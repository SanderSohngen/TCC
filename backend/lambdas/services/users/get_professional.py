import json
import os
from psycopg2.extras import RealDictCursor
import psycopg2

def lambda_handler(event, context):
    professional_id = event['pathParameters']['professional_id']

    conn, cursor = connect_db()

    try:
        professional_data = fetch_professional_data(cursor, professional_id)

        if not professional_data:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Professional not found"})
            }

        return {
            "statusCode": 200,
            "body": json.dumps(professional_data, ensure_ascii=False, default=str)
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }
    finally:
        cursor.close()
        conn.close()

def fetch_professional_data(cursor, professional_id):
    query = """
        SELECT 
            u.user_id AS professional_id, 
            u.name,
            pr.profession,
            pr.bio, 
            pr.specialties, 
            pr.credentials, 
            pr.price
        FROM users u
        JOIN professionals pr ON u.user_id = pr.professional_id
        WHERE u.user_id = %s
    """
    cursor.execute(query, (professional_id,))
    return cursor.fetchone()

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