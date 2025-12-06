import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';
import Swal from 'sweetalert2';

// 🚨 AÑADIR ESTA LÍNEA para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL; 

const ForgotPassword = ({ onBackToLogin, onShowResetPassword }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage({ text: 'Por favor, ingresa tu correo electrónico', type: 'error' });
      return;
    }

    if (!isValidEmail(email)) {
      setMessage({ text: 'Por favor, ingresa un correo electrónico válido', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 🚨 REEMPLAZO: Usar la variable API_BASE_URL en lugar de la URL estática
      const response = await axios.post(`${API_BASE_URL}/forgot_password`, {
        email: email
      });

      if (response.data.status === "success") {
        Swal.fire("¡Enlace enviado!", "Revisa tu correo para continuar con el proceso.", "success");
        setTimeout(() => {
          onShowResetPassword(email);
        }, 3000);
      } else {
        Swal.fire("Error", response.data.message || "No se pudo enviar el correo.", "error");
      }

    } catch (error) {
      console.error(" Error al enviar el enlace:", error);
      Swal.fire("Error", "Ocurrió un error al enviar el correo. Intenta nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>Recuperar Contraseña</h2>
          <p>Te enviaremos un enlace para restablecer tu contraseña</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>{message.text}</div>
        )}

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Enviando...
              </>
            ) : (
              <>
                <i className="fas fa-paper-plane"></i> Enviar Enlace
              </>
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <button type="button" className="btn-back" onClick={onBackToLogin}>
            <i className="fas fa-arrow-left"></i> Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
