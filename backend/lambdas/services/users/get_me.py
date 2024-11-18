import json

def lambda_handler(event, context):
    request_context = event.get('requestContext')
    authorizer = request_context.get('authorizer')
    jwt = authorizer.get('jwt')
    claims = jwt.get('claims')
    user_id = claims.get('custom:user_id')
    user_type = claims.get('custom:user_type')
    name = claims.get('name')
    user_data = {
        'user_id': user_id,
        'user_type': user_type,
        'name': name
    }
    if user_data:
        return {
            'statusCode': 200,
            'body': json.dumps(user_data, ensure_ascii=False, default=str)
        }
    return {
        'statusCode': 404,
        'body': json.dumps({'error': 'Usuário não encontrado.'})
    }
