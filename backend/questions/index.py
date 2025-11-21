import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления анонимными вопросами
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с вопросами или статусом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "SELECT id, question_text, created_at, answered, answer_text, answered_at "
                    "FROM questions ORDER BY created_at DESC"
                )
                questions = cur.fetchall()
                
                for q in questions:
                    if q['created_at']:
                        q['created_at'] = q['created_at'].isoformat()
                    if q['answered_at']:
                        q['answered_at'] = q['answered_at'].isoformat()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'questions': questions})
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            question_text = body_data.get('question_text', '').strip()
            
            if not question_text:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Question text is required'})
                }
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(
                    "INSERT INTO questions (question_text) VALUES (%s) RETURNING id, created_at",
                    (question_text,)
                )
                result = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({
                        'success': True,
                        'id': result['id'],
                        'created_at': result['created_at'].isoformat()
                    })
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            question_id = body_data.get('id')
            answer_text = body_data.get('answer_text', '').strip()
            
            if not question_id or not answer_text:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'error': 'Question ID and answer text are required'})
                }
            
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE questions SET answer_text = %s, answered = TRUE, answered_at = CURRENT_TIMESTAMP "
                    "WHERE id = %s",
                    (answer_text, question_id)
                )
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'isBase64Encoded': False,
                    'body': json.dumps({'success': True})
                }
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        conn.close()
