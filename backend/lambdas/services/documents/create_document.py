import os
import json
import base64
import uuid
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	try:
		user_id, user_type = get_user_info(event)
		if user_type != "professional":
			return response(403, {"error": "Access denied"})

		body = parse_body(event)
		document_id, file_key = process_upload(body, user_id)
		return response(201, {"message": "Document uploaded successfully", "document_id": document_id})

	except Exception as e:
		print(f"Error: {e}")
		return response(500, {"error": "Internal server error"})

def get_user_info(event):
    claims = event.get('requestContext', {}).get('authorizer', {}).get('jwt', {}).get('claims', {})
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")
    return user_id, user_type

def parse_body(event):
    body = json.loads(event.get('body', '{}'))
    required_fields = ['document_type', 'document_name', 'patient_id', 'file']
    if not all(field in body for field in required_fields):
        raise ValueError("Dados incompletos")
    return body

def process_upload(body, user_id):
    document_type = body['document_type']
    document_name = body['document_name']
    patient_id = body['patient_id']
    file_content_base64 = body['file']

    file_content = base64.b64decode(file_content_base64)
    content_type = 'application/pdf'

    document_id = str(uuid.uuid4())
    s3_object_key = f'documents/{patient_id}/{document_type}/{document_id}'

    upload_file_to_s3(s3_object_key, file_content, content_type)
    save_document_metadata(document_id, user_id, patient_id, document_type, document_name, s3_object_key)

    return document_id, s3_object_key

def upload_file_to_s3(s3_object_key, file_content, content_type):
    s3 = boto3.client('s3')
    bucket_name = os.environ['S3_BUCKET_NAME']
    s3.put_object(
        Bucket=bucket_name,
        Key=s3_object_key,
        Body=file_content,
        ContentType=content_type
    )

def save_document_metadata(document_id, professional_id, patient_id, document_type, document_name, s3_object_key):
    conn = connect_db()
    cursor = conn.cursor()
    try:
        insert_query = """
            INSERT INTO documents (document_id, professional_id, patient_id, document_type, document_name, s3_object_key)
            VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_query, (document_id, professional_id, patient_id, document_type, document_name, s3_object_key))
        conn.commit()
    finally:
        cursor.close()
        conn.close()

def connect_db():
    db_params = {
        'dbname': os.environ['DB_NAME'],
        'user': os.environ['DB_USER'],
        'password': os.environ['DB_PASSWORD'],
        'host': os.environ['DB_HOST'],
        'port': os.environ.get('DB_PORT', '5432')
    }
    return psycopg2.connect(**db_params)

def response(status_code, body):
    return {
        "statusCode": status_code,
        "body": json.dumps(body, ensure_ascii=False),
        "headers": {"Content-Type": "application/json"}
    }