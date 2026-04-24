const BASE = 'http://localhost:3000';
let currentTab = 'dashboard';
let editingId = null;

window._barberos = [];
window._clientes = [];
window._servicios = [];

// ===== FECHA EN TOPBAR =====
function setDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('topbarDate').textContent = now.toLocaleDateString('es-CO', opts);
}

// ===== API =====
async function api(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const r = await fetch(BASE + path, opts);
    return await r.json();
  } catch (e) {
    showToast('⚠ Error conectando con el servidor');
    return [];
  }
}

// ===== TOAST =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ===== NAVEGACIÓN =====
const tabConfig = {
  dashboard: { title: 'Dashboard',  sub: 'Resumen general',       addBtn: false },
  citas:     { title: 'Citas',      sub: 'Agenda de citas',        addBtn: true  },
  barberos:  { title: 'Barberos',   sub: 'Equipo de trabajo',      addBtn: true  },
  clientes:  { title: 'Clientes',   sub: 'Clientes registrados',   addBtn: true  },
  servicios: { title: 'Servicios',  sub: 'Catálogo de servicios',  addBtn: true  },
};

async function showTab(tab) {
  currentTab = tab;
  editingId = null;

  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const tabIndex = { dashboard: 0, citas: 1, barberos: 2, clientes: 3, servicios: 4 };
  document.querySelectorAll('.nav-item')[tabIndex[tab]].classList.add('active');

  const cfg = tabConfig[tab];
  document.getElementById('pageTitle').textContent = cfg.title;
  document.getElementById('pageSub').textContent = cfg.sub;
  document.getElementById('btnAdd').style.display = cfg.addBtn ? 'block' : 'none';
  document.getElementById('content').innerHTML = '<div class="loading">Cargando</div>';

  if (tab === 'dashboard') await renderDashboard();
  else if (tab === 'barberos') await renderBarberos();
  else if (tab === 'clientes') await renderClientes();
  else if (tab === 'servicios') await renderServicios();
  else if (tab === 'citas') await renderCitas();
}

