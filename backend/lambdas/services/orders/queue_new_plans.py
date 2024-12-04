import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

def lambda_handler(event, context):
    conn, cursor = connect_db()

    try:
        record = event['Records'][0]
        message = json.loads(record['body'])
        plan_id = message['plan_id']
        plan_type = message['plan_type']
        plan_items = message['plan_items']

        partners = fetch_partners_by_plan_type(cursor, plan_type)

        sqs = boto3.client('sqs')
        partner_queue_url = os.environ['PARTNER_ORDER_PROCESSING_QUEUE_URL']

        for partner in partners:
            partner_message = {
                'partner_id': str(partner['company_id']),
                'products_endpoint': partner['products_endpoint'],
                'plan_id': plan_id,
                'plan_items': plan_items
            }
            sqs.send_message(
                QueueUrl=partner_queue_url,
                MessageBody=json.dumps(partner_message)
            )

    except Exception as e:
        print(f"Erro: {e}")
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
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    return conn, cursor

def fetch_partners_by_plan_type(cursor, plan_type):
    plan_type_to_company_types = {
        'nutrition': ['market'],
        'exercise': ['sports_store', 'gym'],
        'therapy': ['pharmacy'],
        'medication': ['pharmacy', 'hospital']
    }
    company_types = plan_type_to_company_types.get(plan_type, ['market'])

    query = """
        SELECT company_id, products_endpoint
        FROM companies
        WHERE company_type = ANY(%s::company_type_enum[])
    """
    cursor.execute(query, (company_types,))
    return cursor.fetchall()