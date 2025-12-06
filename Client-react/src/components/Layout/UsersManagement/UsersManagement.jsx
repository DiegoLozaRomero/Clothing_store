import { useState, useEffect } from "react";
import styles from "./UsersManagement.module.css";
import clsx from "clsx";
import Swal from "sweetalert2";
import axios from "axios";
import "animate.css";

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function UsersManagement() {
  const [users, setUsers] = useState([]);

  // Cargar los usuarios desde Flask
  useEffect(() => {
    axios.get(`${API_BASE_URL}/users`)
      .then((response) => {
        setUsers(response.data.users);
      })
      .catch((error) => {
        console.error("Error al obtener usuarios:", error);
        Swal.fire({
          icon: "error",
          title: "Error al cargar usuarios",
          text: "No se pudieron obtener los usuarios desde el servidor.",
        });
      });
  }, []);

  // Formatear fechas
  function formatDate(dateString) {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("es-MX");
  }

  // Editar usuario
  async function showEditUserModal(id) {
    const user = users.find((u) => String(u.id) === String(id));
    if (!user) return;
await Swal.fire({
  title: `Editar Usuario: ${user.Nombre}`,
    width: '900px', 
  html: `
    <div style="overflow-x: auto;">
      <table style="min-width:800px;border-collapse:collapse;font-size:14px;width:100%;">
        <tr>
          <th style="background:#ff9f1c; color:white;">Campo</th>
          <th style="background:#ff9f1c; color:white;">Valor Actual</th>
          <th style="background:#ff9f1c; color:white;">Nuevo Valor</th>
        </tr>
        <tr>
          <td>Id</td>
          <td>${user.id}</td>
          <td><label id="edit-id" class="swal2-input" style="width:90%;">${user.id}</label></td>
        </tr>
        <tr>
          <td>Nombre</td>
          <td>${user.Nombre}</td>
          <td><input id="edit-nombre" value="${user.Nombre}" class="swal2-input" style="width:90%;"></td>
        </tr>
        <tr>
          <td>Apellido</td>
          <td>${user.Apellido}</td>
          <td><input id="edit-apellido" value="${user.Apellido}" class="swal2-input" style="width:90%;"></td>
        </tr>
        <tr>
          <td>Email</td>
          <td>${user.Email}</td>
          <td><input id="edit-email" value="${user.Email}" class="swal2-input" style="width:90%;"></td>
        </tr>
        <tr>
          <td>Contraseña</td>
          <td>${user.Password || '••••••'}</td>
          <td><input id="edit-Password" value="${user.Password || '••••••'}" class="swal2-input" style="width:90%;"></td>
        </tr>
        <tr>
          <td>Teléfono</td>
          <td>${user.Telefono || "N/A"}</td>
          <td><input id="edit-telefono" value="${user.Telefono || ""}" class="swal2-input" style="width:90%;"></td>
        </tr>
        <tr>
          <td>Género</td>
          <td>${user.Genero || "N/A"}</td>
          <td>
            <select id="edit-genero" class="swal2-input" style="width:90%;">
              <option value="">Seleccionar</option>
              <option value="Masculino" ${user.Genero === "Masculino" ? "selected" : ""}>Masculino</option>
              <option value="Femenino" ${user.Genero === "Femenino" ? "selected" : ""}>Femenino</option>
              <option value="Otro" ${user.Genero === "Otro" ? "selected" : ""}>Otro</option>
            </select>
          </td>
        </tr>
        <tr>
          <td>Estado</td>
          <td>${user.Activo || "N/A"}</td>
          <td>
            <select id="edit-estado" class="swal2-input" style="width:90%;">
              <option value="">Seleccionar</option>
              <option value="Activo" ${user.Activo === "Activo" ? "selected" : ""}>Activo</option>
              <option value="Inactivo" ${user.Activo === "Inactivo" ? "selected" : ""}>Inactivo</option>
              <option value="Bloqueado" ${user.Activo === "Bloqueado" ? "selected" : ""}>Bloqueado</option>
            </select>
          </td>
        </tr>
      </table>
    </div>`,
  showCancelButton: true,
  confirmButtonText: "Guardar Cambios",
  cancelButtonText: "Cancelar",
  confirmButtonColor: "#3085d6",
  cancelButtonColor: "#d33",
  preConfirm: () => {
    return {
       id: document.getElementById("edit-id").textContent.trim(),
      Nombre: document.getElementById("edit-nombre").value.trim(),
      Apellido: document.getElementById("edit-apellido").value.trim(),
      Email: document.getElementById("edit-email").value.trim(),
      Password: document.getElementById("edit-Password").value.trim(),
      Telefono: document.getElementById("edit-telefono").value.trim(),
      Genero: document.getElementById("edit-genero").value,
      Activo: document.getElementById("edit-estado").value
    };
  },
}).then(async (result) => {
  if (result.isConfirmed) {
    try {
      const response = await axios.put(`${API_BASE_URL}/UpdateUser`, result.value);

      // Actualiza el estado local
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, ...result.value } : u))
      );

        Swal.fire({
    title: '¡Actualizado!',
    html: `
      <div style="text-align: center; padding: 10px;">
        <i class="fas fa-check-circle" style="font-size: 50px; color: #28a745; margin-bottom: 15px;"></i>
        <p style="font-size: 16px;">El usuario <strong>${user.Nombre} ${user.Apellido}</strong> ha sido actualizado correctamente.</p>
        <p style="font-size: 14px; color: #555; margin-top: 5px;">
          ${response.data.message || "Los cambios se guardaron con éxito."}
        </p>
      </div>
    `,
    confirmButtonColor: '#3085d6',
    background: '#f9f9f9',
    width: '450px'
  });
    } catch (error) {
       Swal.fire({
    title: 'Error',
    html: `
      <div style="text-align: center; padding: 10px;">
        <i class="fas fa-times-circle" style="font-size: 50px; color: #e74c3c; margin-bottom: 15px;"></i>
        <p style="font-size: 16px;">No se pudo actualizar el usuario.</p>
        <p style="font-size: 14px; color: #666; margin-top: 10px;">
          Error: ${error.response?.data?.error || error.message}
        </p>
      </div>
    `,
    confirmButtonColor: '#3085d6',
    background: '#f9f9f9',
    width: '450px'
  });
    }
  }
});
  }
  // Eliminar usuario
  const confirmDeleteUser = async (id) => {
    const user = users.find((u) => u.id === id);
    if (!user) return;

    const result = await Swal.fire({
      title: "¿Eliminar Usuario?",
      html: `<p>¿Seguro que deseas eliminar a <strong>${user.Nombre} ${user.Apellido}</strong>?</p>`,
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_BASE_URL}/DeleteUser`, {
        data: {
          id: user.id,
          Nombre: user.Nombre,
          Email: user.Email
        },
        });
        setUsers((prev) => prev.filter((u) => u.id !== id));
        Swal.fire("Eliminado", "El usuario ha sido eliminado correctamente", "success");
      } catch (error) {
        Swal.fire("Error", error.response?.data?.error || error.message, "error");
      }
    }
  };


  // Ver usuario con direcciones
  function viewUser(id) {
    const user = users.find((u) => String(u.id) === String(id));
    if (!user) return;

    const direccionesHTML = user.Direcciones?.length
      ? user.Direcciones.map(
          (d, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${d.direccion}</td>
          <td>${d.ciudad}</td>
          <td>${d.estado_provincia}</td>
          <td>${d.codigo_postal}</td>
          <td>${d.pais}</td>
          <td>${d.tipo_direccion}</td>
        </tr>`
        ).join("")
      : `<tr><td colspan="7">Sin direcciones registradas</td></tr>`;

    Swal.fire({
      title: `Detalles de ${user.Nombre}`,
      width: "95%",
      background: "#f9f9f9",
      confirmButtonColor: "#3085d6",
      html: `
        <div style="overflow-x:auto;">
          <table style="min-width:1000px;border-collapse:collapse;font-size:14px;">
            <tr><th>ID</th><td>${user.id}</td></tr>
            <tr><th>Nombre</th><td>${user.Nombre} ${user.Apellido}</td></tr>
            <tr><th>Email</th><td>${user.Email}</td></tr>
            <tr><th>Teléfono</th><td>${user.Telefono}</td></tr>
            <tr><th>Género</th><td>${user.Genero || "N/A"}</td></tr>
            <tr><th>Activo</th><td>${user.Activo}</td></tr>
            <tr><th>Fecha Creación</th><td>${formatDate(user.Fecha_creacion)}</td></tr>
          </table>
          <br>
          <h4> Direcciones registradas</h4>
          <table border="1" style="width:100%;border-collapse:collapse;">
            <thead>
              <tr style="background:#fabc66;">
                <th>#</th><th>Dirección</th><th>Ciudad</th><th>Estado</th>
                <th>C.P.</th><th>País</th><th>Tipo</th>
              </tr>
            </thead>
            <tbody>${direccionesHTML}</tbody>
          </table>
        </div>
      `,
    });
  }

  return (
    <div className={styles.container}>
      <h2>Gestión de Usuarios</h2>
      {users.length === 0 ? (
        <div className={styles.noUsers}>
          <i className="fas fa-user-slash"></i>
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Apellido</th>
              <th>Email</th><th>Password</th><th>Teléfono</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>#{user.id}</td>
                <td>{user.Nombre}</td>
                <td>{user.Apellido}</td>
                <td>{user.Email}</td>
                <td>{user.Password || '••••••'}</td>
                <td>{user.Telefono}</td>
                <td>
                  <span
                    className={clsx(
                      styles.badge,
                      user.Activo === "Activo"
                        ? styles.badgeSuccess
                        : user.Activo === "Inactivo"
                        ? styles.badgeWarning
                        : styles.badgeGray
                    )}
                  >
                    {user.Activo}
                  </span>
                </td>
                <td className={styles.actions}>
                  <button className="btn btn-sm btn-info" onClick={() => viewUser(user.id)}>
                    <i className="fas fa-eye"></i>
                  </button>
                  <button className="btn btn-sm btn-warning" onClick={() => showEditUserModal(user.id)}>
                    <i className="fas fa-edit"></i>
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => confirmDeleteUser(user.id)}>
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
