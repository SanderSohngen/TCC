import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	body = json.loads(event['body'])
	company_ids = body.get('company_ids', [])

	if not company_ids:
		return {
			"statusCode": 400,
			"body": json.dumps({"error": "No company_id provided"})
		}

	conn, cursor = connect_db()

	try:
		companies_data = fetch_companies_data(cursor, company_ids)

		return {
			"statusCode": 200,
			"body": json.dumps(companies_data, ensure_ascii=False, default=str)
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

def fetch_companies_data(cursor, company_ids):
	query = """
		SELECT 
			u.user_id AS company_id,
			u.name,
			c.company_type,
			c.address_id,
			a.street,
			a.house_number,
			a.complement,
			a.neighborhood,
			a.city,
			a.state,
			a.zip_code,
			a.country,
			a.latitude,
			a.longitude
		FROM users u
		JOIN companies c ON u.user_id = c.company_id
		JOIN addresses a ON c.address_id = a.address_id
		WHERE u.user_id = ANY(%s::uuid[])
	"""
	cursor.execute(query, (company_ids,))
	return cursor.fetchall()

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