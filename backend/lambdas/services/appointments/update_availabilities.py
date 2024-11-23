import os
import json
import psycopg2
from datetime import datetime, timedelta, time, timezone

from psycopg2.extras import RealDictCursor, execute_values

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")

    body = json.loads(event['body'])
    availabilities = body.get('availabilities', [])

    if not availabilities:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "No availabilities provided"})
        }

    conn, cursor = connect_db()

    try:
        update_availabilities(cursor, user_id, availabilities)
        delete_future_slots(cursor, user_id)

        active_availabilities = [
            {
                'availability_id': a['availability_id'],
                'weekday': a['weekday'],
                'start_time': a['start_time']
            }
             for a in availabilities if a['is_active']
        ]
        generate_slots(cursor, active_availabilities)

        conn.commit()

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Availabilities updated and slots regenerated successfully"})
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

def delete_future_slots(cursor, user_id):
    query = """
        DELETE FROM slots
        USING availabilities
        WHERE slots.availability_id = availabilities.availability_id
        AND availabilities.professional_id = %s
        AND slots.is_reserved = FALSE
        AND slots.slot_datetime > NOW()
    """
    cursor.execute(query, (user_id,))

def update_availabilities(cursor, user_id, availabilities):
    query = """
        UPDATE availabilities
        SET is_active = data.is_active
        FROM (VALUES %s) AS data(availability_id, is_active)
        WHERE availabilities.availability_id = data.availability_id::UUID
        AND availabilities.professional_id = %s
    """
    values = [(a['availability_id'], a['is_active']) for a in availabilities]
    formatted_values = ", ".join(
        cursor.mogrify("(%s, %s)", v).decode("utf-8") for v in values
    )

    query = query.replace("(VALUES %s)", f"(VALUES {formatted_values})")

    cursor.execute(query, (user_id,))

def generate_slots(cursor, availabilities):
    utc_minus_3 = timezone(timedelta(hours=-3))
    start_date = datetime.now(utc_minus_3)
    end_date = start_date + timedelta(days=90)

    slots = []

    for availability in availabilities:
        availability_id = availability['availability_id']
        weekday = availability['weekday']
        start_time = datetime.strptime(availability['start_time'], "%H:%M:%S").time()

        days_until_next_weekday = (weekday - start_date.isoweekday()) % 7
        next_weekday_date = start_date + timedelta(days=days_until_next_weekday)

        current_date = next_weekday_date

        while current_date <= end_date:
            slot_datetime = datetime.combine(current_date, start_time, tzinfo=utc_minus_3)

            if slot_datetime < start_date:
                current_date += timedelta(days=7)
                continue

            slots.append((availability_id, slot_datetime))
            current_date += timedelta(days=7)

    if slots:
        insert_slots(cursor, slots)

def insert_slots(cursor, slots):
    query = """
        INSERT INTO slots (availability_id, slot_datetime)
        VALUES %s
        ON CONFLICT DO NOTHING
    """
    execute_values(cursor, query, slots)