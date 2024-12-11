import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_type = claims.get("custom:user_type")
    user_id = claims.get("custom:user_id")

    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JWT claims"})
        }
    if user_type not in ["patient", "company"]:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "User type cannot be updated"})
        }

    conn, cursor = connect_db()

    try:
        body = json.loads(event.get("body", "{}"))
        rows_affected = update_user_data(cursor, user_id, user_type, body)

        if rows_affected == 0:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "User not found or no update performed"})
            }

        conn.commit()

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "User data updated successfully"})
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

def update_user_data(cursor, user_id, user_type, data):
    if user_type == "patient":
        allowed_fields = {
            "weight": "DECIMAL(5,2)",
            "height": "DECIMAL(5,2)",
            "food_restrictions": "TEXT"
        }

        updates = []
        params = []
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])

        if updates:
            query = f"""
                UPDATE patients SET {', '.join(updates)}
                WHERE patient_id = %s
            """
            params.append(user_id)
            cursor.execute(query, tuple(params))
            return cursor.rowcount
        return 0

    if user_type == "company":
        allowed_fields = {
            "api_key": "VARCHAR(255)",
            "products_endpoint": "VARCHAR(255)",
            "orders_endpoint": "VARCHAR(255)"
        }

        updates = []
        params = []
        for field in allowed_fields:
            if field in data:
                updates.append(f"{field} = %s")
                params.append(data[field])

        if updates:
            query = f"""
                UPDATE companies SET {', '.join(updates)}
                WHERE company_id = %s
            """
            params.append(user_id)
            cursor.execute(query, tuple(params))
            return cursor.rowcount
        return 0