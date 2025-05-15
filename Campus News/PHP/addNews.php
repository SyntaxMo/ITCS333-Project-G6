<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request');
    }

    // Validate input
    if (empty($_POST['title']) || empty($_POST['college'])) {
        throw new Exception('Title and college are required');
    }

    // Connect to database using environment variables
    $host = "127.0.0.1";
    $user = getenv("db_user");
    $pass = getenv("db_pass");
    $db = getenv("db_name");

    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8mb4", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    $imagePath = 'Pic/default.jpg';
    if (!empty($_FILES['image_file']['tmp_name'])) {
        $validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fileInfo, $_FILES['image_file']['tmp_name']);
        if (in_array($mime, $validTypes)) {
            $ext = str_replace('image/', '', $mime);

            // --- ADD THIS BLOCK ---
            $uploadDir = __DIR__ . '/Pic/';
            $webDir = 'Pic/'; // This is the path you use in HTML <img src="...">
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $filename = 'article_' . time() . '.' . $ext;
            $targetPath = $uploadDir . $filename;
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetPath)) {
                $imagePath = $webDir . $filename; // <-- Save this to the database!
            }
            // --- END BLOCK ---
        }
    }

    // Insert the article into the database
    $stmt = $pdo->prepare('INSERT INTO news (title, content, author, date, image, college, courseCode, views) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
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

    $insertedId = $pdo->lastInsertId();  // <-- Get inserted article ID

    $response['success'] = true;
    $response['articleid'] = $insertedId; // <- Add this      // <-- Include it in response
    $response['message'] = 'Article published';
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>