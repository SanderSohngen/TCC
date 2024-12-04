import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

def lambda_handler(event, context):
    claims = get_claims(event)
    user_type = claims.get("custom:user_type")
    user_id = claims.get("custom:user_id")

    if not user_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Invalid JWT claims"})
        }

    conn, cursor = connect_db()

    try:
        user_data = get_user_data(conn, cursor, user_id, user_type)
        if not user_data:
            return {
                "statusCode": 404,
                "body": json.dumps({"error": "User not found"})
            }

        return {
            "statusCode": 200,
            "body": json.dumps(user_data, ensure_ascii=False, default=str)
        }
    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
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

def get_user_data(conn, cursor, user_id, user_type):
    USER_TYPE_MAPPING = {
        'patient': {
            'table': 'patients',
            'join_column': 'patient_id',
            'fields': [
                'p.address_id',
                'p.birthday', 'p.weight', 'p.height', 'p.gender', 'p.food_restrictions',
                'a.street', 'a.house_number', 'a.complement', 'a.neighborhood',
                'a.city', 'a.state', 'a.zip_code', 'a.country'
            ],
            'join': 'LEFT JOIN addresses a ON p.address_id = a.address_id',
        },
        'professional': {
            'table': 'professionals',
            'join_column': 'professional_id',
            'fields': [
                'p.profession', 'p.credentials', 'p.price', 'p.is_verified', 'p.bio', 'p.specialties'
            ],
            'join': '',
        },
        'company': {
            'table': 'companies',
            'join_column': 'company_id',
            'fields': [
                'c.cnpj', 'c.company_type', 'c.is_verified', 'c.products_endpoint', 'c.orders_endpoint',
                'a.street', 'a.house_number', 'a.complement', 'a.neighborhood',
                'a.city', 'a.state', 'a.zip_code', 'a.country'
            ],
            'join': 'LEFT JOIN addresses a ON c.address_id = a.address_id',
        }
    }

    if user_type not in USER_TYPE_MAPPING:
        raise ValueError("Invalid user type")

    config = USER_TYPE_MAPPING[user_type]
    fields = ', '.join(config['fields'])
    join_clause = config['join']
    table = config['table']
    join_column = config['join_column']

    query = f"""
        SELECT 
            u.name, u.email, u.created_at, u.updated_at,
            {fields}
        FROM users u
        LEFT JOIN {table} {user_type[0]} ON u.user_id = {user_type[0]}.{join_column}
        {join_clause}
        WHERE u.user_id = %s AND u.user_type = %s
    """
    cursor.execute(query, (user_id, user_type))
    result = cursor.fetchone()
    return result