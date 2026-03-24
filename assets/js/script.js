// Frontend (vanilla JS) del panel:
// - Carga programas y estudiantes desde la API (fetch)
// - Renderiza tablas (estudiantes, resumen, distribución por programas)
// - Maneja modales para ver/crear/editar/eliminar

const studentsApiUrl = "api/students.php";
const programsApiUrl = "api/programs.php";
let studentsCache = [];
let programsCache = [];

// Referencias a elementos del DOM (tablas, formularios, campos, etc.).
const studentsBody = document.getElementById("studentsBody");
const recentStudentsBodies = [...document.querySelectorAll(".js-recent-students")];
const programsBodies = [...document.querySelectorAll(".js-programs")];
const addForm = document.getElementById("addForm");
const editForm = document.getElementById("editForm");
const deleteForm = document.getElementById("deleteForm");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const addProgram = document.getElementById("addProgram");
const editProgram = document.getElementById("editProgram");
const statStudents = document.getElementById("statStudents");
const statPrograms = document.getElementById("statPrograms");
const viewId = document.getElementById("viewId");
const viewNombre = document.getElementById("viewNombre");
const viewApellido = document.getElementById("viewApellido");
const viewCorreo = document.getElementById("viewCorreo");
const viewPrograma = document.getElementById("viewPrograma");

// Asegura que los botones de submit en modales no queden invisibles por overrides de CSS/tema.
function ensureModalSubmitButtons() {
  const candidates = [];
  if (addForm) {
    candidates.push(addForm.querySelector('button[type="submit"]'));
  }
  if (editForm) {
    candidates.push(editForm.querySelector('button[type="submit"]'));
  }

  candidates.filter(Boolean).forEach((button) => {
    button.style.setProperty("background-color", "#00a65a", "important");
    button.style.setProperty("border-color", "#00a65a", "important");
    button.style.setProperty("color", "#ffffff", "important");
    button.style.setProperty("min-width", "140px");
    if (!button.textContent || !button.textContent.trim()) {
      button.textContent = "Guardar";
    }
  });
}

// Modales: usamos Bootstrap JS si está disponible. Si no (por ejemplo, CDN bloqueado),
// usamos un fallback mínimo para abrir/cerrar modales y no romper toda la app.
function createModalFallback(modalEl) {
  if (!modalEl) {
    return { show() {}, hide() {} };
  }

  function show() {
    modalEl.style.display = "block";
    modalEl.classList.add("show");
    modalEl.removeAttribute("aria-hidden");
    modalEl.setAttribute("aria-modal", "true");
    document.body.classList.add("modal-open");
  }

  function hide() {
    modalEl.classList.remove("show");
    modalEl.style.display = "none";
    modalEl.setAttribute("aria-hidden", "true");
    modalEl.removeAttribute("aria-modal");
    document.body.classList.remove("modal-open");
  }

  return { show, hide };
}

const hasBootstrapModal = typeof window.bootstrap !== "undefined" && typeof window.bootstrap.Modal === "function";
const modalOptions = { backdrop: false };
const addModalEl = document.getElementById("addModal");
const editModalEl = document.getElementById("editModal");
const deleteModalEl = document.getElementById("deleteModal");
const viewModalEl = document.getElementById("viewModal");

const addModal = hasBootstrapModal ? new window.bootstrap.Modal(addModalEl, modalOptions) : createModalFallback(addModalEl);
const editModal = hasBootstrapModal ? new window.bootstrap.Modal(editModalEl, modalOptions) : createModalFallback(editModalEl);
const deleteModal = hasBootstrapModal ? new window.bootstrap.Modal(deleteModalEl, modalOptions) : createModalFallback(deleteModalEl);
const viewModal = hasBootstrapModal ? new window.bootstrap.Modal(viewModalEl, modalOptions) : createModalFallback(viewModalEl);

