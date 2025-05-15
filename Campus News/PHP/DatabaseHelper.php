<?php
require_once 'config.php';

class DatabaseHelper {
    private $pdo;

    public function __construct(array $config) {
        $dsn = "mysql:host={$config['host']};dbname={$config['dbname']};charset=utf8mb4";

        try {
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $config['options']);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage()
            ]);
            exit;
        }
    }

    public function getPDO() {
        return $this->pdo;
    }

    public function query($sql) {
        return $this->pdo->query($sql);
    }

    public function prepare($sql) {
        return $this->pdo->prepare($sql);
    }

    public function exec($sql) {
        return $this->pdo->exec($sql);
    }

    public function lastInsertId() {
        return $this->pdo->lastInsertId();
    }

    public function createNewsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `news` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `content` TEXT,
            `author` VARCHAR(100) DEFAULT 'Anonymous',
            `date` DATE NOT NULL,
            `image` VARCHAR(255) DEFAULT 'Pic/default.jpg',
            `college` VARCHAR(100) NOT NULL,
            `courseCode` VARCHAR(20),
            `views` INT DEFAULT 0
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $this->exec($sql);
    }

    public function createCommentsTable() {
        $sql = "CREATE TABLE IF NOT EXISTS `comments` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `articleId` INT NOT NULL,
            `author` VARCHAR(255) NOT NULL,
            `content` TEXT NOT NULL,
            `date` DATETIME NOT NULL,
            FOREIGN KEY (`articleId`) REFERENCES `news`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $this->exec($sql);
    }
}
?>
