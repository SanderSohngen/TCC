import os
import json
import boto3
import psycopg2
import requests

from psycopg2.extras import RealDictCursor
from aws_requests_auth.aws_auth import AWSRequestsAuth


def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    appointment_id = event['pathParameters']['appointment_id']

    conn, cursor = connect_db()

    try:
        appointment = fetch_appointment(cursor, appointment_id)

        if not appointment:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Appointment not found"})
            }

        if user_type == "patient" and appointment['patient_id'] != user_id:
            return {"statusCode": 403, "body": json.dumps({"error": "Access denied"})}
        if user_type == "professional" and appointment['professional_id'] != user_id:
            return {"statusCode": 403, "body": json.dumps({"error": "Access denied"})}

        if user_type == "patient":
            professional_data = fetch_professional_data(appointment['professional_id'])
        else:
            patient_data = fetch_patient_data(appointment['patient_id'])

        enriched_appointment = {
            "appointment": appointment,
            "patient": patient_data if user_type == "professional" else None,
            "professional": professional_data if user_type == "patient" else None,
        }

        return {
            "statusCode": 200,
            "body": json.dumps(enriched_appointment, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def fetch_appointment(cursor, appointment_id):
    query = """
        SELECT 
            a.appointment_id,
            a.patient_id,
            a.status,
            s.slot_datetime,
            av.professional_id
        FROM appointments a
        JOIN slots s ON a.slot_id = s.slot_id
        JOIN availabilities av ON s.availability_id = av.availability_id
        WHERE a.appointment_id = %s
    """
    cursor.execute(query, (appointment_id,))
    return cursor.fetchone()

def fetch_patient_data(patient_id):
    url = f"{os.environ['PATIENTS_API_URL']}/{patient_id}"
    return fetch_data_from_api(url)

def fetch_professional_data(professional_id):
    url = f"{os.environ['PROFESSIONALS_API_URL']}/{professional_id}"
    return fetch_data_from_api(url)

def fetch_data_from_api(url):
    session = boto3.Session()
    credentials = session.get_credentials().get_frozen_credentials()
    region = session.region_name
    service = 'execute-api'
    auth = AWSRequestsAuth(
        aws_access_key=credentials.access_key,
        aws_secret_access_key=credentials.secret_key,
        aws_host=url.split('/')[2],
        aws_region=region,
        aws_service=service,
        aws_token=credentials.token
    )

    response = requests.get(url, auth=auth)
    response.raise_for_status()
    return response.json()

def get_claims(event):
    authorizer = event.get('requestContext', {}).get('authorizer', {})
    jwt = authorizer.get('jwt', {})
    return jwt.get('claims', {})

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