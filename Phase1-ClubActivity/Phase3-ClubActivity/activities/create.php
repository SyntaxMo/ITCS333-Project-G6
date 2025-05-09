<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST"); 
header("access-control-allow-headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include('function.php');

$requestMethod = $_SERVER["REQUEST_METHOD"];

if($requestMethod == "POST") {

  $inputData = json_decode(file_get_contents("php://input"), true);
  if(empty($inputData)) {
    
    $storeActivity = storeActivity($_POST);

  }

  else{

    $storeActivity = storeActivity($inputData);

    }

  echo $storeActivity;
   }
else {

  $data = [
      'status' => 405,
      'message'=> $requestMethod . " method not allowed",
    ] ;
    header("HTTP/1.0 405 Method Not Allowed");
    echo json_encode($data);
}

?>