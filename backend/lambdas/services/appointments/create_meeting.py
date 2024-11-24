import os
import json
import boto3
import psycopg2
from datetime import datetime, timezone, timedelta
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    appointment_id = event['pathParameters']['appointment_id']
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not appointment_id or not user_id:
        return {
            'statusCode': 400,
            'body': json.dumps({'error': 'Invalid request'})
        }

    conn, cursor = connect_db()

    try:
        appointment_info = get_appointment_info(cursor, appointment_id)

        if not appointment_info:
            return {
                'statusCode': 404,
                'body': json.dumps({'error': 'Appointment not found'})
            }

        slot_datetime = appointment_info['slot_datetime']
        patient_id = appointment_info['patient_id']
        professional_id = appointment_info['professional_id']

        if user_id not in [str(patient_id), str(professional_id)]:
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Access denied'})
            }

        if not is_within_allowed_time(slot_datetime):
            return {
                'statusCode': 403,
                'body': json.dumps({'error': 'Meeting not available at this time'})
            }

        chime_client = boto3.client('chime-sdk-meetings')
        meeting_info = create_chime_meeting(chime_client, appointment_id)
        attendee_info = create_attendee(chime_client, meeting_info['MeetingId'], user_id)
        update_appointment_status(cursor, appointment_id)

        conn.commit()

        return {
            'statusCode': 200,
            'body': json.dumps({
                'Meeting': meeting_info,
                'Attendee': attendee_info
            })
        }

    except Exception as e:
        print(f"Erro: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
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

def get_appointment_info(cursor, appointment_id):
    query = """
        SELECT 
            a.appointment_id, 
            a.patient_id, 
            s.slot_datetime, 
            av.professional_id
        FROM 
            appointments a
        JOIN 
            slots s ON a.slot_id = s.slot_id
        JOIN 
            availabilities av ON s.availability_id = av.availability_id
        WHERE 
            a.appointment_id = %s
    """
    cursor.execute(query, (appointment_id,))
    return cursor.fetchone()

def is_within_allowed_time(slot_datetime_str):
    slot_datetime = slot_datetime_str.astimezone(timezone.utc)
    now = datetime.now(timezone.utc)
    start_time = slot_datetime - timedelta(minutes=5)
    end_time = slot_datetime + timedelta(minutes=10)
    return start_time <= now <= end_time

def create_chime_meeting(chime_client, appointment_id):
    response = chime_client.create_meeting(
        ClientRequestToken=appointment_id,
        ExternalMeetingId=appointment_id,
        MediaRegion='us-east-1',
        MeetingFeatures={
            'Attendee': {'MaxCount': 2},
            'Audio': {'EchoReduction': 'AVAILABLE'},
            'Video': {'MaxResolution': 'FHD'}
        }
    )
    return response['Meeting']

def create_attendee(chime_client, meeting_id, user_id):
    response = chime_client.create_attendee(
        MeetingId=meeting_id,
        ExternalUserId=str(user_id)
    )
    return response['Attendee']

def update_appointment_status(cursor, appointment_id):
    query = """
        UPDATE appointments
        SET status = 'completed', updated_at = NOW()
        WHERE appointment_id = %s
    """
    cursor.execute(query, (appointment_id,))
