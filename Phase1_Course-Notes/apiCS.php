<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// .. SHOW ERRORS for debugging
ini_set('display_errors', 1); 
error_reporting(E_ALL);

$host = getenv("db_host") ?: "127.0.0.1";
$username = getenv("db_user") ?: "myadmin";
$password = getenv("db_pass") ?: "wwe123";
$dbname = "unihubb";

$response = ['success' => false, 'message' => 'Invalid action'];

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $action = $_GET['action'] ?? ($_POST['action'] ?? '');

    switch ($action) {

        // === Get Notes ===
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

        // === Add Note ===
        case 'addNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data) {
                $stmt = $pdo->prepare("
                    INSERT INTO notes 
                    (title, course_code, type, description, upload_date, downloads, file_size, content_overview)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ");
                $success = $stmt->execute([
                    $data['title'],
                    $data['courseCode'],
                    $data['type'],
                    $data['description'],
                    $data['uploadDate'],
                    $data['downloads'],
                    $data['fileSize'],
                    json_encode($data['contentOverview'] ?? [])
                ]);

                if ($success) {
                    $response['success'] = true;
                    $response['message'] = 'Note added successfully';
                    $response['data'] = ['id' => $pdo->lastInsertId()];
                } else {
                    $response['message'] = "Note insert failed: " . implode(' | ', $stmt->errorInfo());
                }
            }
            break;

        // === Update Note ===
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
                    $success = $stmt->execute($params);
                    if ($success) {
                        $response['success'] = true;
                        $response['message'] = 'Note updated successfully';
                    } else {
                        $response['message'] = "Note update failed: " . implode(' | ', $stmt->errorInfo());
                    }
                }
            }
            break;

        // === Delete Note ===
        case 'deleteNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['id'])) {
                $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
                $success = $stmt->execute([$data['id']]);
                if ($success) {
                    $response['success'] = true;
                    $response['message'] = 'Note deleted successfully';
                } else {
                    $response['message'] = "Delete failed: " . implode(' | ', $stmt->errorInfo());
                }
            }
            break;

        // === Get Comments ===
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

        // === Add Comment ===
        case 'addComment':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['noteId'], $data['author'], $data['text'], $data['date'])) {
                $stmt = $pdo->prepare("
                    INSERT INTO comments (note_id, author, text, date)
                    VALUES (?, ?, ?, ?)
                ");
                $success = $stmt->execute([
                    $data['noteId'],
                    $data['author'],
                    $data['text'],
                    $data['date'] // must be YYYY-MM-DD
                ]);

                if ($success) {
                    $response['success'] = true;
                    $response['message'] = 'Comment added successfully';
                } else {
                    $response['message'] = "Comment insert failed: " . implode(' | ', $stmt->errorInfo());
                }
            }
            break;
    }

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => "Database error: " . $e->getMessage()
    ]);
}
