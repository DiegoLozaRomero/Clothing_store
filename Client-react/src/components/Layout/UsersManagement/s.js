import { useState, useEffect } from "react";
import { Header, Mi_Cuenta } from "../../Layout/header/Header";
import { Footer } from "../../Layout/footer/Footer";
import { FloatingWhatsApp } from "../../FloatingWhatsApp/FloatingWhatsApp";
import LogoutLink from "../../Auth/logout/LogoutLink";
import "./Perfil.css";

import "react-profile/themes/default";
import { openEditor } from "react-profile";

import axios from "axios";
import Swal from "sweetalert2";

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [activeSection, setActiveSection] = useState("personal");

// Direcciones del usuario desde la API
const [addresses, setAddresses] = useState([]);

const fetchAddresses = async () => {
  if (!user?.id) return;
  try {
    // 🚨 2. REEMPLAZO en fetchAddresses
    const res = await axios.get(`${API_BASE_URL}/user/${user.id}/addresses`);
    if (res.data.direcciones && res.data.direcciones.length > 0) {
      const mapped = res.data.direcciones.map((addr) => ({
        id: addr.id,
        street: addr.direccion,
        city: addr.ciudad,
        state: addr.estado_provincia,
        zip: addr.codigo_postal,
        country: addr.pais,
        tipo: addr.tipo_direccion,
        isDefault: addr.principal === 1 || addr.principal === true,
      }));
      setAddresses(mapped);
    } else {
      setAddresses([]);
    }
  } catch (error) {
    console.error("Error al cargar direcciones:", error);
  }
};
// Luego el useEffect solo la llama
useEffect(() => {
  if (user?.id) fetchAddresses();
}, [user]);



  // 🔹 Cargar datos del usuario desde localStorage y normalizar campos
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);

      const normalizedUser = {
        id: parsedUser.id || parsedUser.ID || parsedUser.Id || "",
        Nombre: parsedUser.Nombre || parsedUser.nombre || parsedUser.name || "",
        Apellido:
          parsedUser.Apellido || parsedUser.apellido || parsedUser.lastname || "",
        Email: parsedUser.Email || parsedUser.email || "",
        Password: parsedUser.Password || parsedUser.password || "",
        Telefono: parsedUser.Telefono || parsedUser.telefono || parsedUser.phone || "",
        Genero: parsedUser.Genero || parsedUser.genero || "",
        Direccion:
          parsedUser.Direccion || parsedUser.direccion || parsedUser.address || "",
        Ciudad: parsedUser.Ciudad || parsedUser.ciudad || parsedUser.city || "",
        Estado_provincia:
          parsedUser.Estado_provincia ||
          parsedUser.estado_provincia ||
          parsedUser.state ||
          "",
        Codigo_postal:
          parsedUser.Codigo_postal ||
          parsedUser.codigo_postal ||
          parsedUser.zip ||
          "",
        Pais: parsedUser.Pais || parsedUser.pais || parsedUser.country || "",
        Tipo_direccion:
          parsedUser.Tipo_direccion || parsedUser.tipo_direccion || "",
        Fecha_creacion:
          parsedUser.Fecha_creacion || parsedUser.fecha_creacion || parsedUser.created_at || "",
        // conserva posibles campos originales por si los necesitas
        raw: parsedUser,
      };

      setUser(normalizedUser);
    }
  }, []);

  // 🔹 Manejar cambios en inputs (usa las keys normalizadas: Nombre, Apellido, Email...)
  const handleChange = (e) => {
    const { id, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

const setAsDefault = async (addressId) => {
  if (!user?.id) return;

  if (!window.confirm("¿Establecer esta dirección como principal?")) return;

  try {
    // 🚨 3. REEMPLAZO en setAsDefault
    const res = await axios.put(`${API_BASE_URL}/address/${addressId}/set_default`, {
      user_id: user.id,
    });

    if (res.data.status === "success") {
      const updated = addresses.map((a) => ({
        ...a,
        isDefault: a.id === addressId,
      }));
      setAddresses(updated);
      alert("Dirección establecida como principal");
    } else {
      alert(res.data.message || "No se pudo cambiar la dirección principal");
    }
  } catch (error) {
    console.error("Error al cambiar dirección principal:", error);
  }
};


const deleteAddress = async (addressId) => {
  if (!window.confirm("¿Eliminar esta dirección?")) return;

  try {
    // 🚨 4. REEMPLAZO en deleteAddress
    const res = await axios.delete(`${API_BASE_URL}/address/${addressId}`, {
      headers: { "Content-Type": "application/json" },
    });

    if (res.data.status === "success") {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      Swal.fire({
        icon: "success",
        title: "Dirección eliminada",
        text: "Se eliminó correctamente",
        confirmButtonColor: "#6366F1",
        background: "#1E1E2F",
        color: "#FFF",
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: res.data.message || "No se pudo eliminar la dirección",
        confirmButtonColor: "#6366F1",
        background: "#1E1E2F",
        color: "#FFF",
      });
    }
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: error.response?.data?.error || "No se pudo eliminar la dirección",
      confirmButtonColor: "#6366F1",
      background: "#1E1E2F",
      color: "#FFF",
    });
  }
};




