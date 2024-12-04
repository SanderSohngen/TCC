import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid

def lambda_handler(event, context):
    conn, cursor = connect_db()

    try:
        record = event['Records'][0]
        message = json.loads(record['body'])
        partner_id = message['partner_id']
        products_endpoint = message['products_endpoint']
        plan_id = message['plan_id']
        plan_items = message['plan_items']

        partner_has_all_products, products_data = check_partner_products(products_endpoint, plan_items)

        if partner_has_all_products:
            create_order_option(cursor, plan_id, partner_id, plan_items, products_data)
            conn.commit()
            print(f"Order option created for partner {partner_id}")
        else:
            print(f"Partner {partner_id} does not have all products.")

    except Exception as e:
        print(f"Error: {e}")
        conn.rollback()
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
    conn = psycopg2.connect(**db_params)
    cursor = conn.cursor()
    return conn, cursor

def check_partner_products(products_endpoint, plan_items):
    # Código real para chamada à API do parceiro (comentado)
    """
    import requests
    product_names = [item['product_name'] for item in plan_items]
    response = requests.post(f"{orders_endpoint}/check_products", json={'products': product_names})
    if response.status_code == 200:
        data = response.json()
        partner_has_all_products = data['has_all_products']
        products_data = data['products_data']  # Dicionário com informações dos produtos
    else:
        partner_has_all_products = False
        products_data = {}
    """

    # Simulação da resposta do parceiro
    partner_has_all_products = True
    products_data = {}
    for item in plan_items:
        products_data[item['product_name']] = {
            'supplier_product_id': str(uuid.uuid4()),
            'price': round(10 + (hash(item['product_name']) % 10), 2)
        }
    return partner_has_all_products, products_data

def create_order_option(cursor, plan_id, partner_id, plan_items, products_data):
    order_option_id = str(uuid.uuid4())
    total_price = 0

    insert_order_option = """
        INSERT INTO order_options (order_option_id, plan_id, company_id, total_price)
        VALUES (%s, %s, %s, %s)
    """

    item_options_values = []
    for item in plan_items:
        product_name = item['product_name']
        product_data = products_data[product_name]
        price = product_data['price']
        quantity = item['quantity']
        total_price += price * quantity

        item_option_id = str(uuid.uuid4())
        item_options_values.append((
            item_option_id,
            order_option_id,
            item['plan_item_id'],
            partner_id,
            product_data['supplier_product_id'],
            price,
            quantity
        ))

    cursor.execute(insert_order_option, (
        order_option_id,
        plan_id,
        partner_id,
        total_price,
    ))

    insert_item_option = """
        INSERT INTO item_options (
            item_option_id, order_option_id, plan_item_id, company_id,
            supplier_product_id, price, quantity
        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.executemany(insert_item_option, item_options_values)
