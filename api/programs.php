<?php
// API de Programas (solo lectura).
// Devuelve la lista de programas activos para poblar los <select> del frontend.

// CORS: permite que el navegador consuma la API y define los metodos permitidos.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight CORS: el navegador puede enviar OPTIONS antes del GET.
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// La respuesta es JSON.
header("Content-Type: application/json; charset=utf-8");

// Conexion PDO ($pdo).
require_once __DIR__ . "/../connectdb.php";

// Corrige nombres con mojibake (ej: "IngenierÃ­a") si la BD fue cargada con un charset incorrecto.
// Esto deja la BD "bien" para que el frontend siempre muestre acentos correctamente.
function fixProgramsMojibake(PDO $pdo): void {
    try {
        $pdo->exec(
            "UPDATE programs
             SET name = CONVERT(CAST(CONVERT(name USING latin1) AS BINARY) USING utf8mb4)
             WHERE name LIKE '%Ã%' OR name LIKE '%Â%'"
        );
    } catch (Throwable $e) {
        // Si falla (por permisos/compatibilidad), no rompemos la API.
    }
}

// Helper para responder con status HTTP + JSON y terminar el script.
function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

$method = $_SERVER["REQUEST_METHOD"];

try {
    if ($method === "GET") {
        fixProgramsMojibake($pdo);
        // Lista de programas activos (para el selector).
        $stmt = $pdo->query("SELECT id, name FROM programs WHERE active = 1 ORDER BY name ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        respond(200, ["success" => true, "data" => $rows]);
    }

    // Cualquier otro metodo se considera no permitido.
    respond(405, ["success" => false, "message" => "Metodo no permitido."]);
} catch (Throwable $e) {
    // Error inesperado del servidor (por ejemplo, SQL o conexion).
    respond(500, ["success" => false, "message" => "Error del servidor."]);
}
