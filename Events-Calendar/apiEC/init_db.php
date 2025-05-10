<?php
// Database configuration
$host = 'localhost';
$username = 'root';
$password = '';

try {
    // Create connection without database
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS unihub");
    echo "Database created successfully<br>";
    
    // Select the database
    $pdo->exec("USE unihub");
    
    // Create events table
    $sql = "CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        event_date DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(50) NOT NULL,
        image_path VARCHAR(255) NOT NULL,
        popularity INT DEFAULT 0,
        comments JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $pdo->exec($sql);
    echo "Table 'events' created successfully";
} catch(PDOException $e) {
    die("Database initialization failed: " . $e->getMessage());
}
?> 