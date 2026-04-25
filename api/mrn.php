<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$action = $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'];
$role = $_SESSION['role'];

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET MRN Sheets
    $query = "
        SELECT m.id, m.purpose, m.status, m.created_at,
               u.full_name as requester_name, d.name as department_name, l.name as location_name
        FROM mrns m
        JOIN users u ON m.requester_id = u.id
        JOIN departments d ON m.department_id = d.id
        JOIN locations l ON m.location_id = l.id
    ";
    
    // Filter based on role
    if ($role === 'requester') {
        $query .= " WHERE m.requester_id = :user_id";
        $stmt = $pdo->prepare($query . " ORDER BY m.created_at DESC");
        $stmt->execute(['user_id' => $user_id]);
    } else {
        $stmt = $pdo->prepare($query . " ORDER BY m.created_at DESC");
        $stmt->execute();
    }
    
    $mrns = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch items for each MRN
    foreach ($mrns as &$mrn) {
        $item_stmt = $pdo->prepare("SELECT id, item_name, quantity FROM mrn_items WHERE mrn_id = ?");
        $item_stmt->execute([$mrn['id']]);
        $mrn['items'] = $item_stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode($mrns);
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // CREATE MRN Sheet and Items (Only Requesters)
    $data = json_decode(file_get_contents('php://input'), true);
    
    $department_id = $data['department_id'] ?? null;
    $location_id = $data['location_id'] ?? null;
    $purpose = $data['purpose'] ?? '';
    $items = $data['items'] ?? [];
    
    if (!$department_id || !$location_id || empty($items)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields or no items provided']);
        exit;
    }
    
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("INSERT INTO mrns (requester_id, department_id, location_id, purpose) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $department_id, $location_id, $purpose]);
        $mrn_id = $pdo->lastInsertId();

        $item_stmt = $pdo->prepare("INSERT INTO mrn_items (mrn_id, item_name, quantity) VALUES (?, ?, ?)");
        foreach ($items as $item) {
            $item_stmt->execute([$mrn_id, $item['item_name'], $item['quantity']]);
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'id' => $mrn_id]);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Database error while saving MRN']);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // UPDATE MRN STATUS (COO or Fulfillment)
    $data = file_get_contents('php://input');
    $data = json_decode($data, true);
    
    $mrn_id = $data['id'] ?? null;
    $new_status = $data['status'] ?? '';
    
    if (!$mrn_id || !$new_status) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }
    
    // Validations based on roles
    if ($role === 'coo' && !in_array($new_status, ['approved', 'rejected'])) {
        http_response_code(403);
        echo json_encode(['error' => 'COO can only approve or reject']);
        exit;
    }
    
    if ($role === 'fulfillment' && $new_status !== 'fulfilled') {
        http_response_code(403);
        echo json_encode(['error' => 'Fulfillment can only mark as fulfilled']);
        exit;
    }
    
    if ($role === 'requester') {
        http_response_code(403);
        echo json_encode(['error' => 'Requesters cannot change status']);
        exit;
    }
    
    $stmt = $pdo->prepare("UPDATE mrns SET status = ? WHERE id = ?");
    $stmt->execute([$new_status, $mrn_id]);
    
    echo json_encode(['success' => true]);
}
?>
