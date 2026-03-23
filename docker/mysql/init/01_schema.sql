-- Esquema inicial para contenedor MySQL (Docker).
-- Se ejecuta automaticamente al crear la BD por primera vez.

CREATE TABLE IF NOT EXISTS programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  code VARCHAR(20) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_programs_name (name),
  UNIQUE KEY uq_programs_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
  Id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(120) NOT NULL,
  program_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_students_program_id (program_id),
  CONSTRAINT fk_students_program
    FOREIGN KEY (program_id) REFERENCES programs(id)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Programas base (si ya existen, no falla).
INSERT IGNORE INTO programs (id, name, code) VALUES
(1, 'Ingeniería de Sistemas', 'SIS'),
(2, 'Ingeniería Industrial', 'IND'),
(3, 'Administración de Empresas', 'ADE'),
(4, 'Diseño Gráfico', 'DG'),
(5, 'Contaduría Pública', 'CON'),
(6, 'Psicología', 'PSI');

