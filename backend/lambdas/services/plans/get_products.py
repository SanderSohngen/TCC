import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

CATEGORY_RESTRICTIONS = {
    "medic": ["medication", "exam"],
    "nutritionist": ["food"],
    "personal_trainer": ["sports_item", "membership"],
}

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    body = json.loads(event.get("body", "{}"))
    categories = body.get("categories")
    profession = body.get("profession")
    print(profession)
    
    if not user_id or user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }

    if not all([categories, profession]):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required fields: 'categories', 'profession'"}, ensure_ascii=False)
        }

    try:
        allowed_categories = CATEGORY_RESTRICTIONS.get(profession.lower())
        if not allowed_categories:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": f"'{profession}' is not a valid profession"}, ensure_ascii=False)
            }

        invalid_categories = [
            category for category in categories
            if category.lower() not in allowed_categories
        ]
        
        if invalid_categories:
            return {
                "statusCode": 403,
                "body": json.dumps({
                    "error": f"Categories '{invalid_categories}' not allowed for profession '{profession}'"
                }, ensure_ascii=False)
            }

        conn, cursor = connect_db()
        products = list_products(cursor, categories)
        return {
            "statusCode": 200,
            "body": json.dumps(products, ensure_ascii=False, default=str)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}, ensure_ascii=False)
        }

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

def list_products(cursor, categories):
    placeholders = ', '.join(['%s'] * len(categories))
    query = f"""
        SELECT product_id, name, description, category, created_at 
        FROM products 
        WHERE category IN ({placeholders})
    """
    cursor.execute(query, categories)
    return cursor.fetchall()
