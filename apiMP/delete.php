<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');
include_once 'db.php';

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Get and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    $product_id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
    
    if (!$product_id) {
        throw new Exception('Invalid product ID');
    }

    // Use transaction to ensure data consistency
    $pdo->beginTransaction();

    try {
        // Get image path before deleting the product
        $stmt = $pdo->prepare("SELECT image_path FROM products WHERE id = ?");
        $stmt->execute([$product_id]);
        $image_path = $stmt->fetchColumn();

        if (!$image_path) {
            throw new Exception('Product not found');
        }

        // Delete the product
        $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
        $result = $stmt->execute([$product_id]);

        if (!$result) {
            throw new Exception('Failed to delete product');
        }

        // If deletion was successful and image exists, delete it
        if ($image_path && file_exists($image_path)) {
            unlink($image_path);
        }

        $pdo->commit();
        $response['success'] = true;
        $response['message'] = 'Product deleted successfully';

    } catch (Exception $e) {
        $pdo->rollBack();
        throw $e;
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>