// ===== DASHBOARD =====
async function renderDashboard() {
  const [barberos, clientes, servicios, citas] = await Promise.all([
    api('/barberos'), api('/clientes'), api('/servicios'), api('/citas')
  ]);
  const b = Array.isArray(barberos) ? barberos : [];
  const cl = Array.isArray(clientes) ? clientes : [];
  const s = Array.isArray(servicios) ? servicios : [];
  const ci = Array.isArray(citas) ? citas : [];

  document.getElementById('content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">◷</div>
        <div class="stat-label">Citas totales</div>
        <div class="stat-value">${ci.length}</div>
        <div class="stat-hint">registradas</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">◉</div>
        <div class="stat-label">Barberos</div>
        <div class="stat-value">${b.length}</div>
        <div class="stat-hint">activos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">◎</div>
        <div class="stat-label">Clientes</div>
        <div class="stat-value">${cl.length}</div>
        <div class="stat-hint">registrados</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">◆</div>
        <div class="stat-label">Servicios</div>
        <div class="stat-value">${s.length}</div>
        <div class="stat-hint">disponibles</div>
      </div>
    </div>

    <div class="section-header">
      <div class="section-title">Últimas citas</div>
    </div>
    <div class="table-wrap">
      ${ci.length === 0
        ? '<div class="empty"><div class="empty-icon">◷</div>No hay citas registradas aún</div>'
        : `<table>
            <thead><tr><th>ID</th><th>Cliente</th><th>Barbero</th><th>Fecha</th><th>Hora</th></tr></thead>
            <tbody>
              ${ci.slice(-5).reverse().map(c => `
                <tr>
                  <td><span class="badge badge-gold">#${c.id}</span></td>
                  <td>${c.cliente_id}</td>
                  <td>${c.barbero_id}</td>
                  <td>${c.fecha}</td>
                  <td>${c.hora}</td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

// ===== BARBEROS =====
async function renderBarberos() {
  const data = await api('/barberos');
  const list = Array.isArray(data) ? data : [];
  document.getElementById('content').innerHTML = `
    <div class="table-wrap">
      ${list.length === 0
        ? '<div class="empty"><div class="empty-icon">◉</div>No hay barberos registrados</div>'
        : `<table>
            <thead><tr><th>Nombre</th><th>Especialidad</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>
              ${list.map(b => `
                <tr>
                  <td>${b.nombre}</td>
                  <td>${b.especialidad || '—'}</td>
                  <td><span class="badge badge-active">Activo</span></td>
                  <td><div class="td-actions">
                    <button class="btn-sm" onclick="editBarbero(${b.id},'${escapar(b.nombre)}','${escapar(b.especialidad||'')}')">Editar</button>
                    <button class="btn-sm btn-danger" onclick="confirmarEliminar('barbero',${b.id})">Eliminar</button>
                  </div></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

// ===== CLIENTES =====
async function renderClientes() {
  const data = await api('/clientes');
  const list = Array.isArray(data) ? data : [];
  document.getElementById('content').innerHTML = `
    <div class="table-wrap">
      ${list.length === 0
        ? '<div class="empty"><div class="empty-icon">◎</div>No hay clientes registrados</div>'
        : `<table>
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
            <tbody>
              ${list.map(c => `
                <tr>
                  <td>${c.nombre}</td>
                  <td>${c.telefono || '—'}</td>
                  <td>${c.email || '—'}</td>
                  <td><div class="td-actions">
                    <button class="btn-sm" onclick="editCliente(${c.id},'${escapar(c.nombre)}','${escapar(c.telefono||'')}','${escapar(c.email||'')}')">Editar</button>
                    <button class="btn-sm btn-danger" onclick="confirmarEliminar('cliente',${c.id})">Eliminar</button>
                  </div></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

// ===== SERVICIOS =====
async function renderServicios() {
  const data = await api('/servicios');
  const list = Array.isArray(data) ? data : [];
  document.getElementById('content').innerHTML = `
    <div class="table-wrap">
      ${list.length === 0
        ? '<div class="empty"><div class="empty-icon">◆</div>No hay servicios registrados</div>'
        : `<table>
            <thead><tr><th>Servicio</th><th>Duración</th><th>Precio</th><th>Acciones</th></tr></thead>
            <tbody>
              ${list.map(s => `
                <tr>
                  <td>${s.nombre}</td>
                  <td>${s.duracion} min</td>
                  <td>$${Number(s.precio).toLocaleString('es-CO')}</td>
                  <td><div class="td-actions">
                    <button class="btn-sm" onclick="editServicio(${s.id},'${escapar(s.nombre)}',${s.duracion},${s.precio})">Editar</button>
                    <button class="btn-sm btn-danger" onclick="confirmarEliminar('servicio',${s.id})">Eliminar</button>
                  </div></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

// ===== CITAS =====
async function renderCitas() {
  const [citas, barberos, clientes, servicios] = await Promise.all([
    api('/citas'), api('/barberos'), api('/clientes'), api('/servicios')
  ]);
  window._barberos = Array.isArray(barberos) ? barberos : [];
  window._clientes = Array.isArray(clientes) ? clientes : [];
  window._servicios = Array.isArray(servicios) ? servicios : [];
  const list = Array.isArray(citas) ? citas : [];
  const bMap = Object.fromEntries(window._barberos.map(b => [b.id, b.nombre]));
  const cMap = Object.fromEntries(window._clientes.map(c => [c.id, c.nombre]));
  const sMap = Object.fromEntries(window._servicios.map(s => [s.id, s.nombre]));

  document.getElementById('content').innerHTML = `
    <div class="table-wrap">
      ${list.length === 0
        ? '<div class="empty"><div class="empty-icon">◷</div>No hay citas registradas</div>'
        : `<table>
            <thead><tr><th>ID</th><th>Cliente</th><th>Barbero</th><th>Servicio</th><th>Fecha</th><th>Hora</th><th>Acciones</th></tr></thead>
            <tbody>
              ${list.map(c => `
                <tr>
                  <td><span class="badge badge-gold">#${c.id}</span></td>
                  <td>${cMap[c.cliente_id] || c.cliente_id}</td>
                  <td>${bMap[c.barbero_id] || c.barbero_id}</td>
                  <td>${sMap[c.servicio_id] || c.servicio_id}</td>
                  <td>${c.fecha}</td>
                  <td>${c.hora}</td>
                  <td><button class="btn-sm btn-danger" onclick="confirmarEliminar('cita',${c.id})">Eliminar</button></td>
                </tr>`).join('')}
            </tbody>
          </table>`}
    </div>`;
}

// ===== FORMULARIO =====
function openForm() {
  editingId = null;
  const titles = { barberos:'Nuevo barbero', clientes:'Nuevo cliente', servicios:'Nuevo servicio', citas:'Nueva cita' };
  const subs = { barberos:'Agrega un nuevo miembro al equipo', clientes:'Registra un nuevo cliente', servicios:'Añade un servicio al catálogo', citas:'Agenda una nueva cita' };
  document.getElementById('formTitle').textContent = titles[currentTab];
  document.getElementById('formSubtitle').textContent = subs[currentTab];
  document.getElementById('formFields').innerHTML = buildFormFields();
  document.getElementById('formOverlay').classList.add('open');
}

function buildFormFields(data = {}) {
  if (currentTab === 'barberos') return `
    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input class="form-input" id="f_nombre" placeholder="Nombre del barbero" value="${data.nombre || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Especialidad</label>
      <input class="form-input" id="f_especialidad" placeholder="Ej: Corte clásico" value="${data.especialidad || ''}">
    </div>`;

  if (currentTab === 'clientes') return `
    <div class="form-group">
      <label class="form-label">Nombre</label>
      <input class="form-input" id="f_nombre" placeholder="Nombre del cliente" value="${data.nombre || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Teléfono</label>
      <input class="form-input" id="f_telefono" placeholder="Ej: 3001234567" value="${data.telefono || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Email</label>
      <input class="form-input" id="f_email" placeholder="correo@email.com" value="${data.email || ''}">
    </div>`;

  if (currentTab === 'servicios') return `
    <div class="form-group">
      <label class="form-label">Nombre del servicio</label>
      <input class="form-input" id="f_nombre" placeholder="Ej: Corte de cabello" value="${data.nombre || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Duración (minutos)</label>
      <input class="form-input" id="f_duracion" type="number" placeholder="30" value="${data.duracion || ''}">
    </div>
    <div class="form-group">
      <label class="form-label">Precio</label>
      <input class="form-input" id="f_precio" type="number" placeholder="25000" value="${data.precio || ''}">
    </div>`;

  if (currentTab === 'citas') return `
    <div class="form-group">
      <label class="form-label">Cliente</label>
      <select class="form-input" id="f_cliente_id">
        ${window._clientes.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Barbero</label>
      <select class="form-input" id="f_barbero_id">
        ${window._barberos.map(b => `<option value="${b.id}">${b.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Servicio</label>
      <select class="form-input" id="f_servicio_id">
        ${window._servicios.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('')}
      </select>
    </div>
    <div class="form-group">
      <label class="form-label">Fecha</label>
      <input class="form-input" id="f_fecha" type="date">
    </div>
    <div class="form-group">
      <label class="form-label">Hora</label>
      <input class="form-input" id="f_hora" type="time">
    </div>`;

  return '';
}

function editBarbero(id, nombre, especialidad) {
  editingId = id;
  document.getElementById('formTitle').textContent = 'Editar barbero';
  document.getElementById('formSubtitle').textContent = 'Modifica los datos del barbero';
  document.getElementById('formFields').innerHTML = buildFormFields({ nombre, especialidad });
  document.getElementById('formOverlay').classList.add('open');
}

function editCliente(id, nombre, telefono, email) {
  editingId = id;
  document.getElementById('formTitle').textContent = 'Editar cliente';
  document.getElementById('formSubtitle').textContent = 'Modifica los datos del cliente';
  document.getElementById('formFields').innerHTML = buildFormFields({ nombre, telefono, email });
  document.getElementById('formOverlay').classList.add('open');
}

function editServicio(id, nombre, duracion, precio) {
  editingId = id;
  document.getElementById('formTitle').textContent = 'Editar servicio';
  document.getElementById('formSubtitle').textContent = 'Modifica los datos del servicio';
  document.getElementById('formFields').innerHTML = buildFormFields({ nombre, duracion, precio });
  document.getElementById('formOverlay').classList.add('open');
}

async function saveForm() {
  let body = {}, path, method;

  if (currentTab === 'barberos') {
    body = { nombre: document.getElementById('f_nombre').value, especialidad: document.getElementById('f_especialidad').value };
    path = editingId ? `/barberos/${editingId}` : '/barberos';
    method = editingId ? 'PUT' : 'POST';
  } else if (currentTab === 'clientes') {
    body = { nombre: document.getElementById('f_nombre').value, telefono: document.getElementById('f_telefono').value, email: document.getElementById('f_email').value };
    path = editingId ? `/clientes/${editingId}` : '/clientes';
    method = editingId ? 'PUT' : 'POST';
  } else if (currentTab === 'servicios') {
    body = { nombre: document.getElementById('f_nombre').value, duracion: Number(document.getElementById('f_duracion').value), precio: Number(document.getElementById('f_precio').value) };
    path = editingId ? `/servicios/${editingId}` : '/servicios';
    method = editingId ? 'PUT' : 'POST';
  } else if (currentTab === 'citas') {
    body = { cliente_id: Number(document.getElementById('f_cliente_id').value), barbero_id: Number(document.getElementById('f_barbero_id').value), servicio_id: Number(document.getElementById('f_servicio_id').value), fecha: document.getElementById('f_fecha').value, hora: document.getElementById('f_hora').value };
    path = '/citas';
    method = 'POST';
  }

  await api(path, method, body);
  closeForm();
  showToast('✦ Guardado exitosamente');
  showTab(currentTab);
}

function confirmarEliminar(tipo, id) {
  if (!confirm(`¿Estás seguro de eliminar este ${tipo}?`)) return;
  eliminar(tipo, id);
}

async function eliminar(tipo, id) {
  const rutas = { barbero: '/barberos', cliente: '/clientes', servicio: '/servicios', cita: '/citas' };
  await api(`${rutas[tipo]}/${id}`, 'DELETE');
  showToast(`${tipo.charAt(0).toUpperCase() + tipo.slice(1)} eliminado`);
  showTab(currentTab);
}

function closeForm() {
  document.getElementById('formOverlay').classList.remove('open');
  editingId = null;
}

function escapar(str) {
  return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.getElementById('formOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeForm();
});

// ===== INICIO =====
setDate();
showTab('dashboard');
