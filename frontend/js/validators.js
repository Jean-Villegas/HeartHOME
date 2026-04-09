/**
 * Sistema de Salud - Validaciones de Frontend
 * Cédula, teléfono, email, peso, talla, glucosa, colesterol, triglicéridos, etc.
 */

// ─── Reglas de validación ───────────────────────────────────────────────────

const RULES = {
  username: {
    min: 3, max: 30,
    pattern: /^[a-zA-Z0-9_]+$/,
    msg: 'Solo letras, números y guión bajo (3–30 caracteres)'
  },
  cedula: {
    min: 6, max: 10,
    pattern: /^\d+$/,
    msg: 'Solo números (6–10 dígitos)'
  },
  telefono: {
    min: 7, max: 15,
    pattern: /^\d+$/,
    msg: 'Solo números (7–15 dígitos)'
  },
  password: {
    min: 6, max: 72,
    msg: 'Mínimo 6 caracteres'
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    msg: 'Formato de email inválido (ej: usuario@correo.com)'
  },
  peso: {
    numMin: 1, numMax: 500,
    msg: 'El peso debe estar entre 1 y 500 kg'
  },
  talla: {
    numMin: 30, numMax: 250,
    msg: 'La talla debe estar entre 30 y 250 cm'
  },
  edad: {
    numMin: 0, numMax: 120,
    msg: 'La edad debe estar entre 0 y 120 años'
  },
  glucosa: {
    numMin: 10, numMax: 600,
    msg: 'Glucosa debe estar entre 10 y 600 mg/dL'
  },
  colesterol: {
    numMin: 50, numMax: 700,
    msg: 'Colesterol debe estar entre 50 y 700 mg/dL'
  },
  trigliceridos: {
    numMin: 20, numMax: 5000,
    msg: 'Triglicéridos deben estar entre 20 y 5000 mg/dL'
  }
};

// ─── Motor de validación ────────────────────────────────────────────────────

function validateField(type, value, required = true) {
  const v = String(value).trim();

  if (!v) {
    return required ? 'Este campo es obligatorio' : null;
  }

  const rule = RULES[type];
  if (!rule) return null;

  // longitud de texto
  if (rule.min !== undefined && v.length < rule.min) {
    return rule.msg;
  }
  if (rule.max !== undefined && v.length > rule.max) {
    return rule.msg;
  }

  // patrón regex
  if (rule.pattern && !rule.pattern.test(v)) {
    return rule.msg;
  }

  // rango numérico
  if (rule.numMin !== undefined) {
    const n = parseFloat(v);
    if (isNaN(n) || n < rule.numMin || n > rule.numMax) {
      return rule.msg;
    }
  }

  return null; // válido
}

// ─── UI helpers ─────────────────────────────────────────────────────────────

function showFieldError(input, message) {
  input.classList.add('input-error');
  input.classList.remove('input-ok');

  let errEl = input.parentElement.querySelector('.field-error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'field-error-msg';
    input.parentElement.appendChild(errEl);
  }
  errEl.textContent = message;
}

function clearFieldError(input) {
  input.classList.remove('input-error');
  input.classList.add('input-ok');

  const errEl = input.parentElement.querySelector('.field-error-msg');
  if (errEl) errEl.remove();
}

