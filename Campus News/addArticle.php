<?php
header('Content-Type: application/json');
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
$response = ['success' => false, 'message' => ''];
try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request method');
    }

    // Required fields validation
    if (empty($_POST['title'])) {
        throw new Exception('Title is required');
    }
    if (empty($_POST['college'])) {
        throw new Exception('College is required');
    }

    // Process image upload
    $imagePath = 'Pic/default.jpg'; // Default image
    if (!empty($_FILES['image_file']['name'])) {
        $uploadDir = 'Pic/';
        $uploadFile = $uploadDir . basename($_FILES['image_file']['name']);
        
        // Check if image file is valid
        $imageFileType = strtolower(pathinfo($uploadFile, PATHINFO_EXTENSION));
        $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
        
        if (!in_array($imageFileType, $allowedTypes)) {
            throw new Exception('Only JPG, JPEG, PNG & GIF files are allowed');
        }
        
        if (move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadFile)) {
            $imagePath = $uploadFile;
        } else {
            throw new Exception('Error uploading image');
        }
    }

    // Load existing articles
    $filePath = __DIR__ . '/news.json';
    $articles = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];

    if ($articles === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error reading news data');
    }

    // Create new article
    $newArticle = [
        'id' => count($articles) + 1,
        'title' => $_POST['title'],
        'content' => $_POST['content'] ?? '',
        'author' => 'Anonymous', // You can change this to get from session
        'date' => date('Y-m-d'),
        'image' => $imagePath,
        'college' => $_POST['college'],
        'courseCode' => $_POST['course_code'] ?? null,
        'views' => 0
    ];

    // Add new article
    $articles[] = $newArticle;

    // Save back to file
    if (!file_put_contents($filePath, json_encode($articles, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving article');
    }

    $response['success'] = true;
    $response['message'] = 'Article added successfully';

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>