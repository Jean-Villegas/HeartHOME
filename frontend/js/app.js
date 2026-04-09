// Sistema de Salud - Archivo JavaScript Principal
// Versión corregida - TODOS los bugs arreglados

document.addEventListener('DOMContentLoaded', () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = 'index.html';
      return;
    }
    
    const user = JSON.parse(userStr);
    window.currentUser = user;
    
    inicializarUI(user);
    inicializarEventListeners();
    cargarDatosIniciales();
    
  } catch (error) {
    console.error('Error en verificación de autenticación:', error);
    window.location.href = 'index.html';
  }
});

function inicializarUI(user) {
  const userInitial = document.getElementById('user-initial');
  const menuUserName = document.getElementById('menu-user-name');
  const menuUserRole = document.getElementById('menu-user-role');
  
  if (userInitial) userInitial.textContent = user.username.charAt(0).toUpperCase();
  if (menuUserName) menuUserName.textContent = user.username;
  if (menuUserRole) menuUserRole.textContent = user.rol;
  
  if (user.rol === 'Medico') {
    document.querySelectorAll('.medico-only').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.patient-only').forEach(el => el.classList.add('hidden'));
  } else if (user.rol === 'Administrador') {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    document.querySelectorAll('.patient-only').forEach(el => el.classList.add('hidden'));
  } else {
    document.querySelectorAll('.patient-only').forEach(el => el.classList.remove('hidden'));
  }
  
  setupAutoLogout();
}

