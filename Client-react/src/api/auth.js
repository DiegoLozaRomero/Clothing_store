// src/api/auth.js (Código Corregido)

// 🚨 Usar import.meta.env.VITE_API_URL para obtener la URL
const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, { // <- Ahora usa la URL de EC2
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password }), 
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Error al iniciar sesión');
    }

    return await response.json(); 
  } catch (error) {
    console.error('Error en login:', error);
    throw error;
  }
};
