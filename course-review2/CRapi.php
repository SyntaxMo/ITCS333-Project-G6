<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

/**
 * Course Review API (CRapi)
 * Handles all course review operations including:
 * - Getting/adding reviews
 * - Liking reviews/comments
 * - Adding comments
 */

// Database configuration
$host = getenv("DB_HOST") ?: "127.0.0.1";
$username = getenv("DB_USER") ?: "myadmin";
$password = getenv("DB_PASS") ?: "wwe123";
$dbname = "unihubb";

class CRapi {
    private $pdo;
    
    public function __construct($host, $username, $password, $dbname) {
        try {
            $this->pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Database connection failed: " . $e->getMessage());
            exit();
        }
    }
    
    public function handleRequest() {
        $action = $_GET['action'] ?? $_POST['action'] ?? '';
        $data = json_decode(file_get_contents('php://input'), true) ?? [];
        
        switch ($action) {
            case 'getReviews':
                $this->getReviews(
                    $_GET['id'] ?? null,
                    $_GET['courseCode'] ?? null,
                    $_GET['rating'] ?? null,
                    $_GET['sort'] ?? 'newest'
                );
                break;
                
            case 'addReview':
                $this->addReview($data);
                break;
                
            case 'likeReview':
                $this->likeReview(
                    $data['id'] ?? null,
                    $data['userId'] ?? $this->getUserIdentifier()
                );
                break;
                
            case 'addComment':
                $this->addComment(
                    $data['reviewId'] ?? null,
                    $data['author'] ?? null,
                    $data['text'] ?? null,
                    $data['date'] ?? date('Y-m-d')
                );
                break;
                
            case 'likeComment':
                $this->likeComment(
                    $data['commentId'] ?? null,
                    $data['userId'] ?? $this->getUserIdentifier()
                );
                break;
                
            default:
                $this->sendResponse(false, 'Invalid action');
        }
    }
    
    private function getReviews($id = null, $courseCode = null, $rating = null, $sort = 'newest') {
        $where = [];
        $params = [];
        
        if ($id) {
            $where[] = "r.id = ?";
            $params[] = $id;
        }
        
        if ($courseCode && $courseCode !== 'all') {
            $where[] = "r.course_code = ?";
            $params[] = $courseCode;
        }
        
        if ($rating && $rating !== 'all') {
            $where[] = "r.rating = ?";
            $params[] = $rating;
        }
        
        $sql = "SELECT r.*, 
               (SELECT COUNT(*) FROM review_likes WHERE review_id = r.id) as likes,
               (SELECT GROUP_CONCAT(CONCAT_WS('|', c.id, c.author, c.text, c.date, 
               (SELECT COUNT(*) FROM comment_likes WHERE comment_id = c.id)) 
                FROM comments c WHERE c.review_id = r.id) as comments_data
               FROM reviews r";
        
        if (!empty($where)) {
            $sql .= " WHERE " . implode(' AND ', $where);
        }
        
        // Sorting
        switch ($sort) {
            case 'highest':
                $sql .= " ORDER BY likes DESC, r.date DESC";
                break;
            case 'course':
                $sql .= " ORDER BY r.course_code, r.date DESC";
                break;
            case 'newest':
            default:
                $sql .= " ORDER BY r.date DESC";
        }
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Process comments data
            foreach ($reviews as &$review) {
                $review['comments'] = $this->processCommentsData($review['comments_data'] ?? '');
                unset($review['comments_data']);
            }
            
            $this->sendResponse(true, 'Reviews retrieved', $id ? ($reviews[0] ?? null) : $reviews);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Database error: " . $e->getMessage());
        }
    }
    
