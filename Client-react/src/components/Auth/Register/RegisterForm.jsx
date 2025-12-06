import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import "./RegisterForm.css";
import { Footer } from "../../Layout/footer/Footer";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ IMPORTANTE

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
    const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    fecha_nacimiento: '',
    genero: '',
    direccion: '',
    ciudad: '',
    estado_provincia: '',
    codigo_postal: '',
    pais: '',
    tipo_direccion: 'casa',
    referral: '',
    terms: false,
    newsletter: false
  });

// ... (Resto del código del componente)

  //  CORREGIDO: Manejo de submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) {
      showMessage('Debes aceptar los términos y condiciones.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      // 🚨 2. REEMPLAZO: Usar API_BASE_URL en lugar de la URL estática
      const response = await axios.post(`${API_BASE_URL}/Signup`, {
        Nombre: formData.nombre,
        Apellido: formData.apellido,
        Email: formData.email,
        Password: formData.password,
        Telefono: formData.telefono,
        Fecha_nacimiento: formData.fecha_nacimiento,
        Genero: formData.genero,
        Direccion: formData.direccion,
        Ciudad: formData.ciudad,
        Estado_provincia: formData.estado_provincia,
        Codigo_postal: formData.codigo_postal,
        Pais: formData.pais,
        Tipo_direccion: formData.tipo_direccion,
      });
      console.log(" Registro exitoso:", response.data);
      Swal.fire("¡Cuenta creada exitosamente!", "Redirigiendo al login...", "success");

      //  Redirigir después del éxito
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

    } catch (error) {
      console.error(" Error en registro:", error);

      if (error.response) {
        console.error(" Respuesta del servidor:", error.response.data);
        console.error(" Código de estado:", error.response.status);
      } else if (error.request) {
        console.error(" No hubo respuesta del servidor:", error.request);
      } else {
        console.error(" Error al configurar la solicitud:", error.message);
      }

      Swal.fire("Error al crear la cuenta", "Intenta nuevamente.", "error");
    }finally{
      setIsLoading(false);
    }
  };


  return (
    <div className="">
      <header>
        <div className="logo">Fashion Luxe</div>
      </header>
      <br /><br /><br /><br /><br /><br />
      <div className="register-form-container">
        <div className="register-header">
          <h2>Únete a Fashion Luxe</h2>
          <p>Crea tu cuenta para disfrutar de una experiencia de compra personalizada</p>
        </div>
        <br />
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        
        <form className="register-form" onSubmit={handleSubmit}>
          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}
          
          {/* Paso 1: Información Personal */}
          <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  className="form-input"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="apellido">Apellidos</label>
                <input
                  type="text"
                  className="form-input"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  placeholder="Tus apellidos"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                className="form-input"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="tu@email.com"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="password">Contraseña</label>
                <input
                  type={showPassword.password ? "text" : "password"}
                  className="form-input"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Tu contraseña"
                  required
                />
                <span 
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('password')}
                >
                  <i className={`fas fa-eye${showPassword.password ? '-slash' : ''}`}></i>
                </span>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  className="form-input"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Repite tu contraseña"
                  required
                />
                <span 
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  <i className={`fas fa-eye${showPassword.confirmPassword ? '-slash' : ''}`}></i>
                </span>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                className="form-input"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                placeholder="Tu número de teléfono"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
              <input
                type="date"
                className="form-input"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Género</label>
              <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                {['masculino', 'femenino', 'otro'].map(gender => (
                  <label key={gender} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <input
                      type="radio"
                      name="genero"
                      value={gender}
                      checked={formData.genero === gender}
                      onChange={handleInputChange}
                    />
                    {gender === 'masculino' ? 'Hombre' : gender === 'femenino' ? 'Mujer' : 'Otro'}
                  </label>
                ))}
              </div>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="btn-next" onClick={() => goToStep(2)}>
                Siguiente <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
          
          {/* Paso 2: Dirección */}
          <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
            <div className="form-group">
              <label className="form-label" htmlFor="direccion">Dirección</label>
              <input
                type="text"
                className="form-input"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                placeholder="Calle y número"
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="ciudad">Ciudad</label>
                <input
                  type="text"
                  className="form-input"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                  placeholder="Tu ciudad"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="estado_provincia">Estado/Provincia</label>
                <input
                  type="text"
                  className="form-input"
                  id="estado_provincia"
                  name="estado_provincia"
                  value={formData.estado_provincia}
                  onChange={handleInputChange}
                  placeholder="Tu estado o provincia"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label" htmlFor="codigo_postal">Código Postal</label>
                <input
                  type="text"
                  className="form-input"
                  id="codigo_postal"
                  name="codigo_postal"
                  value={formData.codigo_postal}
                  onChange={handleInputChange}
                  placeholder="Código postal"
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="pais">País</label>
                <select
                  className="form-input"
                  id="pais"
                  name="pais"
                  value={formData.pais}
                  onChange={handleInputChange}
                >
                  <option value="">Selecciona tu país</option>
                  <option value="México">México</option>
                  <option value="España">España</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Estados Unidos">Estados Unidos</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label" htmlFor="tipo_direccion">Tipo de dirección</label>
              <select
                className="form-input"
                id="tipo_direccion"
                name="tipo_direccion"
                value={formData.tipo_direccion}
                onChange={handleInputChange}
              >
                <option value="casa">Casa</option>
                <option value="oficina">Oficina</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="btn-prev" onClick={() => goToStep(1)}>
                <i className="fas fa-arrow-left"></i> Anterior
              </button>
              <button type="button" className="btn-next" onClick={() => goToStep(3)}>
                Siguiente <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
          
          {/* Paso 3: Terminos y condiciones */}
          <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
            
            <div className="terms-conditions">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="terms">Acepto los <a href="#">Términos y Condiciones</a> y la <a href="#">Política de Privacidad</a></label>
            </div>
            
            <div className="terms-conditions">
              <input
                type="checkbox"
                id="newsletter"
                name="newsletter"
                checked={formData.newsletter}
                onChange={handleInputChange}
              />
              <label htmlFor="newsletter">Deseo recibir ofertas exclusivas y novedades por correo electrónico</label>
            </div>
            
            <div className="form-buttons">
              <button type="button" className="btn-prev" onClick={() => goToStep(2)}>
                <i className="fas fa-arrow-left"></i> Anterior
              </button>
              <button type="submit" className="btn-register" disabled={isLoading}>
                {isLoading ?(
                  <>
                  <i className="fas fa-user-plus"></i> Creando Cuenta...
                  </>
                ):(
                  <>
                <i className="fas fa-user-plus"></i> Crear Cuenta
               </> )}

              </button>
            </div>
          </div>
        </form>
      </div>
      <br />
      <Footer />
    </div>
  );
};

export default RegisterForm;