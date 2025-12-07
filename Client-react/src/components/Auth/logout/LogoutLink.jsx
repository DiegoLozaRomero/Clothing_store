import { Link, useNavigate } from "react-router-dom";

// 🚨 AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

function LogoutLink() {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      // Llamar al backend para cerrar sesión
      // 🚨 REEMPLAZO: Usar API_BASE_URL en lugar de localhost
      await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include", // MUY IMPORTANTE para usar la sesión Flask
      });
      

      // Limpiar el almacenamiento local del frontend
      localStorage.removeItem("userData");
      sessionStorage.clear();

      // Redirigir al inicio
      navigate("/");
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    }
  };

  return (
    <Link to="/" onClick={handleLogout}>
      <i className="fas fa-sign-out-alt"></i> Cerrar Sesión
    </Link>
  );
}

export default LogoutLink;