function applyValidation(inputEl, type, required = true) {
  if (!inputEl) return;

  // Bloquear caracteres inválidos en tiempo real para campos numéricos
  const numericTypes = ['cedula', 'telefono'];
  if (numericTypes.includes(type)) {
    inputEl.addEventListener('keypress', (e) => {
      if (!/\d/.test(e.key) && !['Backspace', 'Tab', 'Delete', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
      }
    });
    inputEl.addEventListener('paste', (e) => {
      const pasted = (e.clipboardData || window.clipboardData).getData('text');
      if (!/^\d+$/.test(pasted)) {
        e.preventDefault();
      }
    });
  }

  // Validar al perder foco
  inputEl.addEventListener('blur', () => {
    const err = validateField(type, inputEl.value, required);
    if (err) showFieldError(inputEl, err);
    else clearFieldError(inputEl);
  });

  // Limpiar error mientras escribe
  inputEl.addEventListener('input', () => {
    const errEl = inputEl.parentElement.querySelector('.field-error-msg');
    if (errEl) {
      const err = validateField(type, inputEl.value, required);
      if (!err) clearFieldError(inputEl);
    }
  });
}

// ─── Validar formulario completo antes de enviar ────────────────────────────

function validateForm(fields) {
  // fields = [{ el, type, required }]
  let valid = true;
  for (const { el, type, required = true } of fields) {
    if (!el) continue;
    const err = validateField(type, el.value, required);
    if (err) {
      showFieldError(el, err);
      if (valid) el.focus(); // enfocar el primero con error
      valid = false;
    } else {
      clearFieldError(el);
    }
  }
  return valid;
}

// ─── CSS dinámico de errores ─────────────────────────────────────────────────

(function injectValidationStyles() {
  if (document.getElementById('validator-styles')) return;
  const style = document.createElement('style');
  style.id = 'validator-styles';
  style.textContent = `
    .input-error {
      border-color: #ef4444 !important;
      box-shadow: 0 0 0 3px rgba(239,68,68,0.15) !important;
    }
    .input-ok {
      border-color: #22c55e !important;
      box-shadow: 0 0 0 3px rgba(34,197,94,0.12) !important;
    }
    .field-error-msg {
      display: block;
      color: #ef4444;
      font-size: 0.75rem;
      margin-top: 4px;
      font-weight: 500;
      animation: fadeInDown 0.15s ease;
    }
    @keyframes fadeInDown {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(style);
})();

// ─── Activar validaciones en los formularios del sistema ────────────────────

document.addEventListener('DOMContentLoaded', () => {

  // ── Formulario de Registro (index.html) ──────────────────────────────────
  const regForm = document.getElementById('register-form');
  if (regForm) {
    applyValidation(document.getElementById('reg-username'), 'username');
    applyValidation(document.getElementById('reg-cedula'),   'cedula');
    applyValidation(document.getElementById('reg-email'),    'email');
    applyValidation(document.getElementById('reg-password'), 'password');

    regForm.addEventListener('submit', (e) => {
      const ok = validateForm([
        { el: document.getElementById('reg-username'), type: 'username' },
        { el: document.getElementById('reg-cedula'),   type: 'cedula'   },
        { el: document.getElementById('reg-email'),    type: 'email'    },
        { el: document.getElementById('reg-password'), type: 'password' }
      ]);
      if (!ok) e.preventDefault();
    }, true); // captura antes del handler de auth.js
  }

  // ── Formulario de Perfil (app - modal-perfil) ────────────────────────────
  const perfilForm = document.getElementById('perfil-form-full');
  if (perfilForm) {
    applyValidation(document.getElementById('p-id'),    'cedula',       false);
    applyValidation(document.getElementById('p-talla'), 'talla',        false);
    applyValidation(document.getElementById('p-peso'),  'peso',         false);
    applyValidation(document.getElementById('p-edad'),  'edad',         false);

    // Campos de análisis (opcionales)
    applyValidation(document.getElementById('p-glucosa'),       'glucosa',       false);
    applyValidation(document.getElementById('p-colesterol'),    'colesterol',    false);
    applyValidation(document.getElementById('p-trigliceridos'), 'trigliceridos', false);

    perfilForm.addEventListener('submit', (e) => {
      const ok = validateForm([
        { el: document.getElementById('p-id'),              type: 'cedula',        required: false },
        { el: document.getElementById('p-talla'),           type: 'talla',         required: false },
        { el: document.getElementById('p-peso'),            type: 'peso',          required: false },
        { el: document.getElementById('p-edad'),            type: 'edad',          required: false },
        { el: document.getElementById('p-glucosa'),         type: 'glucosa',       required: false },
        { el: document.getElementById('p-colesterol'),      type: 'colesterol',    required: false },
        { el: document.getElementById('p-trigliceridos'),   type: 'trigliceridos', required: false }
      ]);
      if (!ok) e.preventDefault();
    }, true);
  }
});

// Exportar para uso manual si fuera necesario
window.Validators = { validateField, validateForm, applyValidation, showFieldError, clearFieldError };
