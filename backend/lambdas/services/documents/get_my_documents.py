import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	try:
		user_id, user_type = get_user_info(event)
		documents = get_user_documents(user_id, user_type)
		return response(200, documents)
	except Exception as e:
		print(f"Error: {e}")
		return response(500, {"error": "Internal server error"})

def get_user_info(event):
	claims = event.get('requestContext', {}).get('authorizer', {}).get('jwt', {}).get('claims', {})
	user_id = claims.get("custom:user_id")
	user_type = claims.get("custom:user_type")
	return user_id, user_type

def get_user_documents(user_id, user_type):
	conn = connect_db()
	cursor = conn.cursor(cursor_factory=RealDictCursor)
	try:
		if user_type == 'patient':
			select_query = """
				SELECT document_id, document_type, document_name, uploaded_at
				FROM documents
				WHERE patient_id = %s
				ORDER BY uploaded_at DESC
			"""
		elif user_type == 'professional':
			select_query = """
				SELECT document_id, document_type, document_name, uploaded_at
				FROM documents
				WHERE professional_id = %s
				ORDER BY uploaded_at DESC
			"""
		else:
			raise PermissionError("Access denied")
		cursor.execute(select_query, (user_id,))
		return cursor.fetchall()
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
		"body": json.dumps(body, ensure_ascii=False, default=str),
		"headers": {"Content-Type": "application/json"}
	}