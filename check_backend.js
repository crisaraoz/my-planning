// Script para verificar la conexión al backend
const fetch = require('node-fetch');

const checkBackendConnection = async () => {
  try {
    console.log('Intentando conectar al backend...');
    
    // Intentar obtener la documentación de la API
    const docsResponse = await fetch('http://localhost:8000/docs');
    console.log('Respuesta del endpoint /docs:', docsResponse.status, docsResponse.statusText);
    
    // Intentar obtener las columnas
    const columnsResponse = await fetch('http://localhost:8000/api/v1/columns');
    console.log('Respuesta del endpoint /api/v1/columns:', columnsResponse.status, columnsResponse.statusText);
    
    if (columnsResponse.ok) {
      const data = await columnsResponse.json();
      console.log('Datos recibidos:', JSON.stringify(data, null, 2));
    }
    
    console.log('Verificación completada');
  } catch (error) {
    console.error('Error al conectar con el backend:', error.message);
  }
};

checkBackendConnection(); 