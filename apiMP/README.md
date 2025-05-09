# Student Marketplace API Documentation

## Base URL
```
http://localhost/333/api
```

## Endpoints

### List Products
**GET** `/read.php`

Lists all products in the marketplace. Results are sorted by creation date (newest first).

**Response**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Product Name",
            "description": "Product Description",
            "price": "99.99",
            "category_id": 1,
            "image_path": "uploads/images/image.jpg",
            "created_at": "2025-05-09 12:00:00"
        }
    ]
}
```

### Get Single Product
**GET** `/read.php?id={id}`

Get details for a specific product.

**Parameters**
- `id` (required): Product ID

**Response**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Product Name",
        "description": "Product Description",
        "price": "99.99",
        "category_id": 1,
        "image_path": "uploads/images/image.jpg",
        "created_at": "2025-05-09 12:00:00"
    }
}
```

### Create Product
**POST** `/create.php`

Create a new product listing.

**Request Body**
```json
{
    "name": "Product Name",
    "description": "Product Description",
    "price": 99.99,
    "category_id": 1,
    "image": "base64_encoded_image_data"
}
```

**Response**
```json
{
    "success": true,
    "message": "Product created successfully",
    "data": {
        "id": 1,
        "name": "Product Name",
        "description": "Product Description",
        "price": "99.99",
        "image_path": "uploads/images/image.jpg",
        "category_id": 1
    }
}
```

### Update Product
**POST** `/update.php`

Update an existing product.

**Request Body**
```json
{
    "id": 1,
    "name": "Updated Name",
    "description": "Updated Description",
    "price": 149.99,
    "category_id": 2,
    "image": "base64_encoded_image_data" // Optional
}
```

**Response**
```json
{
    "success": true,
    "message": "Product updated successfully"
}
```

### Delete Product
**POST** `/delete.php`

Delete a product.

**Request Body**
```json
{
    "id": 1
}
```

**Response**
```json
{
    "success": true,
    "message": "Product deleted successfully"
}
```

### Comments

#### Get Comments
**GET** `/comment.php?product_id={id}`

Get comments for a specific product.

**Parameters**
- `product_id` (required): Product ID

**Response**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "commenter_name": "User Name",
            "comment_text": "Comment content",
            "created_at": "2025-05-09 12:00:00"
        }
    ]
}
```

#### Add Comment
**POST** `/comment.php`

Add a new comment to a product.

**Request Body**
```json
{
    "product_id": 1,
    "commenter_name": "User Name",
    "comment_text": "Comment content"
}
```

**Response**
```json
{
    "success": true,
    "message": "Comment added successfully",
    "data": {
        "id": 1,
        "commenter_name": "User Name",
        "comment_text": "Comment content",
        "created_at": "2025-05-09 12:00:00"
    }
}
```

## Error Handling

All endpoints return errors in the following format:

```json
{
    "success": false,
    "message": "Error description"
}
```

Common HTTP status codes:
- 200: Success
- 400: Bad Request (invalid input)
- 404: Not Found
- 405: Method Not Allowed
- 500: Server Error

## Database Schema

### Products Table
```sql
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category_id INT,
    image_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
```

### Categories Table
```sql
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT
);
```

### Comments Table
```sql
CREATE TABLE comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (item_id) REFERENCES products(id) ON DELETE CASCADE
);
```