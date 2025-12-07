import React, { useState } from "react";
import ProgressBar from "./ProgressBar";
import "./RegisterForm.css";
import { Footer } from "../../Layout/footer/Footer";
import axios from "axios";
import Swal from "sweetalert2";

// URL del backend
const API_BASE_URL = import.meta.env.VITE_API_URL;

const RegisterForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  const [isLoading, setIsLoading] = useState(false);

  // Mensajes
  const [message, setMessage] = useState({ text: "", type: "" });

  // Mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefono: "",
    fecha_nacimiento: "",
    genero: "",
    direccion: "",
    ciudad: "",
    estado_provincia: "",
    codigo_postal: "",
    pais: "",
    tipo_direccion: "casa",
    referral: "",
    terms: false,
    newsletter: false,
  });

  // Mostrar mensajes
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  // 🚨 FUNCIÓN QUE FALTABA (ROMPÍA TODO)
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Cambiar pasos
  const goToStep = (step) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step);
    }
  };

  // Enviar datos
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.terms) {
      showMessage("Debes aceptar los términos y condiciones.", "error");
      return;
    }

    setIsLoading(true);

    try {
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

      console.log("Registro exitoso:", response.data);
      Swal.fire("¡Cuenta creada exitosamente!", "Redirigiendo al login...", "success");

      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error en registro:", error);

      if (error.response) {
        showMessage(
          error.response.data.message || "Error al registrar la cuenta",
          "error"
        );
      } else if (error.request) {
        showMessage("No se pudo conectar al servidor.", "error");
      } else {
        showMessage("Error interno.", "error");
      }

      Swal.fire("Error al crear la cuenta", "Intenta nuevamente.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ======================================
  //               RENDER
  // ======================================

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
            <div className={`message ${message.type}`}>{message.text}</div>
          )}

          {/* ============================
              PASO 1
          ============================ */}
          <div className={`form-step ${currentStep === 1 ? "active" : ""}`}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="apellido">Apellidos</label>
                <input
                  type="text"
                  id="apellido"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type={showPassword.password ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("password")}
                >
                  👁️
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                <input
                  type={showPassword.confirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                />
                <span
                  className="password-toggle"
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                >
                  👁️
                </span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="fecha_nacimiento">Fecha de nacimiento</label>
              <input
                type="date"
                id="fecha_nacimiento"
                name="fecha_nacimiento"
                value={formData.fecha_nacimiento}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-next" onClick={() => goToStep(2)}>
                Siguiente →
              </button>
            </div>
          </div>

          {/* ============================
              PASO 2
          ============================ */}
          <div className={`form-step ${currentStep === 2 ? "active" : ""}`}>
            <div className="form-group">
              <label htmlFor="direccion">Dirección</label>
              <input
                type="text"
                id="direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="ciudad">Ciudad</label>
                <input
                  type="text"
                  id="ciudad"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="estado_provincia">Estado/Provincia</label>
                <input
                  type="text"
                  id="estado_provincia"
                  name="estado_provincia"
                  value={formData.estado_provincia}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-prev" onClick={() => goToStep(1)}>
                ← Anterior
              </button>

              <button type="button" className="btn-next" onClick={() => goToStep(3)}>
                Siguiente →
              </button>
            </div>
          </div>

          {/* ============================
              PASO 3
          ============================ */}
          <div className={`form-step ${currentStep === 3 ? "active" : ""}`}>
            <div className="form-group">
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleInputChange}
                required
              />
              <label htmlFor="terms">
                Acepto los <a href="#">Términos y Condiciones</a>
              </label>
            </div>

            <div className="form-buttons">
              <button type="button" className="btn-prev" onClick={() => goToStep(2)}>
                ← Anterior
              </button>

              <button type="submit" className="btn-register" disabled={isLoading}>
                {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default RegisterForm;

