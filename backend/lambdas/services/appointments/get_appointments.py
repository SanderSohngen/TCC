import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type not in ["patient", "professional"]:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Acesso negado"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        if user_type == "patient":
            appointments = fetch_patient_appointments(cursor, user_id)
        elif user_type == "professional":
            appointments = fetch_professional_appointments(cursor, user_id)

        return {
            "statusCode": 200,
            "body": json.dumps(appointments, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Erro interno do servidor"}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def get_claims(event):
    request_context = event.get('requestContext', {})
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

def fetch_patient_appointments(cursor, patient_id):
    query = """
        SELECT 
            a.appointment_id,
            a.status,
            a.created_at,
            s.slot_id,
            s.slot_datetime,
            av.professional_id
        FROM appointments a
        JOIN slots s ON a.slot_id = s.slot_id
        JOIN availabilities av ON s.availability_id = av.availability_id
        WHERE a.patient_id = %s
        ORDER BY s.slot_datetime DESC
    """
    cursor.execute(query, (patient_id,))
    return cursor.fetchall()

def fetch_professional_appointments(cursor, professional_id):
    query = """
        SELECT 
            a.appointment_id,
            a.status,
            a.created_at,
            s.slot_id,
            s.slot_datetime,
            a.patient_id
        FROM appointments a
        JOIN slots s ON a.slot_id = s.slot_id
        JOIN availabilities av ON s.availability_id = av.availability_id
        WHERE av.professional_id = %s
        ORDER BY s.slot_datetime DESC
    """
    cursor.execute(query, (professional_id,))
    return cursor.fetchall()