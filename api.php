<?php
header('Content-Type: application/json');

$dsn = 'mysql:host=localhost;dbname=campus_hub;charset=utf8mb4';
$username = 'root'; // Replace with your MySQL username
$password = ''; // Replace with your MySQL password

try {
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
<?php
// Handle API requests
$method = $_SERVER['REQUEST_METHOD'];
$path = explode('/', trim($_SERVER['PATH_INFO'], '/'));

if ($path[0] === 'articles') {
    switch ($method) {
        case 'GET':
            if (isset($path[1])) {
                // Get a single article
                $stmt = $pdo->prepare('SELECT * FROM articles WHERE id = ?');
                $stmt->execute([$path[1]]);
                $article = $stmt->fetch();
                echo json_encode($article ?: ['error' => 'Article not found']);
            } else {
                // Get all articles with optional pagination
                $page = $_GET['page'] ?? 1;
                $limit = $_GET['limit'] ?? 10;
                $offset = ($page - 1) * $limit;

                $stmt = $pdo->prepare('SELECT * FROM articles LIMIT ? OFFSET ?');
                $stmt->execute([$limit, $offset]);
                $articles = $stmt->fetchAll();
                echo json_encode($articles);
            }
            break;

        case 'POST':
            // Create a new article
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare('INSERT INTO articles (title, college, content, image, views, date) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $data['title'],
                $data['college'],
                $data['content'],
                $data['image'],
                $data['views'] ?? 0,
                $data['date'] ?? date('Y-m-d'),
            ]);
            echo json_encode(['success' => 'Article created']);
            break;

        case 'PUT':
            // Update an article
            if (!isset($path[1])) {
                http_response_code(400);
                echo json_encode(['error' => 'Article ID is required']);
                exit;
            }
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare('UPDATE articles SET title = ?, college = ?, content = ?, image = ?, views = ?, date = ? WHERE id = ?');
            $stmt->execute([
                $data['title'],
                $data['college'],
                $data['content'],
                $data['image'],
                $data['views'],
                $data['date'],
                $path[1],
            ]);
            echo json_encode(['success' => 'Article updated']);
            break;

        // In your api.php, fix the DELETE handler:
case 'DELETE':
    header('Content-Type: application/json');
    
    if (!isset($path[1])) {
        http_response_code(400);
        echo json_encode(['error' => 'Article ID is required']);
        exit;
    }

    try {
        $stmt = $pdo->prepare('DELETE FROM articles WHERE id = ?');
        $stmt->execute([$path[1]]);
        
        if ($stmt->rowCount() > 0) {
            echo json_encode(['success' => true, 'message' => 'Article deleted']);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Article not found']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Endpoint not found']);
}