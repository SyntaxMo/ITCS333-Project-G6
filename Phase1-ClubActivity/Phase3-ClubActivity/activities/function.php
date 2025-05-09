<?php

require '../index.php';

function error422($message){
  $data = [
    'status' => 422,
    'message'=> $message,
  ] ;
  header("HTTP/1.0 422 Unprocessable Entity");
  echo json_encode($data);
  exit();
}

function getClubActivity(){

global $conn;
  $sql = "SELECT * FROM activity";
  $query = mysqli_query($conn, $sql);  
 
  if($query){

    if(mysqli_num_rows($query) > 0){

      $result = mysqli_fetch_all($query, MYSQLI_ASSOC);

      $data = [
        'status' => 200,
        'message'=> " Activity fetched successfully",
        "data"=> $result
        ] ;
      header("HTTP/1.0 200 Activity fetched successfully");
      return json_encode($data);

    }
    else{

      $data = [
        'status' => 404,
        'message'=> " No activity found",
        ] ;
      header("HTTP/1.0 404 No activity found");
      return json_encode($data);

    }

}
  else {
    $data = [
      'status' => 500,
      'message'=> " Internal Server Error",
    ] ;
    header("HTTP/1.0 500 Internal Server Error");
    return json_encode($data);
}

}

function storeActivity($activityInput){

global $conn;

$title = $activityInput['title'];
$host = $activityInput['host'];
$location = $activityInput['location'];
$dateTime = $activityInput['date_time'];
$description = $activityInput['description'];

if(empty(trim($title))){
  return error422("Please enter a title");

}else if(empty(trim($host))){
  return error422("Please select a host");

}else if(empty(trim($location))){
  return error422("Please enter a location");

}else if(empty(trim($dateTime))){
  return error422("Please select a date and time");

}else if(empty(trim($description))){
  return error422("Please enter a description");

}else{

  $query = "INSERT INTO activity (title, host, location, date_time, description) VALUES ('$title', '$host', '$location', '$dateTime', '$description')";
  $result = mysqli_query($conn, $query);

  if($result){

    $data = [
      'status' => 201,
      'message'=> " Activity created successfully",
    ] ;
    header("HTTP/1.0 201 Activity created successfully");
    return json_encode($data);

  }
  else{
    $data = [
      'status' => 500,
      'message'=> " Internal Server Error",
    ] ;
    header("HTTP/1.0 500 Internal Server Error");
    return json_encode($data);
  }
}
}

function getActivity($activityParams){

  global $conn;

  if($activityParams['title'] == null){
    return error422("Please enter the activity title");
  }

  $title = mysqli_real_escape_string($conn, $activityParams['title']);
  $query = "SELECT * FROM activity WHERE title = '$title'";
  $result = mysqli_query($conn, $query);

  if($result){

    if(mysqli_num_rows($result) > 0){

      $activity = mysqli_fetch_all($result, MYSQLI_ASSOC);

      $data = [
        'status' => 200,
        'message'=> " Activity fetched successfully",
        "data"=> $activity
        ] ;
      header("HTTP/1.0 200 Activity fetched successfully");
      return json_encode($data);

    }
    else{

      $data = [
        'status' => 404,
        'message'=> " No activity found",
        ] ;
      header("HTTP/1.0 404 No activity found");
      return json_encode($data);

    }
  }
  else{
    $data = [
      'status' => 500,
      'message'=> " Internal Server Error",
    ] ;
    header("HTTP/1.0 500 Internal Server Error");
    return json_encode($data);
  }
}

?>