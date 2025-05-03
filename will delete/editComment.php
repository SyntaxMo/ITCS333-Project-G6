<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_POST['id'])) {
        throw new Exception('Invalid request');
    }
    $filePath = __DIR__ . '/comments.json';
    $comments = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];
    if ($comments === null && json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Error reading comments data');
    }
    $found = false;
    foreach ($comments as &$comment) {
        if ((string)$comment['id'] === (string)$_POST['id']) {
            $comment['content'] = $_POST['content'];
            $comment['date'] = date('Y-m-d');
            $found = true;
            break;
        }
    }
    if (!$found) throw new Exception('Comment not found');
    if (!file_put_contents($filePath, json_encode($comments, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving updated comment');
    }
    $response['success'] = true;
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}
echo json_encode($response);
