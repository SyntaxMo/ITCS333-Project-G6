<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

include_once 'db.php';

$response = ['success' => false, 'message' => '', 'data' => null];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Invalid input');
    }

    // Validate and sanitize inputs
    $name = trim($input['name'] ?? '');
    $description = trim($input['description'] ?? '');
    $price = filter_var($input['price'] ?? null, FILTER_VALIDATE_FLOAT);
    $category_id = filter_var($input['category_id'] ?? null, FILTER_VALIDATE_INT);
    $image_data = $input['image'] ?? null;

    // Validate required fields
    if (empty($name)) {
        throw new Exception('Name is required');
    }
    if (empty($description)) {
        throw new Exception('Description is required');
    }
    if ($price === false || $price < 0) {
        throw new Exception('Invalid price value');
    }
    if ($category_id === false || $category_id < 1) {
        throw new Exception('Invalid category');
    }
    if (empty($image_data)) {
        throw new Exception('Image is required');
    }

    // Validate name length
    if (strlen($name) > 255) {
        throw new Exception('Name is too long (maximum 255 characters)');
    }

    // Validate category exists
    $cat_stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
    $cat_stmt->execute([$category_id]);
    if (!$cat_stmt->fetch()) {
        throw new Exception('Invalid category selected');
    }

    // Process and validate image
    $image_data = base64_decode($image_data);
    if ($image_data === false) {
        throw new Exception('Invalid image format');
    }

    // Check if image data is actually an image
    $f = finfo_open();
    $mime_type = finfo_buffer($f, $image_data, FILEINFO_MIME_TYPE);
    finfo_close($f);
    
    if (!in_array($mime_type, ['image/jpeg', 'image/png', 'image/gif'])) {
        throw new Exception('Invalid image type. Only JPEG, PNG and GIF are allowed');
    }

    // Define the upload directory with proper permissions
    $upload_dir = 'uploads/images/';
    if (!file_exists($upload_dir)) {
        if (!mkdir($upload_dir, 0755, true)) {
            throw new Exception('Failed to create upload directory');
        }
    }

    // Create a unique file name
    $image_name = uniqid() . '.jpg';
    $image_path = $upload_dir . $image_name;

    // Save the image with proper error checking
    if (file_put_contents($image_path, $image_data) === false) {
        throw new Exception('Failed to save the image');
    }

    // Use transaction to ensure data consistency
    $pdo->beginTransaction();

    try {
        $stmt = $pdo->prepare("INSERT INTO products (name, description, price, image_path, category_id, created_at) 
                              VALUES (?, ?, ?, ?, ?, NOW())");

        $stmt->execute([
            htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
            $price,
            $image_path,
            $category_id
        ]);

        $product_id = $pdo->lastInsertId();
        $pdo->commit();

        $response['success'] = true;
        $response['message'] = 'Product created successfully';
        $response['data'] = [
            'id' => $product_id,
            'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
            'description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),
            'price' => $price,
            'image_path' => $image_path,
            'category_id' => $category_id
        ];
    } catch (Exception $e) {
        $pdo->rollBack();
        // Delete uploaded image if database insert fails
        if (file_exists($image_path)) {
            unlink($image_path);
        }
        throw $e;
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);
?>
