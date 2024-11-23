import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != "patient":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Acesso negado"}, ensure_ascii=False)
        }

    try:
        body = json.loads(event.get('body', '{}'))
        slot_id = body.get('slot_id')
        if not slot_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "O campo 'slot_id' é obrigatório"}, ensure_ascii=False)
            }
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Formato de JSON inválido"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        conn.autocommit = False

        cursor.execute("""
            SELECT is_reserved, is_blocked
            FROM slots
            WHERE slot_id = %s
            FOR UPDATE
        """, (slot_id,))
        slot = cursor.fetchone()

        if not slot:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Slot não encontrado"}, ensure_ascii=False)
            }

        if slot['is_reserved']:
            return {
                "statusCode": 409,
                "body": json.dumps({"error": "Slot já reservado"}, ensure_ascii=False)
            }

        if slot['is_blocked']:
            return {
                "statusCode": 409,
                "body": json.dumps({"error": "Slot está bloqueado"}, ensure_ascii=False)
            }

        cursor.execute("""
            UPDATE slots
            SET is_reserved = TRUE
            WHERE slot_id = %s
        """, (slot_id,))

        cursor.execute("""
            INSERT INTO appointments (slot_id, patient_id, status)
            VALUES (%s, %s, %s)
            RETURNING appointment_id, created_at
        """, (slot_id, user_id, 'scheduled'))
        appointment = cursor.fetchone()

        conn.commit()

        return {
            "statusCode": 201,
            "body": json.dumps({
                "message": "Consulta agendada com sucesso",
                "appointment_id": appointment['appointment_id'],
                "created_at": appointment['created_at']
            }, ensure_ascii=False, default=str)
        }

    except Exception as e:
        conn.rollback()
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
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