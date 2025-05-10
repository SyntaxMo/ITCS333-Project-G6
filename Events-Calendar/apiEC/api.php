<?php
// Prevent PHP errors from being displayed
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration
$host = 'localhost';
$dbname = 'unihub';
$username = 'root';
$password = '';

// Error handling function
function sendResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit();
}

// Input validation function
function validateInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

try {
    // Create PDO instance
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    sendResponse(['error' => 'Database connection failed: ' . $e->getMessage()], 500);
}

// Handle different HTTP methods
$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        switch ($action) {
            case 'list':
                try {
                    // Get pagination parameters
                    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
                    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 9;
                    $offset = ($page - 1) * $limit;
                    
                    // Get filter parameters
                    $category = isset($_GET['category']) ? validateInput($_GET['category']) : null;
                    $search = isset($_GET['search']) ? validateInput($_GET['search']) : null;
                    
                    // Build query
                    $query = "SELECT * FROM events WHERE 1=1";
                    $countQuery = "SELECT COUNT(*) FROM events WHERE 1=1";
                    $params = [];
                    $countParams = [];
                    
                    if ($category && $category !== 'all') {
                        $query .= " AND category = ?";
                        $countQuery .= " AND category = ?";
                        $params[] = $category;
                        $countParams[] = $category;
                    }
                    
                    if ($search) {
                        $query .= " AND (title LIKE ? OR description LIKE ?)";
                        $countQuery .= " AND (title LIKE ? OR description LIKE ?)";
                        $params[] = "%$search%";
                        $params[] = "%$search%";
                        $countParams[] = "%$search%";
                        $countParams[] = "%$search%";
                    }
                    
                    // Add sorting
                    $sort = isset($_GET['sort']) ? $_GET['sort'] : 'newest';
                    switch ($sort) {
                        case 'popular':
                            $query .= " ORDER BY popularity DESC";
                            break;
                        case 'newest':
                        default:
                            $query .= " ORDER BY created_at DESC";
                            break;
                    }
                    
                    // Add pagination (inject as integers, not bound parameters)
                    $query .= " LIMIT " . intval($limit) . " OFFSET " . intval($offset);
                    
                    // Get total count for pagination
                    $stmt = $pdo->prepare($countQuery);
                    $stmt->execute($countParams);
                    $total = $stmt->fetchColumn();
                    
                    // Get events
                    $stmt = $pdo->prepare($query);
                    $stmt->execute($params);
                    $events = $stmt->fetchAll();
                    
                    sendResponse([
                        'events' => $events,
                        'total' => $total,
                        'page' => $page,
                        'total_pages' => ceil($total / $limit)
                    ]);
                } catch (Exception $e) {
                    sendResponse(['error' => 'Failed to fetch events: ' . $e->getMessage()], 500);
                }
                break;
                
            case 'get':
                try {
                    if (!isset($_GET['id'])) {
                        sendResponse(['error' => 'Event ID is required'], 400);
                    }
                    
                    $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
                    $stmt->execute([$_GET['id']]);
                    $event = $stmt->fetch();
                    
                    if (!$event) {
                        sendResponse(['error' => 'Event not found'], 404);
                    }
                    
                    sendResponse($event);
                } catch (Exception $e) {
                    sendResponse(['error' => 'Failed to fetch event: ' . $e->getMessage()], 500);
                }
                break;
                
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'POST':
        switch ($action) {
            case 'create':
                // Validate required fields
                $requiredFields = ['title', 'event_date', 'location', 'description', 'category'];
                foreach ($requiredFields as $field) {
                    if (!isset($_POST[$field]) || empty($_POST[$field])) {
                        error_log("Missing or empty field: $field");
                        sendResponse(['error' => "Field '$field' is required"], 400);
                    }
                }
                
                // Handle image upload
                $imagePath = '';
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = 'uploads/images/';
                    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
                    $uploadFile = $uploadDir . $fileName;
                    
                    // Validate file type
                    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                        error_log('Invalid file type: ' . $_FILES['image']['type']);
                        sendResponse(['error' => 'Invalid file type. Only JPG, JPEG & PNG files are allowed.'], 400);
                    }
                    
                    // Validate file size (5MB max)
                    if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                        error_log('File size too large: ' . $_FILES['image']['size']);
                        sendResponse(['error' => 'File size too large. Maximum size is 5MB.'], 400);
                    }
                    
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                        $imagePath = $uploadFile;
                    } else {
                        error_log('Failed to upload image: ' . $_FILES['image']['name']);
                        sendResponse(['error' => 'Failed to upload image'], 500);
                    }
                } else {
                    $imgErr = isset($_FILES['image']) ? $_FILES['image']['error'] : 'not set';
                    error_log('Image is required or upload error: ' . $imgErr);
                    sendResponse(['error' => 'Image is required or upload error: ' . $imgErr], 400);
                }
                
                // Insert event
                try {
                    $stmt = $pdo->prepare("
                        INSERT INTO events (title, event_date, location, description, category, image_path)
                        VALUES (?, ?, ?, ?, ?, ?)
                    ");
                    $stmt->execute([
                        validateInput($_POST['title']),
                        validateInput($_POST['event_date']),
                        validateInput($_POST['location']),
                        validateInput($_POST['description']),
                        validateInput($_POST['category']),
                        $imagePath
                    ]);
                } catch (PDOException $e) {
                    error_log('DB Insert Error: ' . $e->getMessage());
                    sendResponse(['error' => 'Database error: ' . $e->getMessage()], 500);
                }
                
                $eventId = $pdo->lastInsertId();
                
                // Get the created event
                $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
                $stmt->execute([$eventId]);
                $event = $stmt->fetch();
                
                sendResponse($event, 201);
                break;
            case 'update':
                // Update event via POST (for edit form with file upload)
                if (!isset($_POST['id'])) {
                    sendResponse(['error' => 'Event ID is required'], 400);
                }
                $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
                $stmt->execute([$_POST['id']]);
                $event = $stmt->fetch();
                if (!$event) {
                    sendResponse(['error' => 'Event not found'], 404);
                }
                $updates = [];
                $params = [];
                $fields = ['title', 'event_date', 'location', 'description', 'category'];
                foreach ($fields as $field) {
                    if (isset($_POST[$field])) {
                        $updates[] = "$field = ?";
                        $params[] = validateInput($_POST[$field]);
                    }
                }
                // Handle comments update
                if (isset($_POST['comments'])) {
                    $updates[] = "comments = ?";
                    $params[] = $_POST['comments'];
                }
                // Handle popularity update
                if (isset($_POST['popularity'])) {
                    $updates[] = "popularity = ?";
                    $params[] = intval($_POST['popularity']);
                }
                // Handle image update if provided
                if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
                    $uploadDir = 'uploads/images/';
                    $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
                    $uploadFile = $uploadDir . $fileName;
                    $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
                    if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                        sendResponse(['error' => 'Invalid file type. Only JPG, JPEG & PNG files are allowed.'], 400);
                    }
                    if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                        sendResponse(['error' => 'File size too large. Maximum size is 5MB.'], 400);
                    }
                    if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                        if ($event['image_path'] && file_exists($event['image_path'])) {
                            unlink($event['image_path']);
                        }
                        $updates[] = "image_path = ?";
                        $params[] = $uploadFile;
                    } else {
                        sendResponse(['error' => 'Failed to upload image'], 500);
                    }
                }
                if (empty($updates)) {
                    sendResponse(['error' => 'No fields to update'], 400);
                }
                $params[] = $_POST['id'];
                $query = "UPDATE events SET " . implode(", ", $updates) . " WHERE id = ?";
                $stmt = $pdo->prepare($query);
                $stmt->execute($params);
                $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
                $stmt->execute([$_POST['id']]);
                $updatedEvent = $stmt->fetch();
                sendResponse($updatedEvent);
                break;
            default:
                sendResponse(['error' => 'Invalid action'], 400);
        }
        break;
        
    case 'PUT':
        if ($action !== 'update') {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        
        // Get PUT data
        parse_str(file_get_contents("php://input"), $_PUT);
        
        if (!isset($_PUT['id'])) {
            sendResponse(['error' => 'Event ID is required'], 400);
        }
        
        // Check if event exists
        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$_PUT['id']]);
        $event = $stmt->fetch();
        
        if (!$event) {
            sendResponse(['error' => 'Event not found'], 404);
        }
        
        // Build update query
        $updates = [];
        $params = [];
        
        $fields = ['title', 'event_date', 'location', 'description', 'category'];
        foreach ($fields as $field) {
            if (isset($_PUT[$field])) {
                $updates[] = "$field = ?";
                $params[] = validateInput($_PUT[$field]);
            }
        }
        
        // Handle comments update
        if (isset($_PUT['comments'])) {
            $updates[] = "comments = ?";
            $params[] = $_PUT['comments'];
        }
        
        // Handle popularity update
        if (isset($_PUT['popularity'])) {
            $updates[] = "popularity = ?";
            $params[] = intval($_PUT['popularity']);
        }
        
        // Handle image update if provided
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = 'uploads/images/';
            $fileName = uniqid() . '_' . basename($_FILES['image']['name']);
            $uploadFile = $uploadDir . $fileName;
            
            // Validate file type
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!in_array($_FILES['image']['type'], $allowedTypes)) {
                sendResponse(['error' => 'Invalid file type. Only JPG, JPEG & PNG files are allowed.'], 400);
            }
            
            // Validate file size (5MB max)
            if ($_FILES['image']['size'] > 5 * 1024 * 1024) {
                sendResponse(['error' => 'File size too large. Maximum size is 5MB.'], 400);
            }
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $uploadFile)) {
                // Delete old image if exists
                if ($event['image_path'] && file_exists($event['image_path'])) {
                    unlink($event['image_path']);
                }
                
                $updates[] = "image_path = ?";
                $params[] = $uploadFile;
            } else {
                sendResponse(['error' => 'Failed to upload image'], 500);
            }
        }
        
        if (empty($updates)) {
            sendResponse(['error' => 'No fields to update'], 400);
        }
        
        // Add ID to params
        $params[] = $_PUT['id'];
        
        // Update event
        $query = "UPDATE events SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($query);
        $stmt->execute($params);
        
        // Get updated event
        $stmt = $pdo->prepare("SELECT * FROM events WHERE id = ?");
        $stmt->execute([$_PUT['id']]);
        $updatedEvent = $stmt->fetch();
        
        sendResponse($updatedEvent);
        break;
        
    case 'DELETE':
        if ($action !== 'delete') {
            sendResponse(['error' => 'Invalid action'], 400);
        }
        
        if (!isset($_GET['id'])) {
            sendResponse(['error' => 'Event ID is required'], 400);
        }
        
        // Get event image path before deletion
        $stmt = $pdo->prepare("SELECT image_path FROM events WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $event = $stmt->fetch();
        
        if (!$event) {
            sendResponse(['error' => 'Event not found'], 404);
        }
        
        // Delete event
        $stmt = $pdo->prepare("DELETE FROM events WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        
        // Delete image file if exists
        if ($event['image_path'] && file_exists($event['image_path'])) {
            unlink($event['image_path']);
        }
        
        sendResponse(['message' => 'Event deleted successfully']);
        break;
        
    default:
        sendResponse(['error' => 'Method not allowed'], 405);
}
?> 