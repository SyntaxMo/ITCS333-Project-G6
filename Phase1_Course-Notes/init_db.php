<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$host = getenv("db_host") ?: "127.0.0.1";
$username = getenv("db_user") ?: "myadmin";
$password = getenv("db_pass") ?: "wwe123";
$dbname = getenv("db_name") ?: "unihubb";

try {
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Create DB if it doesn't exist
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbname`");
    $pdo->exec("USE `$dbname`");

    // Notes table
    $pdo->exec("CREATE TABLE IF NOT EXISTS notes (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        course_code VARCHAR(50) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT NULL,
        upload_date DATE NOT NULL,
        downloads INT NOT NULL DEFAULT 0,
        file_size VARCHAR(20) NOT NULL DEFAULT 'Not uploaded',
        content_overview TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    // Comments table
    $pdo->exec("CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        note_id BIGINT NOT NULL,
        author VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        date DATE NOT NULL,
        FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )");

    echo "✅ MySQL database initialized successfully.";
} catch(PDOException $e) {
    echo "❌ Error initializing database: " . $e->getMessage();
}
?>
