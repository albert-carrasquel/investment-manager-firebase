# 🏠 HomeFlow

**HomeFlow** es una aplicación web para gestión de finanzas personales que integra inversiones y gastos domésticos en un solo lugar.

[![GitHub](https://img.shields.io/badge/repo-home--flow-blue)](https://github.com/albert-carrasquel/home-flow)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb?logo=react)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6.0-orange?logo=firebase)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-7.2.6-646cff?logo=vite)](https://vitejs.dev/)

---

## ✨ Características

### 💰 Gestión de Inversiones
- Portfolio con posiciones abiertas en tiempo real
- Engine FIFO para cálculo de P&L
- Importador automático desde IOL (InvertirOnline)
- Soporte para múltiples tipos de activos: Acciones, Cedears, Bonos, Lecaps, ON, FCI
- Dashboard con métricas clave y gráficos

### 💸 Gestión de Gastos
- Registro de ingresos y gastos del hogar
- Categorización automática
- Reportes por período (día/semana/mes/año)
- Análisis de tendencias con gráficos

### 📊 Reportes y Análisis
- Análisis FIFO de operaciones cerradas
- P&L realizado por activo
- Diversificación de portfolio (por tipo y moneda)
- Tendencias de cashflow mensual
- Exportación a Excel con múltiples hojas

### 👥 Multi-Usuario
- Soporte para múltiples usuarios/familiares
- Vista consolidada y por usuario
- Asignación de transacciones a usuarios

---

## 🚀 Tecnologías

- **Frontend**: React 19 + Vite
- **Backend**: Firebase (Auth + Firestore)
- **Estilos**: Tailwind CSS
- **Gráficos**: Recharts
- **Importación**: SheetJS (xlsx)

---

## 📦 Instalación

```bash
# Clonar repositorio
git clone https://github.com/albert-carrasquel/home-flow.git
cd home-flow

# Instalar dependencias
npm install

# Configurar Firebase (crear .env.local con tus credenciales)
# Ver .env.example para variables requeridas

# Iniciar servidor de desarrollo
npm run dev
```

---

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo (Vite)
npm run build        # Build de producción
npm run preview      # Preview del build
npm run lint         # Linter (ESLint)
```

---

## 📁 Estructura del Proyecto

```
src/
├── components/          # Componentes UI reutilizables
│   ├── forms/          # Formularios
│   ├── layouts/        # Layouts (MainLayout, WelcomeScreen)
│   └── reports/        # Componentes de reportes
├── config/             # Configuración (Firebase, constantes)
├── contexts/           # Context API (estado global)
├── hooks/              # Custom hooks (useFirebase, useTransactions, etc.)
├── services/           # Servicios (Firestore paths, CRUD operations)
├── utils/              # Utilidades (formatters, validators, normalizers)
├── App.jsx             # Componente principal
└── main.jsx            # Entry point
```

---

## 📖 Documentación

- **[ROADMAP.md](ROADMAP.md)**: Roadmap de features y mejoras
- **[PARSER_IOL.md](PARSER_IOL.md)**: Documentación técnica del importador IOL

---

## 🤝 Contribución

Este es un proyecto personal pero las contribuciones son bienvenidas:

1. Fork del repositorio
2. Crear branch de feature (`git checkout -b feature/nueva-feature`)
3. Commit de cambios (`git commit -m 'feat: agregar nueva feature'`)
4. Push al branch (`git push origin feature/nueva-feature`)
5. Abrir Pull Request

---

## 📝 Convenciones de Commits

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `refactor:` Refactorización de código
- `style:` Cambios de formato (sin cambio de lógica)
- `test:` Agregar o corregir tests
- `chore:` Cambios en build, CI, etc.

---

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

---

## 👤 Autor

**Albert Carrasquel**
- GitHub: [@albert-carrasquel](https://github.com/albert-carrasquel)

---

**Estado del proyecto**: ✅ Activo - En desarrollo continuo
