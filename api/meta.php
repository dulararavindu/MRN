<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$stmt_dept = $pdo->query("SELECT id, name FROM departments ORDER BY name");
$departments = $stmt_dept->fetchAll();

$stmt_loc = $pdo->query("SELECT id, name FROM locations ORDER BY name");
$locations = $stmt_loc->fetchAll();

echo json_encode([
    'departments' => $departments,
    'locations' => $locations
]);
?>
