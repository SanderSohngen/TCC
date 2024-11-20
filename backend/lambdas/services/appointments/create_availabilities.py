import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor, execute_values

def lambda_handler(event, context):
    sqs_message = json.loads(event["Records"][0]["body"])
    user_id = sqs_message.get("user_id")

    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "user_id is required"})
        }

    conn, cursor = connect_db()


    try:
        availabilities = create_availabilities(user_id)
        insert_availabilities(cursor, availabilities)

        conn.commit()
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Availabilities created successfully"})
        }
    except Exception as e:
        print(f"Erro ao criar disponibilidades: {e}")
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

def create_availabilities(user_id):
    availabilities = []
    for weekday in range(1, 8):
        for hour in range(0, 24):
            start_time = f"{hour:02}:00:00"
            end_time = f"{(hour + 1) % 24:02}:00:00"
            availabilities.append((user_id, weekday, start_time, end_time, False))
    return availabilities

def insert_availabilities(cursor, availabilities):
    query = """
        INSERT INTO availabilities (professional_id, weekday, start_time, end_time, is_active)
        VALUES %s
    """
    execute_values(cursor, query, availabilities)
