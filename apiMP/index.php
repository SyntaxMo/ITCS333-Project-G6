<?php
// Allow CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Parse the request URI
$request = $_SERVER['REQUEST_URI'];
$basePath = '/api/';
$path = substr($request, strlen($basePath));

// Route the request to the appropriate file
switch ($path) {
    case '':
    case 'read':
    case 'read.php':
        require __DIR__ . '/read.php';
        break;
    
    case 'create':
    case 'create.php':
        require __DIR__ . '/create.php';
        break;
    
    case 'update':
    case 'update.php':
        require __DIR__ . '/update.php';
        break;
    
    case 'delete':
    case 'delete.php':
        require __DIR__ . '/delete.php';
        break;
    
    case 'comment':
    case 'comment.php':
        require __DIR__ . '/comment.php';
        break;
    
    default:
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Not Found']);
        break;
}