<?php

// Conexion a la base de datos (MySQL) usando PDO.
// Este archivo define la variable global `$pdo`, usada por las APIs en `api/`.
// Nota: en un proyecto real conviene mover estas credenciales a variables de entorno (.env).

$hostDB = '127.0.0.1';
$nameDB = 'clase_db';
$userDB = 'clase_user';
$passDB = 'clase123';

try {
    // DSN: host + nombre de BD + charset. Si la conexion falla lanza una excepcion.
    $pdo = new PDO("mysql:host=$hostDB;dbname=$nameDB;charset=utf8", $userDB, $passDB);
    // Hace que los errores SQL se reporten como excepciones (mejor para depurar).
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Si falla la conexion, se detiene la ejecucion con un mensaje.
    // Si quieres que SIEMPRE sea JSON, lo podemos cambiar por un respond() en las APIs.
    die("Connection failed: " . $e->getMessage());
}

?>
