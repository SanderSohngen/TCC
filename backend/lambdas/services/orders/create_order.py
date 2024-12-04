import os
import json
import uuid
import psycopg2
from psycopg2.extras import execute_values

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if not user_id or user_type != "patient":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"})
        }

    try:
        body = json.loads(event['body'])
        order_option_id = body.get('order_option_id')
        shipping_address_id = body.get('shipping_address_id')
        payment_method = body.get('payment_method')
        items = body.get('items')
    except (json.JSONDecodeError, KeyError):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid request body"})
        }

    if not all([order_option_id, shipping_address_id, payment_method, items]):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required fields"})
        }

    conn, cursor = connect_db()
    try:
        order_option = get_order_option(cursor, order_option_id)
        if not order_option:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "Order option not found"})
            }

        total_amount = sum(float(item['price']) * int(item['quantity']) for item in items)
        payment_successful, transaction_id = process_payment_mock(payment_method, total_amount)
        if not payment_successful:
            return {
                "statusCode": 402,
                "body": json.dumps({"error": "Payment failed"})
            }

        order_id = str(uuid.uuid4())
        create_order(
            cursor,
            order_id,
            user_id,
            order_option_id,
            total_amount,
            payment_method,
            transaction_id,
            shipping_address_id
        )
        insert_order_items(cursor, order_id, items)
        conn.commit()

        return {
            "statusCode": 201,
            "body": json.dumps({"message": "Order created successfully", "order_id": order_id})
        }

    except Exception as e:
        conn.rollback()
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
        'dbname': os.environ.get('DB_NAME'),
        'user': os.environ.get('DB_USER'),
        'password': os.environ.get('DB_PASSWORD'),
        'host': os.environ.get('DB_HOST'),
        'port': os.environ.get('DB_PORT', '5432')
    }
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    return conn, cursor

def get_order_option(cursor, order_option_id):
    query = "SELECT * FROM order_options WHERE order_option_id = %s"
    cursor.execute(query, (order_option_id,))
    return cursor.fetchone()

def process_payment_mock(payment_method, amount):
    if payment_method not in ['credit_card', 'pix']:
        return False, None
    transaction_id = str(uuid.uuid4())
    return True, transaction_id

def create_order(cursor, order_id, patient_id, order_option_id, total_amount, payment_method, transaction_id, shipping_address_id):
    query = """
        INSERT INTO orders (
            order_id, patient_id, order_option_id, total_amount, order_status,
            payment_method, transaction_id, shipping_address_id
        ) VALUES (
            %s, %s, %s, %s, 'paid', %s, %s, %s
        )
    """
    cursor.execute(query, (
        order_id,
        patient_id,
        order_option_id,
        total_amount,
        payment_method,
        transaction_id,
        shipping_address_id
    ))

def insert_order_items(cursor, order_id, items):
	order_items = []
	for item in items:
		order_item_id = item.get('order_item_id')
		order_items.append((
			order_item_id,
			order_id,
			item['product_id'],
			item['supplier_product_id'],
			item['quantity'],
			item['price']
		))

	query = """
		INSERT INTO order_items (
			order_item_id, order_id, product_id, supplier_product_id, quantity, price
		) VALUES %s
	"""
	execute_values(cursor, query, order_items)