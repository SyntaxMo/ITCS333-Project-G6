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
    $pdo->exec("CREATE DATABASE IF NOT EXISTS unihubb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    echo "Database created successfully<br>";
    
    // Select the database
    $pdo->exec("USE unihubb");
    
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

    $pdo->exec($sql);
    echo "Table 'events' created successfully<br>";
    
    // Create reviews table (for course reviews)
    $sql = "CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        course_title VARCHAR(255) NOT NULL,
        course_code VARCHAR(50) NOT NULL,
        professor_name VARCHAR(255) NOT NULL,
        rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        course_description TEXT,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'reviews' created successfully<br>";
    
    // Create review_likes table
    $sql = "CREATE TABLE IF NOT EXISTS review_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        user_identifier VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
        UNIQUE KEY (review_id, user_identifier)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'review_likes' created successfully<br>";
    
    // Create comments table
    $sql = "CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        review_id INT NOT NULL,
        author VARCHAR(255) NOT NULL,
        text TEXT NOT NULL,
        date DATE NOT NULL,
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'comments' created successfully<br>";
    
    // Create comment_likes table
    $sql = "CREATE TABLE IF NOT EXISTS comment_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        comment_id INT NOT NULL,
        user_identifier VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE,
        UNIQUE KEY (comment_id, user_identifier)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
    
    $pdo->exec($sql);
    echo "Table 'comment_likes' created successfully<br>";
    
    // Insert sample events
    $sampleEvents = [
        [
            'title' => 'Welcome Freshmen Orientation',
            'event_date' => '2023-09-15 10:00:00',
            'location' => 'Main Campus Quad',
            'description' => 'Annual orientation event for new students with campus tours and information sessions.',
            'category' => 'Orientation',
            'image_path' => 'images/orientation.jpg',
            'popularity' => 150
        ],
        [
            'title' => 'Career Fair 2023',
            'event_date' => '2023-10-05 09:00:00',
            'location' => 'University Conference Center',
            'description' => 'Meet with top employers from various industries and explore internship opportunities.',
            'category' => 'Career',
            'image_path' => 'images/career_fair.jpg',
            'popularity' => 200
        ],
        [
            'title' => 'Computer Science Workshop',
            'event_date' => '2023-10-15 13:00:00',
            'location' => 'Engineering Building Room 205',
            'description' => 'Hands-on workshop covering modern web development techniques.',
            'category' => 'Workshop',
            'image_path' => 'images/cs_workshop.jpg',
            'popularity' => 75
        ]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO events (title, event_date, location, description, category, image_path, popularity) 
                          VALUES (:title, :event_date, :location, :description, :category, :image_path, :popularity)");
    
    foreach ($sampleEvents as $event) {
        $stmt->execute($event);
    }
    echo "Sample events inserted successfully<br>";
    
    // Insert sample reviews
    $sampleReviews = [
        [
            'course_title' => 'Intro to Computer Science',
            'course_code' => 'COMP 101',
            'professor_name' => 'Prof. Smith',
            'rating' => 5,
            'review_text' => 'Excellent introduction to programming concepts. The professor was very knowledgeable and approachable.',
            'author' => 'Student1',
            'date' => '2023-09-15',
            'course_description' => 'Introduction to fundamental programming concepts using Python.',
            'likes' => 24
        ],
        [
            'course_title' => 'Calculus II',
            'course_code' => 'MATH 202',
            'professor_name' => 'Prof. Johnson',
            'rating' => 4,
            'review_text' => 'Good coverage of integration techniques. Homework was time-consuming but helpful.',
            'author' => 'Student3',
            'date' => '2023-09-10',
            'course_description' => 'Advanced integration techniques and applications.',
            'likes' => 12
        ],
        [
            'course_title' => 'Database Systems',
            'course_code' => 'ITCS 333',
            'professor_name' => 'Prof. Williams',
            'rating' => 3,
            'review_text' => 'Content was good but the projects were too complex for the time given.',
            'author' => 'Student4',
            'date' => '2023-09-05',
            'course_description' => 'Relational database design and implementation.',
            'likes' => 8
        ]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO reviews (course_title, course_code, professor_name, rating, review_text, author, date, course_description, likes) 
                          VALUES (:course_title, :course_code, :professor_name, :rating, :review_text, :author, :date, :course_description, :likes)");
    
    foreach ($sampleReviews as $review) {
        $stmt->execute($review);
    }
    echo "Sample reviews inserted successfully<br>";
    
    // Insert sample comments
    $sampleComments = [
        [
            'review_id' => 1,
            'author' => 'Student2',
            'text' => 'I completely agree! The assignments were challenging but fair.',
            'date' => '2023-09-16',
            'likes' => 5
        ],
        [
            'review_id' => 1,
            'author' => 'Student5',
            'text' => 'The TA sessions were really helpful for the projects.',
            'date' => '2023-09-18',
            'likes' => 3
        ],
        [
            'review_id' => 2,
            'author' => 'Student7',
            'text' => 'The textbook was excellent but the lectures could be more engaging.',
            'date' => '2023-09-12',
            'likes' => 2
        ]
    ];
    
    $stmt = $pdo->prepare("INSERT INTO comments (review_id, author, text, date, likes) 
                          VALUES (:review_id, :author, :text, :date, :likes)");
    
    foreach ($sampleComments as $comment) {
        $stmt->execute($comment);
    }
    echo "Sample comments inserted successfully<br>";
    
    echo "<h2>Database initialization completed successfully!</h2>";
    
} catch(PDOException $e) {
    die("Database initialization failed: " . $e->getMessage());
}
?>