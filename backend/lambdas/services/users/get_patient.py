import os
import json
import psycopg2

from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    patient_id = event['pathParameters']['patient_id']

    conn, cursor = connect_db()

    try:
        patient_data = fetch_patient_data(cursor, patient_id)

        if not patient_data:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Patient not found"}, ensure_ascii=False)
            }

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

def fetch_patient_data(cursor, patient_id):
    query = """
        SELECT 
            u.user_id AS patient_id, 
            u.name,
            p.birthday, 
            p.weight, 
            p.height, 
            p.gender, 
            p.food_restrictions
        FROM users u
        JOIN patients p ON u.user_id = p.patient_id
        WHERE u.user_id = %s
    """
    cursor.execute(query, (patient_id,))
    return cursor.fetchone()

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