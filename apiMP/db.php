<?php
// db.php - Database connection file

// Error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Check if running on Replit
$isReplit = getenv('REPL_ID') !== false;

if ($isReplit) {
    // Replit database credentials
    $host = getenv('DB_HOST');
    $dbname = getenv('DB_NAME');
    $username = getenv('DB_USER');
    $password = getenv('DB_PASS');
} else {
    // Local XAMPP database credentials
    $host = 'localhost';
    $dbname = 'student_marketplace';
    $username = 'root';
    $password = '';
}

$charset = 'utf8mb4';
$dsn = "mysql:host=$host;dbname=$dbname;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
];

try {
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    error_log("Database Error: " . $e->getMessage());
    if (strpos($e->getMessage(), "Unknown database") !== false) {
        die("Database '$dbname' does not exist. Please run init_db.php first.");
    } else if (strpos($e->getMessage(), "Access denied") !== false) {
        die("Database access denied. Check your database credentials.");
    } else if (strpos($e->getMessage(), "Connection refused") !== false) {
        die("Could not connect to MySQL. Make sure MySQL is running.");
    } else {
        die("Database Error: " . $e->getMessage());
    }
}
?>