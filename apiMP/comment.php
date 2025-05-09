<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Add new comment
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['product_id']) || !isset($data['commenter_name']) || !isset($data['comment_text'])) {
        echo json_encode(['success' => false, 'message' => 'Missing required fields']);
        exit;
    }

    // Validate and sanitize inputs
    $product_id = filter_var($data['product_id'], FILTER_VALIDATE_INT);
    if ($product_id === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        exit;
    }

    // Sanitize name and comment text
    $commenter_name = htmlspecialchars(trim($data['commenter_name']), ENT_QUOTES, 'UTF-8');
    $comment_text = htmlspecialchars(trim($data['comment_text']), ENT_QUOTES, 'UTF-8');
    
    if (empty($commenter_name) || empty($comment_text)) {
        echo json_encode(['success' => false, 'message' => 'Name and comment cannot be empty']);
        exit;
    }

    try {
        // First check if product exists
        $check_stmt = $pdo->prepare('SELECT id FROM products WHERE id = ?');
        $check_stmt->execute([$product_id]);
        if (!$check_stmt->fetch()) {
            echo json_encode(['success' => false, 'message' => 'Product not found']);
            exit;
        }
        
        // Insert comment with proper field names
        $stmt = $pdo->prepare('INSERT INTO comments (item_id, name, comment_text, created_at) VALUES (?, ?, ?, NOW())');
        $result = $stmt->execute([$product_id, $commenter_name, $comment_text]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Comment added successfully',
                'data' => [
                    'id' => $pdo->lastInsertId(),
                    'commenter_name' => $commenter_name,
                    'comment_text' => $comment_text,
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ]);
        } else {
            throw new Exception('Failed to add comment');
        }
    } catch (PDOException $e) {
        error_log('Comment error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to add comment']);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Get comments for an item
    $product_id = filter_var($_GET['product_id'] ?? '', FILTER_VALIDATE_INT);
    
    if ($product_id === false) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('SELECT * FROM comments WHERE item_id = ? ORDER BY created_at DESC');
        $stmt->execute([$product_id]);
        $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Map database field names to frontend expected names and sanitize output
        $formatted_comments = array_map(function($comment) {
            return [
                'id' => $comment['id'],
                'commenter_name' => htmlspecialchars($comment['name'], ENT_QUOTES, 'UTF-8'),
                'comment_text' => htmlspecialchars($comment['comment_text'], ENT_QUOTES, 'UTF-8'),
                'created_at' => $comment['created_at']
            ];
        }, $comments);
        
        echo json_encode([
            'success' => true,
            'data' => $formatted_comments
        ]);
    } catch (PDOException $e) {
        error_log('Comment error: ' . $e->getMessage());
        echo json_encode(['success' => false, 'message' => 'Failed to fetch comments']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
}