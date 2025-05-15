<?php
$config = [
    'host' => getenv('db_host'),
    'dbname' => getenv('db_name'),
    'username' => getenv('db_user'),
    'password' => getenv('db_pass'),
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];
?>
