import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        slots = fetch_professional_slots(cursor, user_id)

        return {
            "statusCode": 200,
            "body": json.dumps(slots, ensure_ascii=False, default=str)
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

def fetch_professional_slots(cursor, professional_id):
    query = """
        SELECT 
            s.slot_id,
            s.slot_datetime,
            s.is_reserved,
            s.is_blocked,
            a.professional_id
        FROM slots s
        JOIN availabilities a ON s.availability_id = a.availability_id
        WHERE a.professional_id = %s
        ORDER BY s.slot_datetime
    """
    cursor.execute(query, (professional_id,))
    return cursor.fetchall()