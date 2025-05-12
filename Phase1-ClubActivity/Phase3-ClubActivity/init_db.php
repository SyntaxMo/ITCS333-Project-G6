<?php
// Database configuration
$host = 'localhost';
$username = 'myadmin';
$password = 'wwe123';

try {
    // Create connection without database
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS unihubb");
    echo "Database created successfully<br>";
    
    // Select the database
    $pdo->exec("USE unihubb");
    
    // Create events table
    $sql = "CREATE TABLE IF NOT EXISTS activity (
        title VARCHAR(255) NOT NULL,
        dateTime DATETIME NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        host VARCHAR(50) NOT NULL,
        image VARCHAR(255) NOT NULL,
        comments JSON DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )";

    $pdo->exec($sql);
    echo "Table 'events' created successfully";
} catch(PDOException $e) {
    die("Database initialization failed: " . $e->getMessage());
}