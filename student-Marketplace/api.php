<?php
// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS Headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database connection
function getDB() {
    static $pdo = null;
    if ($pdo === null) {
        $host = 'localhost';
        $dbname = 'student_marketplace';
        $username = 'root';
        $password = '';
        $charset = 'utf8mb4';
        
        try {
            $dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            error_log("Database Error: " . $e->getMessage());
            if (strpos($e->getMessage(), "Unknown database") !== false) {
                die("Database '$dbname' does not exist. Please run init_db.php first.");
            } else if (strpos($e->getMessage(), "Access denied") !== false) {
                die("Database access denied. Check your database credentials.");
            } else if (strpos($e->getMessage(), "Connection refused") !== false) {
                die("Could not connect to MySQL. Make sure MySQL is running.");
            } else {
                die("Database Error: " . $e->getMessage());
            }
        }
    }
    return $pdo;
}

// Content type header for JSON responses
header('Content-Type: application/json');

// Initialize PDO
$pdo = getDB();

// Get request method and endpoint
$method = $_SERVER['REQUEST_METHOD'];
$endpoint = $_GET['action'] ?? '';

// Initialize response array
$response = ['success' => false, 'message' => '', 'data' => null];

try {
    switch ($endpoint) {
        case 'read':
            if (isset($_GET['id'])) {
                // Get single item
                $stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
                $stmt->execute([$_GET['id']]);
                $response['data'] = $stmt->fetch();
                if (!$response['data']) {
                    throw new Exception('Item not found');
                }
            } else {
                // Get all items
                $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
                $response['data'] = $stmt->fetchAll();
            }

            // Fix image paths to be relative to student-Marketplace folder
            if ($response['data']) {
                if (isset($response['data']['image_path'])) {
                    // Single item
                    $response['data']['image_path'] = str_replace('uploads/', '', $response['data']['image_path']);
                } else {
                    // Multiple items
                    foreach ($response['data'] as &$item) {
                        $item['image_path'] = str_replace('uploads/', '', $item['image_path']);
                    }
                    unset($item); // Break the reference
                }
            }
            $response['success'] = true;
            break;

        case 'create':
            if ($method !== 'POST') throw new Exception('Invalid request method');

            $input = json_decode(file_get_contents('php://input'), true);
            
            // Validate inputs
            if (empty($input['name']) || empty($input['description']) || 
                !isset($input['price']) || !isset($input['category_id']) || 
                empty($input['image'])) {
                throw new Exception('Missing required fields');
            }

            // Process image
            $image_data = base64_decode($input['image']);
            $upload_dir = 'uploads/images/';
            if (!file_exists($upload_dir)) {
                mkdir($upload_dir, 0755, true);
            }
            
            $image_name = uniqid() . '.jpg';
            $image_path = $upload_dir . $image_name;
            
            if (file_put_contents($image_path, $image_data) === false) {
                throw new Exception('Failed to save image');
            }

            // Insert product
            $stmt = $pdo->prepare("INSERT INTO products (name, description, price, image_path, category_id, created_at) 
                                  VALUES (?, ?, ?, ?, ?, NOW())");
            
            $stmt->execute([
                htmlspecialchars($input['name']),
                htmlspecialchars($input['description']),
                $input['price'],
                $image_path,
                $input['category_id']
            ]);

            $response['success'] = true;
            $response['message'] = 'Product created successfully';
            $response['data'] = ['id' => $pdo->lastInsertId()];
            break;

        case 'update':
            if ($method !== 'POST') throw new Exception('Invalid request method');

            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['id'])) throw new Exception('Product ID required');

            $updateFields = [];
            $params = [];

            if (isset($input['name'])) {
                $updateFields[] = "name = ?";
                $params[] = htmlspecialchars($input['name']);
            }
            if (isset($input['description'])) {
                $updateFields[] = "description = ?";
                $params[] = htmlspecialchars($input['description']);
            }
            if (isset($input['price'])) {
                $updateFields[] = "price = ?";
                $params[] = $input['price'];
            }
            if (isset($input['category_id'])) {
                $updateFields[] = "category_id = ?";
                $params[] = $input['category_id'];
            }
            if (isset($input['image'])) {
                // Get old image path to delete it
                $stmt = $pdo->prepare("SELECT image_path FROM products WHERE id = ?");
                $stmt->execute([$input['id']]);
                $old_image_path = $stmt->fetchColumn();

                // Delete old image if it exists
                if ($old_image_path && file_exists($old_image_path)) {
                    unlink($old_image_path);
                }

                $image_data = base64_decode($input['image']);
                $upload_dir = 'uploads/images/';
                if (!file_exists($upload_dir)) {
                    mkdir($upload_dir, 0755, true);
                }
                $image_name = uniqid() . '.jpg';
                $image_path = $upload_dir . $image_name;
                
                if (file_put_contents($image_path, $image_data)) {
                    $updateFields[] = "image_path = ?";
                    $params[] = $image_path;
                }
            }

            if (empty($updateFields)) throw new Exception('No fields to update');

            $params[] = $input['id'];
            $sql = "UPDATE products SET " . implode(', ', $updateFields) . " WHERE id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);

            $response['success'] = true;
            $response['message'] = 'Product updated successfully';
            break;

        case 'delete':
            if ($method !== 'POST') throw new Exception('Invalid request method');

            $input = json_decode(file_get_contents('php://input'), true);
            if (!isset($input['id'])) throw new Exception('Product ID required');

            // Get image path before deleting
            $stmt = $pdo->prepare("SELECT image_path FROM products WHERE id = ?");
            $stmt->execute([$input['id']]);
            $image_path = $stmt->fetchColumn();

            // Delete product
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$input['id']]);

            // Delete image if exists
            if ($image_path && file_exists($image_path)) {
                unlink($image_path);
            }

            $response['success'] = true;
            $response['message'] = 'Product deleted successfully';
            break;

        case 'comment':
            switch ($method) {
                case 'GET':
                    $product_id = filter_var($_GET['product_id'] ?? '', FILTER_VALIDATE_INT);
                    if (!$product_id) throw new Exception('Invalid product ID');

                    $stmt = $pdo->prepare('SELECT * FROM comments WHERE item_id = ? ORDER BY created_at DESC');
                    $stmt->execute([$product_id]);
                    $response['data'] = $stmt->fetchAll();
                    $response['success'] = true;
                    break;

                case 'POST':
                    $input = json_decode(file_get_contents('php://input'), true);
                    if (!isset($input['product_id'], $input['commenter_name'], $input['comment_text'])) {
                        throw new Exception('Missing required fields');
                    }

                    $stmt = $pdo->prepare('INSERT INTO comments (item_id, name, comment_text, created_at) VALUES (?, ?, ?, NOW())');
                    $stmt->execute([
                        $input['product_id'],
                        htmlspecialchars($input['commenter_name']),
                        htmlspecialchars($input['comment_text'])
                    ]);

                    $response['success'] = true;
                    $response['message'] = 'Comment added successfully';
                    break;

                default:
                    throw new Exception('Invalid method for comments');
            }
            break;

        default:
            throw new Exception('Invalid endpoint');
    }
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400);
}

echo json_encode($response);