function inicializarEventListeners() {
  
  // Toggle Profile Menu - FIX: usar mousedown para evitar race con document click
  const profileBtn = document.getElementById('profile-dropdown-btn');
  const profileMenu = document.getElementById('profile-menu');
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle('show');
    });
    document.addEventListener('click', (e) => {
      if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        profileMenu.classList.remove('show');
      }
    });
  }
  
  // Open Modals from Menu
  document.getElementById('nav-edit-profile')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (profileMenu) profileMenu.classList.remove('show');
    openProfileModal();
  });
  
  document.getElementById('btn-abrir-perfil-new')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (profileMenu) profileMenu.classList.remove('show');
    openProfileModal();
  });
  
  document.getElementById('nav-doctor-inbox')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (profileMenu) profileMenu.classList.remove('show');
    document.getElementById('modal-medico')?.classList.remove('hidden');
    loadDoctorInbox();
  });
  
  document.getElementById('nav-admin-panel')?.addEventListener('click', (e) => {
    e.preventDefault();
    if (profileMenu) profileMenu.classList.remove('show');
    document.getElementById('modal-admin')?.classList.remove('hidden');
    loadAdminPanel();
  });
  
  // Modal perfil close
  document.getElementById('close-modal-perfil')?.addEventListener('click', () => {
    document.getElementById('modal-perfil')?.classList.add('hidden');
  });
  
  // Modal mis análisis
  document.getElementById('btn-ver-analisis')?.addEventListener('click', () => {
    document.getElementById('modal-mis-analisis')?.classList.remove('hidden');
    loadMisAnalisis();
  });
  
  document.getElementById('close-modal-mis-analisis')?.addEventListener('click', () => {
    document.getElementById('modal-mis-analisis')?.classList.add('hidden');
  });
  
  // Close Modals genéricos
  ['medico', 'admin'].forEach(m => {
    document.getElementById(`close-modal-${m}`)?.addEventListener('click', () => {
      document.getElementById(`modal-${m}`)?.classList.add('hidden');
    });
  });

  // Cerrar modal diagnóstico
  document.getElementById('close-modal-diagnostico')?.addEventListener('click', () => {
    document.getElementById('modal-diagnostico')?.classList.add('hidden');
  });

  // Click fuera del modal para cerrarlo
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });
  
  // Global Search
  const globalSearch = document.getElementById('global-search');
  if (globalSearch) {
    globalSearch.addEventListener('input', async (e) => {
      const term = e.target.value.toLowerCase();
      if (term.length < 2) {
        renderPosts(allPosts);
      } else {
        const filtered = allPosts.filter(p => 
          p.titulo.toLowerCase().includes(term) || 
          p.contenido.toLowerCase().includes(term)
        );
        renderPosts(filtered);
      }
    });
  }
  
  // Formulario del foro
  document.getElementById('foro-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('f-titulo').value.trim();
    const contenido = document.getElementById('f-contenido').value.trim();
    
    if (!titulo || !contenido) {
      showAlert('El título y el contenido son obligatorios', 'error');
      return;
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Publicando...'; }

    const res = await API.request('/foros', {
      method: 'POST',
      body: JSON.stringify({ titulo, contenido })
    });
    
    if (btn) { btn.disabled = false; btn.textContent = 'Publicar'; }

    if (res.ok) {
      showAlert('Post publicado exitosamente', 'success');
      document.getElementById('foro-form').reset();
      loadForo();
    } else {
      showAlert(res.data?.mensaje || 'Error al publicar post', 'error');
    }
  });
  
  // Formulario del perfil
  document.getElementById('perfil-form-full')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación defensiva: evita envíos aunque otro listener solo haga preventDefault
    if (window.Validators?.validateForm) {
      const ok = window.Validators.validateForm([
        { el: document.getElementById('p-id'),            type: 'cedula',        required: false },
        { el: document.getElementById('p-talla'),         type: 'talla',         required: false },
        { el: document.getElementById('p-peso'),          type: 'peso',          required: false },
        { el: document.getElementById('p-edad'),          type: 'edad',          required: false },
        { el: document.getElementById('p-glucosa'),       type: 'glucosa',       required: false },
        { el: document.getElementById('p-colesterol'),    type: 'colesterol',    required: false },
        { el: document.getElementById('p-trigliceridos'), type: 'trigliceridos', required: false }
      ]);
      if (!ok) {
        showAlert('Corrige los campos inválidos antes de guardar.', 'error');
        return;
      }
    }
    
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Guardando...'; }

    try {
      const formData = {
        username: document.getElementById('p-full-name').value,
        email: document.getElementById('p-email').value,
        cedula: document.getElementById('p-id').value
      };
      
      const userRes = await API.request(`/usuarios/${window.currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      
      if (!userRes.ok) {
        showAlert(userRes.data?.mensaje || 'Error al actualizar datos básicos', 'error');
        if (btn) { btn.disabled = false; btn.textContent = 'Guardar Todos los Cambios'; }
        return;
      }
      
      const perfilData = {
        peso_kg: parseFloat(document.getElementById('p-peso').value) || null,
        altura_cm: parseInt(document.getElementById('p-talla').value) || null,
        tipo_sangre: document.getElementById('p-sangre').value || 'A+',
        color_piel: document.getElementById('p-color-piel')?.value || null,
        genero: document.getElementById('p-genero')?.value || null,
        edad: parseInt(document.getElementById('p-edad')?.value) || null
      };
      
      await API.request(`/perfiles-salud/${window.currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(perfilData)
      });
      
      const glucosa = parseFloat(document.getElementById('p-glucosa')?.value) || null;
      const colesterol = parseFloat(document.getElementById('p-colesterol')?.value) || null;
      const trigliceridos = parseFloat(document.getElementById('p-trigliceridos')?.value) || null;
      const fechaAnalisis = document.getElementById('p-fecha-analisis')?.value;
      const sintomas = document.getElementById('p-sintomas')?.value;
      
      if (glucosa !== null || colesterol !== null || trigliceridos !== null || sintomas) {
        const analisisData = {
          fecha_examen: fechaAnalisis || new Date().toISOString().slice(0, 10),
          tipo_examen: 'Sangre Completa',
          resultados_glucosa: glucosa,
          resultados_colesterol: colesterol,
          resultados_trigliceridos: trigliceridos,
          diagnostico_paciente: sintomas || null
        };
        
        await API.request('/analisis', {
          method: 'POST',
          body: JSON.stringify(analisisData)
        });
      }
      
      showAlert('¡Todos los datos guardados correctamente!', 'success');
      document.getElementById('modal-perfil')?.classList.add('hidden');
      loadProfilePreview();
      
    } catch (error) {
      console.error('Error guardando perfil:', error);
      showAlert('Error al guardar perfil: ' + error.message, 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = 'Guardar Todos los Cambios'; }
    }
  });
  
  // Formulario de diagnóstico (en el modal)
  document.getElementById('form-diagnostico')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const analisisId = document.getElementById('diagnostico-analisis-id').value;
    const diagnostico = document.getElementById('diagnostico-texto').value.trim();
    
    if (!diagnostico) {
      showAlert('El diagnóstico no puede estar vacío', 'error');
      return;
    }

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Enviando...'; }

    const res = await API.request(`/analisis/${analisisId}/diagnosis`, {
      method: 'PUT',
      body: JSON.stringify({
        diagnostico_medico: diagnostico,
        medico_id: window.currentUser.id
      })
    });

    if (btn) { btn.disabled = false; btn.textContent = 'Enviar Diagnóstico'; }

    if (res.ok) {
      showAlert('Diagnóstico registrado correctamente', 'success');
      document.getElementById('modal-diagnostico')?.classList.add('hidden');
      document.getElementById('diagnostico-texto').value = '';
      loadDoctorInbox();
    } else {
      showAlert(res.data?.mensaje || 'Error al registrar diagnóstico', 'error');
    }
  });

  // LOGOUT
  const logoutBtn = document.getElementById('btn-logout-new');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (profileMenu) profileMenu.classList.remove('show');
      handleLogout(e);
    });
  }

  // Fallback por delegación: garantiza funcionamiento del botón aunque se re-renderice
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#btn-logout-new');
    if (!trigger) return;
    e.preventDefault();
    e.stopPropagation();
    if (profileMenu) profileMenu.classList.remove('show');
    handleLogout(e);
  });
  
  // Test pulmonar
  const btnTestPulmones = document.getElementById('btn-test-pulmones');
  if (btnTestPulmones) {
    btnTestPulmones.addEventListener('click', toggleTestPulmonar);
  }
}

async function cargarDatosIniciales() {
  try {
    loadForo().catch(error => {
      console.error('Error cargando foro:', error);
      const container = document.getElementById('foro-feed');
      if (container) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Error cargando posts. Por favor recarga la página.</div>';
      }
    });
    
    loadProfilePreview().catch(error => {
      console.error('Error cargando perfil:', error);
    });
  } catch (error) {
    console.error('Error en carga inicial:', error);
  }
}

// --- FUNCIONES PRINCIPALES ---