const addNewAddress = async () => {
  if (!user?.id) {
    Swal.fire({
      icon: "error",
      title: "Usuario no identificado",
      text: "Inicia sesión antes de agregar una dirección.",
      confirmButtonColor: "#4F46E5",
      background: "#1E1E2F",
      color: "#FFF",
    });
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: "<h3 style='color:#FFF; font-weight:600;'>Agregar Nueva Dirección</h3>",
    html: `
      <style>
        .swal2-input, .swal2-select {
          background: #2B2B3D !important;
          color: #F1F1F1 !important;
          border: 1px solid #3E3E4E !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          padding: 10px 12px !important;
          width: 100% !important;
          margin-bottom: 10px !important;
        }
        .swal2-input:focus, .swal2-select:focus {
          outline: none !important;
          border-color: #6366F1 !important;
          box-shadow: 0 0 6px #6366F1 !important;
        }
        .swal2-label {
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
          color: #D1D5DB;
          font-size: 13px;
        }
        .swal2-checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          color: #E5E7EB;
        }
      </style>

      <div style="text-align:left;">
        <label class="swal2-label"><i class="fas fa-road"></i> Calle y número:</label>
        <input id="swal-direccion" class="swal2-input" placeholder="Ej: Av. Reforma 123">

        <label class="swal2-label"><i class="fas fa-city"></i> Ciudad:</label>
        <input id="swal-ciudad" class="swal2-input" placeholder="Ej: Monterrey">

        <label class="swal2-label"><i class="fas fa-map"></i> Estado o provincia:</label>
        <input id="swal-estado" class="swal2-input" placeholder="Ej: Nuevo León">

        <label class="swal2-label"><i class="fas fa-mail-bulk"></i> Código postal:</label>
        <input id="swal-cp" class="swal2-input" placeholder="Ej: 64000">

        <label class="swal2-label"><i class="fas fa-flag"></i> País:</label>
        <input id="swal-pais" class="swal2-input" placeholder="Ej: México">

        <label class="swal2-label"><i class="fas fa-home"></i> Tipo de dirección:</label>
        <select id="swal-tipo" class="swal2-select">
          <option value="Casa">Casa</option>
          <option value="Oficina">Oficina</option>
          <option value="Otro">Otro</option>
        </select>

        <div class="swal2-checkbox-row">
          <input type="checkbox" id="swal-principal">
          <label for="swal-principal">Establecer como dirección principal</label>
        </div>
      </div>
    `,
    background: "#1E1E2F",
    color: "#FFF",
    showCancelButton: true,
    confirmButtonText: "<i class='fas fa-save'></i> Guardar",
    cancelButtonText: "<i class='fas fa-times'></i> Cancelar",
    confirmButtonColor: "#6366F1",
    cancelButtonColor: "#6B7280",
    width: "500px",
    padding: "25px",
    preConfirm: () => {
      const direccion = document.getElementById("swal-direccion").value.trim();
      const ciudad = document.getElementById("swal-ciudad").value.trim();
      const estado_provincia = document.getElementById("swal-estado").value.trim();
      const codigo_postal = document.getElementById("swal-cp").value.trim();
      const pais = document.getElementById("swal-pais").value.trim();
      const tipo_direccion = document.getElementById("swal-tipo").value;
      const principal = document.getElementById("swal-principal").checked;

      if (!direccion || !ciudad) {
        Swal.showValidationMessage("La dirección y la ciudad son obligatorias.");
        return false;
      }

      return {
        direccion,
        ciudad,
        estado_provincia,
        codigo_postal,
        pais,
        tipo_direccion,
        principal,
      };
    },
  });

  if (!formValues) return;

  try {
    const newAddress = {
      user_id: user.id,
      ...formValues,
    };

    // 🚨 5. REEMPLAZO en addNewAddress
    const res = await axios.post(`${API_BASE_URL}/address`, newAddress, {
      headers: { "Content-Type": "application/json" },
    });
// Cuando agregas una nueva dirección
if (res.data.status === "success") {
  const nueva = {
    id: res.data.address.id,
    street: res.data.address.direccion,
    city: res.data.address.ciudad,
    state: res.data.address.estado_provincia,
    zip: res.data.address.codigo_postal,
    country: res.data.address.pais,
    tipo: res.data.address.tipo_direccion,
    isDefault: res.data.address.principal === 1 || res.data.address.principal === true,
  };

  setAddresses((prev) => {
    if (nueva.isDefault) {
      // Si esta nueva es principal, las demás ya no lo son
      return prev.map((a) => ({ ...a, isDefault: false })).concat(nueva);
    } else {
      return [...prev, nueva];
    }
  });

  Swal.fire({
    icon: "success",
    title: "¡Dirección guardada!",
    text: "La nueva dirección se ha agregado correctamente.",
    confirmButtonColor: "#6366F1",
    background: "#1E1E2F",
    color: "#FFF",
  });
}
 else {
      Swal.fire({
        icon: "warning",
        title: "Aviso",
        text: res.data.message || "Error al agregar la dirección.",
        confirmButtonColor: "#6366F1",
        background: "#1E1E2F",
        color: "#FFF",
      });
    }
  } catch (error) {
    console.error("Error al agregar dirección:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "No se pudo agregar la dirección.",
      confirmButtonColor: "#EF4444",
      background: "#1E1E2F",
      color: "#FFF",
    });
  }
};



