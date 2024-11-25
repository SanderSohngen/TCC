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

    if not user_id or user_type not in ["professional", "patient"]:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    conn, cursor = connect_db()

    try:
        my_assessments = fetch_my_assessments(cursor, user_id)

        if user_type == "patient":
            professional_ids = {a["professional_id"] for a in my_assessments}
            enriched_data = fetch_data_from_api(
                f"{os.environ['PROFESSIONALS_API_URL']}",
                {"ids": list(professional_ids)}
            )
            enrich_assessments(my_assessments, enriched_data, "professional_id")
        elif user_type == "professional":
            patient_ids = {a["patient_id"] for a in my_assessments}
            enriched_data = fetch_data_from_api(
                f"{os.environ['PATIENTS_API_URL']}",
                {"ids": list(patient_ids)}
            )
            enrich_assessments(my_assessments, enriched_data, "patient_id")

        return {
            "statusCode": 200,
            "body": json.dumps(my_assessments, ensure_ascii=False, default=str)
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

def fetch_my_assessments(cursor, user_id):
    query = """
        SELECT * FROM assessments
        WHERE professional_id = %s OR patient_id = %s
    """
    cursor.execute(query, (user_id, user_id))
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

def enrich_assessments(assessments, enriched_data, key):
    enriched_map = {item[key]: item for item in enriched_data}

    for assessment in assessments:
        data_key = assessment[key]
        if data_key in enriched_map:
            assessment.update(enriched_map[data_key])
