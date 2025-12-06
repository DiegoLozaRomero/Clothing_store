import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import './SocialLogin.css';
import axios from 'axios';

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

const SocialLogin = () => {
  // ✅ Cuando el login con Google es exitoso
  const handleGoogleSuccess = async (response) => {
    console.log('✅ Google Success:', response);
    await sendTokenToBackend('google', response.credential);
  };

  // ❌ Si falla
  const handleGoogleError = () => {
    alert('Error al iniciar sesión con Google');
  };

  // ✅ Facebook login
  const handleFacebookResponse = async (response) => {
    console.log('✅ Facebook Success:', response);
    if (response.accessToken) {
      await sendTokenToBackend('facebook', response.accessToken);
    } else {
      alert('Error al iniciar sesión con Facebook');
    }
  };

  // 🔹 Enviar el token a tu backend Flask
  const sendTokenToBackend = async (provider, token) => {
    try {
      // 🚨 2. REEMPLAZO: Usar API_BASE_URL en lugar de la URL estática
      const res = await axios.post(`${API_BASE_URL}/social_login`, {
        provider,
        token,
      });
      console.log('Backend response:', res.data);
      alert(`Bienvenido, ${res.data.user?.Nombre || 'usuario'}`);
    } catch (error) {
      console.error('Error al iniciar sesión social:', error);
      alert('Error al autenticar con el servidor');
    }
  };

  return (
    <div className="social-login-container">
      <h5>O inicia sesión con:</h5>

      {/* BOTÓN GOOGLE */}
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />

      {/* BOTÓN FACEBOOK */}
      <FacebookLogin
        appId="TU_FACEBOOK_APP_ID"
        onSuccess={handleFacebookResponse}
        onFail={(err) => console.error('Facebook Error:', err)}
      />
    </div>
  );
};

export default SocialLogin;