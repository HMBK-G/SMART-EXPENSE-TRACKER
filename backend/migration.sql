-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  note VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  category VARCHAR(50) NOT NULL,
  monthly_limit DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_category (user_id, category),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  token VARCHAR(500) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo users (passwords are hashed with werkzeug - password is "password")
INSERT IGNORE INTO users (id, first_name, last_name, email, password) VALUES
  (1, 'Demo', 'User', 'demo@example.com', 'scrypt:32768:8:1$dXupTJ0wNmN2R8VZ$7bbdfcb414c63f58de5f5b10d3215278e6bab5d7f686e01e5d49338bb2433bf27bf0e6b223156d88829e554938243afc698881cc4555bc602d9b1a4dbec5e9e5'),
  (2, 'himalaya', 'pink', 'eaxmple@gmail.com', 'scrypt:32768:8:1$dXupTJ0wNmN2R8VZ$7bbdfcb414c63f58de5f5b10d3215278e6bab5d7f686e01e5d49338bb2433bf27bf0e6b223156d88829e554938243afc698881cc4555bc602d9b1a4dbec5e9e5');

-- Insert default budgets for demo users
INSERT IGNORE INTO budgets (user_id, category, monthly_limit) VALUES
  (1, 'food', 10000),
  (1, 'travel', 5000),
  (1, 'shopping', 8000),
  (1, 'rent', 15000),
  (1, 'utilities', 3000),
  (1, 'entertainment', 5000),
  (1, 'health', 3000),
  (1, 'other', 1000),
  (2, 'food', 10000),
  (2, 'travel', 5000),
  (2, 'shopping', 8000),
  (2, 'rent', 15000),
  (2, 'utilities', 3000),
  (2, 'entertainment', 5000),
  (2, 'health', 3000),
  (2, 'other', 1000);

-- Insert sample expenses
INSERT IGNORE INTO expenses (user_id, amount, category, date, note) VALUES
  (1, 500.00, 'travel', '2026-01-27', 'Gas'),
  (2, 300.00, 'food', '2026-01-27', 'burger'),
  (2, 2000.00, 'shopping', '2026-01-27', 'at shopping'),
  (2, 25.00, 'other', '2026-01-27', 'at chai'),
  (2, 8000.00, 'entertainment', '2026-01-27', 'Event tickets');
