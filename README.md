# Virtu - Backend API

Backend en Node.js + Express + Prisma ORM + MySQL (TiDB Cloud) para la plataforma educativa **Virtu**.

---

## 🌐 Despliegue en Vivo y Documentación Interactiva

* **API en Producción (Render):** `https://backend-virtu.onrender.com`
* **Swagger UI (Documentación Interactiva):** 👉 **[https://backend-virtu.onrender.com/docs](https://backend-virtu.onrender.com/docs)**
* **OpenAPI Spec (JSON):** `https://backend-virtu.onrender.com/api/docs-json`

> **Instrucciones para probar con Swagger:**
> 1. Haz clic en el endpoint `POST /api/auth/login` e ingresa:
>    * Estudiante: `alumno1` / `Estudiante123!`
>    * Docente: `profesor1` / `Docente123!`
> 2. Copia el `token` devuelto.
> 3. Haz clic en el botón verde **Authorize** (arriba a la derecha), pega el token y haz clic en **Authorize**.
> 4. ¡Listo! Puedes probar todos los endpoints protegidos directamente desde tu navegador.

---

## 📁 Estructura del Proyecto

```text
backend-virtu/
├── prisma/
│   ├── schema.prisma          # Esquema relacional MySQL (Modelos Core y Glosarios)
│   └── seed.js                # Script de poblamiento inicial de datos en TiDB Cloud
├── src/
│   ├── config/
│   │   └── db.js              # Instancia del cliente Prisma
│   ├── controllers/
│   │   ├── auth.controller.js         # Controladores de inicio de sesión y perfil
│   │   ├── contenido.controller.js    # Controladores de materias y lecciones
│   │   ├── cuestionario.controller.js # Controladores de evaluación wizard
│   │   ├── progreso.controller.js     # Controladores de progreso de estudiantes
│   │   ├── glosario.controller.js     # Controladores de glosarios modulares
│   │   └── docente.controller.js      # Controladores de panel docente (solo lectura)
│   ├── docs/
│   │   └── swagger.js         # Especificación OpenAPI 3.0 / Swagger UI
│   ├── middlewares/
│   │   ├── auth.middleware.js # Validación de Token JWT y extracción de usuario
│   │   ├── role.middleware.js # Control de acceso por rol (ESTUDIANTE / DOCENTE)
│   │   └── error.middleware.js# Manejador centralizado de errores
│   ├── routes/
│   │   ├── auth.routes.js         # /api/auth
│   │   ├── contenido.routes.js    # /api/contenidos
│   │   ├── leccion.routes.js      # /api/lecciones
│   │   ├── cuestionario.routes.js # /api/cuestionarios e /api/intentos
│   │   ├── estudiante.routes.js   # /api/estudiantes
│   │   ├── glosario.routes.js     # /api/glosarios
│   │   ├── docente.routes.js      # /api/docente
│   │   └── index.js               # Enrutador principal de la API (/api)
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── contenido.service.js
│   │   ├── cuestionario.service.js
│   │   ├── progreso.service.js
│   │   ├── glosario.service.js
│   │   └── docente.service.js
│   ├── app.js                 # Express, CORS, Swagger UI y middlewares
│   └── index.js               # Punto de entrada del servidor HTTP
├── API_ENDPOINTS_VIRTU.md     # Contrato técnico para el equipo frontend
├── .env.example
├── package.json
└── README.md
```

---

## 📡 Tabla General de Endpoints

| Módulo | Método | Endpoint | Descripción | Rol Requerido |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/login` | Inicia sesión con `username` y `password` | Público |
| **Auth** | `POST` | `/api/auth/register` | Registro de nuevos usuarios | Público |
| **Auth** | `GET` | `/api/auth/me` | Datos del usuario según rol (1 curso vs N cursos) | Token |
| **Contenidos** | `GET` | `/api/contenidos` | Listado de materias habilitadas | Token |
| **Contenidos** | `GET` | `/api/contenidos/:slug` | Materia con unidades, lecciones y progreso | Token |
| **Lecciones** | `GET` | `/api/lecciones/:id` | Definición (10k chars), ejemplo (2k chars) | Token |
| **Progreso** | `POST` | `/api/lecciones/:id/marcar-estudiado` | Marca lección manual (SOLO si no tiene cuestionario) | Estudiante |
| **Cuestionarios** | `POST` | `/api/cuestionarios/:id/iniciar` | Inicia intento (5 preguntas, 4 opciones) | Estudiante |
| **Cuestionarios** | `POST` | `/api/intentos/:id/responder` | Envía respuesta secuencial (inmutable + corrección inmediata) | Estudiante |
| **Cuestionarios** | `POST` | `/api/intentos/:id/finalizar` | Finaliza, calcula nota (>= 4/5 aprueba y marca lección) | Estudiante |
| **Cuestionarios** | `GET` | `/api/cuestionarios/:id/historial` | Histórico de intentos del alumno | Estudiante |
| **Progreso** | `GET` | `/api/estudiantes/progreso` | Porcentaje global de avance del estudiante | Estudiante |
| **Glosarios** | `GET` | `/api/glosarios/:materia` | Listar o buscar (`?q=...`) en glosario modular | Token |
| **Glosarios** | `GET` | `/api/glosarios/historia/linea-tiempo/:id` | Hito actual + 2 anteriores y 2 posteriores | Token |
| **Docente** | `GET` | `/api/docente/cursos` | Lista de cursos asignados al docente | Docente |
| **Docente** | `GET` | `/api/docente/cursos/:id/estudiantes` | Lista de alumnos con % de avance de Unidades | Docente |
| **Docente** | `GET` | `/api/docente/estudiantes/:id/lecciones/:id` | Aciertos y desaciertos por lección y alumno | Docente |
