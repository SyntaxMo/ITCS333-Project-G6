<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

include_once 'db.php';

$response = ['success' => false, 'message' => '', 'data' => null];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        throw new Exception('Invalid request method');
    }

    // Check if specific item ID is requested
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $item = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$item) {
            throw new Exception('Item not found');
        }
        
        $response['data'] = $item;
    } else {
        // Get all items
        // Always order by created_at DESC by default for consistency
        $query = "SELECT * FROM products ORDER BY created_at DESC";
        $stmt = $pdo->prepare($query);
        $stmt->execute();
        
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Ensure all items have the required fields
        $items = array_map(function($item) {
            return [
                'id' => $item['id'],
                'name' => $item['name'],
                'description' => $item['description'],
                'price' => $item['price'],
                'category_id' => $item['category_id'],
                'image_path' => $item['image_path'],
                'created_at' => $item['created_at']
            ];
        }, $items);
        
        $response['data'] = $items;
    }

    $response['success'] = true;

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);  // Set appropriate error code
}

echo json_encode($response);
