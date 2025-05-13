<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json');

require_once 'config.php';
require_once 'DatabaseHelper.php';

$db = new DatabaseHelper($config);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$action = $_POST['action'] ?? $_GET['action'] ?? null;

try {
    switch ($action) {
        case 'addComment':
            $response = addComment($db);
            break;
        case 'addNews':
            $response = addNews($db);
            break;
        case 'editNews':
            $response = editNews($db);
            break;
        case 'deleteNews':
            $response = deleteNews($db);
            break;
        case 'getNews':
            $response = getNews($db);
            break;
        case 'editComment':
            $response = editComment($db);
            break;
        case 'deleteComment':
            $response = deleteComment($db);
            break;
        case 'incrementViews':
            $response = incrementViews($db);
            break;
        case 'getComments':
            $response = getComments($db);
            break;
        default:
            throw new Exception('Invalid action');
    }
} catch (Exception $e) {
    http_response_code(400);
    $response = ['success' => false, 'message' => $e->getMessage()];
}

echo json_encode($response);

// FUNCTIONS

function addComment($db) {
    if (empty($_POST['articleId']) || empty($_POST['author']) || empty($_POST['content'])) {
        throw new Exception('All fields are required');
    }
    $stmt = $db->prepare('INSERT INTO comments (articleId, author, content, date) VALUES (?, ?, ?, ?)');
    $stmt->execute([
        $_POST['articleId'],
        $_POST['author'],
        $_POST['content'],
        date('Y-m-d H:i:s')
    ]);
    return ['success' => true, 'message' => 'Comment added successfully', 'id' => $db->lastInsertId()];
}

function addNews($db) {
    if (empty($_POST['title']) || empty($_POST['college'])) {
        throw new Exception('Title and college are required');
    }

    $imagePath = 'Pic/default.jpg';
    if (!empty($_FILES['image_file']['tmp_name'])) {
        $validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fileInfo, $_FILES['image_file']['tmp_name']);

        if (in_array($mime, $validTypes)) {
            $ext = str_replace('image/', '', $mime);
            $uploadDir = __DIR__ . '/Pic/';
            $webDir = 'Pic/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $filename = 'article_' . time() . '.' . $ext;
            $targetPath = $uploadDir . $filename;

            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetPath)) {
                $imagePath = $webDir . $filename;
            }
        }
    }

    $stmt = $db->prepare('INSERT INTO news (title, content, author, date, image, college, courseCode, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        substr(trim($_POST['title']), 0, 255),
        $_POST['content'] ?? '',
        'Anonymous',
        date('Y-m-d'),
        $imagePath,
        substr(trim($_POST['college']), 0, 100),
        !empty($_POST['course_code']) ? substr(trim($_POST['course_code']), 0, 20) : null,
        0
    ]);

    return ['success' => true, 'message' => 'News article added successfully'];
}

function editNews($db) {
    if (empty($_POST['id'])) {
        throw new Exception('Article ID is required');
    }
    $imagePath = $_POST['originalImage'] ?? 'Pic/default.jpg';
    if (!empty($_FILES['image_file']['tmp_name'])) {
        $validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fileInfo, $_FILES['image_file']['tmp_name']);
        if (in_array($mime, $validTypes)) {
            $ext = str_replace('image/', '', $mime);
            $uploadDir = __DIR__ . '/Pic/';
            $webDir = 'Pic/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $filename = 'article_' . time() . '.' . $ext;
            $targetPath = $uploadDir . $filename;
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetPath)) {
                $imagePath = $webDir . $filename;
            }
        }
    }

    $stmt = $db->prepare('UPDATE news SET title = ?, content = ?, college = ?, courseCode = ?, image = ?, date = NOW() WHERE id = ?');
    $stmt->execute([
        $_POST['title'],
        $_POST['content'],
        $_POST['college'],
        $_POST['course_code'] ?? null,
        $imagePath,
        $_POST['id']
    ]);
    return ['success' => true, 'message' => 'Article updated successfully'];
}

function deleteNews($db) {
    if (empty($_POST['id'])) {
        throw new Exception('Article ID is required');
    }
    $stmt = $db->prepare('DELETE FROM news WHERE id = ?');
    $stmt->execute([$_POST['id']]);
    return ['success' => true, 'message' => 'Article deleted successfully'];
}

function getNews($db) {
    $stmt = $db->query('SELECT * FROM news ORDER BY date DESC');
    return $stmt->fetchAll();
}

function editComment($db) {
    if (empty($_POST['id']) || empty($_POST['content'])) {
        throw new Exception('Comment ID and content are required');
    }
    $stmt = $db->prepare('UPDATE comments SET content = ?, date = ? WHERE id = ?');
    $stmt->execute([
        $_POST['content'],
        date('Y-m-d H:i:s'),
        $_POST['id']
    ]);
    return ['success' => true, 'message' => 'Comment updated successfully'];
}

function deleteComment($db) {
    if (empty($_POST['id'])) {
        throw new Exception('Comment ID is required');
    }
    $stmt = $db->prepare('DELETE FROM comments WHERE id = ?');
    $stmt->execute([$_POST['id']]);
    return ['success' => true, 'message' => 'Comment deleted successfully'];
}

function incrementViews($db) {
    if (empty($_POST['id'])) {
        throw new Exception('Article ID is required');
    }
    $stmt = $db->prepare('UPDATE news SET views = views + 1 WHERE id = ?');
    $stmt->execute([$_POST['id']]);
    return ['success' => true, 'message' => 'Views incremented'];
}

function getComments($db) {
    $stmt = $db->query('SELECT * FROM comments ORDER BY date DESC');
    return $stmt->fetchAll();
}
?>