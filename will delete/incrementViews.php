<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
error_reporting(E_ALL);

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
        if (isset($article['id']) && $article['id'] == $_POST['id']) {
            $article['views'] = isset($article['views']) ? $article['views'] + 1 : 1;
            $found = true;
            break;
        }
    }
    if (!$found) throw new Exception('Article not found');
    if (!file_put_contents($filePath, json_encode($articles, JSON_PRETTY_PRINT))) {
        throw new Exception('Error saving updated views');
    }
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
