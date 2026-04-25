# MRN Management System

A professional Material Request Note (MRN) management system designed for **Amaranayaka Holdings**. This system facilitates the internal requisition of materials across multiple departments and locations, featuring a multi-item request workflow, multi-level status tracking, and a formal printable format.

## 🚀 Features

- **Role-Based Access**: Specialized views for Requesters, COOs (Approvers), and Fulfillment (Inventory) staff.
- **Multi-Item Requests**: Submit multiple items within a single MRN sheet.
- **Real-Time Dashboard**: Quick overview of Total, Pending, Approved, and Fulfilled requests.
- **Search & Filtering**: Search by MRN number, item name, or requester, and filter by status.
- **Printable Documents**: Generate formal MRN sheets with digital signature placeholders for approvals.
- **Responsive Design**: Modern, glassmorphic UI that works on desktops and tablets.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3 (Vanilla), JavaScript (ES6+)
- **Backend**: PHP 7.4+
- **Database**: MySQL (using PDO for secure transactions)

## 📦 Installation & Setup

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) (or any WAMP/LEMP stack)
- Web Browser (Chrome/Edge recommended)

### Step 1: Clone/Download the Project
Move the project folder into your XAMPP server directory:
`C:\xampp\htdocs\MRN`

### Step 2: Database Setup
1. Start **Apache** and **MySQL** via the XAMPP Control Panel.
2. Open [http://localhost/phpmyadmin/](http://localhost/phpmyadmin/).
3. Create a new database named `mrn`.
4. Select the `mrn` database and click **Import**.
5. Upload the `database.sql` file located in the project root.

### Step 3: Configure Database Connection
Open `api/db.php` and update the credentials if necessary:
```php
$host = 'localhost';
$dbname = 'mrn';
$username = 'root'; // Change if using a different user
$password = '';     // Change if you have a MySQL password
```

### Step 4: Run the Application
Navigate to [http://localhost/MRN/](http://localhost/MRN/) in your browser.

## 🔑 Demo Accounts
*All passwords are `12345`*
- **Requester**: `requester1`
- **COO (Approver)**: `coo`
- **Fulfillment (Stores)**: `inventory`

## 🛠️ Troubleshooting & Error Fixing

### "Network error. Make sure API is running"
- **Cause**: The frontend cannot reach the PHP files in the `api/` directory.
- **Fix**: Ensure Apache is started in XAMPP. If you are using VS Code's "Live Server" (Port 5500), it will not work with the PHP backend. Always access the site via `http://localhost/MRN/`.

### Live Refresh Not Working
- **Cause**: PHP files aren't natively supported by standard Live Server extensions.
- **Fix**: Use the **Five Server** extension in VS Code or configure a proxy in your Live Server settings to point to `http://localhost/MRN/`.

### Database Connection Failed
- **Cause**: Incorrect credentials in `api/db.php` or the database `mrn` hasn't been created.
- **Fix**: Verify your MySQL username/password and ensure you've imported `database.sql`.

### CSS/JS Changes Not Showing
- **Cause**: Browser caching.
- **Fix**: I have implemented versioning in `index.html`. When making changes, increment the version number:
  `<link rel="stylesheet" href="css/style.css?v=1.2">`

---
*Developed for Amaranayaka Holdings Material Management Workflow.*