async function openProfileModal() {
  const modal = document.getElementById('modal-perfil');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  
  // Prellenar con datos del localStorage primero
  const fullNameInput = document.getElementById('p-full-name');
  const emailInput = document.getElementById('p-email');
  const idInput = document.getElementById('p-id');
  
  if (fullNameInput) fullNameInput.value = window.currentUser.username || '';
  if (emailInput) emailInput.value = window.currentUser.email || '';
  if (idInput) idInput.value = window.currentUser.cedula || '';
  
  try {
    // Cargar datos completos del usuario (email, cedula) desde la API
    const userRes = await API.request(`/usuarios/${window.currentUser.id}`, { method: 'GET' });
    if (userRes.ok && userRes.data) {
      if (fullNameInput) fullNameInput.value = userRes.data.username || window.currentUser.username || '';
      if (emailInput) emailInput.value = userRes.data.email || '';
      if (idInput) idInput.value = userRes.data.cedula || '';
      // Actualizar el usuario en memoria también
      window.currentUser.email = userRes.data.email;
      window.currentUser.cedula = userRes.data.cedula;
    }

    // Cargar datos del perfil de salud
    const perfilRes = await API.request(`/perfiles-salud/${window.currentUser.id}`, { method: 'GET' });
    if (perfilRes.ok && perfilRes.data) {
      const d = perfilRes.data;
      const pesoInput = document.getElementById('p-peso');
      const tallaInput = document.getElementById('p-talla');
      const sangreInput = document.getElementById('p-sangre');
      const colorPielInput = document.getElementById('p-color-piel');
      const generoInput = document.getElementById('p-genero');
      const edadInput = document.getElementById('p-edad');
      
      if (pesoInput) pesoInput.value = d.peso_kg || '';
      if (tallaInput) tallaInput.value = d.altura_cm || '';
      if (sangreInput) sangreInput.value = d.tipo_sangre || 'A+';
      if (colorPielInput) colorPielInput.value = d.color_piel || 'blanco';
      if (generoInput) generoInput.value = d.genero || 'masculino';
      if (edadInput) edadInput.value = d.edad || '';
    }
  } catch (error) {
    console.error('Error cargando datos del perfil:', error);
  }
}


async function loadProfilePreview() {
  try {
    const res = await API.request(`/perfiles-salud/${window.currentUser.id}`, { method: 'GET' });
    if (res.ok && res.data) {
      const pesoElement = document.getElementById('view-peso');
      const sangreElement = document.getElementById('view-sangre');
      
      if (pesoElement) pesoElement.textContent = res.data.peso_kg ? `${res.data.peso_kg}` : '--';
      if (sangreElement) sangreElement.textContent = res.data.tipo_sangre || '--';
    }
  } catch (error) {
    console.error('Error cargando vista previa del perfil:', error);
  }
}

