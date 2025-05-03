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

    // Validate article ID
    if (empty($_POST['id'])) {
        throw new Exception('Article ID is required');
    }

    $articleId = (int)$_POST['id'];

    // Load existing articles
    $filePath = __DIR__ . '/news.json';
    $articles = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];

    if ($articles === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error reading news data');
    }

    // Find and remove the article
    $articleIndex = array_search($articleId, array_column($articles, 'id'));
    if ($articleIndex === false) {
        throw new Exception('Article not found');
    }

    array_splice($articles, $articleIndex, 1);

    // Save updated articles back to file
    if (!file_put_contents($filePath, json_encode($articles, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving updated articles');
    }

    $response['success'] = true;
    $response['message'] = 'Article deleted successfully';

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);
?>