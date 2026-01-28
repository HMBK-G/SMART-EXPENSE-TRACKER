from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime, timedelta
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import uuid
from functools import wraps

app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'your-secret-key-change-this'  # Change in production

# MySQL Connection
def get_db_connection():
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DATABASE
    )

# ===== AUTHENTICATION FUNCTIONS =====
def generate_token(user_id):
    """Generate JWT token for user session"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

def verify_token(token):
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return payload['user_id']
    except:
        return None

def token_required(f):
    """Decorator to protect routes and extract user_id from token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except:
                return jsonify({'error': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        user_id = verify_token(token)
        if not user_id:
            return jsonify({'error': 'Invalid or expired token'}), 401
        
        request.user_id = user_id
        return f(*args, **kwargs)
    return decorated

# Test Connection
@app.route('/api/test', methods=['GET'])
def test():
    try:
        conn = get_db_connection()
        conn.close()
        return jsonify({'status': 'Connected to MySQL successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- EXPENSES ROUTES ---

@app.route('/api/expenses', methods=['GET'])
@token_required
def get_expenses():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Return only logged-in user's expenses
        query = 'SELECT id, user_id, amount, category, date, note, created_at FROM expenses WHERE user_id = %s ORDER BY date DESC'
        cursor.execute(query, (request.user_id,))
        expenses = cursor.fetchall()
        
        # Convert date objects to strings for JSON serialization
        for exp in expenses:
            if exp['date'] and hasattr(exp['date'], 'isoformat'):
                exp['date'] = exp['date'].isoformat()
            elif not exp['date']:
                exp['date'] = ''
        
        cursor.close()
        conn.close()
        return jsonify(expenses), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses', methods=['POST'])
@token_required
def add_expense():
    try:
        data = request.get_json()
        if not data or 'category' not in data or 'amount' not in data or 'date' not in data:
            return jsonify({'error': 'Missing required fields: category, amount, date'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Support both 'note' and 'description' keys from frontend
        note_content = data.get('note') or data.get('description') or ''
        
        query = 'INSERT INTO expenses (category, amount, note, date, user_id) VALUES (%s, %s, %s, %s, %s)'
        cursor.execute(query, (
            data['category'],
            data['amount'],
            note_content,
            data['date'],
            request.user_id
        ))
        
        conn.commit()
        expense_id = cursor.lastrowid
        cursor.close()
        conn.close()
        
        return jsonify({'id': expense_id, 'success': True}), 201
    except Exception as e:
        print(f"Error adding expense: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
@token_required
def update_expense(expense_id):
    try:
        data = request.get_json()
        note_content = data.get('note') or data.get('description') or ''
        
        conn = get_db_connection()
        cursor = conn.cursor()
        query = 'UPDATE expenses SET category=%s, amount=%s, note=%s, date=%s WHERE id=%s AND user_id=%s'
        cursor.execute(query, (
            data['category'],
            data['amount'],
            note_content,
            data['date'],
            expense_id,
            request.user_id
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
@token_required
def delete_expense(expense_id):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id = %s AND user_id = %s', (expense_id, request.user_id))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- BUDGET ROUTES ---

@app.route('/api/budgets', methods=['GET'])
@token_required
def get_budgets():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT category, monthly_limit as amount FROM budgets WHERE user_id = %s', (request.user_id,))
        budgets = cursor.fetchall()
        cursor.close()
        conn.close()
        
        result = {'monthly': 0, 'categoryBudgets': {}}
        for b in budgets:
            if b['category'] == 'total':
                result['monthly'] = b['amount']
            else:
                result['categoryBudgets'][b['category']] = b['amount']
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/budgets', methods=['PUT'])
@token_required
def update_budgets():
    try:
        data = request.get_json()
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if 'monthly' in data:
            cursor.execute('UPDATE budgets SET monthly_limit=%s WHERE category=%s AND user_id=%s', (data['monthly'], 'total', request.user_id))
        
        if 'categoryBudgets' in data:
            for category, amount in data['categoryBudgets'].items():
                cursor.execute('UPDATE budgets SET monthly_limit=%s WHERE category=%s AND user_id=%s', (amount, category, request.user_id))
        
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({'success': True}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# --- INSIGHTS ROUTE ---

@app.route('/api/insights', methods=['GET'])
def get_insights():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
        expenses = cursor.fetchall()
        cursor.execute('SELECT category, monthly_limit as amount FROM budgets')
        budgets = cursor.fetchall()
        cursor.close()
        conn.close()
        
        insights = []
        now = datetime.now()
        current_month = now.strftime('%Y-%m')
        last_month = (now.replace(day=1) - timedelta(days=1)).strftime('%Y-%m')
        
        # DATE FIX: Using strftime because MySQL returns date objects
        current_month_expenses = [exp for exp in expenses if exp['date'].strftime('%Y-%m') == current_month]
        last_month_expenses = [exp for exp in expenses if exp['date'].strftime('%Y-%m') == last_month]
        
        current_total = sum(exp['amount'] for exp in current_month_expenses)
        budget_dict = {b['category']: b['amount'] for b in budgets}
        monthly_limit = budget_dict.get('total', 50000)

        # Basic Budget Prediction
        if current_total > (monthly_limit * 0.8):
            insights.append({
                'id': 'high-spending',
                'type': 'warning',
                'title': 'Budget Alert',
                'message': f"You have used over 80% of your ₹{int(monthly_limit):,} budget.",
                'icon': '⚠️'
            })

        return jsonify(insights), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== AUTHENTICATION ENDPOINTS =====

# SIGNUP
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """Register a new user and auto-login"""
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['first_name', 'last_name', 'email', 'password']
        if not all(field in data for field in required_fields):
            return jsonify({'error': 'Missing required fields: first_name, last_name, email, password'}), 400
        
        first_name = data['first_name'].strip()
        last_name = data['last_name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        if not email or not password:
            return jsonify({'error': 'Email and password cannot be empty'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if email already exists
        cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
        if cursor.fetchone():
            cursor.close()
            conn.close()
            return jsonify({'error': 'Email already registered'}), 409
        
        # Hash password
        hashed_password = generate_password_hash(password)
        
        # Insert new user
        cursor.execute(
            'INSERT INTO users (first_name, last_name, email, password) VALUES (%s, %s, %s, %s)',
            (first_name, last_name, email, hashed_password)
        )
        conn.commit()
        user_id = cursor.lastrowid
        
        # Create default budgets for new user
        default_budgets = [
            ('total', 50000),
            ('food', 10000),
            ('travel', 5000),
            ('shopping', 8000),
            ('rent', 15000),
            ('utilities', 3000),
            ('entertainment', 5000),
            ('health', 3000),
            ('other', 1000)
        ]
        
        for category, limit in default_budgets:
            cursor.execute(
                'INSERT INTO budgets (user_id, category, monthly_limit) VALUES (%s, %s, %s)',
                (user_id, category, limit)
            )
        
        conn.commit()
        cursor.close()
        conn.close()
        
        # Auto-login: Generate token
        token = generate_token(user_id)
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user_id,
                'first_name': first_name,
                'last_name': last_name,
                'email': email
            }
        }), 201
    
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# LOGIN
@app.route('/api/auth/login', methods=['POST'])
def login():
    """Authenticate user and create session"""
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({'error': 'Email and password required'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Find user by email
        cursor.execute('SELECT id, first_name, last_name, email, password FROM users WHERE email = %s', (email,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'error': 'Invalid email or password'}), 401
        
        # Generate token
        token = generate_token(user['id'])
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'first_name': user['first_name'],
                'last_name': user['last_name'],
                'email': user['email']
            }
        }), 200
    
    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# LOGOUT
@app.route('/api/auth/logout', methods=['POST'])
@token_required
def logout():
    """Logout user - token becomes invalid"""
    # In a production app, you'd invalidate the token in the DB
    # For now, frontend just clears the token
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200

# VALIDATE SESSION
@app.route('/api/auth/validate', methods=['GET'])
@token_required
def validate_session():
    """Check if current session is valid"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id, first_name, last_name, email FROM users WHERE id = %s', (request.user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)