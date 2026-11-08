# Virtu - Backend API

Backend en Node.js + Express + Prisma ORM + MySQL para la plataforma educativa **Virtu**.

---

## 📁 Estructura del Proyecto

```text
backend-virtu/
├── prisma/
│   ├── schema.prisma          # Esquema relacional MySQL (Modelos Core y Glosarios)
│   └── seed.js                # Script de poblamiento inicial de datos
├── src/
│   ├── config/
│   │   └── db.js              # Instancia única del cliente Prisma
│   ├── controllers/
│   │   └── auth.controller.js # Controladores de inicio de sesión y perfil
│   ├── middlewares/
│   │   ├── auth.middleware.js # Validación de Token JWT y extracción de usuario
│   │   ├── role.middleware.js # Control de acceso por rol (ESTUDIANTE / DOCENTE)
│   │   └── error.middleware.js# Manejador centralizado de errores
│   ├── routes/
│   │   ├── auth.routes.js     # Endpoints de autenticación (/api/auth)
│   │   └── index.js           # Enrutador principal de la API
│   ├── services/
│   │   └── auth.service.js    # Lógica de negocio y consultas a base de datos
│   ├── app.js                 # Configuración de Express, CORS y middlewares
│   └── index.js               # Punto de entrada del servidor HTTP
├── .env.example               # Plantilla de variables de entorno
├── package.json
└── README.md
```

---

## 🚀 Puesta en Marcha Local

### 1. Variables de Entorno
Copia el archivo `.env.example` a `.env`:
```bash
cp .env.example .env
```
Asegúrate de configurar tu cadena de conexión `DATABASE_URL` hacia tu base de datos MySQL (local o Railway).

### 2. Generar el Cliente Prisma y Migraciones
```bash
npm run prisma:generate
npm run prisma:migrate
```

### 3. Cargar Datos Iniciales (Seed)
```bash
npm run seed
```
> Esto cargará:
> - **1 Colegio** (*Colegio Virtu Central*)
> - **2 Cursos** (*4to Medio A*, *4to Medio B*)
> - **2 Usuarios de Prueba**:
>   - **Docente:** `profesor1` / `Docente123!` (asignado a ambos cursos)
>   - **Estudiante:** `alumno1` / `Estudiante123!` (asignado a 4to Medio A)
> - **Las 6 Materias Core**: Biología, Cálculo, Física, Química, Inglés e Historia.
> - **Unidades y Lecciones de muestra**.
> - **1 Cuestionario de 5 preguntas** de opción múltiple (Historia) con retroalimentación inmediata.
> - **Glosarios modulares** para cada materia (Flashcards, Fórmulas LaTeX, Videos, Audios, etc.).

### 4. Iniciar el Servidor
```bash
# Modo desarrollo con recarga automática
npm run dev

# Modo producción
npm start
```

---

## 📖 Documentación Completa de la API

Para el equipo de Frontend y estudiantes que consumirán esta API, consulta la especificación completa en:
👉 **[API_ENDPOINTS_VIRTU.md](API_ENDPOINTS_VIRTU.md)**

Contiene:
- Todos los endpoints con métodos HTTP, URLs, payloads de entrada y salida JSON.
- Explicación detallada de cómo interactúa cada endpoint con las tablas de MySQL.
- Reglas de negocio (límite de caracteres, notas vigentes, aprobación con 4/5, inmutabilidad de respuestas, avance de unidades).
- Diagramas de secuencia del wizard de preguntas.

---

## 📡 Endpoints Disponibles

### Autenticación y Perfil (`/api/auth`)

| Método | Endpoint | Descripción | Requiere Auth |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/auth/login` | Inicia sesión con `username` y `password` | No |
| `POST` | `/api/auth/register`| Registra un nuevo estudiante o docente | No |
| `GET` | `/api/auth/me` | Obtiene los datos del usuario logueado según su rol | **Sí (Bearer Token)** |

#### Formato de Respuesta para `GET /api/auth/me`:

**Para Estudiantes (1 curso):**
```json
{
  "status": "success",
  "data": {
    "id": 2,
    "username": "alumno1",
    "nombreCompleto": "Sofía Valenzuela",
    "rol": "ESTUDIANTE",
    "colegio": { "id": 1, "nombre": "Colegio Virtu Central" },
    "curso": { "id": 1, "nombre": "4to Medio A" }
  }
}
```

**Para Docentes (Múltiples cursos):**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "username": "profesor1",
    "nombreCompleto": "Prof. Carlos Mendoza",
    "rol": "DOCENTE",
    "colegio": { "id": 1, "nombre": "Colegio Virtu Central" },
    "cursos": [
      { "id": 1, "nombre": "4to Medio A" },
      { "id": 2, "nombre": "4to Medio B" }
    ]
  }
}
```
