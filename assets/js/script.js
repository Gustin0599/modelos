const studentsApiUrl = "api/students.php";
const programsApiUrl = "api/programs.php";
let studentsCache = [];
let programsCache = [];

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
const viewId = document.getElementById("viewId");
const viewNombre = document.getElementById("viewNombre");
const viewApellido = document.getElementById("viewApellido");
const viewCorreo = document.getElementById("viewCorreo");
const viewPrograma = document.getElementById("viewPrograma");

const modalOptions = { backdrop: false };
const addModal = new bootstrap.Modal(document.getElementById("addModal"), modalOptions);
const editModal = new bootstrap.Modal(document.getElementById("editModal"), modalOptions);
const deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"), modalOptions);
const viewModal = new bootstrap.Modal(document.getElementById("viewModal"), modalOptions);

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
  } catch (error) {
    programsCache = [];
    setProgramOptions(addProgram, programsCache);
    setProgramOptions(editProgram, programsCache);
  }
}

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

function fillEditForm(student) {
  editForm.id.value = student.Id;
  editForm.nombre.value = student.first_name;
  editForm.apellido.value = student.last_name;
  editForm.correo.value = student.email;
  setProgramOptions(editProgram, programsCache, student.program_id);
}

function fillViewForm(student) {
  viewId.value = student.Id;
  viewNombre.value = student.first_name;
  viewApellido.value = student.last_name;
  viewCorreo.value = student.email;
  if (viewPrograma) {
    viewPrograma.value = student.program_name || "Sin programa";
  }
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

async function bootstrapApp() {
  await loadPrograms();
  await loadStudents();
}

bootstrapApp();
