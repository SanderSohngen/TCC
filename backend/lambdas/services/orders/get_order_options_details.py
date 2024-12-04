import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
	claims = get_claims(event)
	user_type = claims.get("custom:user_type")

	if user_type != "patient":
		return {
			"statusCode": 403,
			"body": json.dumps({"error": "Access denied"})
		}

	order_option_id = event['pathParameters'].get('order_option_id')

	conn, cursor = connect_db()
	try:
		order_option = fetch_order_option_details(cursor, order_option_id)

		if not order_option:
			return {
				"statusCode": 404,
				"body": json.dumps({"error": "Order option not found"})
			}

		return {
			"statusCode": 200,
			"body": json.dumps(order_option, default=str, ensure_ascii=False)
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

def fetch_order_option_details(cursor, order_option_id):
	query = """
		SELECT o.order_option_id, o.plan_id, o.company_id, o.total_price, o.created_at,
			   COALESCE(
				   JSON_AGG(
					   JSON_BUILD_OBJECT(
						   'item_option_id', io.item_option_id,
						   'plan_item_id', io.plan_item_id,
						   'supplier_product_id', io.supplier_product_id,
						   'price', io.price,
						   'quantity', io.quantity
					   )
				   ) FILTER (WHERE io.item_option_id IS NOT NULL),
				   '[]'
			   ) AS items
		FROM order_options o
		LEFT JOIN item_options io ON o.order_option_id = io.order_option_id
		WHERE o.order_option_id = %s
		GROUP BY o.order_option_id
	"""
	cursor.execute(query, (order_option_id,))
	return cursor.fetchone()

