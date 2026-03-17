<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
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
$input = file_get_contents("php://input");
$data = $input ? json_decode($input, true) : [];

if ($input && json_last_error() !== JSON_ERROR_NONE) {
    respond(400, ["success" => false, "message" => "JSON invalido."]);
}

try {
    if ($method === "GET") {
        $stmt = $pdo->query("SELECT Id, first_name, last_name, email FROM students ORDER BY Id ASC");
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        respond(200, ["success" => true, "data" => $rows]);
    }

    if ($method === "POST") {
        $nombre = trim($data["nombre"] ?? "");
        $apellido = trim($data["apellido"] ?? "");
        $correo = trim($data["correo"] ?? "");

        if ($nombre === "" || $apellido === "" || $correo === "") {
            respond(422, ["success" => false, "message" => "Todos los campos son obligatorios."]);
        }

        $stmt = $pdo->prepare("INSERT INTO students (first_name, last_name, email) VALUES (:nombre, :apellido, :correo)");
        $stmt->execute([
            ":nombre" => $nombre,
            ":apellido" => $apellido,
            ":correo" => $correo
        ]);

        respond(201, ["success" => true, "message" => "Estudiante creado."]);
    }

    if ($method === "PUT") {
        $id = (int)($data["id"] ?? 0);
        $nombre = trim($data["nombre"] ?? "");
        $apellido = trim($data["apellido"] ?? "");
        $correo = trim($data["correo"] ?? "");

        if ($id <= 0 || $nombre === "" || $apellido === "" || $correo === "") {
            respond(422, ["success" => false, "message" => "Datos incompletos para actualizar."]);
        }

        $stmt = $pdo->prepare("UPDATE students SET first_name = :nombre, last_name = :apellido, email = :correo WHERE Id = :id");
        $stmt->execute([
            ":nombre" => $nombre,
            ":apellido" => $apellido,
            ":correo" => $correo,
            ":id" => $id
        ]);

        respond(200, ["success" => true, "message" => "Estudiante actualizado."]);
    }

    if ($method === "DELETE") {
        $id = (int)($data["id"] ?? 0);
        if ($id <= 0) {
            respond(422, ["success" => false, "message" => "ID invalido."]);
        }

        $stmt = $pdo->prepare("DELETE FROM students WHERE Id = :id");
        $stmt->execute([":id" => $id]);

        respond(200, ["success" => true, "message" => "Estudiante eliminado."]);
    }

    respond(405, ["success" => false, "message" => "Metodo no permitido."]);
} catch (Throwable $e) {
    respond(500, ["success" => false, "message" => "Error del servidor."]);
}
