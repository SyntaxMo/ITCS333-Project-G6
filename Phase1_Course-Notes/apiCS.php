<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for local testing and Replit

$host = getenv("db_host") ?: "127.0.0.1";
$username = getenv("db_user") ?: "myadmin";
$password = getenv("db_pass") ?: "wwe123";
$dbname = "unihubb";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = isset($_GET['action']) ? $_GET['action'] : (isset($_POST['action']) ? $_POST['action'] : '');
    $response = ['success' => false, 'message' => 'Invalid action'];

    switch ($action) {
        case 'getNotes':
            $id = isset($_GET['id']) ? (int)$_GET['id'] : null;
            $sql = "SELECT * FROM notes";
            $params = [];
            if ($id) {
                $sql .= " WHERE id = ?";
                $params[] = $id;
            }
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $notes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($notes as &$note) {
                $note['courseCode'] = $note['course_code'];
                $note['contentOverview'] = json_decode($note['content_overview'], true) ?? [];
            }
            $response['success'] = true;
            $response['data'] = $id ? ($notes[0] ?? null) : $notes;
            break;

        case 'addNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $stmt = $pdo->prepare("INSERT INTO notes (title, course_code, type, description, upload_date, downloads, file_size, content_overview) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $data['title'],
                    $data['courseCode'],
                    $data['type'],
                    $data['description'],
                    $data['uploadDate'],
                    $data['downloads'],
                    $data['fileSize'],
                    json_encode($data['contentOverview'])
                ]);
                $response['success'] = true;
                $response['message'] = 'Note added successfully';
                $response['data'] = ['id' => $pdo->lastInsertId()];
            }
            break;

        case 'updateNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['id'])) {
                $set = [];
                $params = [];
                if (isset($data['title'])) {
                    $set[] = "title = ?";
                    $params[] = $data['title'];
                }
                if (isset($data['downloads'])) {
                    $set[] = "downloads = ?";
                    $params[] = $data['downloads'];
                }
                if (!empty($set)) {
                    $params[] = $data['id'];
                    $stmt = $pdo->prepare("UPDATE notes SET " . implode(', ', $set) . " WHERE id = ?");
                    $stmt->execute($params);
                    $response['success'] = true;
                    $response['message'] = 'Note updated successfully';
                }
            }
            break;

        case 'deleteNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['id'])) {
                $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
                $stmt->execute([$data['id']]);
                $response['success'] = true;
                $response['message'] = 'Note deleted successfully';
            }
            break;

        case 'getComments':
            $noteId = isset($_GET['noteId']) ? (int)$_GET['noteId'] : null;
            if ($noteId) {
                $stmt = $pdo->prepare("SELECT * FROM comments WHERE note_id = ?");
                $stmt->execute([$noteId]);
                $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $response['success'] = true;
                $response['data'] = $comments;
            }
            break;

        case 'addComment':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['noteId'], $data['author'], $data['text'])) {
                $stmt = $pdo->prepare("INSERT INTO comments (note_id, author, text, date) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $data['noteId'],
                    $data['author'],
                    $data['text'],
                    $data['date']
                ]);
                $response['success'] = true;
                $response['message'] = 'Comment added successfully';
            }
            break;
    }

    echo json_encode($response);
} catch (PDOException $e) {
    $response['message'] = "Database error: " . $e->getMessage();
    echo json_encode($response);
}