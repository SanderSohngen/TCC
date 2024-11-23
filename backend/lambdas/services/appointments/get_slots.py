import os
import json
import psycopg2
import requests
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != "patient":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    utc_minus_3 = timezone(timedelta(hours=-3))
    now = datetime.now(utc_minus_3)
    query_params = event.get('queryStringParameters') or {}
    profession = query_params.get('profession')
    date_from = query_params.get('date_from') or now.strftime('%Y-%m-%d')
    date_to = query_params.get('date_to')

    if not profession:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Profession parameter is required"}, ensure_ascii=False)
        }

    date_from = parse_date(date_from)
    date_to = parse_date(date_to)
    authorization = event.get('headers', {}).get('authorization', '')
    professionals_info = fetch_professionals_info(profession, authorization)

    if not professionals_info:
        return {
            "statusCode": 404,
            "body": json.dumps({"error": "No professionals found for the given profession"}, ensure_ascii=False)
        }

    professional_ids = [prof["professional_id"] for prof in professionals_info]

    conn, cursor = connect_db()

    try:
        slots = fetch_slots(cursor, professional_ids, date_from, date_to)
        enriched_slots = enrich_slots(slots, professionals_info)

        return {
            "statusCode": 200,
            "body": json.dumps(enriched_slots, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def get_claims(event):
    request_context = event.get('requestContext')
    authorizer = request_context.get('authorizer', {})
    jwt = authorizer.get('jwt', {})
    claims = jwt.get('claims', {})
    return claims

def connect_db():
    db_params = {
        'dbname': os.environ['DB_NAME'],
        'user': os.environ['DB_USER'],
        'password': os.environ['DB_PASSWORD'],
        'host': os.environ['DB_HOST'],
        'port': os.environ.get('DB_PORT', '5432')
    }
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return conn, cursor

def parse_date(date_str):
    if date_str:
        try:
            return datetime.strptime(date_str, "%Y-%m-%d")
        except ValueError:
            raise ValueError("Invalid date format. Use YYYY-MM-DD.")
    return None

def fetch_professionals_info(profession, authorization):
    url = os.environ.get("PROFESSIONALS_URL")
    headers = {"Authorization": authorization}
    response = requests.get(url, params={"profession": profession}, headers=headers)
    response.raise_for_status()
    return response.json()

def fetch_slots(cursor, professional_ids, date_from, date_to):
    query = """
        SELECT 
            s.slot_id,
            s.slot_datetime,
            a.professional_id
        FROM slots s
        JOIN availabilities a ON s.availability_id = a.availability_id
        WHERE a.professional_id = ANY(%s::UUID[])
          AND s.is_reserved = FALSE
          AND s.is_blocked = FALSE
    """
    params = [professional_ids]

    if date_from:
        query += " AND s.slot_datetime >= %s"
        params.append(date_from)
    if date_to:
        query += " AND s.slot_datetime <= %s"
        params.append(date_to)

    query += " ORDER BY s.slot_datetime"
    cursor.execute(query, tuple(params))
    return cursor.fetchall()

def enrich_slots(slots, professionals_info):
    professionals_map = {prof["professional_id"]: prof for prof in professionals_info}

    enriched_slots = []
    for slot in slots:
        professional_id = slot["professional_id"]
        professional_data = professionals_map.get(professional_id)

        if professional_data:
            enriched_slots.append({
                "slot_id": slot["slot_id"],
                "slot_datetime": slot["slot_datetime"],
                "professional_id": professional_id,
                "professional_name": professional_data["name"],
                "bio": professional_data.get("bio"),
                "specialties": professional_data.get("specialties"),
                "price": professional_data.get("price"),
            })

    return enriched_slots