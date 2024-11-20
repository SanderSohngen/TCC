import os
import json
import uuid
import boto3
import bcrypt
import psycopg2
from botocore.exceptions import ClientError
import boto3


def lambda_handler(event, context):
    body = json.loads(event['body'])
    user_type = body.get('user_type')

    user_creation_map = {
        'patient': create_patient,
        'professional': create_professional,
        'company': create_company
    }
    
    if user_type not in user_creation_map:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Tipo de usuário inválido.'})
        }
    
    response = create_user(body, user_creation_map[user_type])
    return response

def create_user(body, specific_user_function):
    conn = None
    cursor = None
    try:
        conn, cursor = connect_db()
        email = body.get('email')
        password = body.get('password')
        name = body.get('name')
        address_data = body.get('address')

        if not all([email, password, name]):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json; charset=utf-8'},
                'body': json.dumps({'error': 'Campos obrigatórios ausentes.'})
            }
        user_id = str(uuid.uuid4())
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

        insert_user_query = """
            INSERT INTO users (user_id, email, password_hash, name, user_type)
            VALUES (%s, %s, %s, %s, %s)
        """
        cursor.execute(insert_user_query, (user_id, email, password_hash, name, body.get('user_type')))

        address_id = None
        if address_data:
            address_id = create_address(cursor, address_data)
            if isinstance(address_id, dict):
                conn.rollback()
                return address_id

        response = specific_user_function(cursor, body, user_id, address_id)
        if response.get('statusCode') != 201:
            conn.rollback()
            return response

        conn.commit()
        return response

    except Exception as e:
        if conn:
            conn.rollback()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': f'Erro inesperado: {str(e)}'})
        }
    finally:
        if cursor:
            cursor.close()
        if conn:
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

def create_patient(cursor, body, user_id, address_id):
    patient_data = body.get('patient_data', {})
    birthday = patient_data.get('birthday')
    weight = patient_data.get('weight')
    height = patient_data.get('height')
    gender = patient_data.get('gender')
    food_restrictions = patient_data.get('food_restrictions')

    if not all([birthday, weight, height, gender, food_restrictions]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Dados obrigatórios do paciente ausentes.'})
        }

    insert_patient_query = """
        INSERT INTO patients (patient_id, birthday, weight, height, gender, food_restrictions, address_id)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_patient_query, (user_id, birthday, weight, height, gender, food_restrictions, address_id))

    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json; charset=utf-8'},
        'body': json.dumps({'message': 'Paciente criado com sucesso.', 'user_id': user_id})
    }

def create_professional(cursor, body, user_id, _):
    professional_data = body.get('professional_data', {})
    profession = professional_data.get('profession')
    credentials = professional_data.get('credentials')
    price = professional_data.get('price')
    bio = professional_data.get('bio')
    specialties = professional_data.get('specialties')

    if not all([profession, credentials, price]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Dados obrigatórios do profissional ausentes.'})
        }

    insert_professional_query = """
        INSERT INTO professionals (professional_id, profession, credentials, price, bio, specialties)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_professional_query, (user_id, profession, credentials, price, bio, specialties))

    create_availabilities(user_id)

    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json; charset=utf-8'},
        'body': json.dumps({'message': 'Profissional criado com sucesso.', 'user_id': user_id})
    }

def create_company(cursor, body, user_id, address_id):
    company_data = body.get('company_data', {})
    cnpj = company_data.get('cnpj')
    company_type = company_data.get('company_type')
    api_key = company_data.get('api_key')
    products_endpoint = company_data.get('products_endpoint')
    orders_endpoint = company_data.get('orders_endpoint')

    if not all([cnpj, company_type, api_key, products_endpoint, orders_endpoint]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Dados obrigatórios da empresa ausentes.'})
        }

    insert_company_query = """
        INSERT INTO companies (
            company_id, cnpj, company_type, api_key, products_endpoint, orders_endpoint, address_id
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    cursor.execute(insert_company_query, (
        user_id,
        cnpj,
        company_type,
        api_key,
        products_endpoint,
        orders_endpoint,
        address_id
    ))

    return {
        'statusCode': 201,
        'headers': {'Content-Type': 'application/json; charset=utf-8'},
        'body': json.dumps({'message': 'Empresa criada com sucesso.', 'user_id': user_id})
    }

def create_address(cursor, address_data):
    street = address_data.get('street')
    neighborhood = address_data.get('neighborhood')
    city = address_data.get('city')
    state = address_data.get('state')
    house_number = address_data.get('house_number')
    complement = address_data.get('complement', '')

    if not all([street, neighborhood, city, state, house_number]):
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Parâmetros obrigatórios do endereço ausentes.'})
        }

    address_components = [street, house_number, complement, neighborhood, city, state]
    address_query = ', '.join(filter(None, address_components))
    
    place_index_name = os.environ.get('PlaceIndex')
    if not place_index_name:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': 'Nome do Place Index não configurado.'})
        }
    
    location = boto3.client('location')
    try:
        response = location.search_place_index_for_text(
            IndexName=place_index_name,
            Text=address_query,
            MaxResults=1
        )
        results = response.get('Results', [])
        if not results:
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json; charset=utf-8'},
                'body': json.dumps({'error': 'Endereço não encontrado.'})
            }

        place = results[0]['Place']
        processed_address = {
            'street': place.get('Street', street),
            'house_number': place.get('AddressNumber', house_number),
            'complement': complement,
            'neighborhood': place.get('Neighborhood', place.get('SubMunicipality', neighborhood)),
            'city': place.get('Municipality'),
            'state': place.get('Region'),
            'country': place.get('Country'),
            'postcode': place.get('PostalCode'),
            'latitude': float(place['Geometry']['Point'][1]),
            'longitude': float(place['Geometry']['Point'][0])
        }

    except ClientError as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': f'Erro ao chamar o Amazon Location Service: {str(e)}'})
        }

    try:
        address_id = str(uuid.uuid4())
        insert_address_query = """
            INSERT INTO addresses (
                address_id, street, house_number, complement, neighborhood, city, state, zip_code, country, latitude, longitude
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(insert_address_query, (
            address_id,
            processed_address['street'],
            processed_address['house_number'],
            processed_address['complement'],
            processed_address['neighborhood'],
            processed_address['city'],
            processed_address['state'],
            processed_address['postcode'],
            processed_address['country'],
            processed_address['latitude'],
            processed_address['longitude']
        ))

        return address_id

    except psycopg2.Error as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json; charset=utf-8'},
            'body': json.dumps({'error': f'Erro no banco de dados: {str(e)}'})
        }

def create_availabilities(user_id):
    sqs_client, sqs_url = sqs_connection()
    message = {
        'user_id': user_id
    }
    sqs_client.send_message(
        QueueUrl=sqs_url,
        MessageBody=json.dumps(message)
    )

def sqs_connection():
    sqs_client = boto3.client('sqs')
    sqs_url = os.environ['SQS_URL']
    return sqs_client, sqs_url