import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    body = json.loads(event['body'])
    status = body.get('status')
    slot_id = body.get('slot_id')
    path_parameters = event.get('pathParameters', {})
    appointment_id = path_parameters.get('appointment_id')

    if not appointment_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "appointment_id is required"})
        }

    if status not in ['scheduled', 'canceled']:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid status. Must be 'scheduled' or 'canceled'."})
        }

    conn, cursor = connect_db()
    try:
        appointment = fetch_appointment(cursor, appointment_id)

        if not appointment:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Appointment not found."})
            }

        if appointment['patient_id'] != user_id:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Unauthorized action for this user."})
            }

        if appointment['status'] != 'scheduled':
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Appointment is not scheduled."})
            }

        if status == 'scheduled':
            if not slot_id:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Slot ID is required to reschedule an appointment."})
                }

            slot = fetch_slot(cursor, slot_id)
            if not slot:
                return {
                    "statusCode": 404,
                    "body": json.dumps({"error": "Slot not found."})
                }

            if slot['is_reserved'] or slot['is_blocked']:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Slot is not available."})
                }

            if slot['professional_id'] != appointment['professional_id']:
                return {
                    "statusCode": 403,
                    "body": json.dumps({"error": "Slot does not belong to the same professional as the appointment."})
                }

            update_slot_status(cursor, appointment['slot_id'], False)
            update_slot_status(cursor, slot_id, True)
            update_appointment(cursor, appointment_id, slot_id, status)

        elif status == 'canceled':
            update_slot_status(cursor, appointment['slot_id'], False)
            update_appointment(cursor, appointment_id, None, status)

        conn.commit()

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Appointment updated successfully."})
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


def fetch_appointment(cursor, appointment_id):
    query = """
        SELECT 
            a.appointment_id,
            a.patient_id,
            a.slot_id,
            a.status,
            av.professional_id,
            a.created_at,
            a.updated_at,
            s.availability_id,
            s.slot_datetime,
            s.is_reserved,
            s.is_blocked
        FROM appointments a
        JOIN slots s ON a.slot_id = s.slot_id
        JOIN availabilities av ON s.availability_id = av.availability_id
        WHERE a.appointment_id = %s
    """
    cursor.execute(query, (appointment_id,))
    return cursor.fetchone()


def fetch_slot(cursor, slot_id):
    query = """
        SELECT 
            s.slot_id, 
            a.professional_id, 
            s.is_reserved, 
            s.is_blocked
        FROM slots s
        JOIN availabilities a ON s.availability_id = a.availability_id
        WHERE s.slot_id = %s
    """
    cursor.execute(query, (slot_id,))
    return cursor.fetchone()


def update_slot_status(cursor, slot_id, is_reserved):
    query = """
        UPDATE slots
        SET is_reserved = %s
        WHERE slot_id = %s
    """
    cursor.execute(query, (is_reserved, slot_id))


def update_appointment(cursor, appointment_id, slot_id, status):
    query = """
        UPDATE appointments
        SET slot_id = %s, status = %s, updated_at = NOW()
        WHERE appointment_id = %s
    """
    cursor.execute(query, (slot_id, status, appointment_id))