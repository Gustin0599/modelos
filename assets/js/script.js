const apiUrl = "api/students.php";
let studentsCache = [];

const studentsBody = document.getElementById("studentsBody");
const recentStudentsBodies = [...document.querySelectorAll(".js-recent-students")];
const programsBodies = [...document.querySelectorAll(".js-programs")];
const addForm = document.getElementById("addForm");
const editForm = document.getElementById("editForm");
const deleteForm = document.getElementById("deleteForm");
const searchInput = document.getElementById("searchInput");
const searchClear = document.getElementById("searchClear");
const viewId = document.getElementById("viewId");
const viewNombre = document.getElementById("viewNombre");
const viewApellido = document.getElementById("viewApellido");
const viewCorreo = document.getElementById("viewCorreo");

const addModal = new bootstrap.Modal(document.getElementById("addModal"));
const editModal = new bootstrap.Modal(document.getElementById("editModal"));
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"));

function showError(el, message) {
  el.textContent = message;
  el.classList.remove("d-none");
}

function clearError(el) {
  el.textContent = "";
  el.classList.add("d-none");
}

function renderTable(rows, emptyMessage) {
  if (!rows.length) {
    studentsBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-secondary py-4">${emptyMessage || "No hay estudiantes registrados."}</td>
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
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2 btn-view" data-id="${student.Id}">
              <i class="fa-solid fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning me-2 btn-edit" data-id="${student.Id}">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${student.Id}">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>
      `
    )
    .join("");
}

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

const PROGRAMS = [
  "Ingenieria de Sistemas",
  "Ingenieria Industrial",
  "Administracion de Empresas",
  "Diseno Grafico",
  "Contaduria Publica",
  "Psicologia",
];

function deriveProgram(student) {
  const seed = `${student.email || ""}|${student.Id || ""}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PROGRAMS[hash % PROGRAMS.length];
}

function renderProgramsTable(rows, emptyMessage) {
  if (!programsBodies.length) {
    return;
  }

  if (!rows.length) {
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
  rows.forEach((student) => {
    const program = deriveProgram(student);
    counts.set(program, (counts.get(program) || 0) + 1);
  });

  const ordered = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const html = ordered
    .map(
      ([program, count]) => `
        <tr>
          <td>${program}</td>
          <td class="text-end fw-semibold">${count}</td>
        </tr>
      `
    )
    .join("");

  programsBodies.forEach((tbody) => {
    tbody.innerHTML = html;
  });
}

function applyFilter() {
  const query = (searchInput.value || "").trim().toLowerCase();
  if (!query) {
    renderTable(studentsCache);
    renderRecentTable(studentsCache);
    renderProgramsTable(studentsCache);
    return;
  }

  const filtered = studentsCache.filter((student) => {
    const id = String(student.Id).toLowerCase();
    const nombre = String(student.first_name || "").toLowerCase();
    const apellido = String(student.last_name || "").toLowerCase();
    return id.includes(query) || nombre.includes(query) || apellido.includes(query);
  });

  renderTable(filtered, "No hay coincidencias para la busqueda.");
  renderRecentTable(filtered, "No hay coincidencias para el resumen.");
  renderProgramsTable(filtered, "No hay coincidencias para programas.");
}

async function loadStudents() {
  studentsBody.innerHTML = `
    <tr>
      <td colspan="5" class="text-center text-secondary py-4">Cargando estudiantes...</td>
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
    const response = await fetch(apiUrl);
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || "No se pudo cargar la informacion.");
    }

    studentsCache = payload.data;
    applyFilter();
  } catch (error) {
    studentsBody.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-danger py-4">${error.message}</td>
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

function fillEditForm(student) {
  editForm.id.value = student.Id;
  editForm.nombre.value = student.first_name;
  editForm.apellido.value = student.last_name;
  editForm.correo.value = student.email;
}

function fillViewForm(student) {
  viewId.value = student.Id;
  viewNombre.value = student.first_name;
  viewApellido.value = student.last_name;
  viewCorreo.value = student.email;
}

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

if (searchInput) {
  searchInput.addEventListener("input", applyFilter);
}

if (searchClear) {
  searchClear.addEventListener("click", () => {
    searchInput.value = "";
    applyFilter();
    searchInput.focus();
  });
}

addForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("addError");
  clearError(errorEl);

  const payload = {
    nombre: addForm.nombre.value.trim(),
    apellido: addForm.apellido.value.trim(),
    correo: addForm.correo.value.trim(),
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "No se pudo guardar el estudiante.");
    }

    addForm.reset();
    addModal.hide();
    await loadStudents();
  } catch (error) {
    showError(errorEl, error.message);
  }
});

editForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("editError");
  clearError(errorEl);

  const payload = {
    id: Number(editForm.id.value),
    nombre: editForm.nombre.value.trim(),
    apellido: editForm.apellido.value.trim(),
    correo: editForm.correo.value.trim(),
  };

  try {
    const response = await fetch(apiUrl, {
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

deleteForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById("deleteError");
  clearError(errorEl);

  const payload = { id: Number(deleteForm.id.value) };

  try {
    const response = await fetch(apiUrl, {
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

loadStudents();
