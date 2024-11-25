import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    professional_ids = body.get("ids", [])

    if not isinstance(professional_ids, list) or not professional_ids:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid or missing 'professional_ids' in request body"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        professional_data = fetch_professional_data(cursor, professional_ids)

        return {
            "statusCode": 200,
            "body": json.dumps(professional_data, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def fetch_professional_data(cursor, professional_ids):
    query = """
        SELECT 
            u.user_id AS professional_id, 
            u.name as professional_name, 
            pr.profession, 
            pr.bio, 
            pr.specialties, 
            pr.credentials, 
            pr.price
        FROM users u
        JOIN professionals pr ON u.user_id = pr.professional_id
        WHERE u.user_id = ANY(%s::UUID[])
    """
    cursor.execute(query, (professional_ids,))
    return cursor.fetchall()

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