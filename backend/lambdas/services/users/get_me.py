import os
import json
import psycopg2

def lambda_handler(event, context):
    email = get_email(event)
    conn, cursor = connect_db()
    user_id, user_type, name = get_user_data(conn, cursor, email)
    user_data = {
        'user_id': user_id,
        'user_type': user_type,
        'name': name
    }
    if user_data:
         return {
            'statusCode': 200,
            'body': json.dumps(user_data)
         }
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Usuário não encontrado.'})
    }
    
def get_email(event):
    request_context = event.get('requestContext')
    authorizer = request_context.get('authorizer')
    jwt = authorizer.get('jwt')
    claims = jwt.get('claims')
    return claims.get('email')

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

def get_user_data(conn, cursor, email):
    query = """
        SELECT user_id, user_type, name
        FROM users
        WHERE email = %s
    """
    cursor.execute(query, (email,))
    user_data = cursor.fetchone()
    return user_data