    private function addReview($data) {
        $required = ['courseTitle', 'courseCode', 'professorName', 'rating', 'reviewText', 'author'];
        foreach ($required as $field) {
            if (empty($data[$field])) {
                $this->sendResponse(false, "Missing required field: $field");
                return;
            }
        }
        
        try {
            $stmt = $this->pdo->prepare("INSERT INTO reviews 
                (course_title, course_code, professor_name, rating, review_text, author, date, course_description) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
            
            $stmt->execute([
                $data['courseTitle'],
                $data['courseCode'],
                $data['professorName'],
                $data['rating'],
                $data['reviewText'],
                $data['author'],
                $data['date'] ?? date('Y-m-d'),
                $data['courseDescription'] ?? 'No description available'
            ]);
            
            $reviewId = $this->pdo->lastInsertId();
            $this->getReviews($reviewId); // Return the newly added review
        } catch (PDOException $e) {
            $this->sendResponse(false, "Failed to add review: " . $e->getMessage());
        }
    }
    
    private function likeReview($reviewId, $userId) {
        if (!$reviewId) {
            $this->sendResponse(false, "Review ID required");
            return;
        }
        
        try {
            // Check if already liked
            $stmt = $this->pdo->prepare("SELECT id FROM review_likes 
                                        WHERE review_id = ? AND user_identifier = ?");
            $stmt->execute([$reviewId, $userId]);
            
            if ($stmt->fetch()) {
                $this->sendResponse(true, 'Already liked');
                return;
            }
            
            // Add like
            $stmt = $this->pdo->prepare("INSERT INTO review_likes (review_id, user_identifier) VALUES (?, ?)");
            $stmt->execute([$reviewId, $userId]);
            
            // Get updated like count
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as likes FROM review_likes WHERE review_id = ?");
            $stmt->execute([$reviewId]);
            $likes = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(true, 'Review liked', ['newLikes' => (int)$likes['likes']]);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Failed to like review: " . $e->getMessage());
        }
    }
    
    private function addComment($reviewId, $author, $text, $date) {
        if (!$reviewId || !$author || !$text) {
            $this->sendResponse(false, "Review ID, author and text required");
            return;
        }
        
        try {
            $stmt = $this->pdo->prepare("INSERT INTO comments 
                (review_id, author, text, date) 
                VALUES (?, ?, ?, ?)");
            
            $stmt->execute([
                $reviewId,
                $author,
                $text,
                $date
            ]);
            
            $commentId = $this->pdo->lastInsertId();
            
            // Return the new comment
            $stmt = $this->pdo->prepare("SELECT *, 0 as likes FROM comments WHERE id = ?");
            $stmt->execute([$commentId]);
            $comment = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(true, 'Comment added', $comment);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Failed to add comment: " . $e->getMessage());
        }
    }
    
    private function likeComment($commentId, $userId) {
        if (!$commentId) {
            $this->sendResponse(false, "Comment ID required");
            return;
        }
        
        try {
            // Check if already liked
            $stmt = $this->pdo->prepare("SELECT id FROM comment_likes 
                                        WHERE comment_id = ? AND user_identifier = ?");
            $stmt->execute([$commentId, $userId]);
            
            if ($stmt->fetch()) {
                $this->sendResponse(true, 'Already liked');
                return;
            }
            
            // Add like
            $stmt = $this->pdo->prepare("INSERT INTO comment_likes (comment_id, user_identifier) VALUES (?, ?)");
            $stmt->execute([$commentId, $userId]);
            
            // Get updated like count
            $stmt = $this->pdo->prepare("SELECT COUNT(*) as likes FROM comment_likes WHERE comment_id = ?");
            $stmt->execute([$commentId]);
            $likes = $stmt->fetch(PDO::FETCH_ASSOC);
            
            $this->sendResponse(true, 'Comment liked', ['newLikes' => (int)$likes['likes']]);
        } catch (PDOException $e) {
            $this->sendResponse(false, "Failed to like comment: " . $e->getMessage());
        }
    }
    
    private function processCommentsData($commentsData) {
        if (empty($commentsData)) return [];
        
        $comments = [];
        $commentEntries = explode(',', $commentsData);
        
        foreach ($commentEntries as $entry) {
            list($id, $author, $text, $date, $likes) = explode('|', $entry);
            $comments[] = [
                'id' => (int)$id,
                'author' => $author,
                'text' => $text,
                'date' => $date,
                'likes' => (int)$likes
            ];
        }
        
        return $comments;
    }
    
    private function getUserIdentifier() {
        // Use session ID if available, otherwise IP address
        return session_id() ? session_id() : $_SERVER['REMOTE_ADDR'];
    }
    
    private function sendResponse($success, $message, $data = null) {
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        if ($data !== null) {
            $response['data'] = $data;
        }
        
        echo json_encode($response);
        exit();
    }
}

// Initialize and run the API
$crapi = new CRapi($host, $username, $password, $dbname);
$crapi->handleRequest();