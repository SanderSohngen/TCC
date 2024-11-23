import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta, timezone

def lambda_handler(event, context):
    professional_id = event['pathParameters']['professional_id']

    if not professional_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Parâmetro 'professional_id' é obrigatório."})
        }

    conn, cursor = connect_db()

    try:
        available_slots = fetch_available_slots(cursor, professional_id)

        return {
            "statusCode": 200,
            "body": json.dumps(available_slots, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }

    finally:
        cursor.close()
        conn.close()

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

def fetch_available_slots(cursor, professional_id):
	now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
	query = """
		SELECT 
			s.slot_id, 
			s.slot_datetime, 
			a.professional_id 
		FROM slots s
		JOIN availabilities a ON s.availability_id = a.availability_id
		WHERE a.professional_id = %s
		  AND s.is_reserved = FALSE
		  AND s.is_blocked = FALSE
		  AND s.slot_datetime >= %s
		ORDER BY s.slot_datetime ASC
	"""
	cursor.execute(query, (professional_id, now))
	return cursor.fetchall()
