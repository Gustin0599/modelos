<?php
// Vista principal (UI). Los datos se cargan via fetch desde:
// - api/programs.php (catálogo de programas)
// - api/students.php (CRUD/listado de estudiantes)
//
// Cache busting: agrega ?v=timestamp a CSS/JS para evitar que el navegador use versiones viejas.
$assetVersion = @filemtime(__DIR__ . "/assets/js/script.js") ?: time();
$stylesVersion = @filemtime(__DIR__ . "/assets/css/styles.css") ?: time();
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Panel de Estudiantes</title>
    <link rel="stylesheet" href="assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-rc6/dist/css/adminlte.min.css" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/styles.css?v=<?php echo $stylesVersion; ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="hold-transition sidebar-mini layout-fixed">
    <div class="app-wrapper adminlte-shell">
        <!-- NAVBAR superior -->
        <nav class="main-header navbar navbar-expand navbar-dark bg-dark">
            <div class="container-fluid">
                <span class="navbar-brand mb-0 h1">Admin Panel</span>
            </div>
        </nav>

        <!-- SIDEBAR (navegación por tabs) -->
        <aside class="main-sidebar sidebar-dark-primary elevation-4 admin-sidebar">
            <div class="brand-link text-center py-3 text-white fw-semibold">Panel Administrativo</div>
            <div class="sidebar px-3 py-3">
                <div class="sidebar-meta mb-3">
                    <p class="text-white-50 mb-1 small">Modulo</p>
                    <p class="text-white mb-0 fw-semibold">Gestion de Estudiantes</p>
                </div>

                <ul class="nav nav-pills flex-column gap-1 sidebar-tabs" id="leftTabs" role="tablist" aria-label="Navegacion principal">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="nav-main-estudiantes" data-bs-toggle="tab" data-bs-target="#pane-main-estudiantes" type="button" role="tab" aria-controls="pane-main-estudiantes" aria-selected="true">
                            <i class="fa-solid fa-users tab-icon me-2"></i> Estudiantes
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="nav-main-resumen" data-bs-toggle="tab" data-bs-target="#pane-main-resumen" type="button" role="tab" aria-controls="pane-main-resumen" aria-selected="false">
                            <i class="fa-solid fa-chart-simple tab-icon me-2"></i> Resumen
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="nav-main-programas" data-bs-toggle="tab" data-bs-target="#pane-main-programas" type="button" role="tab" aria-controls="pane-main-programas" aria-selected="false">
                            <i class="fa-solid fa-layer-group tab-icon me-2"></i> Programas
                        </button>
                    </li>
                </ul>
            </div>
        </aside>

        <!-- CONTENIDO principal -->
        <div class="content-wrapper">
            <div class="tab-content" id="mainTabContent">
                <!-- TAB: Estudiantes -->
                <div class="tab-pane fade show active" id="pane-main-estudiantes" role="tabpanel" aria-labelledby="nav-main-estudiantes" tabindex="0">
                    <section class="content-header px-3 px-md-4 pt-4 pb-2">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <h1 class="h4 mb-0">Panel de Estudiantes</h1>
                            <button class="btn btn-success btn-add" data-bs-toggle="modal" data-bs-target="#addModal">
                                <i class="fa-solid fa-plus me-2"></i> Anadir Estudiante
                            </button>
                        </div>
                    </section>

                    <section class="content px-3 px-md-4 pb-4">
                        <!-- Buscador + estadísticas rápidas -->
                        <div class="row mb-4 g-3 align-items-center">
                            <div class="col-12 col-xl-7">
                                <div class="input-group search-group">
                                    <span class="input-group-text"><i class="fa-solid fa-magnifying-glass"></i></span>
                                    <input id="searchInput" type="text" class="form-control" placeholder="Buscar por ID, nombre, apellido, correo o programa">
                                    <button id="searchClear" class="btn btn-outline-secondary" type="button">Limpiar</button>
                                </div>
                            </div>
                            <div class="col-12 col-xl-5">
                                <div class="d-flex justify-content-xl-end gap-2 flex-wrap stats-strip" aria-label="Estadisticas rapidas">
                                    <div class="stat-chip">
                                        <span class="stat-label">Estudiantes</span>
                                        <span class="stat-value" id="statStudents">-</span>
                                    </div>
                                    <div class="stat-chip">
                                        <span class="stat-label">Programas</span>
                                        <span class="stat-value" id="statPrograms">-</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla principal (CRUD) -->
                        <div class="card panel-card mb-4">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h3 class="card-title mb-0">Tabla 1 - Gestion CRUD</h3>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-dark">
	                                            <tr>
	                                                <th scope="col">ID</th>
	                                                <th scope="col">Nombre</th>
	                                                <th scope="col">Apellido</th>
	                                                <th scope="col">Correo</th>
	                                                <th scope="col">Programa</th>
	                                                <th scope="col" class="text-end">Acciones</th>
	                                            </tr>
	                                        </thead>
	                                        <tbody id="studentsBody">
	                                            <tr>
	                                                <td colspan="6" class="text-center text-secondary py-4">Cargando estudiantes...</td>
	                                            </tr>
	                                        </tbody>
	                                    </table>
	                                </div>
	                            </div>
	                        </div>
                    </section>
                </div>

                <!-- TAB: Resumen -->
                <div class="tab-pane fade" id="pane-main-resumen" role="tabpanel" aria-labelledby="nav-main-resumen" tabindex="0">
                    <section class="content-header px-3 px-md-4 pt-4 pb-2">
                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                            <h1 class="h4 mb-0">Resumen</h1>
                        </div>
                    </section>

                    <section class="content px-3 px-md-4 pb-4">
                        <div class="row g-3 g-lg-4">
                            <div class="col-12 col-xl-7">
                                <!-- Resumen: últimos 5 estudiantes -->
                                <div class="card panel-card h-100">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h3 class="card-title mb-0">Ultimos 5 estudiantes</h3>
                                    </div>
                                    <div class="card-body">
                                        <div class="table-responsive">
                                            <table class="table table-sm table-striped align-middle mb-0">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th scope="col">ID</th>
                                                        <th scope="col">Nombre Completo</th>
                                                        <th scope="col">Correo</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="js-recent-students">
                                                    <tr>
                                                        <td colspan="3" class="text-center text-secondary py-4">Cargando resumen...</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-12 col-xl-5">
                                <!-- Resumen: distribución por programa -->
                                <div class="card panel-card h-100">
                                    <div class="card-header d-flex justify-content-between align-items-center">
		                                        <h3 class="card-title mb-0">Programas</h3>
		                                    </div>
	                                    <div class="card-body">
	                                        <p class="text-secondary small mb-2">Distribucion por programa segun los estudiantes registrados.</p>
	                                        <div class="table-responsive">
	                                            <table class="table table-sm table-hover align-middle mb-0">
                                                <thead class="table-light">
                                                    <tr>
                                                        <th scope="col">Programa</th>
                                                        <th scope="col" class="text-end">Estudiantes</th>
                                                    </tr>
                                                </thead>
                                                <tbody class="js-programs">
                                                    <tr>
                                                        <td colspan="2" class="text-center text-secondary py-4">Cargando programas...</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                <!-- TAB: Programas (distribución completa) -->
                <div class="tab-pane fade" id="pane-main-programas" role="tabpanel" aria-labelledby="nav-main-programas" tabindex="0">
		                    <section class="content-header px-3 px-md-4 pt-4 pb-2">
		                        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
		                            <h1 class="h4 mb-0">Programas</h1>
	                            <p class="text-secondary mb-0 small">Distribucion basada en los estudiantes actuales.</p>
	                        </div>
	                    </section>

                    <section class="content px-3 px-md-4 pb-4">
                        <div class="card panel-card">
                            <div class="card-header d-flex justify-content-between align-items-center">
                                <h3 class="card-title mb-0">Distribucion</h3>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-hover align-middle mb-0">
                                        <thead class="table-dark">
                                            <tr>
                                                <th scope="col">Programa</th>
                                                <th scope="col" class="text-end">Estudiantes</th>
                                            </tr>
                                        </thead>
                                        <tbody class="js-programs">
                                            <tr>
                                                <td colspan="2" class="text-center text-secondary py-4">Cargando programas...</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>

    <!-- MODAL: AÑADIR estudiante -->
    <div class="modal fade" id="addModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="addForm">
                    <div class="modal-header">
                        <h5 class="modal-title">Nuevo Estudiante</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" name="nombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Apellido</label>
                            <input type="text" class="form-control" name="apellido" required>
                        </div>
	                        <div class="mb-3">
	                            <label class="form-label">Correo</label>
	                            <input type="email" class="form-control" name="correo" required>
	                        </div>
	                        <div class="mb-3">
	                            <label class="form-label">Programa</label>
	                            <select id="addProgram" class="form-select" name="program_id" required>
	                                <option value="" selected disabled>Cargando programas...</option>
	                            </select>
	                        </div>
	                        <div class="alert alert-danger d-none" id="addError"></div>
	                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL: EDITAR estudiante -->
    <div class="modal fade" id="editModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="editForm">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Estudiante</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="id">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" name="nombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Apellido</label>
                            <input type="text" class="form-control" name="apellido" required>
                        </div>
	                        <div class="mb-3">
	                            <label class="form-label">Correo</label>
	                            <input type="email" class="form-control" name="correo" required>
	                        </div>
	                        <div class="mb-3">
	                            <label class="form-label">Programa</label>
	                            <select id="editProgram" class="form-select" name="program_id" required>
	                                <option value="" selected disabled>Cargando programas...</option>
	                            </select>
	                        </div>
	                        <div class="alert alert-danger d-none" id="editError"></div>
	                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-warning">Actualizar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL: ELIMINAR estudiante -->
    <div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <form id="deleteForm">
                    <div class="modal-header">
                        <h5 class="modal-title">Eliminar Estudiante</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" name="id">
                        <p class="mb-0">Esta accion no se puede deshacer.</p>
                        <div class="alert alert-danger d-none" id="deleteError"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-danger">Eliminar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL: VER detalle del estudiante -->
    <div class="modal fade" id="viewModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Detalle del Estudiante</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">ID</label>
                        <input type="text" class="form-control" id="viewId" readonly>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nombre</label>
                        <input type="text" class="form-control" id="viewNombre" readonly>
                    </div>
	                    <div class="mb-3">
	                        <label class="form-label">Apellido</label>
	                        <input type="text" class="form-control" id="viewApellido" readonly>
	                    </div>
	                    <div class="mb-3">
	                        <label class="form-label">Programa</label>
	                        <input type="text" class="form-control" id="viewPrograma" readonly>
	                    </div>
	                    <div class="mb-0">
	                        <label class="form-label">Correo</label>
	                        <input type="email" class="form-control" id="viewCorreo" readonly>
	                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

        <!-- Librerías JS -->
	    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
	    <script src="https://cdn.jsdelivr.net/npm/admin-lte@4.0.0-rc6/dist/js/adminlte.min.js" crossorigin="anonymous"></script>
        <!-- Script principal del proyecto -->
	    <script src="assets/js/script.js?v=<?php echo $assetVersion; ?>"></script>
	</body>
	</html>
