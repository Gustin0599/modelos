<?php

$hostDB = '127.0.0.1';
$nameDB = 'clase_db';
$userDB = 'clase_user';
$passDB = 'clase123';

try {
    $pdo = new PDO("mysql:host=$hostDB;dbname=$nameDB;charset=utf8", $userDB, $passDB);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

?>
