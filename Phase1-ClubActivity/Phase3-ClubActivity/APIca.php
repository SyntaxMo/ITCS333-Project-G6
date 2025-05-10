<?php
// APIca.php - Single entry point for all Club Activity API operations

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$dbname = "clubactivity";
$conn = mysqli_connect($host, $username, $password, $dbname);
if (!$conn) {
    http_response_code(500);
    echo json_encode(["status" => 500, "message" => "Database connection failed: " . mysqli_connect_error()]);
    exit();
}

function error422($message){
  http_response_code(422);
  echo json_encode([
    'status' => 422,
    'message'=> $message,
  ]);
  exit();
}

function getClubActivity(){
  global $conn;
  $sql = "SELECT * FROM activity";
  $query = mysqli_query($conn, $sql);  
  if($query){
    if(mysqli_num_rows($query) > 0){
      $result = mysqli_fetch_all($query, MYSQLI_ASSOC);
      http_response_code(200);
      echo json_encode($result);
    } else {
      http_response_code(200);
      echo json_encode([]);
    }
  } else {
    http_response_code(500);
    echo json_encode(["status" => 500, "message" => "Internal Server Error"]);
  }
  exit();
}

function getActivity($activityParams){
  global $conn;
  if(!isset($activityParams['title']) || $activityParams['title'] == null){
    error422("Please enter the activity title");
  }
  $title = mysqli_real_escape_string($conn, $activityParams['title']);
  $query = "SELECT * FROM activity WHERE title = '$title'";
  $result = mysqli_query($conn, $query);
  if($result){
    if(mysqli_num_rows($result) > 0){
      $activity = mysqli_fetch_all($result, MYSQLI_ASSOC);
      http_response_code(200);
      echo json_encode($activity);
    } else {
      http_response_code(404);
      echo json_encode([]);
    }
  } else {
    http_response_code(500);
    echo json_encode(["status" => 500, "message" => "Internal Server Error"]);
  }
  exit();
}

function storeActivity($activityInput){
  global $conn;
  $title = $activityInput['title'] ?? '';
  $host = $activityInput['host'] ?? '';
  $location = $activityInput['location'] ?? '';
  $dateTime = $activityInput['date_time'] ?? '';
  $description = $activityInput['description'] ?? '';
  if(empty(trim($title))){
    error422("Please enter a title");
  } else if(empty(trim($host))){
    error422("Please select a host");
  } else if(empty(trim($location))){
    error422("Please enter a location");
  } else if(empty(trim($dateTime))){
    error422("Please select a date and time");
  } else if(empty(trim($description))){
    error422("Please enter a description");
  } else {
    $query = "INSERT INTO activity (title, host, location, date_time, description) VALUES ('$title', '$host', '$location', '$dateTime', '$description')";
    $result = mysqli_query($conn, $query);
    if($result){
      http_response_code(201);
      echo json_encode(["status" => 201, "message" => "Activity created successfully"]);
    } else {
      http_response_code(500);
      echo json_encode(["status" => 500, "message" => "Internal Server Error"]);
    }
  }
  exit();
}

function updateActivity($activityInput, $activityParams){
  global $conn;
  if(!isset($activityParams['title']) || $activityParams['title'] == null){
    error422("Please enter the activity title");
  }
  $title = mysqli_real_escape_string($conn, $activityParams['title']);
  $host = mysqli_real_escape_string($conn, $activityInput['host']);
  $location = mysqli_real_escape_string($conn, $activityInput['location']);
  $dateTime = mysqli_real_escape_string($conn, $activityInput['date_time']);
  $description = mysqli_real_escape_string($conn, $activityInput['description']);
  $query = "UPDATE activity SET host='$host', location='$location', date_time='$dateTime', description='$description' WHERE title='$title'";
  $result = mysqli_query($conn, $query);
  if($result){
    http_response_code(200);
    echo json_encode(["status" => 200, "message" => "Activity updated successfully"]);
  } else {
    http_response_code(500);
    echo json_encode(["status" => 500, "message" => "Internal Server Error"]);
  }
  exit();
}

function deleteActivity($activityParams){
  global $conn;
  if(!isset($activityParams['title']) || $activityParams['title'] == null){
    error422("Please enter the activity title");
  }
  $title = mysqli_real_escape_string($conn, $activityParams['title']);
  $query = "DELETE FROM activity WHERE title='$title'";
  $result = mysqli_query($conn, $query);
  if($result){
    http_response_code(204);
    echo json_encode(["status" => 204, "message" => "Activity deleted successfully"]);
  } else {
    http_response_code(500);
    echo json_encode(["status" => 500, "message" => "Internal Server Error"]);
  }
  exit();
}

// Main API router
$requestMethod = $_SERVER["REQUEST_METHOD"];
$path = $_GET['action'] ?? '';

if ($requestMethod == "GET") {
  if(isset($_GET['title'])) {
    getActivity($_GET);
  } else {
    getClubActivity();
  }
} elseif ($requestMethod == "POST") {
  $inputData = json_decode(file_get_contents("php://input"), true);
  if(empty($inputData)) {
    storeActivity($_POST);
  } else {
    storeActivity($inputData);
  }
} elseif ($requestMethod == "PUT") {
  $inputData = json_decode(file_get_contents("php://input"), true);
  updateActivity($inputData, $_GET);
} elseif ($requestMethod == "DELETE") {
  deleteActivity($_GET);
} elseif ($requestMethod == "OPTIONS") {
  http_response_code(200);
  exit();
} else {
  http_response_code(405);
  echo json_encode(["status" => 405, "message" => $requestMethod . " method not allowed"]);
  exit();
}
?>
