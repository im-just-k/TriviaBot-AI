def handler(event, context):
    path = event.get('path', '')
    method = event.get('httpMethod', '')

    if path == '/api/' and method == 'GET':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': '{"message": "TriviaBot backend is running!"}'
        }
    elif path == '/api/chat' and method == 'POST':
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': '{"response": "Test response from backend!"}'
        }
    else:
        return {
            'statusCode': 404,
            'body': 'Not Found'
        }