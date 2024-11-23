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
            "body": json.dumps({"error": "Forbidden: Only professionals can access this endpoint"})
        }

    conn, cursor = connect_db()

    try:
        availabilities = get_availabilities(cursor, user_id)

        return {
            "statusCode": 200,
            "body": json.dumps(availabilities, default=str)
        }

    except Exception as e:
        print(f"Error: {e}")
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

def get_availabilities(cursor, user_id):
    query = """
        SELECT availability_id, weekday, start_time, end_time, is_active
        FROM availabilities
        WHERE professional_id = %s
    """
    cursor.execute(query, (user_id,))
    return cursor.fetchall()