const editAddress = async (addressId) => {
  const address = addresses.find((a) => a.id === addressId);
  if (!address) return;

  const { value: formValues } = await Swal.fire({
    title: `<h3 style="color:#FFF; font-weight:600;">Editar Dirección</h3>`,
    html: `
      <style>
        .swal2-input, .swal2-select {
          background: #2B2B3D !important;
          color: #F1F1F1 !important;
          border: 1px solid #3E3E4E !important;
          border-radius: 8px !important;
          font-size: 14px !important;
          padding: 10px 12px !important;
          width: 100% !important;
          margin-bottom: 10px !important;
        }
        .swal2-input:focus, .swal2-select:focus {
          outline: none !important;
          border-color: #6366F1 !important;
          box-shadow: 0 0 6px #6366F1 !important;
        }
        .swal2-label {
          display: block;
          margin-bottom: 4px;
          font-weight: 600;
          color: #D1D5DB;
          font-size: 13px;
        }
        .swal2-checkbox-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          color: #E5E7EB;
        }
      </style>

      <div style="text-align:left;">
        <label class="swal2-label"><i class="fas fa-map-marker-alt"></i> Nombre de la dirección:</label>
        <input id="swal-name" class="swal2-input" value="${address.name || ""}" placeholder="Ej: Casa Principal">

        <label class="swal2-label"><i class="fas fa-road"></i> Calle y número:</label>
        <input id="swal-street" class="swal2-input" value="${address.street || ""}" placeholder="Ej: Av. Reforma 123">

        <label class="swal2-label"><i class="fas fa-home"></i> Colonia:</label>
        <input id="swal-colonia" class="swal2-input" value="${address.colonia || ""}" placeholder="Ej: Centro">

        <label class="swal2-label"><i class="fas fa-city"></i> Ciudad:</label>
        <input id="swal-city" class="swal2-input" value="${address.city || ""}" placeholder="Ej: Monterrey">

        <label class="swal2-label"><i class="fas fa-map"></i> Estado:</label>
        <input id="swal-state" class="swal2-input" value="${address.state || ""}" placeholder="Ej: Nuevo León">

        <label class="swal2-label"><i class="fas fa-mail-bulk"></i> Código postal:</label>
        <input id="swal-zip" class="swal2-input" value="${address.zip || ""}" placeholder="Ej: 64000">

        <label class="swal2-label"><i class="fas fa-phone"></i> Teléfono:</label>
        <input id="swal-phone" class="swal2-input" value="${address.phone || ""}" placeholder="Ej: 8123456789">

        <label class="swal2-label"><i class="fas fa-sticky-note"></i> Instrucciones de entrega:</label>
        <input id="swal-instructions" class="swal2-input" value="${address.instructions || ""}" placeholder="Ej: Tocar timbre dos veces">

        <div class="swal2-checkbox-row">
          <input type="checkbox" id="swal-default" ${address.isDefault ? "checked" : ""}>
          <label for="swal-default">Establecer como dirección principal</label>
        </div>
      </div>
    `,
    background: "#1E1E2F",
    color: "#FFF",
    showCancelButton: true,
    confirmButtonText: "<i class='fas fa-save'></i> Guardar cambios",
    cancelButtonText: "<i class='fas fa-times'></i> Cancelar",
    confirmButtonColor: "#6366F1",
    cancelButtonColor: "#6B7280",
    width: "520px",
    padding: "25px",
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById("swal-name").value.trim();
      const street = document.getElementById("swal-street").value.trim();
      const colonia = document.getElementById("swal-colonia").value.trim();
      const city = document.getElementById("swal-city").value.trim();
      const state = document.getElementById("swal-state").value.trim();
      const zip = document.getElementById("swal-zip").value.trim();
      const phone = document.getElementById("swal-phone").value.trim();
      const instructions = document.getElementById("swal-instructions").value.trim();
      const isDefault = document.getElementById("swal-default").checked;

      if (!name || !street || !city) {
        Swal.showValidationMessage("Los campos 'nombre', 'calle' y 'ciudad' son obligatorios.");
        return false;
      }

      return { name, street, colonia, city, state, zip, phone, instructions, isDefault };
    },
  });

  if (!formValues) return;

