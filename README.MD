- los campos que son obligatorios deben ir con el \*
- en la carpeta assets debe ir los recursos como css y js
- manejar dos tablas 
- djngo y ia 

## Base de datos (MySQL / phpMyAdmin)
Este proyecto usa:
- Tabla `students` (estudiantes)
- Tabla `programs` (programas)

SQL sugerido (ajusta nombres si tu tabla `students` es diferente):

```sql
CREATE TABLE programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(20) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_programs_name (name),
  UNIQUE KEY uq_programs_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO programs (name, code) VALUES
('Ingeniería de Sistemas', 'SIS'),
('Ingeniería Industrial', 'IND'),
('Administración de Empresas', 'ADE'),
('Diseño Gráfico', 'DG'),
('Contaduría Pública', 'CON'),
('Psicología', 'PSI');

ALTER TABLE students
  ADD COLUMN program_id INT NULL AFTER email,
  ADD CONSTRAINT fk_students_program
    FOREIGN KEY (program_id) REFERENCES programs(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL;

CREATE INDEX idx_students_program_id ON students(program_id);
```

## Docker (recomendado)

### Requisitos
- Tener instalado Docker Desktop.
- En Windows: habilitar WSL2 (si Docker te lo pide).

### Variables de entorno (.env)
Este proyecto lee credenciales desde un archivo `.env` (no se versiona).

1) Copia el ejemplo:
```bash
copy .env.example .env
```

2) Ajusta valores si lo necesitas (puertos/credenciales).

### Levantar el proyecto
1) Abre una terminal en la carpeta del proyecto (donde está `docker-compose.yml`).
2) Ejecuta:

```bash
docker compose up -d --build
```

3) Abre:
- App: `http://localhost:8080/`
- phpMyAdmin: `http://localhost:8081/`
  - Servidor: el valor de `DB_HOST` (por defecto `db`)
  - Usuario: `PMA_USER` (por defecto `root`)
  - Contraseña: `MYSQL_ROOT_PASSWORD`

### Puertos (por defecto)
- Web (Apache/PHP): `WEB_PORT -> 80`
- phpMyAdmin: `PHPMYADMIN_PORT -> 80`
- MySQL: `MYSQL_PORT -> 3306`

### Apagar contenedores
```bash
docker compose down
```

### Resetear la base de datos (borrado total)
Esto elimina el volumen de MySQL y vuelve a ejecutar el SQL de `docker/mysql/init/01_schema.sql`.

```bash
docker compose down -v
docker compose up -d --build
```