// Fallback para abrir/cerrar modales cuando Bootstrap JS no está cargado.
if (!hasBootstrapModal) {
  document.querySelectorAll("[data-bs-toggle=\"modal\"][data-bs-target]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      const targetSelector = trigger.getAttribute("data-bs-target");
      const modalEl = targetSelector ? document.querySelector(targetSelector) : null;
      if (!modalEl) {
        return;
      }
      createModalFallback(modalEl).show();
    });
  });

  document.querySelectorAll("[data-bs-dismiss=\"modal\"]").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      const modalEl = btn.closest(".modal");
      if (!modalEl) {
        return;
      }
      createModalFallback(modalEl).hide();
    });
  });
}

// Helpers para mostrar/ocultar errores en los modales.
function showError(el, message) {
  el.textContent = message;
  el.classList.remove("d-none");
}

function clearError(el) {
  el.textContent = "";
  el.classList.add("d-none");
}

// Renderiza la tabla principal de estudiantes.
function renderTable(rows, emptyMessage) {
  if (!rows.length) {
    studentsBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-secondary py-4">${emptyMessage || "No hay estudiantes registrados."}</td>
      </tr>
    `;
    return;
  }

  studentsBody.innerHTML = rows
    .map(
      (student) => `
        <tr>
          <td>${student.Id}</td>
          <td>${student.first_name}</td>
          <td>${student.last_name}</td>
          <td>${student.email}</td>
          <td>${student.program_name || "Sin programa"}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2 btn-view" data-id="${student.Id}" title="Ver" aria-label="Ver">
              <i class="fa-solid fa-eye" aria-hidden="true"></i><span class="action-text">Ver</span>
            </button>
            <button class="btn btn-sm btn-outline-warning me-2 btn-edit" data-id="${student.Id}" title="Editar" aria-label="Editar">
              <i class="fa-solid fa-pen" aria-hidden="true"></i><span class="action-text">Editar</span>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${student.Id}" title="Eliminar" aria-label="Eliminar">
              <i class="fa-solid fa-trash" aria-hidden="true"></i><span class="action-text">Eliminar</span>
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

// Renderiza la tabla del resumen (últimos 5 estudiantes por Id).
function renderRecentTable(rows, emptyMessage) {
  if (!recentStudentsBodies.length) {
    return;
  }

  const latest = [...rows]
    .sort((a, b) => Number(b.Id) - Number(a.Id))
    .slice(0, 5);

  if (!latest.length) {
    recentStudentsBodies.forEach((tbody) => {
      tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-secondary py-4">${emptyMessage || "Sin registros para mostrar."}</td>
        </tr>
      `;
    });
    return;
  }

  const html = latest
    .map(
      (student) => `
          <tr>
            <td>${student.Id}</td>
            <td>${student.first_name} ${student.last_name}</td>
            <td>${student.email}</td>
          </tr>
        `
    )
    .join("");

  recentStudentsBodies.forEach((tbody) => {
    tbody.innerHTML = html;
  });
}

// Renderiza la distribución de estudiantes por programa.
// Si tenemos el catálogo de programas, muestra todos (incluyendo los que tengan 0 estudiantes).
function renderProgramsTable(students, programs, emptyMessage) {
  if (!programsBodies.length) {
    return;
  }

  if (!students.length && !programs.length) {
    programsBodies.forEach((tbody) => {
      tbody.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-secondary py-4">${emptyMessage || "Sin informacion para mostrar."}</td>
        </tr>
      `;
    });
    return;
  }

  const counts = new Map();

  if (programs.length) {
    programs.forEach((program) => {
      counts.set(Number(program.id), 0);
    });

    let withoutProgram = 0;
    students.forEach((student) => {
      const programId = Number(student.program_id);
      if (!programId) {
        withoutProgram += 1;
        return;
      }

      counts.set(programId, (counts.get(programId) || 0) + 1);
    });

    const knownProgramIds = new Set(programs.map((program) => Number(program.id)));

    const ordered = [
      ...programs.map((program) => [program.name, counts.get(Number(program.id)) || 0]),
      ...[...counts.entries()]
        .filter(([programId, count]) => count > 0 && !knownProgramIds.has(programId))
        .map(([programId, count]) => [`Programa #${programId}`, count]),
      ...(withoutProgram ? [["Sin programa", withoutProgram]] : []),
    ].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

    const html = ordered
      .map(
        ([programName, count]) => `
        <tr>
          <td>${programName}</td>
          <td class="text-end fw-semibold">${count}</td>
        </tr>
      `
      )
      .join("");

    programsBodies.forEach((tbody) => {
      tbody.innerHTML = html;
    });

    return;
  }

  students.forEach((student) => {
    const programName = student.program_name || "Sin programa";
    counts.set(programName, (counts.get(programName) || 0) + 1);
  });

  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const html = ordered
    .map(
      ([programName, count]) => `
        <tr>
          <td>${programName}</td>
          <td class="text-end fw-semibold">${count}</td>
        </tr>
      `
    )
    .join("");

  programsBodies.forEach((tbody) => {
    tbody.innerHTML = html;
  });
}

// Filtra en memoria usando el texto del buscador y vuelve a renderizar.
function applyFilter() {
  const query = (searchInput.value || "").trim().toLowerCase();
  if (!query) {
    renderTable(studentsCache);
    renderRecentTable(studentsCache);
    renderProgramsTable(studentsCache, programsCache);
    return;
  }

  const filtered = studentsCache.filter((student) => {
    const id = String(student.Id).toLowerCase();
    const nombre = String(student.first_name || "").toLowerCase();
    const apellido = String(student.last_name || "").toLowerCase();
    const correo = String(student.email || "").toLowerCase();
    const programa = String(student.program_name || "").toLowerCase();
    return id.includes(query) || nombre.includes(query) || apellido.includes(query) || correo.includes(query) || programa.includes(query);
  });

  renderTable(filtered, "No hay coincidencias para la busqueda.");
  renderRecentTable(filtered, "No hay coincidencias para el resumen.");
  renderProgramsTable(filtered, programsCache, "No hay coincidencias para programas.");
}

// Actualiza chips/indicadores de conteo (estudiantes y programas).
function updateStats() {
  if (statStudents) {
    statStudents.textContent = String(studentsCache.length);
  }
  if (statPrograms) {
    statPrograms.textContent = String(programsCache.length);
  }
}

// Llena un <select> con la lista de programas.
function setProgramOptions(selectEl, programs, selectedId) {
  if (!selectEl) {
    return;
  }

  if (!programs.length) {
    selectEl.innerHTML = `<option value=\"\" selected disabled>No hay programas disponibles</option>`;
    selectEl.disabled = true;
    return;
  }

  selectEl.disabled = false;

  const placeholderSelected = selectedId == null || selectedId === "";
  const placeholder = `<option value=\"\" disabled ${placeholderSelected ? "selected" : ""}>Seleccione un programa...</option>`;
  const options = programs
    .map((program) => `<option value=\"${program.id}\">${program.name}</option>`)
    .join("");

  selectEl.innerHTML = `${placeholder}${options}`;

  if (!placeholderSelected) {
    selectEl.value = String(selectedId);
  }
}

// Carga el catálogo de programas (para selects y estadísticas).
async function loadPrograms() {
  try {
    const response = await fetch(programsApiUrl);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "No se pudo cargar la informacion de programas.");
    }

    programsCache = payload.data || [];
    setProgramOptions(addProgram, programsCache);
    setProgramOptions(editProgram, programsCache);
    updateStats();
  } catch (error) {
    programsCache = [];
    setProgramOptions(addProgram, programsCache);
    setProgramOptions(editProgram, programsCache);
    updateStats();
  }
}

