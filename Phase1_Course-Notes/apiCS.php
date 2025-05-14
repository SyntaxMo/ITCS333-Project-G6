<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow CORS for Replit/local testing

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
            $response = [
                'success' => true,
                'data' => $id ? ($notes[0] ?? null) : $notes
            ];
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
                    json_encode($data['contentOverview'] ?? [])
                ]);
                $response = [
                    'success' => true,
                    'message' => 'Note added successfully',
                    'data' => ['id' => $pdo->lastInsertId()]
                ];
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
                    $response = [
                        'success' => true,
                        'message' => 'Note updated successfully'
                    ];
                }
            }
            break;

        case 'deleteNote':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['id'])) {
                $stmt = $pdo->prepare("DELETE FROM notes WHERE id = ?");
                $stmt->execute([$data['id']]);
                $response = [
                    'success' => true,
                    'message' => 'Note deleted successfully'
                ];
            }
            break;

        case 'getComments':
            $noteId = isset($_GET['noteId']) ? (int)$_GET['noteId'] : null;
            if ($noteId) {
                $stmt = $pdo->prepare("SELECT * FROM comments WHERE note_id = ?");
                $stmt->execute([$noteId]);
                $comments = $stmt->fetchAll(PDO::FETCH_ASSOC);
                $response = [
                    'success' => true,
                    'data' => $comments
                ];
            }
            break;

        case 'addComment':
            $data = json_decode(file_get_contents('php://input'), true);
            if ($data && isset($data['noteId'], $data['author'], $data['text'], $data['date'])) {
                $stmt = $pdo->prepare("INSERT INTO comments (note_id, author, text, date) VALUES (?, ?, ?, ?)");
                $stmt->execute([
                    $data['noteId'],
                    $data['author'],
                    $data['text'],
                    $data['date']
                ]);
                $response = [
                    'success' => true,
                    'message' => 'Comment added successfully'
                ];
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
?>
