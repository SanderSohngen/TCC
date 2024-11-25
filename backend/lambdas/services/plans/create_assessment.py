import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    body = json.loads(event.get('body', '{}'))

    required_fields = ['appointment_id', 'patient_id', 'is_simplified', 'content']
    for field in required_fields:
        if field not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Campo '{field}' é obrigatório."}, ensure_ascii=False)
            }

    conn, cursor = connect_db()

    try:
        appointment_id = body['appointment_id']
        patient_id = body['patient_id']
        professional_id = user_id
        is_simplified = body['is_simplified']
        content = body['content']
        assessment = create_assessment(cursor, appointment_id, patient_id, professional_id, is_simplified, content)

        conn.commit()

        return {
            "statusCode": 201,
            "body": json.dumps(assessment, ensure_ascii=False, default=str)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
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

def create_assessment(cursor, appointment_id, patient_id, professional_id, is_simplified, content):
    query = """
        INSERT INTO assessments (appointment_id, patient_id, professional_id, is_simplified, content, created_at)
        VALUES (%s, %s, %s, %s, %s, NOW())
        ON CONFLICT (appointment_id, patient_id, is_simplified)
        DO NOTHING
        RETURNING *
    """
    cursor.execute(query, (appointment_id, patient_id, professional_id, is_simplified, content))
    assessment = cursor.fetchone()
    return assessment