import os
import json
import base64
import boto3
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	try:
		user_id, user_type = get_user_info(event)
		document_id = event['pathParameters']['document_id']

		document = get_document_metadata(document_id)
		verify_access(document, user_id, user_type)

		file_content = download_file_from_s3(document['s3_object_key'])
		return build_file_response(file_content, document['document_name'])

	except PermissionError as e:
		return response(403, {"error": str(e)})
	except FileNotFoundError as e:
		return response(404, {"error": str(e)})
	except Exception as e:
		print(f"Error: {e}")
		return response(500, {"error": "Internal server error"})

def get_user_info(event):
	claims = event.get('requestContext', {}).get('authorizer', {}).get('jwt', {}).get('claims', {})
	user_id = claims.get("custom:user_id")
	user_type = claims.get("custom:user_type")
	return user_id, user_type

def get_document_metadata(document_id):
	conn = connect_db()
	cursor = conn.cursor(cursor_factory=RealDictCursor)
	try:
		select_query = "SELECT * FROM documents WHERE document_id = %s"
		cursor.execute(select_query, (document_id,))
		document = cursor.fetchone()
		if not document:
			raise FileNotFoundError("Document not found")
		return document
	finally:
		cursor.close()
		conn.close()

def verify_access(document, user_id, user_type):
	if user_type == 'patient' and document['patient_id'] != user_id:
		raise PermissionError("Access denied")
	if user_type == 'professional' and document['professional_id'] != user_id:
		raise PermissionError("Access denied")

def download_file_from_s3(s3_object_key):
	s3 = boto3.client('s3')
	bucket_name = os.environ['S3_BUCKET_NAME']
	file_obj = s3.get_object(Bucket=bucket_name, Key=s3_object_key)
	return file_obj['Body'].read()

def build_file_response(file_content, document_name):
	file_content_base64 = base64.b64encode(file_content).decode('utf-8')
	return {
		"statusCode": 200,
		"headers": {
			"Content-Type": "application/pdf",
			"Content-Disposition": f'attachment; filename="{document_name}"'
		},
		"body": file_content_base64,
		"isBase64Encoded": True
	}

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