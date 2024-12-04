import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import boto3

PLAN_TYPE_RESTRICTIONS = {
    "medic": ["medication"],
    "nutritionist": ["nutrition"],
    "personal_trainer": ["exercise"],
    "psycologist": ["therapy"],
}

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    if user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    body = json.loads(event.get('body', '{}'))
    required_fields = ['patient_id', 'plan_type', 'description', 'items', 'profession']
    for field in required_fields:
        if field not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"Field '{field}' is required."}, ensure_ascii=False)
            }

    patient_id = body['patient_id']
    plan_type = body['plan_type']
    description = body['description']
    items = body['items']
    profession = body['profession']

    allowed_plan_types = PLAN_TYPE_RESTRICTIONS.get(profession, [])
    if plan_type not in allowed_plan_types:
        return {
            "statusCode": 403,
            "body": json.dumps({"error": f"Plan type '{plan_type}' not allowed for profession '{profession}'."}, ensure_ascii=False)
        }

    conn, cursor = connect_db()
    try:
        plan = create_plan(cursor, patient_id, user_id, plan_type, description)
        plan_id = plan['plan_id']
        plan_items = []

        for item in items:
            if 'product_id' not in item or 'quantity' not in item:
                return {
                    "statusCode": 400,
                    "body": json.dumps({"error": "Each item must contain 'product_id' and 'quantity'."}, ensure_ascii=False)
                }
            plan_item = create_plan_item(cursor, plan_id, item['product_id'], item['quantity'], item.get('instructions'))
            plan_item['product_name'] = item['product_name']
            plan_item['quantity'] = item['quantity']
            plan_items.append(plan_item)

        conn.commit()
        send_message_to_sqs(plan_id, plan_type, plan_items)

        return {
            "statusCode": 201,
            "body": json.dumps(plan, ensure_ascii=False, default=str)
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

def create_plan(cursor, patient_id, professional_id, plan_type, description):
    query = """
        INSERT INTO plans (patient_id, professional_id, plan_type, description, created_at)
        VALUES (%s, %s, %s, %s, NOW())
        RETURNING plan_id, patient_id, professional_id, plan_type, description, created_at
    """
    cursor.execute(query, (patient_id, professional_id, plan_type, description))
    return cursor.fetchone()

def create_plan_item(cursor, plan_id, product_id, quantity, instructions):
    query = """
        INSERT INTO plan_items (plan_id, product_id, quantity, instructions)
        VALUES (%s, %s, %s, %s)
        RETURNING plan_item_id, plan_id, product_id, quantity, instructions
    """
    cursor.execute(query, (plan_id, product_id, quantity, instructions))
    return cursor.fetchone()

def send_message_to_sqs(plan_id, plan_type, plan_items):
    sqs = boto3.client('sqs')
    queue_url = os.environ['PLAN_ORDER_OPTIONS_QUEUE_URL']

    message = {
        'plan_id': str(plan_id),
        'plan_type': plan_type,
        'plan_items': plan_items
    }

    sqs.send_message(
        QueueUrl=queue_url,
        MessageBody=json.dumps(message, default=str)
    )
