<?php
// API de Estudiantes (CRUD).
// Metodos:
// - GET: lista estudiantes (incluye programa con LEFT JOIN)
// - POST: crea estudiante
// - PUT: actualiza estudiante
// - DELETE: elimina estudiante

// CORS: permite que el navegador consuma la API y define metodos.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight CORS: el navegador puede enviar OPTIONS antes de POST/PUT/DELETE.
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

// La respuesta es JSON.
header("Content-Type: application/json; charset=utf-8");

// Conexion PDO ($pdo).
require_once __DIR__ . "/../connectdb.php";

// Helper para responder con status HTTP + JSON y terminar el script.
function respond($status, $payload) {
    http_response_code($status);
    echo json_encode($payload);
    exit;
}

// Valida que el programa exista y este activo (para no guardar program_id invalidos).
function programExists($pdo, $programId) {
    $stmt = $pdo->prepare("SELECT 1 FROM programs WHERE id = :id AND active = 1");
    $stmt->execute([":id" => $programId]);
    return (bool)$stmt->fetchColumn();
}

$method = $_SERVER["REQUEST_METHOD"];
// Body JSON (si aplica). En GET normalmente viene vacio.
$input = file_get_contents("php://input");
$data = $input ? json_decode($input, true) : [];

// Si el cliente envio JSON pero esta mal formado.
if ($input && json_last_error() !== JSON_ERROR_NONE) {
    respond(400, ["success" => false, "message" => "JSON invalido."]);
}

try {
    if ($method === "GET") {
        // Lista de estudiantes + nombre del programa (si tiene).
        $stmt = $pdo->query("SELECT s.Id, s.first_name, s.last_name, s.email, s.program_id, p.name AS program_name FROM students s LEFT JOIN programs p ON p.id = s.program_id ORDER BY s.Id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        respond(200, ["success" => true, "data" => $rows]);
    }

    if ($method === "POST") {
        // Crear estudiante.
        $nombre = trim($data["nombre"] ?? "");
        $apellido = trim($data["apellido"] ?? "");
        $correo = trim($data["correo"] ?? "");
        $programId = (int)($data["program_id"] ?? 0);

        // Validaciones basicas.
        if ($nombre === "" || $apellido === "" || $correo === "" || $programId <= 0) {
            respond(422, ["success" => false, "message" => "Todos los campos son obligatorios."]);
        }

        if (!programExists($pdo, $programId)) {
            respond(422, ["success" => false, "message" => "Programa invalido."]);
        }

        // Insercion en BD.
        $stmt = $pdo->prepare("INSERT INTO students (first_name, last_name, email, program_id) VALUES (:nombre, :apellido, :correo, :program_id)");
        $stmt->execute([
            ":nombre" => $nombre,
            ":apellido" => $apellido,
            ":correo" => $correo,
            ":program_id" => $programId
        ]);

        respond(201, ["success" => true, "message" => "Estudiante creado."]);
    }

    if ($method === "PUT") {
        // Actualizar estudiante.
        $id = (int)($data["id"] ?? 0);
        $nombre = trim($data["nombre"] ?? "");
        $apellido = trim($data["apellido"] ?? "");
        $correo = trim($data["correo"] ?? "");
        $programId = (int)($data["program_id"] ?? 0);

        // Validaciones basicas.
        if ($id <= 0 || $nombre === "" || $apellido === "" || $correo === "" || $programId <= 0) {
            respond(422, ["success" => false, "message" => "Datos incompletos para actualizar."]);
        }

        if (!programExists($pdo, $programId)) {
            respond(422, ["success" => false, "message" => "Programa invalido."]);
        }

        // Actualizacion en BD.
        $stmt = $pdo->prepare("UPDATE students SET first_name = :nombre, last_name = :apellido, email = :correo, program_id = :program_id WHERE Id = :id");
        $stmt->execute([
            ":nombre" => $nombre,
            ":apellido" => $apellido,
            ":correo" => $correo,
            ":program_id" => $programId,
            ":id" => $id
        ]);

        respond(200, ["success" => true, "message" => "Estudiante actualizado."]);
    }

    if ($method === "DELETE") {
        // Eliminar estudiante por Id.
        $id = (int)($data["id"] ?? 0);
        if ($id <= 0) {
            respond(422, ["success" => false, "message" => "ID invalido."]);
        }

        $stmt = $pdo->prepare("DELETE FROM students WHERE Id = :id");
        $stmt->execute([":id" => $id]);

        respond(200, ["success" => true, "message" => "Estudiante eliminado."]);
    }

    // Metodo no soportado.
    respond(405, ["success" => false, "message" => "Metodo no permitido."]);
} catch (Throwable $e) {
    // Error inesperado del servidor (por ejemplo, SQL o conexion).
    respond(500, ["success" => false, "message" => "Error del servidor."]);
}
