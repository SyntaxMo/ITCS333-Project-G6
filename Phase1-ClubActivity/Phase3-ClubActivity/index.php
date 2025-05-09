<?php

$conn = mysqli_connect ("localhost", "root", "", "clubactivity");
$response = array();
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}
else {
  $sql = "SELECT * FROM activity";
  $result = mysqli_query($conn, $sql);  
  $i=0;
  if($result){
    header("content-type: JSON");
    while ($row = mysqli_fetch_assoc($result)){
    $response[$i]['title'] = $row['title'];
    $response[$i]['host'] = $row['host'];
    $response[$i]['location'] = $row['location'];
    $response[$i]['dateTime'] = $row['dateTime'];
    $response[$i]['description'] = $row['description'];
    $i++;
    }
    echo json_encode($response, JSON_PRETTY_PRINT);
  }
}

?>