<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Invalid request');
    }
    $filePath = __DIR__ . '/comments.json';
    $comments = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if ($comments === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error reading comments data');
    }
    // Validate input
    if (empty($_POST['articleId']) || empty($_POST['author']) || empty($_POST['content'])) {
        throw new Exception('All fields are required');
    }
    // Generate unique comment ID
    $newId = empty($comments) ? 1 : (max(array_column($comments, 'id')) + 1);
    $newComment = [
        'id' => $newId,
        'articleId' => (int)$_POST['articleId'],
        'author' => $_POST['author'],
        'content' => $_POST['content'],
        'date' => date('Y-m-d')
    ];
    $comments[] = $newComment;
    if (!file_put_contents($filePath, json_encode($comments, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving comment');
    }
    $response['success'] = true;
    $response['comment'] = $newComment;
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
