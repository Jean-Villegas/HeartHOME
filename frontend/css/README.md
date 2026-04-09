# 📁 Estructura de CSS - Sistema de Salud

Los archivos CSS están organizados por modularidad para facilitar su mantenimiento y modificación.

## 🗂️ Archivos CSS

### 📄 `style.css` (Principal)
- **Propósito**: Archivo principal que importa todos los demás módulos
- **Uso**: Es el único archivo que se incluye en los HTML
- **Contenido**: Imports y configuración general

### 🎨 `variables.css`
- **Propósito**: Variables CSS globales (colores, fuentes, espaciado)
- **Contenido**:
  - Colores primarios y secundarios
  - Variables de espaciado y bordes
  - Transiciones y animaciones base
- **Modificación**: Cambiar aquí afecta a toda la aplicación

### 🏗️ `base.css`
- **Propósito**: Estilos base y reset
- **Contenido**:
  - Reset CSS
  - Tipografías
  - Layout principal del dashboard
  - Clases utilitarias básicas
  - Media queries responsive

### 🧩 `components.css`
- **Propósito**: Componentes reutilizables
- **Contenido**:
  - Botones (.btn)
  - Tarjetas (.card)
  - Badges
  - Formularios
  - Alertas
  - Tablas
  - Spinners de carga

### 📐 `layout.css`
- **Propósito**: Estructura y layout general
- **Contenido**:
  - Barra superior (.top-bar)
  - Menú desplegable
  - Modales
  - Columnas del dashboard
  - Navegación

### ✨ `animations.css`
- **Propósito**: Animaciones y transiciones
- **Contenido**:
  - Keyframes (fadeIn, slideDown, bounce, etc.)
  - Clases de animación
  - Efectos hover
  - Duraciones y delays

### 🔐 `auth.css`
- **Propósito**: Estilos específicos de autenticación
- **Contenido**:
  - Panel de login/registro
  - Formularios de auth
  - Alertas de autenticación
  - Estilos responsive para auth

### 📊 `dashboard.css`
- **Propósito**: Estilos específicos del dashboard
- **Contenido**:
  - Widgets laterales
  - Feed principal
  - Bandeja médica
  - Panel de administración
  - Tarjetas de datos médicos

## 🛠️ Cómo Modificar

### Para cambiar colores:
1. Editar `variables.css`
2. Las variables afectan automáticamente toda la app

### Para modificar componentes:
1. Ir al archivo específico (`components.css`)
2. Buscar la clase correspondiente
3. Los cambios se aplican globalmente

### Para ajustar layout:
1. Editar `layout.css` para estructura general
2. Editar `dashboard.css` para elementos específicos del dashboard

### Para agregar nuevas animaciones:
1. Añadir keyframes en `animations.css`
2. Crear clases de animación si es necesario

## 🎯 Beneficios de esta estructura

✅ **Mantenimiento fácil**: Cada archivo tiene una responsabilidad clara
✅ **Modularidad**: Puedes trabajar en partes específicas sin afectar otras
✅ **Reutilización**: Los componentes están centralizados
✅ **Consistencia**: Las variables aseguran consistencia visual
✅ **Rendimiento**: Solo se carga lo necesario
✅ **Escalabilidad**: Fácil agregar nuevos módulos

## 📝 Convenciones

- **Nomenclatura BEM**: `.block__element--modifier`
- **Variables**: `--category-specific-name`
- **Breakpoints**: 1100px y 850px para responsive
- **Colores**: Sistema semántico (primary, success, danger, etc.)

## 🔄 Flujo de trabajo

1. **Identificar** qué quieres modificar
2. **Localizar** el archivo CSS correspondiente
3. **Modificar** las clases o variables necesarias
4. **Probar** los cambios
5. **Documentar** cambios importantes si es necesario
