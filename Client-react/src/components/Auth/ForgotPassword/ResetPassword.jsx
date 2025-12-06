import React, { useState } from 'react';
import axios from 'axios';
import './ForgotPassword.css';

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL; 

const ResetPassword = ({ email, onBackToLogin, onBackToForgot }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleCodeChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 5) {
        document.getElementById(`code-${index + 1}`).focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`).focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setMessage({ text: 'Por favor, ingresa el código de 6 dígitos', type: 'error' });
      return;
    }
    if (!newPassword || !confirmPassword) {
      setMessage({ text: 'Por favor, completa todos los campos', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ text: 'La contraseña debe tener al menos 6 caracteres', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 🚨 2. REEMPLAZO: Usar API_BASE_URL en lugar de localhost
      const res = await axios.post(`${API_BASE_URL}/reset_password`, {
        email,
        codigo: verificationCode,
        new_password: newPassword,
      });

      if (res.status === 200) {
        setMessage({ text: '¡Contraseña restablecida exitosamente!', type: 'success' });
        setTimeout(() => onBackToLogin(), 2000);
      } else {
        setMessage({ text: 'Error al restablecer la contraseña.', type: 'error' });
      }

    } catch (error) {
      console.error('Error en reset:', error);
      setMessage({
        text: error.response?.data?.error || 'Código inválido o error al restablecer la contraseña',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };
  // ... (el resto del componente de renderizado que no has incluido)

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="forgot-password-header">
          <h2>Restablecer Contraseña</h2>
          <p>Ingresa el código enviado a <strong>{email}</strong></p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Código de Verificación</label>
            <div className="code-inputs">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="code-input"
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">Nueva Contraseña</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nueva contraseña"
                required
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
              </span>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              className="form-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmar nueva contraseña"
              required
            />
          </div>

          <button type="submit" className="btn-submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Restableciendo...
              </>
            ) : (
              <>
                <i className="fas fa-lock"></i> Restablecer Contraseña
              </>
            )}
          </button>
        </form>

        <div className="forgot-password-footer">
          <p>
            ¿No recibiste el código?{' '}
            <button type="button" className="btn-link" onClick={onBackToForgot}>
              Reenviar código
            </button>
          </p>
          <button type="button" className="btn-back" onClick={onBackToLogin}>
            <i className="fas fa-arrow-left"></i> Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
