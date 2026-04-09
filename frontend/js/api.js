// Constantes base
const API_URL = '/api';

// Función global para manejar mensajes de alerta
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  if (!alertBox) return;
  
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  
  // Auto-hide alert after 5 seconds
  setTimeout(() => {
    alertBox.className = 'alert hidden';
  }, 5000);
}

// Cliente API principal
const API = {
  
  async request(endpoint, options = {}) {
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      const fnOptions = {
        ...options,
        headers,
        credentials: 'include' // Importante para enviar cookies
      };

      const response = await fetch(`${API_URL}${endpoint}`, fnOptions);
      const data = await response.json();
      
      // Manejar errores de autenticación
      if (response.status === 401 || response.status === 403) {
        if (data.codigo === 'TOKEN_INVALID' || data.codigo === 'TOKEN_MISSING') {
          // Limpiar datos locales
          localStorage.removeItem('user');
          sessionStorage.clear();
          
          // Mostrar mensaje específico
          if (data.expirado) {
            showAlert('Tu sesión ha expirado. Serás redirigido al login.', 'warning');
          } else {
            showAlert('Sesión inválida. Serás redirigido al login.', 'error');
          }
          
          // Redirigir después de un breve delay
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
          
          return { ok: false, status: response.status, data };
        }
      }
      
      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error('API Error:', error);
      
      // Manejar errores de conexión
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        showAlert('Error de conexión. Verifica tu conexión a internet.', 'error');
      }
      
      return { ok: false, status: 500, data: { mensaje: 'Error de conexión con el servidor' } };
    }
  },

  async login(username, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },
  
  async getMe() {
    return this.request('/auth/me', {
      method: 'GET'
    });
  }
};
