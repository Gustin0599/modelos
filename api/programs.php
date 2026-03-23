<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/../connectdb.php";

function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];

try {
    if ($method === "GET") {
        $stmt = $pdo->query("SELECT id, name FROM programs WHERE active = 1 ORDER BY name ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        respond(200, ["success" => true, "data" => $rows]);
    }

    respond(405, ["success" => false, "message" => "Metodo no permitido."]);
} catch (Throwable $e) {
    respond(500, ["success" => false, "message" => "Error del servidor."]);
}

