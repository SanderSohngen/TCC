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

    conn, cursor = connect_db()
    try:
        if user_type == 'patient':
            orders = get_patient_orders(cursor, user_id)
            company_ids = list({order['company_id'] for order in orders})
            if company_ids:
                company_data = fetch_data_from_api(
                    os.environ['GET_COMPANIES_DATA_URL'],
                    {'company_ids': company_ids}
                )
                company_map = {item['company_id']: item['name'] for item in company_data}
                for order in orders:
                    order['company_name'] = company_map.get(order['company_id'], 'Unknown')
        elif user_type == 'company':
            orders = get_company_orders(cursor, user_id)
            patient_ids = list({order['patient_id'] for order in orders})
            if patient_ids:
                patient_data = fetch_data_from_api(
                    os.environ['GET_PATIENTS_DATA_URL'],
                    {'patient_ids': patient_ids}
                )
                patient_map = {item['patient_id']: item['name'] for item in patient_data}
                for order in orders:
                    order['patient_name'] = patient_map.get(order['patient_id'], 'Unknown')
        else:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": "Access denied"})
            }

        return {
            "statusCode": 200,
            "body": json.dumps(orders, default=str)
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
        'dbname': os.environ.get('DB_NAME'),
        'user': os.environ.get('DB_USER'),
        'password': os.environ.get('DB_PASSWORD'),
        'host': os.environ.get('DB_HOST'),
        'port': os.environ.get('DB_PORT', '5432')
    }
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return conn, cursor

def get_patient_orders(cursor, patient_id):
    query = """
        SELECT
            o.order_id,
            o.total_amount,
            o.order_date,
            o.order_status,
            o.payment_method,
            o.transaction_id,
            oo.company_id
        FROM orders o
        JOIN order_options oo ON o.order_option_id = oo.order_option_id
        WHERE o.patient_id = %s
        ORDER BY o.order_date DESC
    """
    cursor.execute(query, (patient_id,))
    return cursor.fetchall()

def get_company_orders(cursor, company_id):
    query = """
        SELECT
            o.order_id,
            o.total_amount,
            o.order_date,
            o.order_status,
            o.payment_method,
            o.transaction_id,
            o.patient_id
        FROM orders o
        JOIN order_options oo ON o.order_option_id = oo.order_option_id
        WHERE oo.company_id = %s
        ORDER BY o.order_date DESC
    """
    cursor.execute(query, (company_id,))
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