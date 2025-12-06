// 🚨 CORRECCIÓN: Usar la sintaxis de Vite para acceder a la variable de entorno
const API_URL = import.meta.env.VITE_API_URL;

export const endpoints = {
  // Las URLs se construirán correctamente usando la IP Elástica: http://3.139.232.5:5000/login
  login: `${API_URL}/login`,
  register: `${API_URL}/register`,
  shop: `${API_URL}/shop`,
  perfil: `${API_URL}/perfil`,
  carrito: `${API_URL}/carrito`,
  pagar: `${API_URL}/pagar`,
  favorito: `${API_URL}/favorito`,
  admin: `${API_URL}/admin`,
  usersManagement: `${API_URL}/users`,
  ordersManagement: `${API_URL}/orders`,
  productManagement: `${API_URL}/products`,
  reportAnalyze: `${API_URL}/report`,
  notifications: `${API_URL}/notifications`,
  updatePassword: `${API_URL}/update-password`,

};