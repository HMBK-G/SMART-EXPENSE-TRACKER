# 💸 ExpenseAI – Smart Expense Tracker

ExpenseAI is a modern, AI-assisted expense tracking web application that helps users monitor spending, manage budgets, and gain intelligent financial insights through a clean and user-friendly dashboard.

---

## 🚀 Features

- 🔐 User Authentication (Signup & Login)
- 👤 User-specific expense storage
- 💰 Monthly budget tracking with progress bar
- 📊 Recent expenses overview
- 🤖 AI Spending Coach (smart alerts & tips)
- 📈 Analytics & budget insights (planned)
- 🔒 Secure backend logic
- 🔑 Password hashing
- 🚪 Explicit logout handling
- 📱 Responsive UI

---

## 🛠️ Tech Stack

### Frontend
- HTML
- CSS
- JavaScript

### Backend
- Python (Flask)
- MySQL
- Flask Sessions / JWT
- bcrypt

### Tools
- Git & GitHub
- VS Code
- Node.js & npm (optional)

---

## 📂 Project Structure

ExpenseAI/
│
├── frontend/
│ ├── index.html
│ ├── styles.css
│ ├── script.js
│
├── backend/
│ ├── app.py
│ ├── config.py
│ ├── models.py
│ ├── routes/
│ │ ├── auth.py
│ │ ├── expenses.py
│ │ └── budgets.py
│ └── requirements.txt
│
├── database/
│ └── schema.sql
│
├── README.md
└── .gitignore




---

## ⚙️ Prerequisites

Ensure you have the following installed:

- Python 3.9+
- MySQL 8+
- Node.js & npm
- Git

Check versions:

```bash
python --version
mysql --version
node --version
npm --version



git clone https://github.com/your-username/ExpenseAI.git
cd ExpenseAI


```
cd backend
python -m venv venv




venv\Scripts\activate

pip install -r requirements.txt
python app.py
