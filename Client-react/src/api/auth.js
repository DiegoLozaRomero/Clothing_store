// src/api/auth.js

const API_URL = process.env.REACT_APP_API_URL; // toma la URL desde .env

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, { // <- aquí usamos la variable
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }), // el backend espera username
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al iniciar sesión');
    }

    return await response.json(); // contiene { access_token }
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
