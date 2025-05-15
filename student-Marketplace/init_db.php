<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Create connection without database selected
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if not exists
    $pdo->exec("CREATE DATABASE IF NOT EXISTS student_marketplace");
    $pdo->exec("USE student_marketplace");
    
    // Create products table
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image_path VARCHAR(255),
        category_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Create categories table
    $pdo->exec("CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL
    )");
    
    // Create comments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        comment_text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES products(id) ON DELETE CASCADE
    )");
    
    // Insert default categories if they don't exist
    $categories = [
        'Books',
        'Electronics',
        'Clothing',
        'Furniture',
        'Accessories',
        'Sports Equipment',
        'Others'
    ];
    
    $stmt = $pdo->prepare("INSERT IGNORE INTO categories (id, name) VALUES (?, ?)");
    foreach ($categories as $index => $category) {
        $stmt->execute([$index + 1, $category]);
    }
    
    echo "Database initialized successfully!\n";
    
} catch(PDOException $e) {
    echo "Error initializing database: " . $e->getMessage() . "\n";
}