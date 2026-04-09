document.addEventListener('DOMContentLoaded', () => {

  const loginFormContainer = document.getElementById('login-form-container');
  const registerFormContainer = document.getElementById('register-form-container');
  
  const toRegisterBtn = document.getElementById('to-register');
  const toLoginBtn = document.getElementById('to-login');
  
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');

  // Toggle Forms
  toRegisterBtn.addEventListener('click', () => {
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
    document.getElementById('alert-box').className = 'alert hidden';
  });

  toLoginBtn.addEventListener('click', () => {
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
    document.getElementById('alert-box').className = 'alert hidden';
  });

  // Login Logic
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnLogin.textContent = 'Verificando...';
    btnLogin.disabled = true;

    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const res = await API.login(username, password);

    if (res.ok) {
      // Guardar datos del usuario en localStorage
      if (res.data && res.data.usuario) {
        localStorage.setItem('user', JSON.stringify(res.data.usuario));
        console.log('Usuario guardado en localStorage:', res.data.usuario);
      }
      
      showAlert('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
      setTimeout(() => {
        // Redirigir al dashboard
        window.location.href = 'dashboard.html';
      }, 1000);
    } else {
      showAlert(res.data.mensaje || 'Credenciales incorrectas');
      btnLogin.textContent = 'Ingresar al Sistema';
      btnLogin.disabled = false;
    }
  });

  // Register Logic
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnRegister.textContent = 'Registrando...';
    btnRegister.disabled = true;

    const authData = {
      username: document.getElementById('reg-username').value,
      cedula: document.getElementById('reg-cedula').value,
      email: document.getElementById('reg-email').value,
      password: document.getElementById('reg-password').value,
      rol: document.getElementById('reg-rol').value
    };

    const res = await API.register(authData);

    if (res.ok) {
      showAlert('¡Registro exitoso! Por favor inicia sesión.', 'success');
      setTimeout(() => {
        registerForm.reset();
        toLoginBtn.click();
        btnRegister.textContent = 'Completar Registro';
        btnRegister.disabled = false;
        // Optionally pre-fill the username
        document.getElementById('login-username').value = authData.username;
      }, 2000);
    } else {
      showAlert(res.data.mensaje || 'Error al registrar usuario');
      btnRegister.textContent = 'Completar Registro';
      btnRegister.disabled = false;
    }
  });

});
