<?php

// Conexion a la base de datos (MySQL) usando PDO.
// Este archivo define la variable global `$pdo`, usada por las APIs en `api/`.
//
// Soporta variables de entorno (ideal para Docker):
// - DB_HOST, DB_NAME, DB_USER, DB_PASS
// Si no existen, usa los valores locales por defecto (XAMPP).

$hostDB = getenv('DB_HOST') ?: '127.0.0.1';
$nameDB = getenv('DB_NAME') ?: 'clase_db';
$userDB = getenv('DB_USER') ?: 'clase_user';
$passDB = getenv('DB_PASS') ?: 'clase123';
$portDB = getenv('DB_PORT') ?: '';

try {
    // DSN: host + nombre de BD + charset. Si la conexion falla lanza una excepcion.
    $dsn = "mysql:host=$hostDB;dbname=$nameDB;charset=utf8mb4";
    if ($portDB !== '') {
        $dsn .= ";port=$portDB";
    }

    $pdo = new PDO($dsn, $userDB, $passDB);
    // Hace que los errores SQL se reporten como excepciones (mejor para depurar).
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    // Si falla la conexion, se detiene la ejecucion con un mensaje.
    // Si quieres que SIEMPRE sea JSON, lo podemos cambiar por un respond() en las APIs.
    die("Connection failed: " . $e->getMessage());
}

?>