async function loadMisAnalisis() {
  try {
    const content = document.getElementById('mis-analisis-content');
    if (!content) return;
    
    content.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size:2rem; color:var(--primary);"></i><p style="margin-top:15px; color:var(--text-muted);">Cargando análisis...</p></div>';
    
    // Usar el endpoint correcto para clientes: /analisis/cliente/:id
    const res = await API.request(`/analisis/cliente/${window.currentUser.id}`, { method: 'GET' });
    
    if (res.ok && res.data && res.data.length > 0) {
      const analisisHTML = res.data.map(analisis => `
        <div class="card" style="margin-bottom: 20px; border-left: 4px solid ${getAnalisisColor(analisis)}; padding: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
              <h4 style="margin: 0 0 5px 0; color: var(--text-main);">
                <i class="fas fa-flask"></i> ${analisis.tipo_examen || 'Análisis'}
              </h4>
              <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">
                <i class="fas fa-calendar"></i> ${formatDate(analisis.fecha_examen)}
              </p>
            </div>
            <span style="padding: 5px 12px; border-radius: 12px; font-size: 0.75rem; font-weight: 700; background: ${analisis.diagnostico_medico ? '#d1fae5' : '#fef3c7'}; color: ${analisis.diagnostico_medico ? '#065f46' : '#92400e'};">
              ${analisis.diagnostico_medico ? '✓ Diagnosticado' : '⏳ Pendiente'}
            </span>
          </div>
          
          ${analisis.resultados_glucosa || analisis.resultados_colesterol || analisis.resultados_trigliceridos ? `
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
              <h5 style="margin: 0 0 10px 0; font-size: 0.9rem; color: var(--text-main);">Resultados:</h5>
              ${analisis.resultados_glucosa ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: var(--text-muted);">Glucosa:</span>
                  <strong style="color: ${getGlucosaColor(analisis.resultados_glucosa)};">${analisis.resultados_glucosa} mg/dL</strong>
                </div>
              ` : ''}
              ${analisis.resultados_colesterol ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: var(--text-muted);">Colesterol:</span>
                  <strong style="color: ${getColesterolColor(analisis.resultados_colesterol)};">${analisis.resultados_colesterol} mg/dL</strong>
                </div>
              ` : ''}
              ${analisis.resultados_trigliceridos ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                  <span style="color: var(--text-muted);">Triglicéridos:</span>
                  <strong style="color: ${getTrigliceridosColor(analisis.resultados_trigliceridos)};">${analisis.resultados_trigliceridos} mg/dL</strong>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          ${analisis.diagnostico_paciente ? `
            <div style="margin-bottom: 15px; padding: 12px; background: #f0f9ff; border-radius: 8px; border-left: 3px solid var(--primary);">
              <p style="margin: 0; color: var(--text-muted); font-size: 0.85rem;">
                <strong>Tus síntomas:</strong><br>
                ${analisis.diagnostico_paciente}
              </p>
            </div>
          ` : ''}
          
          ${analisis.diagnostico_medico ? `
            <div style="padding: 15px; background: linear-gradient(135deg, #d1fae5, #a7f3d0); border-radius: 10px; border-left: 4px solid var(--success);">
              <p style="margin: 0; color: #065f46; font-weight: 600;">
                <i class="fas fa-user-md"></i> <strong>Diagnóstico del Médico:</strong><br>
                <span style="font-weight: 400; margin-top: 5px; display: block;">${analisis.diagnostico_medico}</span>
              </p>
            </div>
          ` : `
            <div style="padding: 15px; background: linear-gradient(135deg, #fef3c7, #fde68a); border-radius: 10px; border-left: 4px solid var(--warning);">
              <p style="margin: 0; color: #92400e; font-weight: 600;">
                <i class="fas fa-clock"></i> Tu análisis está pendiente de revisión médica
              </p>
            </div>
          `}
        </div>
      `).join('');
      
      content.innerHTML = analisisHTML;
    } else if (res.ok) {
      content.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-flask" style="font-size:2.5rem; color:var(--text-muted); margin-bottom:15px; display:block;"></i><p style="color:var(--text-muted);">No tienes análisis registrados aún.<br><small>Completa tu perfil para registrar tus primeros datos médicos.</small></p></div>';
    } else {
      content.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--danger);"><i class="fas fa-exclamation-circle" style="font-size:2rem; margin-bottom:15px; display:block;"></i><p>Error al cargar análisis:<br><small>${res.data?.mensaje || 'Error desconocido'}</small></p></div>`;
    }
  } catch (error) {
    console.error('Error cargando análisis:', error);
    const content = document.getElementById('mis-analisis-content');
    if (content) {
      content.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger);"><p>Error de conexión al cargar análisis</p></div>';
    }
  }
}

async function loadDoctorInbox() {
  try {
    const list = document.getElementById('doctor-inbox-list');
    if (!list) return;
    
    list.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem; color:var(--primary);"></i><p style="margin-top:10px;">Cargando pacientes...</p></div>';
    
    const res = await API.request('/analisis', { method: 'GET' });
    
    if (res.ok && res.data) {
      if (res.data.length > 0) {
        list.innerHTML = res.data.map(analisis => `
          <div class="patient-card card" style="margin-bottom: 12px; cursor: pointer; padding: 15px; transition: all 0.2s;" 
               onclick="showPatientDetails(${analisis.id}, ${analisis.cliente_id})">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <div style="flex:1;">
                <h4 style="margin: 0 0 4px 0; color: var(--text-main); font-size: 0.95rem;">
                  <i class="fas fa-user-injured" style="color:var(--primary);"></i> ${analisis.cliente_username || `Paciente #${analisis.cliente_id}`}
                </h4>
                <p style="margin: 0 0 2px 0; color: var(--text-muted); font-size: 0.8rem;">
                  <i class="fas fa-calendar"></i> ${formatDate(analisis.fecha_examen)}
                </p>
                <p style="margin: 0; color: var(--text-muted); font-size: 0.8rem;">
                  <i class="fas fa-flask"></i> ${analisis.tipo_examen || 'Análisis'}
                </p>
              </div>
              <div>
                ${!analisis.diagnostico_medico ? 
                  `<span style="background:#fef3c7; color:#92400e; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:700; display:block; margin-bottom:8px; white-space:nowrap;">⏳ Pendiente</span>
                   <button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); abrirModalDiagnostico(${analisis.id}, '${(analisis.cliente_username || '').replace(/'/g, "\\'")}')">
                     <i class="fas fa-stethoscope"></i> Diagnosticar
                   </button>` : 
                  `<span style="background:#d1fae5; color:#065f46; padding:4px 10px; border-radius:12px; font-size:0.75rem; font-weight:700; white-space:nowrap;">✓ Diagnosticado</span>`
                }
              </div>
            </div>
            
            ${analisis.diagnostico_paciente ? `
              <div style="background: #f0f9ff; padding: 8px 12px; border-radius: 6px; margin-top: 8px; border-left: 3px solid var(--primary);">
                <small style="color: var(--text-muted);">Síntomas: <em>${analisis.diagnostico_paciente.substring(0, 80)}${analisis.diagnostico_paciente.length > 80 ? '...' : ''}</em></small>
              </div>
            ` : ''}
          </div>
        `).join('');
      } else {
        list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i class="fas fa-check-circle" style="font-size:2rem; margin-bottom:15px; display:block; color:var(--success);"></i><p>No hay análisis pendientes</p></div>';
      }
    } else {
      list.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--danger);"><p>Error al cargar análisis:<br><small>${res.data?.mensaje || 'Error desconocido'}</small></p></div>`;
    }
  } catch (error) {
    console.error('Error cargando bandeja médica:', error);
    const list = document.getElementById('doctor-inbox-list');
    if (list) {
      list.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--danger);"><p>Error de conexión</p></div>';
    }
  }
}

// Abrir el modal de diagnóstico con datos precargados
window.abrirModalDiagnostico = function(analisisId, pacienteNombre) {
  document.getElementById('diagnostico-analisis-id').value = analisisId;
  const titulo = document.getElementById('diagnostico-modal-titulo');
  if (titulo) titulo.textContent = `Diagnóstico para ${pacienteNombre || 'Paciente'}`;
  document.getElementById('diagnostico-texto').value = '';
  document.getElementById('modal-diagnostico')?.classList.remove('hidden');
};

async function loadAdminPanel() {
  const container = document.getElementById('admin-crud-area');
  if (!container) return;
  
  container.innerHTML = '<div style="text-align: center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';

  try {
    const [usersRes, postsRes] = await Promise.all([
      API.request('/usuarios', { method: 'GET' }),
      API.request('/foros', { method: 'GET' })
    ]);

    const userCount = usersRes.ok ? (usersRes.data.length || 0) : 0;
    const postCount = postsRes.ok ? (postsRes.data.length || 0) : 0;

    const countUsers = document.getElementById('count-users');
    const countPosts = document.getElementById('count-posts');
    if (countUsers) countUsers.textContent = userCount;
    if (countPosts) countPosts.textContent = postCount;

    if (usersRes.ok && usersRes.data.length > 0) {
      container.innerHTML = `
        <h4 style="margin-bottom:15px; color:var(--primary);">Usuarios del Sistema</h4>
        <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">
          <thead>
            <tr style="background:var(--primary); color:white;">
              <th style="padding:10px; text-align:left;">ID</th>
              <th style="padding:10px; text-align:left;">Usuario</th>
              <th style="padding:10px; text-align:left;">Email</th>
              <th style="padding:10px; text-align:left;">Rol</th>
            </tr>
          </thead>
          <tbody>
            ${usersRes.data.map(u => `
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:10px; color:var(--text-muted);">#${u.id}</td>
                <td style="padding:10px; font-weight:600;">${u.username}</td>
                <td style="padding:10px; color:var(--text-muted);">${u.email}</td>
                <td style="padding:10px;">
                  <span style="padding:2px 8px; border-radius:8px; font-size:0.75rem; font-weight:700;
                    background:${u.rol === 'Medico' ? '#d1fae5' : u.rol === 'Administrador' ? '#fee2e2' : '#dbeafe'};
                    color:${u.rol === 'Medico' ? '#065f46' : u.rol === 'Administrador' ? '#991b1b' : '#1e40af'};">
                    ${u.rol}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    } else {
      container.innerHTML = '<p style="text-align:center; color:var(--text-muted);">No se pudo cargar la lista de usuarios.</p>';
    }
  } catch (error) {
    container.innerHTML = '<p style="text-align:center; color:var(--danger);">Error al cargar datos del panel.</p>';
  }
}

// --- FORO / FEED ---

let allPosts = [];

async function loadForo() {
  const res = await API.request('/foros', { method: 'GET' });
  if (res.ok) {
    allPosts = res.data;
    renderPosts(allPosts);
  } else {
    console.error('Error al cargar foro:', res.data);
  }
}

function renderPosts(posts) {
  const container = document.getElementById('foro-feed');
  if (!container) return;
  
  if (!posts || posts.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color:var(--text-muted);"><i class="fas fa-comments" style="font-size:2rem; margin-bottom:15px; display:block;"></i><p>No hay posts aún. ¡Sé el primero en publicar!</p></div>';
    return;
  }
  
  container.innerHTML = posts.map(post => `
    <div class="feed-post">
      <div class="post-header">
        <div class="post-author-info">
          <h3 style="font-size:1.1rem; margin:0 0 4px 0; color:var(--text-main);">${escapeHtml(post.titulo)}</h3>
          <span style="font-size:0.8rem; color:var(--text-muted); margin-right: 10px;">
            <i class="fas fa-user-circle"></i> ${escapeHtml(post.autor_username)}
          </span>
          <span style="font-size:0.8rem; color:var(--text-muted);">
            <i class="fas fa-clock"></i> ${formatDate(post.created_at)}
          </span>
        </div>
      </div>
      <div class="post-content" style="margin: 12px 0; line-height:1.6; color:var(--text-main);">
        <p style="margin:0;">${escapeHtml(post.contenido)}</p>
      </div>
      <div class="post-comments">
        <button onclick="toggleComments(${post.id})" style="background:none; border:none; color:var(--primary); font-weight:700; cursor:pointer; font-size:0.85rem; padding: 6px 0; display:inline-flex; align-items:center; gap:6px;">
          <i class="far fa-comment"></i> COMENTARIOS (<span id="comment-count-${post.id}">${post.comentarios_count || 0}</span>)
        </button>
        <div id="comments-container-${post.id}" class="hidden" style="margin-top:10px;">
          <div id="comments-list-${post.id}" style="margin-bottom:10px;"></div>
          <form onsubmit="submitComment(event, ${post.id})" style="display:flex; gap:10px; margin-top:10px;">
            <input type="text" id="comentario-input-${post.id}" 
              placeholder="Escribe tu comentario..." 
              style="flex-grow:1; padding:10px 15px; border-radius:10px; border:1px solid #e2e8f0; font-size:0.9rem; outline:none; font-family:inherit;"
              autocomplete="off">
            <button type="submit" class="btn btn-primary btn-sm" style="padding:8px 16px; white-space:nowrap;">
              <i class="fas fa-paper-plane"></i> Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  `).join('');
}

// FIX: usar data-loaded para saber si ya se cargaron comentarios
window.toggleComments = async (postId) => {
  const container = document.getElementById(`comments-container-${postId}`);
  if (!container) return;

  const isHidden = container.classList.contains('hidden');
  container.classList.toggle('hidden');
  
  // Solo cargar si vamos a mostrar Y aún no hemos cargado
  if (isHidden && !container.dataset.loaded) {
    const list = document.getElementById(`comments-list-${postId}`);
    if (list) list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:5px;"><i class="fas fa-spinner fa-spin"></i> Cargando comentarios...</p>';
    
    try {
      const res = await API.request(`/foros/${postId}/comentarios`, { method: 'GET' });
      if (res.ok) {
        container.dataset.loaded = 'true';
        renderComments(postId, res.data);
      } else {
        if (list) list.innerHTML = '<p style="color:var(--danger); font-size:0.85rem;">Error al cargar comentarios</p>';
      }
    } catch(err) {
      if (list) list.innerHTML = '<p style="color:var(--danger); font-size:0.85rem;">Error de conexión</p>';
    }
  }
};

function renderComments(postId, comments) {
  const list = document.getElementById(`comments-list-${postId}`);
  const countEl = document.getElementById(`comment-count-${postId}`);
  
  if (countEl) countEl.textContent = comments.length;

  if (!list) return;
  if (comments.length === 0) {
    list.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic; padding:5px;">Sin comentarios aún. ¡Sé el primero!</p>';
    return;
  }
  
  list.innerHTML = comments.map(c => `
    <div style="padding: 10px 14px; background: #f8fafc; border-radius: 10px; margin-bottom: 8px; border-left: 3px solid var(--glass-border);">
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:4px;">
        <strong style="font-size:0.85rem; color:var(--primary);">${escapeHtml(c.autor_username)}</strong>
        <span style="font-size:0.75rem; color:var(--text-muted);">${formatDate(c.created_at)}</span>
      </div>
      <p style="margin:0; font-size:0.9rem; color:var(--text-main);">${escapeHtml(c.comentario)}</p>
    </div>
  `).join('');
}

window.submitComment = async (e, foroId) => {
  e.preventDefault();
  const input = document.getElementById(`comentario-input-${foroId}`);
  const text = input.value.trim();
  
  if (!text) return;
  
  const btn = e.target.querySelector('button[type="submit"]');
  if (btn) { btn.disabled = true; }

  const res = await API.request(`/foros/${foroId}/comentarios`, {
    method: 'POST',
    body: JSON.stringify({ comentario: text })
  });
  
  if (btn) { btn.disabled = false; }

  if (res.ok) {
    input.value = '';
    // Marcar como no cargado para forzar recarga
    const container = document.getElementById(`comments-container-${foroId}`);
    if (container) {
      delete container.dataset.loaded;
      const listEl = document.getElementById(`comments-list-${foroId}`);
      if (listEl) listEl.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:5px;"><i class="fas fa-spinner fa-spin"></i> Actualizando...</p>';
    }
    // Recargar comentarios
    const reloadRes = await API.request(`/foros/${foroId}/comentarios`, { method: 'GET' });
    if (reloadRes.ok) {
      const cont = document.getElementById(`comments-container-${foroId}`);
      if (cont) cont.dataset.loaded = 'true';
      renderComments(foroId, reloadRes.data);
    }
  } else {
    showAlert(res.data?.mensaje || 'Error al enviar comentario', 'error');
  }
};

// --- FUNCIONES DE UTILIDAD ---

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function formatDateTime(dateString) {
  if (!dateString) return 'No especificada';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getGlucosaColor(valor) {
  if (valor < 70) return 'var(--warning)';
  if (valor > 126) return 'var(--danger)';
  return 'var(--success)';
}

function getColesterolColor(valor) {
  if (valor > 240) return 'var(--danger)';
  if (valor > 200) return 'var(--warning)';
  return 'var(--success)';
}

function getTrigliceridosColor(valor) {
  if (valor > 200) return 'var(--danger)';
  if (valor > 150) return 'var(--warning)';
  return 'var(--success)';
}

function getAnalisisColor(analisis) {
  if (analisis.diagnostico_medico) return 'var(--success)';
  if (analisis.resultados_glucosa > 126 || analisis.resultados_colesterol > 240 || analisis.resultados_trigliceridos > 200) {
    return 'var(--warning)';
  }
  return 'var(--primary)';
}

// --- TEST PULMONES ---

let testInterval;
let isTesting = false;
let seconds = 0;

function toggleTestPulmonar() {
  const btn = document.getElementById('btn-test-pulmones');
  const timer = document.getElementById('test-timer');
  const result = document.getElementById('test-result');
  
  if (!isTesting) {
    isTesting = true;
    seconds = 0;
    if (btn) { btn.textContent = 'Soltar Aire'; btn.style.background = 'linear-gradient(135deg, var(--danger), #dc2626)'; }
    if (timer) timer.textContent = '0.0s';
    if (result) result.textContent = '';
    
    testInterval = setInterval(() => {
      seconds += 0.1;
      if (timer) timer.textContent = seconds.toFixed(1) + 's';
    }, 100);
  } else {
    isTesting = false;
    clearInterval(testInterval);
    if (btn) { btn.textContent = 'Iniciar Retención'; btn.style.background = ''; }
    
    if (result) {
      if (seconds > 60) {
        result.textContent = '🏆 Excelente condición pulmonar';
        result.style.color = 'var(--success)';
      } else if (seconds > 30) {
        result.textContent = '✓ Buena condición pulmonar';
        result.style.color = 'var(--success)';
      } else {
        result.textContent = '~ Condición promedio - Se recomienda ejercicio';
        result.style.color = 'var(--warning)';
      }
    }
  }
}

// --- AUTO LOGOUT ---

let logoutTimer;
let warningTimer;

function setupAutoLogout() {
  const resetTimers = () => {
    clearTimeout(logoutTimer);
    clearTimeout(warningTimer);
    
    warningTimer = setTimeout(() => {
      showLogoutWarning();
    }, 14 * 60 * 1000); // aviso a los 14 minutos
    
    logoutTimer = setTimeout(() => {
      performLogout();
    }, 15 * 60 * 1000); // logout a los 15 minutos
  };
  
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => document.addEventListener(event, resetTimers, true));
  
  resetTimers();
}

function showLogoutWarning() {
  const warningModal = document.getElementById('session-warning-modal');
  if (warningModal) warningModal.classList.remove('hidden');
}

function performLogout() {
  // Intentar invalidar sesión en backend aunque sea auto-logout
  API.request('/auth/logout', { method: 'POST' }).catch(() => {});
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.location.href = 'index.html';
}

window.continueSession = () => {
  const warningModal = document.getElementById('session-warning-modal');
  if (warningModal) warningModal.classList.add('hidden');
  setupAutoLogout();
};

window.logoutNow = performLogout;

// --- LOGOUT ---

async function handleLogout(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Si hay un modal visible, esconderlo
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
  document.getElementById('profile-menu')?.classList.remove('show');

  if (!confirm('¿Estás seguro de que quieres cerrar sesión?')) return;

  // Limpiar primero siempre, por si la API falla
  localStorage.removeItem('user');
  sessionStorage.clear();
  window.currentUser = null;

  try {
    showAlert('Cerrando sesión...', 'success');
    await API.request('/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Error en logout del servidor:', error);
  } finally {
    // Redirigir siempre
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 500);
  }
}

// --- FUNCIONES GLOBALES ---

window.showPatientDetails = async (analisisId, clienteId) => {
  try {
    const detailsContainer = document.getElementById('patient-details');
    if (!detailsContainer) return;
    
    detailsContainer.innerHTML = '<div style="text-align: center; padding: 40px;"><i class="fas fa-spinner fa-spin" style="font-size:1.5rem; color:var(--primary);"></i><p style="margin-top:10px; color:var(--text-muted);">Cargando expediente del paciente...</p></div>';
    
    // Cargar en paralelo: análisis específico + perfil de salud + todos los análisis del paciente
    const [analisisRes, perfilRes, historialRes] = await Promise.all([
      API.request(`/analisis/${analisisId}`, { method: 'GET' }),
      API.request(`/perfiles-salud/${clienteId}`, { method: 'GET' }),
      API.request(`/analisis/cliente/${clienteId}`, { method: 'GET' })
    ]);
    
    if (!analisisRes.ok) {
      detailsContainer.innerHTML = '<div style="text-align:center; padding:40px; color:var(--danger);">Error al cargar el análisis</div>';
      return;
    }

    const a = analisisRes.data;
    const perfil = perfilRes.ok ? perfilRes.data : null;
    const historial = historialRes.ok ? historialRes.data : [];

    // Helper para mostrar valor o "No registrado"
    const val = (v, unit = '') => v != null && v !== '' ? `<strong>${v}${unit}</strong>` : `<span style="color:#ccc;">No registrado</span>`;

    detailsContainer.innerHTML = `
      <div style="padding: 5px;">

        <!-- CABECERA PACIENTE -->
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:18px; padding-bottom:15px; border-bottom:2px solid #f1f5f9;">
          <div style="width:52px; height:52px; border-radius:50%; background:linear-gradient(135deg,var(--primary),#0284c7); color:white; display:flex; align-items:center; justify-content:center; font-size:1.4rem; font-weight:800; flex-shrink:0;">
            ${(a.cliente_username || 'P').charAt(0).toUpperCase()}
          </div>
          <div style="flex:1;">
            <h4 style="margin:0 0 2px 0; color:var(--text-main); font-size:1rem;">${escapeHtml(a.cliente_username || 'Paciente')}</h4>
            <p style="margin:0; color:var(--text-muted); font-size:0.82rem;"><i class="fas fa-envelope" style="margin-right:4px;"></i>${escapeHtml(a.cliente_email || 'Sin email')}</p>
          </div>
          <span style="padding:5px 12px; border-radius:12px; font-size:0.75rem; font-weight:700; white-space:nowrap;
            background:${a.diagnostico_medico ? '#d1fae5' : '#fef3c7'}; 
            color:${a.diagnostico_medico ? '#065f46' : '#92400e'};">
            ${a.diagnostico_medico ? '✓ Diagnosticado' : '⏳ Pendiente'}
          </span>
        </div>

        <!-- PERFIL FÍSICO DEL PACIENTE -->
        <div style="margin-bottom:15px;">
          <h5 style="margin:0 0 10px 0; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--primary); font-weight:700;">
            <i class="fas fa-id-card"></i> Perfil Físico del Paciente
          </h5>
          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px;">
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Peso</div>
              ${val(perfil?.peso_kg, ' kg')}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Talla</div>
              ${val(perfil?.altura_cm, ' cm')}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Sangre</div>
              ${val(perfil?.tipo_sangre)}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Edad</div>
              ${val(perfil?.edad, ' años')}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Género</div>
              ${val(perfil?.genero)}
            </div>
            <div style="background:#f8fafc; padding:10px; border-radius:8px; text-align:center;">
              <div style="font-size:0.7rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Piel</div>
              ${val(perfil?.color_piel)}
            </div>
          </div>
          ${perfil?.alergias ? `<div style="margin-top:8px; padding:8px 12px; background:#fff7ed; border-radius:8px; border-left:3px solid var(--warning); font-size:0.85rem;"><strong>Alergias:</strong> ${escapeHtml(perfil.alergias)}</div>` : ''}
          ${perfil?.antecedentes ? `<div style="margin-top:6px; padding:8px 12px; background:#fef9c3; border-radius:8px; border-left:3px solid #eab308; font-size:0.85rem;"><strong>Antecedentes:</strong> ${escapeHtml(perfil.antecedentes)}</div>` : ''}
        </div>

        <!-- ANÁLISIS ACTUAL -->
        <div style="margin-bottom:15px;">
          <h5 style="margin:0 0 10px 0; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--primary); font-weight:700;">
            <i class="fas fa-flask"></i> Análisis Actual · ${formatDate(a.fecha_examen)}
          </h5>
          
          ${a.resultados_glucosa || a.resultados_colesterol || a.resultados_trigliceridos ? `
            <div style="background:#f0f9ff; padding:12px; border-radius:10px; margin-bottom:10px;">
              ${a.resultados_glucosa ? `
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                  <span style="color:var(--text-muted); font-size:0.9rem;">Glucosa</span>
                  <strong style="color:${getGlucosaColor(a.resultados_glucosa)};">${a.resultados_glucosa} mg/dL</strong>
                </div>` : ''}
              ${a.resultados_colesterol ? `
                <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
                  <span style="color:var(--text-muted); font-size:0.9rem;">Colesterol</span>
                  <strong style="color:${getColesterolColor(a.resultados_colesterol)};">${a.resultados_colesterol} mg/dL</strong>
                </div>` : ''}
              ${a.resultados_trigliceridos ? `
                <div style="display:flex; justify-content:space-between; padding:6px 0;">
                  <span style="color:var(--text-muted); font-size:0.9rem;">Triglicéridos</span>
                  <strong style="color:${getTrigliceridosColor(a.resultados_trigliceridos)};">${a.resultados_trigliceridos} mg/dL</strong>
                </div>` : ''}
            </div>
          ` : '<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic; margin:0 0 10px 0;">Sin valores de laboratorio registrados</p>'}

          ${a.diagnostico_paciente ? `
            <div style="background:#fafafa; padding:12px; border-radius:10px; border-left:3px solid var(--primary); margin-bottom:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:6px; letter-spacing:0.5px;">Síntomas / Observaciones del paciente</div>
              <p style="margin:0; font-style:italic; color:var(--text-main); font-size:0.9rem; line-height:1.5;">"${escapeHtml(a.diagnostico_paciente)}"</p>
            </div>
          ` : '<p style="color:var(--text-muted); font-size:0.85rem; font-style:italic; margin:0 0 10px 0;">El paciente no describió síntomas</p>'}
        </div>

        <!-- HISTORIAL DE ANÁLISIS ANTERIORES -->
        ${historial.length > 1 ? `
          <div style="margin-bottom:15px;">
            <h5 style="margin:0 0 10px 0; font-size:0.8rem; text-transform:uppercase; letter-spacing:1px; color:var(--text-muted); font-weight:700;">
              <i class="fas fa-history"></i> Historial (${historial.length} análisis)
            </h5>
            <div style="max-height:120px; overflow-y:auto; display:flex; flex-direction:column; gap:6px;">
              ${historial.filter(h => h.id !== analisisId).slice(0,4).map(h => `
                <div style="padding:8px 12px; background:#f8fafc; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; border-left:3px solid ${getAnalisisColor(h)};">
                  <span style="color:var(--text-muted);">${formatDate(h.fecha_examen)} · ${escapeHtml(h.tipo_examen || 'Análisis')}</span>
                  <span style="color:${h.diagnostico_medico ? 'var(--success)' : 'var(--warning)'}; font-weight:600; font-size:0.75rem;">${h.diagnostico_medico ? '✓' : '⏳'}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

        <!-- DIAGNÓSTICO MÉDICO / BOTÓN -->
        ${a.diagnostico_medico ? `
          <div style="padding:15px; background:linear-gradient(135deg,#d1fae5,#a7f3d0); border-radius:10px; border-left:4px solid var(--success);">
            <h5 style="margin:0 0 8px 0; font-size:0.8rem; color:#065f46; text-transform:uppercase; letter-spacing:0.5px;">
              <i class="fas fa-stethoscope"></i> Diagnóstico emitido
            </h5>
            <p style="margin:0; color:#065f46; font-size:0.9rem; line-height:1.5;">${escapeHtml(a.diagnostico_medico)}</p>
          </div>
        ` : `
          <button class="btn btn-primary" style="width:100%; margin-top:5px;" onclick="abrirModalDiagnostico(${a.id}, '${escapeHtml(a.cliente_username || '')}')">
            <i class="fas fa-stethoscope"></i> Emitir Diagnóstico
          </button>
        `}
      </div>
    `;
  } catch (error) {
    console.error('Error cargando detalles del paciente:', error);
    const detailsContainer = document.getElementById('patient-details');
    if (detailsContainer) {
      detailsContainer.innerHTML = '<div style="text-align:center; padding:40px; color:var(--danger);"><p>Error al cargar detalles</p></div>';
    }
  }
};

// Compatibilidad con llamadas antiguas
window.diagnosticarAnalisis = async (analisisId) => {
  window.abrirModalDiagnostico(analisisId, 'Paciente');
};

window.handleLogout = handleLogout;
window.openProfileModal = openProfileModal;
window.loadMisAnalisis = loadMisAnalisis;
