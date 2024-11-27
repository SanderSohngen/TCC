import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from aws_requests_auth.aws_auth import AWSRequestsAuth
import boto3
import requests

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    patient_id = event['pathParameters']['patient_id']
    if not patient_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Patient ID is required"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        patient_plans = fetch_patient_plans(cursor, patient_id)

        patient_ids = {plan["patient_id"] for plan in patient_plans}
        professional_ids = {plan["professional_id"] for plan in patient_plans}

        if patient_ids:
            patient_data = fetch_data_from_api(
                f"{os.environ['PATIENTS_API_URL']}",
                {"ids": list(patient_ids)}
            )
            enrich_data(patient_plans, patient_data, "patient_id")

        if professional_ids:
            professional_data = fetch_data_from_api(
                f"{os.environ['PROFESSIONALS_API_URL']}",
                {"ids": list(professional_ids)}
            )
            enrich_data(patient_plans, professional_data, "professional_id")

        return {
            "statusCode": 200,
            "body": json.dumps(patient_plans, ensure_ascii=False, default=str)
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

def fetch_patient_plans(cursor, patient_id):
    query = """
        SELECT 
            p.plan_id,
            p.patient_id,
            p.professional_id,
            p.plan_type,
            p.description,
            p.created_at,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'plan_item_id', pi.plan_item_id,
                        'product_id', pi.product_id,
                        'quantity', pi.quantity,
                        'instructions', pi.instructions,
                        'name', pr.name,
                        'category', pr.category
                    )
                ) FILTER (WHERE pi.plan_item_id IS NOT NULL), 
                '[]'
            ) AS items
        FROM plans p
        LEFT JOIN plan_items pi ON p.plan_id = pi.plan_id
        LEFT JOIN products pr ON pi.product_id = pr.product_id
        WHERE p.patient_id = %s::UUID
        GROUP BY p.plan_id
    """
    cursor.execute(query, (patient_id,))
    return cursor.fetchall()

def fetch_data_from_api(url, body):
    session = boto3.Session()
    credentials = session.get_credentials().get_frozen_credentials()
    region = session.region_name
    service = 'execute-api'

    auth = AWSRequestsAuth(
        aws_access_key=credentials.access_key,
        aws_secret_access_key=credentials.secret_key,
        aws_host=url.split('/')[2],
        aws_region=region,
        aws_service=service,
        aws_token=credentials.token
    )

    response = requests.post(url, json=body, auth=auth)
    response.raise_for_status()
    return response.json()

def enrich_data(data, enriched_data, key):
    enriched_map = {item[key]: item for item in enriched_data}

    for record in data:
        data_key = record[key]
        if data_key in enriched_map:
            record.update(enriched_map[data_key])