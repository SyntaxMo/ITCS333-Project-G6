<?php
header('Content-Type: application/json');
// Disable error reporting for production
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(0);

$response = ['success' => false, 'message' => ''];

try {
    // Basic validation
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request');
    }

    if (empty($_POST['title']) || empty($_POST['college'])) {
        throw new Exception('Title and college are required');
    }

    // Process image
    $imagePath = 'Pic/default.jpg';
    if (!empty($_FILES['image_file']['tmp_name'])) {
        $validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileInfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($fileInfo, $_FILES['image_file']['tmp_name']);
        
        if (in_array($mime, $validTypes)) {
            $ext = str_replace('image/', '', $mime);
            $filename = 'article_' . time() . '.' . $ext;
            $targetPath = 'Pic/' . $filename;
            
            if (move_uploaded_file($_FILES['image_file']['tmp_name'], $targetPath)) {
                $imagePath = $targetPath;
            }
        }
    }

    // Load and update articles
    $filePath = __DIR__ . '/news.json';
    $articles = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    
    // Find the max ID in the existing articles
    $newId = empty($articles) ? 1 : (max(array_column($articles, 'id')) + 1);

    $articles[] = [
        'id' => $newId,
        'title' => substr(trim($_POST['title']), 0, 255),
        'content' => $_POST['content'] ?? '',
        'author' => 'Anonymous',
        'date' => date('Y-m-d'),
        'image' => $imagePath,
        'college' => substr(trim($_POST['college']), 0, 100),
        'courseCode' => !empty($_POST['course_code']) ? substr(trim($_POST['course_code']), 0, 20) : null,
        'views' => 0
    ];

    if (file_put_contents($filePath, json_encode($articles, JSON_PRETTY_PRINT))) {
        $response['success'] = true;
        $response['message'] = 'Article published';
    } else {
        throw new Exception('Failed to save article');
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>