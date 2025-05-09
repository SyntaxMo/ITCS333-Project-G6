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

    // Get input data - support both JSON and form data
    $contentType = $_SERVER["CONTENT_TYPE"] ?? '';
    if (strpos($contentType, 'application/json') !== false) {
        $input = json_decode(file_get_contents('php://input'), true);
    } else {
        $input = $_POST;
    }

    // Validate product ID
    $product_id = filter_var($input['id'] ?? null, FILTER_VALIDATE_INT);
    if (!$product_id) {
        throw new Exception('Invalid product ID');
    }

    // Verify product exists
    $check_stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $check_stmt->execute([$product_id]);
    if (!$check_stmt->fetch()) {
        throw new Exception('Product not found');
    }

    // Initialize arrays for update
    $updateFields = [];
    $params = [];

    // Validate and process name
    if (isset($input['name']) && !empty($input['name'])) {
        $name = trim($input['name']);
        if (strlen($name) > 255) {
            throw new Exception('Name is too long (maximum 255 characters)');
        }
        $updateFields[] = "name = ?";
        $params[] = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    }

    // Validate and process description
    if (isset($input['description']) && !empty($input['description'])) {
        $description = trim($input['description']);
        $updateFields[] = "description = ?";
        $params[] = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
    }

    // Validate and process price
    if (isset($input['price']) && !empty($input['price'])) {
        $price = filter_var($input['price'], FILTER_VALIDATE_FLOAT);
        if ($price === false || $price < 0) {
            throw new Exception('Invalid price value');
        }
        $updateFields[] = "price = ?";
        $params[] = $price;
    }

    // Validate and process category
    if (isset($input['category_id']) && !empty($input['category_id'])) {
        $category_id = filter_var($input['category_id'], FILTER_VALIDATE_INT);
        if ($category_id === false || $category_id < 1) {
            throw new Exception('Invalid category');
        }
        // Verify category exists
        $cat_stmt = $pdo->prepare("SELECT id FROM categories WHERE id = ?");
        $cat_stmt->execute([$category_id]);
        if (!$cat_stmt->fetch()) {
            throw new Exception('Invalid category selected');
        }
        $updateFields[] = "category_id = ?";
        $params[] = $category_id;
    }

    // Handle image upload
    $image_path = null;
    if (isset($_FILES['image']) || isset($input['image'])) {
        $upload_dir = 'uploads/images/';
        if (!file_exists($upload_dir)) {
            if (!mkdir($upload_dir, 0755, true)) {
                throw new Exception('Failed to create upload directory');
            }
        }

        $image_name = uniqid() . '.jpg';
        $image_path = $upload_dir . $image_name;

        if (isset($_FILES['image'])) {
            // Handle form-data file upload
            if (!in_array($_FILES['image']['type'], ['image/jpeg', 'image/png', 'image/gif'])) {
                throw new Exception('Invalid image type. Only JPEG, PNG and GIF are allowed');
            }
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $image_path)) {
                throw new Exception('Failed to save the image');
            }
        } elseif (isset($input['image'])) {
            // Handle base64 image data
            $image_data = base64_decode($input['image']);
            if ($image_data === false) {
                throw new Exception('Invalid image data');
            }

            // Verify image type
            $f = finfo_open();
            $mime_type = finfo_buffer($f, $image_data, FILEINFO_MIME_TYPE);
            finfo_close($f);
            
            if (!in_array($mime_type, ['image/jpeg', 'image/png', 'image/gif'])) {
                throw new Exception('Invalid image type. Only JPEG, PNG and GIF are allowed');
            }

            if (file_put_contents($image_path, $image_data) === false) {
                throw new Exception('Failed to save the image');
            }
        }

        $updateFields[] = "image_path = ?";
        $params[] = $image_path;

        // Get old image path to delete after successful update
        $old_image_stmt = $pdo->prepare("SELECT image_path FROM products WHERE id = ?");
        $old_image_stmt->execute([$product_id]);
        $old_image = $old_image_stmt->fetch(PDO::FETCH_COLUMN);
    }

    if (empty($updateFields)) {
        throw new Exception('No fields to update');
    }

    // Add ID to params array for WHERE clause
    $params[] = $product_id;

    // Begin transaction
    $pdo->beginTransaction();

    try {
        // Prepare and execute update query
        $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute($params);

        if (!$result) {
            throw new Exception('Failed to update product');
        }

        // If we have a new image and update was successful, delete the old one
        if ($image_path && $old_image && file_exists($old_image)) {
            unlink($old_image);
        }

        $pdo->commit();
        $response['success'] = true;
        $response['message'] = 'Product updated successfully';

    } catch (Exception $e) {
        $pdo->rollBack();
        // Delete newly uploaded image if database update fails
        if ($image_path && file_exists($image_path)) {
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