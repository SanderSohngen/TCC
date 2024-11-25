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

    conn, cursor = connect_db()

    try:
        patient_assessments = fetch_patient_assessments(cursor, user_id)

        patient_ids = {a["patient_id"] for a in patient_assessments}
        professional_ids = {a["professional_id"] for a in patient_assessments}

        patient_data = fetch_data_from_api(
            f"{os.environ['PATIENTS_API_URL']}",
            {"ids": list(patient_ids)}
        )
        professional_data = fetch_data_from_api(
            f"{os.environ['PROFESSIONALS_API_URL']}",
            {"ids": list(professional_ids)}
        )

        enrich_assessments(patient_assessments, patient_data, "patient_id")
        enrich_assessments(patient_assessments, professional_data, "professional_id")

        filtered_assessments = filter_assessments_by_profession(patient_assessments, user_id)

        return {
            "statusCode": 200,
            "body": json.dumps(filtered_assessments, ensure_ascii=False, default=str)
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

def fetch_patient_assessments(cursor, patient_id):
    query = """
        SELECT 
            assessment_id, 
            patient_id, 
            professional_id, 
            is_simplified, 
            content, 
            created_at 
        FROM assessments 
        WHERE patient_id = %s::UUID
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

def enrich_assessments(assessments, enriched_data, key):
    enriched_map = {item[key]: item for item in enriched_data}

    for assessment in assessments:
        data_key = assessment[key]
        if data_key in enriched_map:
            assessment.update(enriched_map[data_key])

def filter_assessments_by_profession(assessments, user_id):
    profession_map = {}
    
    for assessment in assessments:
        professional_id = assessment.get("professional_id")
        profession_map[professional_id] = assessment["profession"]

    filtered_assessments = []
    assessments_by_professional = {}

    for assessment in assessments:
        professional_id = assessment.get("professional_id")
        if professional_id not in assessments_by_professional:
            assessments_by_professional[professional_id] = []
        assessments_by_professional[professional_id].append(assessment)

    user_profession = profession_map.get(user_id)

    for professional_id, assessments_group in assessments_by_professional.items():
        profession = profession_map.get(professional_id)

        if profession == user_profession:
            detailed_assessments = [a for a in assessments_group if not a["is_simplified"]]
            filtered_assessments.extend(detailed_assessments)
        else:
            simplified_assessments = [a for a in assessments_group if a["is_simplified"]]
            filtered_assessments.extend(simplified_assessments)

    return filtered_assessments