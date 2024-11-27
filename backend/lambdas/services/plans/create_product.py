import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

# Mapeamento de categorias permitidas por profissão
CATEGORY_RESTRICTIONS = {
    "medic": ["medication", "exam"],
    "nutritionist": ["food"],
    "personal_trainer": ["sports_item", "membership"],
    "psycologist": [],
}

def lambda_handler(event, context):
    claims = get_claims(event)
    user_id = claims.get("custom:user_id")
    user_type = claims.get("custom:user_type")

    body = json.loads(event.get("body", "{}"))
    print(body)
    name = body.get("name")
    description = body.get("description")
    category = body.get("category")
    profession = body.get("profession")
    
    if not user_id or user_type != "professional":
        return {
            "statusCode": 403,
            "body": json.dumps({"error": "Access denied"}, ensure_ascii=False)
        }
    

    if not all([name, description, category, profession]):
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required fields: 'name', 'description', 'category', 'profession'"}, ensure_ascii=False)
        }

    try:
        allowed_categories = CATEGORY_RESTRICTIONS.get(profession.lower(), [])
        if category.lower() not in allowed_categories:
            return {
                "statusCode": 403,
                "body": json.dumps({"error": f"Category '{category}' not allowed for profession '{profession}'"}, ensure_ascii=False)
            }

        conn, cursor = connect_db()
        product = create_product(cursor, conn, name, description, category)

        return {
            "statusCode": 201,
            "body": json.dumps(product, ensure_ascii=False, default=str)
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

def create_product(cursor, conn, name, description, category):
    query = """
        INSERT INTO products (name, description, category)
        VALUES (%s, %s, %s)
        RETURNING product_id, name, description, category, created_at
    """
    cursor.execute(query, (name, description, category))
    conn.commit()
    return cursor.fetchone()