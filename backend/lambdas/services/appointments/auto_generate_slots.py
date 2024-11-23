import os
import json
import psycopg2
from datetime import datetime, timedelta, time, timezone
from psycopg2.extras import RealDictCursor, execute_values

def lambda_handler(event, context):
    conn, cursor = connect_db()

    try:
        active_availabilities = fetch_active_availabilities(cursor)

        if not active_availabilities:
            return {
                "statusCode": 200,
                "body": json.dumps({"message": "Nenhuma disponibilidade ativa encontrada."})
            }

        slots = generate_slots(active_availabilities)
        if slots:
            insert_slots(cursor, slots)
            conn.commit()
        
        return {
            "statusCode": 200,
            "body": json.dumps({"message": f"{len(slots)} slots criados com sucesso."})
        }

    except Exception as e:
        conn.rollback()
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

def fetch_active_availabilities(cursor):
    query = """
        SELECT 
            availability_id, weekday, start_time
        FROM availabilities
        WHERE is_active = TRUE
    """
    cursor.execute(query)
    return cursor.fetchall()

def generate_slots(availabilities):
    utc_minus_3 = timezone(timedelta(hours=-3))
    start_date = datetime.now(utc_minus_3).date() + timedelta(days=90)

    corrected_weekday = start_date.weekday() + 1 

    filtered_availabilities = [
        availability for availability in availabilities
        if availability['weekday'] == corrected_weekday
    ]

    slots = []

    for availability in filtered_availabilities:
        availability_id = availability['availability_id']
        start_time = availability['start_time']

        slot_datetime = datetime.combine(start_date, start_time, tzinfo=utc_minus_3)
        slots.append((availability_id, slot_datetime))

    return slots

def insert_slots(cursor, slots):
    query = """
        INSERT INTO slots (availability_id, slot_datetime)
        VALUES %s
        ON CONFLICT DO NOTHING
    """
    execute_values(cursor, query, slots)