<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

// Security Check: Only admins can access this file
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized: Admin access required']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // List all users (excluding passwords)
        $stmt = $pdo->query("SELECT id, username, role, full_name, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll();
        echo json_encode($users);
        break;

    case 'POST':
        // Create new user
        $data = json_decode(file_get_contents('php://input'), true);
        
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        $role = $data['role'] ?? '';
        $full_name = $data['full_name'] ?? '';

        if (!$username || !$password || !$role || !$full_name) {
            http_response_code(400);
            echo json_encode(['error' => 'All fields are required']);
            exit;
        }

        // Check if username exists
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
        $checkStmt->execute([$username]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Username already exists']);
            exit;
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        try {
            $stmt = $pdo->prepare("INSERT INTO users (username, password, role, full_name) VALUES (?, ?, ?, ?)");
            $stmt->execute([$username, $hashedPassword, $role, $full_name]);
            echo json_encode(['success' => true, 'message' => 'User created successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        // Delete user
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID required']);
            exit;
        }

        $id = $_GET['id'];

        // Prevent self-deletion if needed (optional)
        if ($id == $_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'You cannot delete yourself']);
            exit;
        }

        try {
            $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true, 'message' => 'User deleted successfully']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Cannot delete user (likely has associated records)']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
?>
