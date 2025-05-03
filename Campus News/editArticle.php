<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['id'])) {
        throw new Exception('Invalid request');
    }

    $filePath = __DIR__ . '/news.json';
    $articles = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if ($articles === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error reading news data');
    }

    $found = false;
    foreach ($articles as &$article) {
        if ($article['id'] == $_POST['id']) {
            $article['title'] = $_POST['title'];
            $article['college'] = $_POST['college'];
            $article['courseCode'] = $_POST['course_code'];
            $article['content'] = $_POST['content'];
            // Handle image update if a new image is uploaded
            if (!empty($_FILES['image_file']['name'])) {
                $uploadDir = 'Pic/';
                $uploadFile = $uploadDir . basename($_FILES['image_file']['name']);
                $imageFileType = strtolower(pathinfo($uploadFile, PATHINFO_EXTENSION));
                $allowedTypes = ['jpg', 'jpeg', 'png', 'gif'];
                if (!in_array($imageFileType, $allowedTypes)) {
                    throw new Exception('Only JPG, JPEG, PNG & GIF files are allowed');
                }
                if (move_uploaded_file($_FILES['image_file']['tmp_name'], $uploadFile)) {
                    $article['image'] = $uploadFile;
                } else {
                    throw new Exception('Error uploading image');
                }
            }
            $found = true;
            break;
        }
    }
    if (!$found) throw new Exception('Article not found');

    if (!file_put_contents($filePath, json_encode($articles, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving updated article');
    }

    $response['success'] = true;
    $response['message'] = 'Article updated successfully';
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
?>