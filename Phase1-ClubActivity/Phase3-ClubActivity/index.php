<?php

$host = "localhost";
$username = "root";
$password = "";
$dbname = "clubactivity";

$conn = mysqli_connect($host, $username, $password, $dbname);
$response = array();
if (!$conn) {
    die("Connection failed: " . mysqli_connect_error());
}

?>