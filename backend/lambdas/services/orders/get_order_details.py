import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id:
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

    conn, cursor = connect_db()
    try:
        order = get_order(cursor, order_id, user_id, user_type)
        if not order:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Order not found or access denied"})
            }

        order_items = get_order_items(cursor, order_id)
        order['items'] = order_items

        if user_type == 'patient':
            company_data = fetch_data_from_api(
                os.environ['GET_COMPANIES_DATA_URL'],
                {'company_ids': [order['company_id']]}
            )
            if company_data:
                order['company_name'] = company_data[0].get('name', 'Unknown')
        elif user_type == 'company':
            patient_data = fetch_data_from_api(
                os.environ['GET_PATIENTS_DATA_URL'],
                {'patient_ids': [order['patient_id']]}
            )
            if patient_data:
                order['patient_name'] = patient_data[0].get('name', 'Unknown')

        return {
            "statusCode": 200,
            "body": json.dumps(order, default=str)
        }

    except Exception as e:
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
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return conn, cursor

def get_order(cursor, order_id, user_id, user_type):
    if user_type == 'patient':
        query = """
            SELECT o.*, oo.company_id
            FROM orders o
            JOIN order_options oo ON o.order_option_id = oo.order_option_id
            WHERE o.order_id = %s AND o.patient_id = %s
        """
        cursor.execute(query, (order_id, user_id))
    elif user_type == 'company':
        query = """
            SELECT o.*, o.patient_id
            FROM orders o
            JOIN order_options oo ON o.order_option_id = oo.order_option_id
            WHERE o.order_id = %s AND oo.company_id = %s
        """
        cursor.execute(query, (order_id, user_id))
    else:
        return None
    return cursor.fetchone()

def get_order_items(cursor, order_id):
    query = """
        SELECT
            oi.order_item_id,
            oi.quantity,
            oi.price,
            p.name AS product_name
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        WHERE oi.order_id = %s
    """
    cursor.execute(query, (order_id,))
    return cursor.fetchall()

def fetch_data_from_api(url, body):
    session = boto3.Session()
    credentials = session.get_credentials().get_frozen_credentials()
    region = session.region_name or 'us-east-1'
    service = 'execute-api'
    auth = AWSRequestsAuth(
        aws_access_key=credentials.access_key,
        aws_secret_access_key=credentials.secret_key,
        aws_token=credentials.token,
        aws_host=url.split('/')[2],
        aws_region=region,
        aws_service=service
    )

    response = requests.post(url, json=body, auth=auth)
    response.raise_for_status()
    return response.json()