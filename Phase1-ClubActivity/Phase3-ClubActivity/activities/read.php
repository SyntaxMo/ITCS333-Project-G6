<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET"); 
header("access-control-allow-headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

include('function.php');

$requestMethod = $_SERVER["REQUEST_METHOD"];

if($requestMethod == "GET") {
  if(isset($_GET['title'])){
    $activity = getActivity($_GET);
    echo $activity;

  }else{
    $activityList = getClubActivity();
    echo $activityList;
  }
   
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