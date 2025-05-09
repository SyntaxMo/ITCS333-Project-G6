-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS student_marketplace;
USE student_marketplace;

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT
);

-- Insert sample categories
INSERT INTO categories (name, description) VALUES
    ('Books', 'Textbooks and study materials'),
    ('Electronics', 'Electronic devices and accessories'),
    ('Furniture', 'Dorm and study furniture'),
    ('Other', 'Miscellaneous items');

-- Create products table with category support
CREATE TABLE IF NOT EXISTS products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Insert sample products
INSERT INTO products (name, description, price, category_id, image_path) VALUES
    ('Sample Product 1', 'This is a sample product', 99.99, 1, 'path/to/image1.jpg'),
    ('Sample Product 2', 'This is another sample product', 149.99, 2, 'path/to/image2.jpg');

-- Drop existing comments table if it exists
DROP TABLE IF EXISTS comments;

-- Create comments table with correct field names
CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES products(id) ON DELETE CASCADE
);