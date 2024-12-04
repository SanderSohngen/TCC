import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    try:
        body = json.loads(event['body'])
        patient_ids = body.get('patient_ids', [])
        if not patient_ids:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "No patient_ids provided"})
            }

        conn, cursor = connect_db()
        patients = get_patients(cursor, patient_ids)
        return {
            "statusCode": 200,
            "body": json.dumps(patients, default=str)
        }
    except Exception as e:
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"})
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

def get_patients(cursor, patient_ids):
    query = """
        SELECT
            u.user_id AS patient_id,
            u.name
        FROM users u
        WHERE u.user_id = ANY(%s::uuid[]) AND u.user_type = 'patient'
    """
    cursor.execute(query, (patient_ids,))
    return cursor.fetchall()