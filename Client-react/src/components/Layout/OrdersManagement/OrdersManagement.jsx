import { useState, useEffect } from "react";
import styles from "./OrdersManagement.module.css";
import clsx from "clsx";
import Swal from "sweetalert2";
import "animate.css";
import axios from "axios";

export default function OrdersManagement() {
  const [pedidos, setPedidos] = useState([]);
  const [filteredPedidos, setFilteredPedidos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  // Cargar órdenes reales desde la API
  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://127.0.0.1:5000/admin/orders?per_page=50');
      
      if (response.data.status === 'success') {
        setPedidos(response.data.data.orders);
        setFilteredPedidos(response.data.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      Swal.fire({
        title: 'Error',
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #EF4444; margin-bottom: 15px; animation: shake 0.4s ease;"></i>
            <p style="font-size: 16px; color: #000000ff;">
              No se pudieron cargar los pedidos.
            </p>
          </div>
        `,
        color: "#262626ff",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Reintentar",
        width: "420px",
        customClass: {
          popup: "swal2-glass",
          confirmButton: "swal2-button",
        },
        showClass: {
          popup: "animate__animated animate__shakeX",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // 🔍 Función de búsqueda y filtrado
  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter, startDate, endDate);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    applyFilters(searchTerm, status, startDate, endDate);
  };

  const handleDateFilter = (start, end) => {
    setStartDate(start);
    setEndDate(end);
    applyFilters(searchTerm, statusFilter, start, end);
  };

  const applyFilters = (search, status, start, end) => {
    let filtered = [...pedidos];

    // Filtro por búsqueda
    if (search.trim()) {
      filtered = filtered.filter(pedido => 
        pedido.order_short_id.toLowerCase().includes(search.toLowerCase()) ||
        pedido.user_info.nombre_completo.toLowerCase().includes(search.toLowerCase()) ||
        pedido.user_info.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filtro por estado
    if (status) {
      filtered = filtered.filter(pedido => 
        pedido.estado.toLowerCase() === status.toLowerCase()
      );
    }

    // Filtro por fecha
    if (start) {
      const startDate = new Date(start);
      filtered = filtered.filter(pedido => 
        new Date(pedido.creado_en) >= startDate
      );
    }

    if (end) {
      const endDate = new Date(end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(pedido => 
        new Date(pedido.creado_en) <= endDate
      );
    }

    setFilteredPedidos(filtered);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setStartDate("");
    setEndDate("");
    setFilteredPedidos(pedidos);
  };

  //  Ver detalles del pedido
 const viewPedido = (orderId) => {
    const pedido = pedidos.find((p) => p.id === orderId);
    if (!pedido) return;

    const productsHtml = pedido.detalles.map(detalle => `
      <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.15); border-radius: 8px; border: 1px solid rgba(255,255,255,0.2);">
        <img src="${detalle.producto_imagen || 'https://via.placeholder.com/50x50?text=Imagen'}" 
             alt="${detalle.producto_nombre}" 
             style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px; border: 1px solid rgba(255,255,255,0.3);">
        <div style="flex: 1;">
          <div style="font-weight: 700; color: #FFFFFF; margin-bottom: 5px; text-shadow: 0 1px 2px rgba(0,0,0,0.3);">${detalle.producto_nombre}</div>
          <div style="color: #E5E7EB; font-size: 14px; font-weight: 500;">
            Cantidad: ${detalle.cantidad} × $${detalle.precio_unitario}
          </div>
          <div style="color: #22C55E; font-weight: 700; font-size: 15px; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">Subtotal: $${detalle.subtotal}</div>
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: `<h3 style="color: #FFFFFF; font-weight: 700; margin-bottom: 20px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">Detalles del Pedido ${pedido.order_short_id}</h3>`,
      html: `
        <div style="text-align: center; padding: 10px;">
          <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(99, 102, 241, 0.4); box-shadow: 0 8px 25px rgba(0,0,0,0.3);">
            
            <!-- Información del cliente -->
            <div style="text-align: left; margin-bottom: 20px;">
              <h4 style="color: #FFFFFF; margin-bottom: 10px; border-bottom: 2px solid rgba(99, 102, 241, 0.6); padding-bottom: 5px; font-weight: 700;">
                <i class="fas fa-user" style="margin-right: 8px; color: #6366F1;"></i>Información del Cliente
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Nombre</div>
                  <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.user_info.nombre_completo}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Email</div>
                  <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.user_info.email}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Teléfono</div>
                  <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.user_info.telefono || 'No especificado'}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Fecha de registro</div>
                  <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${new Date(pedido.user_info.fecha_registro).toLocaleDateString('es-ES')}</div>
                </div>
              </div>
            </div>

            <!-- Información del pedido -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Estado</div>
                <div style="font-weight: 700; color: #FFFFFF; text-transform: capitalize; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.estado}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Método de pago</div>
                <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.metodo_pago || 'No especificado'}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Fecha del pedido</div>
                <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${new Date(pedido.creado_en).toLocaleDateString('es-ES')}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #94A3B8; font-weight: 600;">Total productos</div>
                <div style="font-weight: 700; color: #FFFFFF; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">${pedido.resumen.total_productos}</div>
              </div>
            </div>

            <!-- Dirección de envío -->
            ${pedido.direccion_envio ? `
              <div style="text-align: left; margin-bottom: 20px;">
                <h4 style="color: #FFFFFF; margin-bottom: 10px; border-bottom: 2px solid rgba(99, 102, 241, 0.6); padding-bottom: 5px; font-weight: 700;">
                  <i class="fas fa-map-marker-alt" style="margin-right: 8px; color: #6366F1;"></i>Dirección de Envío
                </h4>
                <div style="color: #FFFFFF; font-weight: 700; text-shadow: 0 1px 2px rgba(0,0,0,0.2);">
                  ${pedido.direccion_envio.direccion}, ${pedido.direccion_envio.ciudad}<br>
                  ${pedido.direccion_envio.estado_provincia}, ${pedido.direccion_envio.pais}<br>
                  CP: ${pedido.direccion_envio.codigo_postal}
                </div>
              </div>
            ` : ''}

            <!-- Total -->
            <div style="background: linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.3)); padding: 15px; border-radius: 12px; border: 2px solid rgba(34, 197, 94, 0.5); box-shadow: 0 4px 15px rgba(34, 197, 94, 0.2);">
              <div style="font-size: 12px; color: #D1FAE5; font-weight: 600; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">Total del pedido</div>
              <div style="color: #22C55E; font-size: 26px; font-weight: 800; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">$${pedido.total}</div>
            </div>
          </div>

          <!-- Productos -->
          <div style="background: rgba(30, 41, 59, 0.95); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; border: 1px solid rgba(99, 102, 241, 0.4); box-shadow: 0 8px 25px rgba(0,0,0,0.3);">
            <h4 style="color: #FFFFFF; font-weight: 700; margin-bottom: 15px; text-align: left; border-bottom: 2px solid rgba(99, 102, 241, 0.6); padding-bottom: 10px;">
              <i class="fas fa-box" style="margin-right: 8px; color: #6366F1;"></i>Productos (${pedido.detalles.length})
            </h4>
            ${productsHtml}
          </div>
        </div>
      `,
      background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
      color: "#FFF",
      width: "750px",
      padding: "25px",
      customClass: {
        popup: 'glass-swal-popup'
      },
      showConfirmButton: true,
      confirmButtonText: "<i class='fas fa-times'></i> Cerrar",
      confirmButtonColor: "#EF4444",
      confirmButtonAriaLabel: "Cerrar ventana",
      showCloseButton: true,
      closeButtonHtml: '<i class="fas fa-times" style="color: #FFFFFF; font-size: 18px;"></i>',
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };
  // Editar estado del pedido
  const showEditUserModal = (orderId) => {
    const pedido = pedidos.find((p) => p.id === orderId);
    if (!pedido) return;

    Swal.fire({
      title: `Editar Pedido de: ${pedido.user_info.nombre_completo}`,
      html: `
        <div style="text-align: center; padding: 15px;">
          <i class="fa-solid fa-edit" 
             style="font-size: 60px; color: #6366F1; margin-bottom: 15px; animation: pop 0.4s ease;"></i>
          <p style="font-size: 16px; color: #000000ff; margin-bottom: 20px;">
            Actualizar estado del pedido <strong>${pedido.order_short_id}</strong>
          </p>
          <form id="editOrderForm" style="text-align: left;">
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 600; color: #000000ff; margin-bottom: 8px;">Estado del pedido</label>
              <select 
                id="orderStatus" 
                style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 8px; font-size: 16px; background: white;"
                required
              >
                <option value="Pendiente" ${pedido.estado === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                <option value="Confirmado" ${pedido.estado === 'Confirmado' ? 'selected' : ''}>Confirmado</option>
                <option value="En preparación" ${pedido.estado === 'En preparación' ? 'selected' : ''}>En preparación</option>
                <option value="Enviado" ${pedido.estado === 'Enviado' ? 'selected' : ''}>Enviado</option>
                <option value="Entregado" ${pedido.estado === 'Entregado' ? 'selected' : ''}>Entregado</option>
                <option value="Cancelado" ${pedido.estado === 'Cancelado' ? 'selected' : ''}>Cancelado</option>
              </select>
            </div>
          </form>
        </div>
      `,
      color: "#262626ff",
      showCancelButton: true,
      confirmButtonText: "<i class='fa-solid fa-save'></i> Guardar Cambios",
      cancelButtonText: "<i class='fa-solid fa-times'></i> Cancelar",
      confirmButtonColor: "#6366F1",
      cancelButtonColor: "#6B7280",
      width: "500px",
      customClass: {
        popup: "swal2-glass",
        confirmButton: "swal2-button",
        cancelButton: "swal2-button"
      },
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
      preConfirm: async () => {
        const nuevoEstado = document.getElementById('orderStatus').value;
        
        try {
          const response = await axios.put(`http://127.0.0.1:5000/admin/orders/${orderId}/status`, {
            estado: nuevoEstado
          });
          
          if (response.data.status === 'success') {
            await loadOrders(); // Recargar los pedidos
            return response.data;
          } else {
            throw new Error(response.data.message);
          }
        } catch (error) {
          Swal.showValidationMessage(
            `Error: ${error.response?.data?.message || error.message}`
          );
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: '¡Pedido actualizado!',
          html: `
            <div style="text-align: center; padding: 15px;">
              <i class="fa-solid fa-circle-check" 
                 style="font-size: 60px; color: #10B981; margin-bottom: 15px; animation: pop 0.4s ease;"></i>
              <p style="font-size: 16px; color: #000000ff;">
                ${result.value.message}
              </p>
            </div>
          `,
          color: "#262626ff",
          confirmButtonColor: "#6366F1",
          confirmButtonText: "Entendido",
          width: "450px",
          customClass: {
            popup: "swal2-glass",
            confirmButton: "swal2-button",
          },
          showClass: {
            popup: "animate__animated animate__fadeInDown",
          },
          hideClass: {
            popup: "animate__animated animate__fadeOutUp",
          },
        });
      }
    });
  };

  // Función para obtener el color del badge según el estado
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Entregado':
        return clsx(styles.badge, styles.badgeSuccess);
      case 'Pendiente':
        return clsx(styles.badge, styles.badgeWarning);
      case 'Enviado':
      case 'Confirmado':
        return clsx(styles.badge, styles.badgeBlue);
      case 'En preparación':
        return clsx(styles.badge, styles.badgeGray);
      case 'Cancelado':
        return clsx(styles.badge, styles.badgedanger);
      default:
        return clsx(styles.badge, styles.badgeGray);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  return (
    <div className={styles.container}>
      {/*  Filtros de búsqueda */}
      <div className={styles.search_filters}>
        <div className={styles.search_box}>
          <input 
            type="text" 
            className={styles.form_control} 
            placeholder="Buscar por ID, cliente o email..." 
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <i className="fas fa-search"></i>
        </div>

        <select 
          className={`${styles.form_control} ${styles.filter_select}`}
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Confirmado">Confirmado</option>
          <option value="En preparación">En preparación</option>
          <option value="Enviado">Enviado</option>
          <option value="Entregado">Entregado</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <input 
          type="date" 
          className={styles.form_control} 
          value={startDate}
          onChange={(e) => handleDateFilter(e.target.value, endDate)}
        />
        <input 
          type="date" 
          className={styles.form_control} 
          value={endDate}
          onChange={(e) => handleDateFilter(startDate, e.target.value)}
        />
        
        <button 
          className={styles.clear_filters}
          onClick={clearFilters}
        >
          <i className="fas fa-times"></i>
          Limpiar
        </button>

        <button 
          className={styles.refresh_btn}
          onClick={loadOrders}
          disabled={loading}
        >
          <i className={`fas fa-sync ${loading ? 'fa-spin' : ''}`}></i>
          Actualizar
        </button>
      </div>

      {/* 📊 Información de resultados */}
      <div className={styles.search_info}>
        <p>
          Mostrando <strong>{filteredPedidos.length}</strong> de <strong>{pedidos.length}</strong> pedidos
          {searchTerm && (
            <span> para: <strong>"{searchTerm}"</strong></span>
          )}
          {statusFilter && (
            <span> - Estado: <strong>{statusFilter}</strong></span>
          )}
        </p>
      </div>

      {/* 📋 Tabla de pedidos */}
      <div className={styles.table_container}>
        {loading ? (
          <div className={styles.loading}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando pedidos...</p>
          </div>
        ) : (
          <table className={styles.orders_table}>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Productos</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredPedidos.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.no_results}>
                    <i className="fas fa-search"></i>
                    <p>No se encontraron pedidos</p>
                    {(searchTerm || statusFilter || startDate || endDate) && (
                      <button 
                        className={styles.clear_search_btn}
                        onClick={clearFilters}
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredPedidos.map((pedido) => (
                  <tr key={pedido.id} className={styles.order_row}>
                    <td className={styles.order_id}>
                      <strong>{pedido.order_short_id}</strong>
                    </td>
                    <td className={styles.customer_info}>
                      <div className={styles.customer_name}>
                        {pedido.user_info.nombre_completo}
                      </div>
                      <div className={styles.customer_email}>
                        {pedido.user_info.email}
                      </div>
                    </td>
                    <td className={styles.order_date}>
                      {formatDate(pedido.creado_en)}
                    </td>
                    <td className={styles.products_count}>
                      {pedido.resumen.total_productos} productos
                      <br />
                      <small>{pedido.resumen.total_items} items</small>
                    </td>
                    <td className={styles.order_total}>
                      <strong>${pedido.total}</strong>
                    </td>
                    <td className={styles.order_status}>
                      <span className={getStatusBadgeClass(pedido.estado)}>
                        {pedido.estado}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={`${styles.btn} ${styles.btn_info}`} 
                        onClick={() => viewPedido(pedido.id)}
                        title="Ver detalles"
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className={`${styles.btn} ${styles.btn_warning}`} 
                        onClick={() => showEditUserModal(pedido.id)}
                        title="Editar estado"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
