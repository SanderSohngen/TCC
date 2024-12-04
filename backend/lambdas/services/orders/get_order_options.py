import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3
import requests
from aws_requests_auth.aws_auth import AWSRequestsAuth

def lambda_handler(event, context):
	claims = get_claims(event)
	user_type = claims.get("custom:user_type")

	if user_type != "patient":
		return {
			"statusCode": 403,
			"body": json.dumps({"error": "Access denied"})
		}

	plan_id = event['pathParameters'].get('plan_id')

	conn, cursor = connect_db()
	try:
		order_options = fetch_order_options_by_plan_id(cursor, plan_id)

		if not order_options:
			return {
				"statusCode": 404,
				"body": json.dumps({"error": "No purchase options found for this plan"})
			}

		company_ids = [option['company_id'] for option in order_options]

		if company_ids:
			enriched_data = fetch_data_from_api(
				os.environ['COMPANIES_API_URL'],
				{"company_ids": company_ids}
			)
			enrich_order_options(order_options, enriched_data)

		return {
			"statusCode": 200,
			"body": json.dumps(order_options, default=str, ensure_ascii=False)
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

def fetch_order_options_by_plan_id(cursor, plan_id):
	query = """
		SELECT o.order_option_id, o.plan_id, o.company_id, o.total_price, o.created_at
		FROM order_options o
		WHERE o.plan_id = %s
		ORDER BY o.created_at DESC
	"""
	cursor.execute(query, (plan_id,))
	return cursor.fetchall()

def fetch_data_from_api(url, body):
	session = boto3.Session()
	credentials = session.get_credentials().get_frozen_credentials()
	region = session.region_name or 'us-east-1'
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

def enrich_order_options(order_options, enriched_data):
	enriched_map = {item['company_id']: item for item in enriched_data}

	for option in order_options:
		company_id = option['company_id']
		if company_id in enriched_map:
			company_data = enriched_map[company_id]
			option['company_name'] = company_data['name']
			option['company_type'] = company_data['company_type']
			option['company_address'] = {
				'street': company_data.get('street'),
				'house_number': company_data.get('house_number'),
				'complement': company_data.get('complement'),
				'neighborhood': company_data.get('neighborhood'),
				'city': company_data.get('city'),
				'state': company_data.get('state'),
				'zip_code': company_data.get('zip_code'),
				'country': company_data.get('country'),
				'latitude': company_data.get('latitude'),
				'longitude': company_data.get('longitude')
			}