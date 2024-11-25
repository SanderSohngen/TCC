import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	claims = get_claims(event)
	user_id = claims.get("custom:user_id")
	user_type = claims.get("custom:user_type")

	assessment_id = event['pathParameters'].get('assessment_id')
	if not assessment_id:
		return {
			"statusCode": 400,
			"body": json.dumps({"error": "Parameter 'assessment_id' is required."}, ensure_ascii=False)
		}

	conn, cursor = connect_db()

	try:
		assessment = fetch_assessment(cursor, assessment_id, user_id, user_type)

		if not assessment:
			return {
				"statusCode": 404,
				"body": json.dumps({"error": "Assessment not found or access denied."}, ensure_ascii=False)
			}

		return {
			"statusCode": 200,
			"body": json.dumps(assessment, ensure_ascii=False, default=str)
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

def fetch_assessment(cursor, assessment_id, user_id, user_type):
    if user_type == "professional":
        query = """
            SELECT * FROM assessments
            WHERE assessment_id = %s
              AND (professional_id = %s OR is_simplified = TRUE)
        """
        cursor.execute(query, (assessment_id, user_id))
    elif user_type == "patient":
        query = """
            SELECT * FROM assessments
            WHERE assessment_id = %s
              AND patient_id = %s
        """
        cursor.execute(query, (assessment_id, user_id))
    else:
        return None

    return cursor.fetchone()
