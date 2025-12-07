import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginForm.css';
import { Footer } from '../../Layout/footer/Footer';
import axios from 'axios';
import ForgotPassword from '../ForgotPassword/ForgotPassword';
import ResetPassword from '../ForgotPassword/ResetPassword';

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: '' });

    const [currentView, setCurrentView] = useState('login');
    const [userEmail, setUserEmail] = useState('');

    const navigate = useNavigate();

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const showMessage = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
    };

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !password) return showMessage('Por favor, completa todos los campos', 'error');
        if (!isValidEmail(email)) return showMessage('Correo electrónico inválido', 'error');

        setIsLoading(true);
        try {
            // 🚨 2. REEMPLAZO: Usar API_BASE_URL en lugar de localhost
            const response = await axios.post(`${API_BASE_URL}/login`, {
                Email: email,
                Password: password,
            });

            console.log('✅ Respuesta COMPLETA del servidor:', response.data);

            const { message, user } = response.data;

            if (!user) {
                showMessage('Respuesta inesperada del servidor.', 'error');
                return;
            }
      // MOSTRAR TODOS LOS CAMPOS DISPONIBLES PARA DEBUG
      console.log(' Campos disponibles en user:', Object.keys(user));
      
      // Preparar datos del usuario con todos los campos que necesitas
      const userData = {
        // Datos básicos
        id: user.id,
        nombre: user.Nombre,
        email: user.Email,
        tipo: user.Tipo,
        fecha_creacion: user.Fecha_creacion,
        loginTime: new Date().toISOString(),
        
        // Campos que pueden venir de User (si es cliente)
        apellido: user.Apellido || '',
        telefono: user.Telefono || '',
        fecha_nacimiento: user.Fecha_nacimiento || '',
        genero: user.Genero || '',
        
        // Campos de dirección
        direccion: user.Direccion || '',
        ciudad: user.Ciudad || '',
        estado_provincia: user.Estado_provincia || '',
        codigo_postal: user.Codigo_postal || '',
        pais: user.Pais || '',
        tipo_direccion: user.Tipo_direccion || '',
        
        // Estado
        activo: user.Activo !== undefined ? user.Activo : true,
        
        // Rol (para admins)
        rol: user.Rol || 'usuario'
      };

      console.log('📋 UserData completo para almacenar:', userData);

      // Guardar usuario en localStorage
      localStorage.setItem('user', JSON.stringify(userData));

      showMessage(message || '¡Inicio de sesión exitoso!', 'success');

      // Redirigir según tipo de usuario
      setTimeout(() => {
        const userType = (userData.tipo || '').toLowerCase().trim();
        const userRole = (userData.rol || '').toLowerCase().trim();

        const adminRoles = ['admin', 'administrador', 'administrator', 'superadmin', 'super user'];

        if (userType === 'admin' || adminRoles.includes(userRole)) {
          console.log(' Redirigiendo a panel de ADMIN');
          navigate('/Admin', { replace: true });
        } else {
          console.log(' Redirigiendo a SHOP');
          navigate('/Shop', { replace: true });
        }
      }, 1500);

    } catch (error) {
      console.error('❌ Error en login:', error);
      console.error('Detalles del error:', error.response?.data);

      if (error.response?.status === 401)
        showMessage('Email o contraseña incorrectos', 'error');
      else if (error.response?.status === 404)
        showMessage('Usuario no encontrado', 'error');
      else if (error.code === 'NETWORK_ERROR')
        showMessage('Error de conexión. Verifica tu internet.', 'error');
      else
        showMessage('Error al iniciar sesión. Intenta nuevamente.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider) =>
    showMessage(`Iniciando sesión con ${provider}...`, 'success');

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setCurrentView('forgot');
  };

  const handleForgotPasswordSubmit = (email) => {
    setUserEmail(email);
    setCurrentView('reset');
  };

  const handleBackToLogin = () => {
    setCurrentView('login');
    setUserEmail('');
  };

  const handleBackToForgot = () => setCurrentView('forgot');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'forgot':
        return (
          <ForgotPassword
            onBackToLogin={handleBackToLogin}
            onShowResetPassword={handleForgotPasswordSubmit}
          />
        );
      case 'reset':
        return (
          <ResetPassword
            email={userEmail}
            onBackToLogin={handleBackToLogin}
            onBackToForgot={handleBackToForgot}
          />
        );
      case 'login':
      default:
        return renderLoginForm();
    }
  };

  const renderLoginForm = () => (
    <div className="login-form-container">
      <div className="login-header">
        <h2>Bienvenido de nuevo</h2>
        <p>Ingresa a tu cuenta para continuar</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            className="form-input"
            id="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">Contraseña</label>
          <div className="password-input-container">
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              id="password"
              placeholder="Tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span className="password-toggle" onClick={togglePasswordVisibility}>
              <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
            </span>
          </div>
        </div>

        <div className="remember-forgot">
          <div className="remember-me">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <label htmlFor="remember">Recordarme</label>
          </div>
          <a href="#" className="forgot-password-link" onClick={handleForgotPassword}>
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button type="submit" className="btn-login" disabled={isLoading}>
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i> Iniciando sesión...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i> Iniciar Sesión
            </>
          )}
        </button>

        <div className="social-login">
          <p>O inicia sesión con</p>
          <div className="social-buttons">
            <div className="social-btn google" onClick={() => handleSocialLogin('Google')}>
              <i className="fab fa-google"></i>
            </div>
            <div className="social-btn facebook" onClick={() => handleSocialLogin('Facebook')}>
              <i className="fab fa-facebook-f"></i>
            </div>
            <div className="social-btn twitter" onClick={() => handleSocialLogin('Twitter')}>
              <i className="fab fa-twitter"></i>
            </div>
          </div>
        </div>

        <div className="signup-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate aquí</Link>
        </div>
      </form>
    </div>
  );

  return (
    <div className="login-page">
      <header>
        <div className="logo">Fashion Luxe</div>
      </header>
      <br /><br /><br />

      <div className="login-container">
        {alert.show && (
          <div className={`alert alert-${alert.type}`}>
            {alert.message}
          </div>
        )}
        {renderCurrentView()}
      </div>

      <Footer />
    </div>
  );
}

export default LoginForm;