// Carga estudiantes y renderiza tablas/resúmenes.
async function loadStudents() {
  studentsBody.innerHTML = `
    <tr>
      <td colspan="6" class="text-center text-secondary py-4">Cargando estudiantes...</td>
    </tr>
  `;

  recentStudentsBodies.forEach((tbody) => {
    tbody.innerHTML = `
        <tr>
          <td colspan="3" class="text-center text-secondary py-4">Cargando resumen...</td>
        </tr>
      `;
  });

  programsBodies.forEach((tbody) => {
    tbody.innerHTML = `
        <tr>
          <td colspan="2" class="text-center text-secondary py-4">Cargando programas...</td>
        </tr>
      `;
  });

  try {
    const response = await fetch(studentsApiUrl);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "No se pudo cargar la informacion.");
    }

    studentsCache = payload.data;
    updateStats();
    applyFilter();
  } catch (error) {
    studentsBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-center text-danger py-4">${error.message}</td>
      </tr>
    `;

    recentStudentsBodies.forEach((tbody) => {
      tbody.innerHTML = `
          <tr>
            <td colspan="3" class="text-center text-danger py-4">${error.message}</td>
          </tr>
        `;
    });

    programsBodies.forEach((tbody) => {
      tbody.innerHTML = `
          <tr>
            <td colspan="2" class="text-center text-danger py-4">${error.message}</td>
          </tr>
        `;
    });
  }
}

// Llena el formulario de edición con los datos del estudiante.
function fillEditForm(student) {
  editForm.id.value = student.Id;
  editForm.nombre.value = student.first_name;
  editForm.apellido.value = student.last_name;
  editForm.correo.value = student.email;
  setProgramOptions(editProgram, programsCache, student.program_id);
}

// Llena el modal de vista (readonly) con los datos del estudiante.
function fillViewForm(student) {
  viewId.value = student.Id;
  viewNombre.value = student.first_name;
  viewApellido.value = student.last_name;
  viewCorreo.value = student.email;
  if (viewPrograma) {
    viewPrograma.value = student.program_name || "Sin programa";
  }
}

// Delegación de eventos: detectar click en los botones de la tabla (ver/editar/eliminar).
studentsBody.addEventListener("click", (event) => {
  const viewBtn = event.target.closest(".btn-view");
  const editBtn = event.target.closest(".btn-edit");
  const deleteBtn = event.target.closest(".btn-delete");

  if (viewBtn) {
    const id = Number(viewBtn.dataset.id);
    const student = studentsCache.find((item) => Number(item.Id) === id);
    if (student) {
      fillViewForm(student);
      viewModal.show();
    }
  }

  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    const student = studentsCache.find((item) => Number(item.Id) === id);
    if (student) {
      fillEditForm(student);
      clearError(document.getElementById("editError"));
      editModal.show();
    }
  }

  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    deleteForm.id.value = id;
    clearError(document.getElementById("deleteError"));
    deleteModal.show();
  }
});

// Buscador en vivo.
if (searchInput) {
  searchInput.addEventListener("input", applyFilter);
}

// Botón limpiar búsqueda.
if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    applyFilter();
    searchInput.focus();
  });
}

// Crear estudiante (POST).
addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("addError");
  clearError(errorEl);

  const payload = {
    nombre: addForm.nombre.value.trim(),
    apellido: addForm.apellido.value.trim(),
    correo: addForm.correo.value.trim(),
    program_id: Number(addForm.program_id.value),
  };

  try {
    const response = await fetch(studentsApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "No se pudo guardar el estudiante.");
    }

    addForm.reset();
    setProgramOptions(addProgram, programsCache);
    addModal.hide();
    await loadStudents();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

// Editar estudiante (PUT).
editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("editError");
  clearError(errorEl);

  const payload = {
    id: Number(editForm.id.value),
    nombre: editForm.nombre.value.trim(),
    apellido: editForm.apellido.value.trim(),
    correo: editForm.correo.value.trim(),
    program_id: Number(editForm.program_id.value),
  };

  try {
    const response = await fetch(studentsApiUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "No se pudo actualizar el estudiante.");
    }

    editModal.hide();
    await loadStudents();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

// Eliminar estudiante (DELETE).
deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("deleteError");
  clearError(errorEl);

  const payload = { id: Number(deleteForm.id.value) };

  try {
    const response = await fetch(studentsApiUrl, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "No se pudo eliminar el estudiante.");
    }

    deleteModal.hide();
    await loadStudents();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

// Arranque: primero programas (para llenar selects), luego estudiantes.
async function bootstrapApp() {
  await loadPrograms();
  await loadStudents();
}

bootstrapApp();
ensureModalSubmitButtons();
