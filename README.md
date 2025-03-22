# Mi Proyecto de Kanban

## Descripción
Este es un proyecto de gestión de tareas tipo Kanban, que permite a los usuarios crear, editar y organizar tareas en diferentes columnas.

## Tecnologías Utilizadas

### Backend
- **Framework**: FastAPI
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: SQLAlchemy
- **Autenticación**: JWT (JSON Web Tokens)
- **Entorno**: Python 3.x

### Frontend
- **Framework**: React + Next
- **Librerías**: Axios (para las solicitudes HTTP), React Router (para la navegación)
- **Estilos**: Tailwind CSS 
  
## Levantar el Proyecto Localmente

### Backend

1. **Clona el repositorio**:
   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
   cd tu_repositorio/backend
   ```

2. **Crea un entorno virtual** (opcional pero recomendado):
   ```bash
   python -m venv venv
   ```

3. **Activa el entorno virtual**:
   - En Windows:
     ```bash
     venv\Scripts\activate
     ```
   - En macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

4. **Instala las dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Configura las variables de entorno**:
   Asegúrate de tener un archivo `.env` en la carpeta `backend` con la siguiente configuración:
   ```plaintext
   DATABASE_URL=[LINK DE CONEXIÓN A LA BASE DE DATOS QUE UTILIZES/CREASTE]
   ```

6. **Levanta el servidor**:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend

1. **Navega a la carpeta del frontend**:
   ```bash
   cd ../frontend
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Levanta el servidor**:
   ```bash
   npm start
   ```

4. **Accede a la aplicación**:
   Abre tu navegador y ve a `http://localhost:3000` para ver la aplicación en funcionamiento.

## Contribuciones
Si deseas contribuir a este proyecto, por favor abre un issue o envía un pull request.

5. **LIVE DEMO**:
   https://my-planning-tawny.vercel.app/

## Licencia
Este proyecto está bajo la Licencia MIT.

