import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")
    path_parameters = event.get('pathParameters', {})
    slot_id = path_parameters.get('slot_id')

    if not user_id or user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        slot = fetch_slot(cursor, slot_id, user_id)
        
        if not slot:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Access denied or slot not found"}, ensure_ascii=False)
            }

        if slot['is_reserved']:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Slot is reserved and cannot be blocked/unblocked"})
            }
        
        current_status = slot['is_blocked']

        update_slot_block_status(cursor, slot_id, not current_status)
        conn.commit()

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Slot updated successfully", "slot": {"slot_id": slot_id, "is_blocked": not current_status}})
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

def fetch_slot(cursor, slot_id, user_id):
    query = """
        SELECT 
            s.slot_id, 
            s.is_reserved, 
            s.is_blocked
        FROM slots s
        JOIN availabilities a ON s.availability_id = a.availability_id
        WHERE s.slot_id = %s AND a.professional_id = %s
    """
    cursor.execute(query, (slot_id, user_id))
    return cursor.fetchone()

def update_slot_block_status(cursor, slot_id, is_blocked):
    query = """
        UPDATE slots
        SET is_blocked = %s
        WHERE slot_id = %s
    """
    cursor.execute(query, (is_blocked, slot_id))