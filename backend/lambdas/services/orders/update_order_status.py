import os
import json
import psycopg2

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != 'company':
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"})
        }

    order_id = event['pathParameters'].get('order_id')
    if not order_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Order ID is required"})
        }

    try:
        body = json.loads(event['body'])
        order_status = body.get('order_status')
    except (json.JSONDecodeError, KeyError):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid request body"})
        }

    valid_statuses = ['pending', 'paid', 'completed', 'canceled', 'shipped', 'delivered']
    if not order_status or order_status not in valid_statuses:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid or missing order_status"})
        }

    conn, cursor = connect_db()
    try:
        if not check_order_belongs_to_company(cursor, order_id, user_id):
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Order not found or access denied"})
            }

        update_order_status(cursor, order_id, order_status)
        conn.commit()

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Order status updated successfully"})
        }

    except Exception as e:
        conn.rollback()
        print(f"Error: {e}")
        return {
            "statusCode": 500,
            "body": json.dumps({"error": "Internal server error"})
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
    cursor = conn.cursor()
    return conn, cursor

def check_order_belongs_to_company(cursor, order_id, company_id):
    query = """
        SELECT o.order_id
        FROM orders o
        JOIN order_options oo ON o.order_option_id = oo.order_option_id
        WHERE o.order_id = %s AND oo.company_id = %s
    """
    cursor.execute(query, (order_id, company_id))
    return cursor.fetchone() is not None

def update_order_status(cursor, order_id, order_status):
    query = "UPDATE orders SET order_status = %s WHERE order_id = %s"
    cursor.execute(query, (order_status, order_id))