const updatedAddresses = addresses.map((addr) =>
  addr.id === addressId
    ? { ...addr, ...formValues }
    : { ...addr, isDefault: formValues.isDefault ? false : addr.isDefault }
);

if (formValues.isDefault) {
  // Si se marcó como principal, desactiva las demás
  setAddresses(
    updatedAddresses.map((a) => ({
      ...a,
      isDefault: a.id === addressId,
    }))
  );
} else {
  setAddresses(updatedAddresses);
}


  Swal.fire({
    icon: "success",
    title: "¡Dirección actualizada!",
    text: "Los cambios se guardaron correctamente.",
    confirmButtonColor: "#6366F1",
    background: "#1E1E2F",
    color: "#FFF",
    showClass: {
      popup: "animate__animated animate__fadeInUp animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown animate__faster",
    },
  });
};


  // 🔹 Enviar actualización al backend Flask
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    Swal.fire({
      title: "Actualizando...",
      text: "Por favor espera un momento",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      // aquí mandamos el objeto user normalizado (con campos Nombre, Apellido, Email, etc.)
      // 🚨 6. REEMPLAZO en handleSubmit
      const res = await axios.put(`${API_BASE_URL}/UpdateUser`, user, {
        headers: { "Content-Type": "application/json" },
      });
      Swal.close();

      if (res.data.status === "success") {
          await fetchAddresses(); // 🔁 recarga las direcciones del usuario
        Swal.fire({
          title: "Datos actualizados",
          html: `
            <div style="text-align: center; padding: 10px;">
              <i class="fas fa-check-circle" style="font-size: 50px; color: #28a745; margin-bottom: 15px;"></i>
              <p style="font-size: 16px;">${res.data.message}</p>
            </div>
          `,
          confirmButtonColor: "#3085d6",
          background: "#f9f9f9",
          width: "450px",
        });

        // Actualiza localStorage y estado con la respuesta del backend (si viene user en la respuesta)
        const updatedUser = res.data.user
          ? {
              ...res.data.user,
              // por si backend devuelve en minúsculas, siempre normalizamos
              Nombre: res.data.user.Nombre || res.data.user.nombre || res.data.user.name || user.Nombre,
              Apellido: res.data.user.Apellido || res.data.user.apellido || user.Apellido,
              Email: res.data.user.Email || res.data.user.email || user.Email,
              Telefono: res.data.user.Telefono || res.data.user.telefono || user.Telefono,
              Direccion: res.data.user.Direccion || res.data.user.direccion || user.Direccion,
              Ciudad: res.data.user.Ciudad || res.data.user.ciudad || user.Ciudad,
              Fecha_creacion: res.data.user.Fecha_creacion || res.data.user.fecha_creacion || user.Fecha_creacion,
            }
          : user;

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));

      } else {
        // Si backend responde con otro status, mostrar mensaje
        Swal.fire({
          title: "Aviso",
          html: `<div style="text-align:center"><p>${res.data.message || "Respuesta inesperada"}</p></div>`,
          confirmButtonColor: "#3085d6",
          background: "#f9f9f9",
        });
      }
    } catch (error) {
      Swal.close();
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 10px;">
            <i class="fas fa-times-circle" style="font-size: 50px; color: #e74c3c; margin-bottom: 15px;"></i>
            <p style="font-size: 16px;">${
              error.response?.data?.error ||
              error.response?.data?.message ||
              "No se pudo actualizar el usuario."
            }</p>
          </div>
        `,
        confirmButtonColor: "#3085d6",
        background: "#f9f9f9",
        width: "450px",
      });
    }
  };

  if (!user) return <p>Cargando perfil...</p>;

  return (
    <div>
      <title>Mi Perfil - Fashion Luxe</title>
      <Header />
      <Mi_Cuenta />

      <div className="profile-container">
        {/* SIDEBAR */}
        <div className="profile-sidebar">
          <div className="profile-picture">
            {user?.Nombre && user?.Apellido
              ? `${user.Nombre.charAt(0)}${user.Apellido.charAt(0)}`.toUpperCase()
              : "US"}
            <input
              type="file"
              className="change-photo"
              accept="image/jpeg;image/png"
              onChange={(e) => openEditor({ src: e.target.files[0], square: true })}
            />
          </div>

          <div className="profile-name">
            {user?.Nombre || ""} {user?.Apellido || ""}
          </div>
          <div className="profile-email">{user?.Email || "Invitado"}</div>

          <div className="profile-email">
            <p>Fecha de Creación:</p>
            <span>{user?.Fecha_creacion || "No disponible"}</span>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <div className="stat-value">12</div>
              <div className="stat-label">Pedidos</div>
            </div>
            <div className="stat">
              <div className="stat-value">8</div>
              <div className="stat-label">Favoritos</div>
            </div>
            <div className="stat">
              <div className="stat-value">{addresses.length}</div>
              <div className="stat-label">Direcciones</div>
            </div>
          </div>

          <ul className="sidebar-menu">
            <li>
              <a
                href="#"
                className={activeSection === "personal" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("personal");
                }}
              >
                <i className="fas fa-user"></i> Información Personal
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeSection === "orders" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("orders");
                }}
              >
                <i className="fas fa-shopping-bag"></i> Mis Pedidos
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeSection === "favorites" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("favorites");
                }}
              >
                <i className="fas fa-heart"></i> Mis Favoritos
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeSection === "addresses" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("addresses");
                }}
              >
                <i className="fas fa-map-marker-alt"></i> Direcciones
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeSection === "security" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("security");
                }}
              >
                <i className="fas fa-lock"></i> Cambiar Contraseña
              </a>
            </li>
            <li>
              <a
                href="#"
                className={activeSection === "notifications" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection("notifications");
                }}
              >
                <i className="fas fa-bell"></i> Notificaciones
              </a>
            </li>
            <li>
              <LogoutLink onClick={handleLogout} />
            </li>
          </ul>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="profile-content">
          {/* INFORMACIÓN PERSONAL */}
          {activeSection === "personal" && (
            <div className="profile-section">
              <h2 className="section-title">Información Personal</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="Nombre">Nombre</label>
                    <input
                      type="text"
                      id="Nombre"
                      className="form-control"
                      value={user?.Nombre || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="Apellido">Apellidos</label>
                    <input
                      type="text"
                      id="Apellido"
                      className="form-control"
                      value={user?.Apellido || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="Email">Correo Electrónico</label>
                  <input
                    type="email"
                    id="Email"
                    className="form-control"
                    value={user?.Email || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Telefono">Teléfono</label>
                  <input
                    type="tel"
                    id="Telefono"
                    className="form-control"
                    value={user?.Telefono || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="Genero">Género</label>
                  <select
                    id="Genero"
                    className="form-control"
                    value={user?.Genero || ""}
                    onChange={handleChange}
                  >
                    <option value="">Seleccionar</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100 mt-3">
                  Guardar Cambios
                </button>
              </form>
            </div>
          )}


          {/* DIRECCIONES - funcional */}
{activeSection === "addresses" && (
  <div className="profile-section">
    <h2 className="section-title">Mis Direcciones</h2>

    {addresses.length === 0 ? (
      <p>No tienes direcciones registradas.</p>
    ) : (
      addresses.map((address) => (
        <div
          key={address.id}
          className={`address-card ${address.isDefault ? "address-default" : ""}`}
        >
          <div className="address-header">
            <div className="address-name">
              {address.tipo || "Dirección"} {/* tipo_direccion */}
            </div>
            {address.isDefault && (
              <div className="address-default-badge">Principal</div>
            )}
            <div className="address-actions">
              {!address.isDefault && (
                <button
                  className="address-action"
                  title="Establecer como principal"
                  onClick={() => setAsDefault(address.id)}
                >
                  <i className="fas fa-home"></i>
                </button>
              )}
              <button
                className="address-action"
                title="Editar"
                onClick={() => editAddress(address.id)}
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                className="address-action"
                title="Eliminar"
                onClick={() => deleteAddress(address.id)}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <p>
            <strong>Dirección:</strong> {address.street}
          </p>
          <p>
            <strong>Ciudad:</strong> {address.city}, {address.state}{" "}
            {address.zip}
          </p>
          <p>
            <strong>País:</strong> {address.country}
          </p>
        </div>
      ))
    )}

    <button className="btn btn-primary" onClick={addNewAddress}>
      <i className="fas fa-plus"></i> Agregar Nueva Dirección
    </button>
  </div>
)}


          {/* SECCIÓN DE PEDIDOS RECIENTES */}
          {activeSection === 'orders' && (
            <div className="profile-section">
              <h2 className="section-title">Pedidos Recientes</h2>
              
              <div className="order-card">
                <div className="order-header">
                  <div className="order-id">Pedido #FL-2023-0012</div>
                  <div className="order-status status-delivered">Entregado</div>
                </div>
                <div className="order-details">
                  <div className="order-image">
                    <img src="https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=500&q=80" alt="Camisa Formal Azul"/>
                  </div>
                  <div className="order-info">
                    <div className="order-product">Camisa Formal Azul Marino</div>
                    <div className="order-date">Realizado el 15 de Noviembre, 2023</div>
                    <div className="order-total">Total: $49.99</div>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn btn-outline">Ver Detalles</button>
                  <button className="btn btn-outline">Volver a Comprar</button>
                </div>
              </div>
              
              <div className="order-card">
                <div className="order-header">
                  <div className="order-id">Pedido #FL-2023-0011</div>
                  <div className="order-status status-pending">En Proceso</div>
                </div>
                <div className="order-details">
                  <div className="order-image">
                    <img src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=500&q=80" alt="Camisa Casual a Cuadros"/>
                  </div>
                  <div className="order-info">
                    <div className="order-product">Camisa Casual a Cuadros</div>
                    <div className="order-date">Realizado el 10 de Noviembre, 2023</div>
                    <div className="order-total">Total: $36.79</div>
                  </div>
                </div>
                <div className="order-actions">
                  <button className="btn btn-outline">Ver Detalles</button>
                  <button className="btn btn-outline">Seguir Pedido</button>
                </div>
              </div>
              
              <button className="btn btn-outline" style={{width: '100%'}}>Ver Todos los Pedidos</button>
            </div>
          )}

          {/* SECCIÓN DE FAVORITOS */}
          {activeSection === 'favorites' && (
            <div className="profile-section">
              <h2 className="section-title">Mis Favoritos</h2>
              
              <div className="favorite-grid">
                <div className="favorite-card">
                  <div className="favorite-image">
                    <img src="https://images.unsplash.com/photo-1525450824782-b60f5a1d654a?auto=format&fit=crop&w=500&q=80" alt="Camisa Oxford Gris"/>
                  </div>
                  <div className="favorite-info">
                    <div className="favorite-name">Camisa Oxford Gris</div>
                    <div className="favorite-price">$42.99</div>
                    <div className="favorite-actions">
                      <button className="btn btn-primary">Añadir al Carrito</button>
                      <button className="btn btn-outline"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
                
                <div className="favorite-card">
                  <div className="favorite-image">
                    <img src="https://images.unsplash.com/photo-1574180045827-681f8a1a9622?auto=format&fit=crop&w=500&q=80" alt="Camisa Denim Azul"/>
                  </div>
                  <div className="favorite-info">
                    <div className="favorite-name">Camisa Denim Azul</div>
                    <div className="favorite-price">$34.99</div>
                    <div className="favorite-actions">
                      <button className="btn btn-primary">Añadir al Carrito</button>
                      <button className="btn btn-outline"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN DE SEGURIDAD */}
          {activeSection === 'security' && (
            <div className="profile-section">
              <h2 className="section-title">Cambiar Contraseña</h2>
              <form>
                <div className="form-group">
                  <label htmlFor="currentPassword">Contraseña Actual</label>
                  <input type="password" id="currentPassword" className="form-control" placeholder="Ingresa tu contraseña actual"/>
                </div>
                <div className="form-group">
                  <label htmlFor="newPassword">Nueva Contraseña</label>
                  <input type="password" id="newPassword" className="form-control" placeholder="Ingresa nueva contraseña"/>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                  <input type="password" id="confirmPassword" className="form-control" placeholder="Confirma tu nueva contraseña"/>
                </div>
                <button type="submit" className="btn btn-primary">Actualizar Contraseña</button>
              </form>
            </div>
          )}

          {/* SECCIÓN DE NOTIFICACIONES */}
          {activeSection === 'notifications' && (
            <div className="profile-section">
              <h2 className="section-title">Configuración de Notificaciones</h2>
              <form>
                <div className="toggle-group">
                  <div className="toggle-text">
                    <h4>Notificaciones por Email</h4>
                    <p>Recibir notificaciones por correo electrónico</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked/>
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-group">
                  <div className="toggle-text">
                    <h4>Estado de Pedidos</h4>
                    <p>Alertas sobre el estado de tus pedidos</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked/>
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="toggle-group">
                  <div className="toggle-text">
                    <h4>Ofertas Especiales</h4>
                    <p>Descuentos y promociones exclusivas</p>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked/>
                    <span className="slider"></span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary">Guardar Preferencias</button>
              </form>
            </div>
          )}
        </div>
      </div>
      <Footer/>
      <FloatingWhatsApp/>
    </div>
  );
}