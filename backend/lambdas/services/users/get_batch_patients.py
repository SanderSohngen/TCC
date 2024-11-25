import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    body = json.loads(event.get('body', '{}'))
    patient_ids = body.get("ids", [])

    if not isinstance(patient_ids, list) or not patient_ids:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid or missing 'patient_ids' in request body"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        patient_data = fetch_patient_data(cursor, patient_ids)

        return {
            "statusCode": 200,
            "body": json.dumps(patient_data, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def fetch_patient_data(cursor, patient_ids):
    query = """
        SELECT 
            u.user_id AS patient_id,
            u.name as patient_name,
            p.birthday, 
            p.weight, 
            p.height, 
            p.gender, 
            p.food_restrictions
        FROM users u
        JOIN patients p ON u.user_id = p.patient_id
        WHERE u.user_id = ANY(%s::UUID[])
    """
    cursor.execute(query, (patient_ids,))
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
