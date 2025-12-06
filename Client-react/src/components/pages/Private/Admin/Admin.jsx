import { useEffect,useState } from "react";
import styles from './Admin.module.css';
import clsx from 'clsx';
import SalesChart from "../../../Common/Dashboard/SalesChart";
import ProductChart from "../../../Common/Dashboard/ProductChart";
import UsersManagement from "../../../Layout/UsersManagement/UsersManagement";
import OrdersManagement from "../../../Layout/OrdersManagement/OrdersManagement";
import ProductManagement from "../../../Layout/ProductManagement/ProductManagement";
import ReportAnalyze from "../../../Common/Dashboard/RportAnalyze";
import Notifications from "../../../Layout/notifications/notifications";
import { Update_Password } from "./Update_Password/Update_Password";
import LogoutLink from "../../../Auth/logout/LogoutLink";
import axios from "axios";
import Swal from "sweetalert2";

// 🚨 AÑADIDO: Define la URL base de la API usando la variable de entorno
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function Admin() {
  // Estado de pestaña activa
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userCount, setUserCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [ordersStats, setOrdersStats] = useState({});
  const [loadingOrders, setLoadingOrders] = useState(false);
    const [productsStats, setProductsStats] = useState({
    total_productos: 0,
    total_stock: 0,
    categorias: {},
    generos: {}
  });

  const [loadingProducts, setLoadingProducts] = useState(false);


  // Estados para métodos de pago
  const [paymentData, setPaymentData] = useState({
    labels: ["Tarjeta Crédito", "Tarjeta Débito", "PayPal", "Transferencia", "Efectivo"],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: [
          "rgba(67, 97, 238, 0.7)",
          "rgba(76, 201, 240, 0.7)",
          "rgba(248, 150, 30, 0.7)",
          "rgba(247, 37, 133, 0.7)",
          "rgba(72, 149, 239, 0.7)",
        ],
      },
    ],
  });

    const [paymentStats, setPaymentStats] = useState({
    metodos_pago: [],
    totales: { ordenes: 0, monto: 0, metodos: 0 },
    loading: false
  });

  // Cargar estadísticas de usuarios
  useEffect(() => {
    // 🛑 CORREGIDO: Usando API_BASE_URL
    axios.get(`${API_BASE_URL}/UserCount`)
      .then(res => setUserCount(res.data.total_usuarios))
      .catch(err => console.error("Error al obtener usuarios:", err));
  }, []);



    const loadProductsStats = async () => {
    try {
      setLoadingProducts(true);
      // 🛑 CORREGIDO: Usando API_BASE_URL
      const response = await axios.get(`${API_BASE_URL}/admin/products/count-stats`);
      
      if (response.data.status === 'success') {
        setProductsStats(response.data.data);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading products stats:', error);
      setProductsStats({
        total_productos: 0,
        total_stock: 0,
        categorias: {},
        generos: {}
      });
      
      Swal.fire({
        title: 'Error',
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #EF4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #000000ff;">
              No se pudieron cargar las estadísticas de productos.
            </p>
          </div>
        `,
        color: "#262626ff",
        confirmButtonColor: "#EF4444",
        confirmButtonText: "Entendido",
        width: "420px",
      });
    } finally {
      setLoadingProducts(false);
    }
  };

  // Cargar órdenes para el dashboard 5 amas reciente 
  const loadAdminOrders = async () => {
    try {
      setLoadingOrders(true);
      // 🛑 CORREGIDO: Usando API_BASE_URL
      const response = await axios.get(`${API_BASE_URL}/admin/orders?per_page=5`);
      
      if (response.data.status === 'success') {
        // Tomar solo los primeros 5 pedidos (más recientes)
        const recentOrders = response.data.data.orders.slice(0, 5);
        setOrders(recentOrders);
        setOrdersStats(response.data.data.estadisticas);
      }
    } catch (error) {
      console.error('Error loading admin orders:', error);
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
      setLoadingOrders(false);
    }
  };


  // Cargar estadísticas de órdenes
  const loadOrdersStats = async () => {
    try {
      // 🛑 CORREGIDO: Usando API_BASE_URL
      const response = await axios.get(`${API_BASE_URL}/admin/orders/stats`);
      
      if (response.data.status === 'success') {
        setOrdersStats(response.data.data);
      }
    } catch (error) {
      console.error('Error loading orders stats:', error);
    }
  };

 // Cargar estadísticas de métodos de pago
  const loadPaymentMethodsStats = async () => {
    try {
      setPaymentStats(prev => ({ ...prev, loading: true }));
      console.log('Cargando estadísticas de métodos de pago...');
      
      // 🛑 CORREGIDO: Usando API_BASE_URL
      const response = await axios.get(`${API_BASE_URL}/admin/orders/payment-methods-detailed`);
      console.log('Respuesta de métodos de pago:', response.data);
      
      if (response.data.status === 'success') {
        const data = response.data.data;
        setPaymentStats({
          metodos_pago: data.metodos_pago,
          totales: data.totales,
          loading: false
        });
        
        // ASUMO que la función 'updatePaymentChartData' está definida en otro lugar 
        // y la dejaremos tal cual fue llamada.
        // updatePaymentChartData(data.metodos_pago); 
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error cargando métodos de pago:', error);
      setPaymentStats(prev => ({ ...prev, loading: false }));
      
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar las estadísticas de métodos de pago',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const categoryData = {
    labels: ["Electrónicos", "Ropa", "Hogar", "Deportes", "Juguetes"],
    datasets: [
      {
        data: [45, 20, 15, 12, 8],
        backgroundColor: [
          "rgba(67, 97, 238, 0.7)",
          "rgba(76, 201, 240, 0.7)",
          "rgba(248, 150, 30, 0.7)",
          "rgba(247, 37, 133, 0.7)",
          "rgba(72, 149, 239, 0.7)",
        ],
      },
    ],
  };




  // Actualizar datos del gráfico
  const updatePaymentChartData = (metodosPago) => {
    if (!metodosPago || metodosPago.length === 0) return;

    const colors = [
      "rgba(67, 97, 238, 0.8)",
      "rgba(76, 201, 240, 0.8)",
      "rgba(248, 150, 30, 0.8)",
      "rgba(247, 37, 133, 0.8)",
      "rgba(72, 149, 239, 0.8)",
      "rgba(85, 239, 196, 0.8)",
      "rgba(129, 236, 236, 0.8)",
      "rgba(116, 185, 255, 0.8)",
    ];

    const newPaymentData = {
      labels: metodosPago.map(item => item.metodo),
      datasets: [
        {
          data: metodosPago.map(item => item.cantidad),
          backgroundColor: metodosPago.map((_, index) => colors[index % colors.length]),
          borderColor: metodosPago.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
          borderWidth: 2,
          hoverBackgroundColor: metodosPago.map((_, index) => colors[index % colors.length].replace('0.8', '1')),
        },
      ],
    };

    setPaymentData(newPaymentData);
  };


  // Cargar datos al montar el componente
  useEffect(() => {
    loadAdminOrders();
    loadOrdersStats();
    loadProductsStats();
    loadPaymentMethodsStats();
  }, []);

   // Función para obtener distribución por género
  const getGenderDistribution = () => {
    const { generos } = productsStats;
    if (Object.keys(generos).length === 0) return 'Cargando...';
    
    return Object.entries(generos)
      .map(([genero, data]) => `${genero}: ${data.count}`)
      .join(' | ');
  };



  // Función para obtener el color del badge según el estado
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Entregado':
      case 'Completado':
        return clsx(styles.badge, styles.badgeSuccess);
      case 'Pendiente':
      case 'En preparación':
        return clsx(styles.badge, styles.badgeWarning);
      case 'Cancelado':
        return clsx(styles.badge, styles.badgedanger);
      case 'Enviado':
      case 'Confirmado':
        return clsx(styles.badge, styles.badgeInfo);
      default:
        return clsx(styles.badge, styles.badgeSecondary);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Función para ver detalles de la orden
  const viewOrderDetails = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const productsHtml = order.detalles.map(detalle => `
      <div style="display: flex; align-items: center; margin-bottom: 10px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px;">
        <img src="${detalle.producto_imagen || 'https://via.placeholder.com/50x50?text=Imagen'}" 
             alt="${detalle.producto_nombre}" 
             style="width: 50px; height: 50px; object-fit: cover; border-radius: 6px; margin-right: 15px;">
        <div style="flex: 1;">
          <div style="font-weight: 600; color: #fff; margin-bottom: 5px;">${detalle.producto_nombre}</div>
          <div style="color: #ccc; font-size: 14px;">
            Cantidad: ${detalle.cantidad} × $${detalle.precio_unitario}
          </div>
          <div style="color: #4ade80; font-weight: 600;">Subtotal: $${detalle.subtotal}</div>
        </div>
      </div>
    `).join('');

    Swal.fire({
      title: `<h3 style="color: #fff; font-weight: 600; margin-bottom: 20px;">Detalles del Pedido ${order.order_short_id}</h3>`,
      html: `
        <div style="text-align: center; padding: 10px;">
          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; margin-bottom: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
            
            <!-- Información del cliente -->
            <div style="text-align: left; margin-bottom: 20px;">
              <h4 style="color: #fff; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 5px;">
                <i class="fas fa-user" style="margin-right: 8px;"></i>Información del Cliente
              </h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div>
                  <div style="font-size: 12px; color: #9CA3AF;">Nombre</div>
                  <div style="font-weight: 600; color: #fff;">${order.user_info.nombre_completo}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #9CA3AF;">Email</div>
                  <div style="font-weight: 600; color: #fff;">${order.user_info.email}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #9CA3AF;">Teléfono</div>
                  <div style="font-weight: 600; color: #fff;">${order.user_info.telefono || 'No especificado'}</div>
                </div>
                <div>
                  <div style="font-size: 12px; color: #9CA3AF;">Fecha de registro</div>
                  <div style="font-weight: 600; color: #fff;">${formatDate(order.user_info.fecha_registro)}</div>
                </div>
              </div>
            </div>

            <!-- Información del pedido -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #9CA3AF;">Estado</div>
                <div style="font-weight: 600; color: #fff; text-transform: capitalize;">${order.estado}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #9CA3AF;">Método de pago</div>
                <div style="font-weight: 600; color: #fff;">${order.metodo_pago || 'No especificado'}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #9CA3AF;">Fecha del pedido</div>
                <div style="font-weight: 600; color: #fff;">${formatDate(order.creado_en)}</div>
              </div>
              <div style="text-align: left;">
                <div style="font-size: 12px; color: #9CA3AF;">Total productos</div>
                <div style="font-weight: 600; color: #fff;">${order.resumen.total_productos}</div>
              </div>
            </div>

            <!-- Total -->
            <div style="background: rgba(16, 185, 129, 0.15); padding: 15px; border-radius: 12px; border: 1px solid rgba(16, 185, 129, 0.3);">
              <div style="font-size: 12px; color: #9CA3AF; margin-bottom: 5px;">Total del pedido</div>
              <div style="color: #10B981; font-size: 24px; font-weight: 700;">$${order.total}</div>
            </div>
          </div>

          <!-- Productos -->
          <div style="background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px); border-radius: 16px; padding: 20px; border: 1px solid rgba(255, 255, 255, 0.1);">
            <h4 style="color: #fff; font-weight: 600; margin-bottom: 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 10px;">
              <i class="fas fa-box" style="margin-right: 8px;"></i>Productos (${order.detalles.length})
            </h4>
            ${productsHtml}
          </div>
        </div>
      `,
      background: "rgba(0, 0, 0, 0.1)",
      color: "#FFF",
      width: "700px",
      padding: "25px",
      customClass: {
        popup: 'glass-swal-popup'
      },
      showConfirmButton: true,
      confirmButtonText: "<i class='fas fa-times'></i> Cerrar",
      confirmButtonColor: "#6366F1",
      showCloseButton: true,
      showClass: {
        popup: "animate__animated animate__fadeInDown",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutUp",
      },
    });
  };

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/UserCount")
      .then(res => setUserCount(res.data.total_usuarios))
      .catch(err => console.error("Error al obtener usuarios:", err));
  }, []);

  // Funciones de acción de ejemplo
  const viewOrder = (id) => alert(`Ver pedido ${id}`);
  const editOrder = (id) => alert(`Editar pedido ${id}`);
  const addOrder = () => alert("Agregar nuevo pedido");





    
        const regionData = {
            labels: ['Norte', 'Sur', 'Este', 'Oeste', 'Centro'],
            datasets: [{
                label: 'Ventas por Región',
                data: [8500, 7200, 6300, 5900, 4100],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.7)',
                    'rgba(76, 201, 240, 0.7)',
                    'rgba(248, 150, 30, 0.7)',
                    'rgba(247, 37, 133, 0.7)',
                    'rgba(72, 149, 239, 0.7)'
                ]
            }]
        };
               const performanceData = {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Meta',
                data: [18000, 19000, 20000, 21000, 22000, 23000],
                borderColor: 'rgba(247, 37, 133, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }, {
                label: 'Real',
                data: [12000, 19000, 15000, 22000, 18000, 24580],
                borderColor: 'rgba(67, 97, 238, 1)',
                borderWidth: 2,
                fill: false,
                tension: 0.4
            }]
        };
        function showAddUserModal() {
  Swal.fire({
    background: "#f9f9f9",
    showClass: { popup: "animate__animated animate__fadeInDown" },
    hideClass: { popup: "animate__animated animate__fadeOutUp" },
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    title: "Registrar Nuevo Usuario",
    html: `
      <div style="overflow-x:auto; max-width:100%; white-space:nowrap;">
        <table style="min-width:800px; border-collapse:collapse; font-family:Arial, sans-serif; font-size:14px; width:100%;">
          <tbody>
            <tr>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Nombre</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="nombre" type="text" class="swal2-input" placeholder="Ingresa tu nombre" style="width:90%;"/>
              </td>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Apellido</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="apellido" type="text" class="swal2-input" placeholder="Ingresa tu apellido" style="width:90%;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Email</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="email" type="email" class="swal2-input" placeholder="correo@ejemplo.com" style="width:90%;"/>
              </td>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Contraseña</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="password" type="password" class="swal2-input" placeholder="••••••••" style="width:90%;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Teléfono</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="telefono" type="text" class="swal2-input" placeholder="+52 55..." style="width:90%;"/>
              </td>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Fecha de Nacimiento</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <input id="fecha_nacimiento" type="date" class="swal2-input" style="width:90%;"/>
              </td>
            </tr>
            <tr>
              <td style="padding:8px; background:#fabc66; border:1px solid #ddd;">Género</td>
              <td style="padding:8px; border:1px solid #ddd;">
                <select id="genero" class="swal2-input" style="width:90%;">
                  <option value="">Selecciona...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<i class="fas fa-user-plus"></i> Registrar',
    cancelButtonText: '<i class="fas fa-times"></i> Cancelar',
    width: "90%",
    preConfirm: async () => {
      const nombre = document.getElementById("nombre").value.trim();
      const apellido = document.getElementById("apellido").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();
      const telefono = document.getElementById("telefono").value.trim();
      const fecha_nacimiento = document.getElementById("fecha_nacimiento").value.trim();
      const genero = document.getElementById("genero").value.trim();

      if (!nombre || !apellido || !email || !password) {
        Swal.showValidationMessage(" Completa todos los campos obligatorios (nombre, apellido, email, contraseña).");
        return false;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/Signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Nombre: nombre,
            Apellido: apellido,
            Email: email,
            Password: password,
            Telefono: telefono,
            Fecha_nacimiento: fecha_nacimiento,
            Genero: genero,
          }),
        });

        let result = null;
        try {
          result = await response.json();
        } catch {
          throw new Error("El servidor no devolvió una respuesta válida.");
        }

        if (!response.ok) {
          throw new Error(result.error || "Error desconocido en el registro.");
        }

        return result;
      } catch (error) {
        Swal.showValidationMessage(` ${error.message}`);
      }
    },
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      Swal.fire({
        background: "#f9f9f9",
        showClass: { popup: "animate__animated animate__fadeInDown" },
        title: "Usuario registrado correctamente",
        html: `
          <div style="text-align:center; padding:10px;">
            <i class="fas fa-user-check" style="font-size:50px; color:#28a745; margin-bottom:10px;"></i>
            <p style="font-size:16px;">${result.value.nombre} ${result.value.apellido} ha sido registrado exitosamente.</p>
          </div>
        `,
        confirmButtonColor: "#3085d6",
        width: "450px",
      });
    }
  });
}

  // Componente para mostrar estadísticas de métodos de pago
  const PaymentMethodsStats = () => {
    if (paymentStats.loading) {
      return (
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i> Cargando métodos de pago...
        </div>
      );
    }}
  return (


    
    <div className={styles.container}>
      <title>Panel de Administración - Tienda</title>

      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Panel Administrado</h2>
          <p>FASHION LUXE</p>
        </div>

        <div className={styles.sidebarMenu}>
          <ul className={styles.menuList}>
            {[
              { tab: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
              { tab: 'users', icon: 'fa-users', label: 'Usuarios' },
              { tab: 'orders', icon: 'fa-shopping-cart', label: 'Pedidos' },
              { tab: 'products', icon: 'fa-box', label: 'Productos' },
              { tab: 'reports', icon: 'fa-chart-bar', label: 'Reportes' },
              { tab: 'settings', icon: 'fa-cog', label: 'Configuración' },
            ].map(item => (
              <li
                key={item.tab}
                className={clsx(styles.menuItem, activeTab === item.tab && styles.menuItemActive)}
                onClick={() => setActiveTab(item.tab)}
              >
                <a href="#" className={styles.menuLink}>
                  <i className={`fas ${item.icon} ${styles.menuIcon}`}></i>
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={styles.main_content}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.header_left}>
            <h1>Panel de Administración</h1>
          </div>
          <div className={styles.header_right}>
            <div className={styles.user_info}>
              <div className={styles.user_avatar}>A</div>
              <div>
                <div>Administrador</div>
                <small>admin@fashionluxe.com</small>
              </div>
            </div>
            <button className="btn btn-light" onClick={() => alert("Salir")}>
              <LogoutLink/>
            </button>
          </div>
        </div>

        {/* Contenido dinámico */}
        <div className={styles.content}>
          {activeTab === 'dashboard' && (
            <div className={styles.tabContent}>
              {/* Dashboard cards */}
              <div className={styles.dashboard_cards}>
                <div className={styles.card}>
                  <div className={styles.card_header}>
                    <div className={styles.card_title}>Ventas Totales</div>
                    <div className={clsx(styles.card_icon, 'sales')}>
                      <i className='fas fa-shopping-cart'></i>
                    </div>
                  </div>
                  <div className={styles.card_value}>${ordersStats.ventas_totales ? ordersStats.ventas_totales.toLocaleString() : '0'}</div>
                  <div className={styles.card_title}>+12% respecto al mes anterior</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.card_header}>
                    <div className={styles.card_title}>Usuarios Registrados</div>
                    <div className={clsx(styles.card_icon, 'users')}>
                      <i className='fas fa-users'></i>
                    </div>
                  </div>
                  <div className={styles.card_value}>{userCount.toLocaleString()}</div>
                  <div className={styles.card_title}>+12% respecto al mes anterior</div>
                </div>
                <div className={styles.card}>
                  <div className={styles.card_header}>
                    <div className={styles.card_title}>Productos Activos</div>
                    <div className={clsx(styles.card_icon, 'products')}>
                      <i className='fas fa-box'></i>
                    </div>
                  </div>
                  <div className={styles.card_value}>
                    {loadingProducts ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      productsStats.total_productos.toLocaleString()
                    )}
                  </div>
                  <div className={styles.card_title}>
                    {loadingProducts ? (
                      'Cargando...'
                    ) : (
                      <>
                        Stock: {productsStats.total_stock.toLocaleString()} unidades
                        <br />
                        <small style={{fontSize: '12px', opacity: 0.8}}>
                          {getGenderDistribution()}
                        </small>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.card}>
                  <div className={styles.card_header}>
                    <div className={styles.card_title}>Ingresos Netos</div>
                    <div className={clsx(styles.card_icon, 'revenue')}>
                      <i className='fas fa-dollar-sign'></i>
                    </div>
                  </div>
                  <div className={styles.card_value}>${ordersStats.ventas_ultimo_mes ? ordersStats.ventas_ultimo_mes.toLocaleString() : '0'}</div>
                  <div className={styles.card_title}>+15% respecto al mes anterior</div>
                </div>
              </div>

              {/* Charts */}
              <div className={styles.charts}>
                <div className={styles.chart_container}>
                  <div className={styles.chart_title}>Ventas Mensuales</div>
                  <div className={styles.chart}>
                    <SalesChart />
                  </div>
                </div>
                <div className={styles.chart_container}>
                  <div className={styles.chart_title}>Productos más vendidos</div>
                  <div className={styles.chart}>
                    <ProductChart />
                  </div>
                </div>
              </div>

              {/* Pedidos recientes */}
              <div className={styles.table_container}>
                <div className={styles.page_title}>
                  <h2>Pedidos Recientes</h2>
                  <button 
                    className={styles.refreshBtn}
                    onClick={loadAdminOrders}
                    disabled={loadingOrders}
                  >
                    <i className={`fas fa-sync ${loadingOrders ? 'fa-spin' : ''}`}></i>
                    Actualizar
                  </button>
                </div>
                
                {loadingOrders ? (
                  <div className={styles.loading}>
                    <i className="fas fa-spinner fa-spin"></i>
                    Cargando pedidos...
                  </div>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ID Pedido</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                        <th>Productos</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                            <i className="fas fa-inbox" style={{fontSize: '48px', color: '#ddd', marginBottom: '10px'}}></i>
                            <div>No hay pedidos registrados</div>
                          </td>
                        </tr>
                      ) : (
                        orders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <strong>{order.order_short_id}</strong>
                            </td>
                            <td>
                              <div>
                                <strong>{order.user_info.nombre_completo}</strong>
                                <br />
                                <small>{order.user_info.email}</small>
                              </div>
                            </td>
                            <td>
                              {formatDate(order.creado_en)}
                              <br />
                              <small>
                                {new Date(order.creado_en).toLocaleTimeString('es-ES')}
                              </small>
                            </td>
                            <td>
                              <strong>${order.total}</strong>
                            </td>
                            <td>
                              {order.resumen.total_productos} productos
                              <br />
                              <small>{order.resumen.total_items} items</small>
                            </td>
                            <td>
                              <span className={getStatusBadgeClass(order.estado)}>
                                {order.estado}
                              </span>
                            </td>
                            <td>
                              <div className={styles.actionButtons}>
                                <button
                                  className={styles.btnInfo}
                                  onClick={() => viewOrderDetails(order.id)}
                                  title="Ver detalles"
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}






          {/* Aquí puedes agregar más pestañas dinámicas */}
          {activeTab === 'users' && <div className={styles.tabContent}>
              <div className={styles.page_title}>
                <h2>Gestion de Usuario</h2>
                <div>
<button className="btn btn-primary" onClick={showAddUserModal}>
  <i className="fas fa-plus"></i> Agregar Usuario
</button>

                </div>
              </div>
              <div className={styles.table_container}>
                <UsersManagement />
              </div>
            </div>}
          {activeTab === 'orders' && <div className={styles.tabContent}>
            <div className={styles.page_title}>
              <h2>Gestion de Pedidos</h2>
            </div>
          <OrdersManagement/>
            </div>}
          {activeTab === 'products' && <div className={styles.tabContent}>
            <div className={styles.page_title}>
              <h2>Gestion de Productos </h2>
            </div>
            <ProductManagement/>
          </div>}
          {activeTab === 'reports' && <div className={styles.tabContent}>
            <div className={styles.page_title}>
              <h2>Reportes y Análisis</h2>
              <div>
                <button className="btn btn-primary" onclick="generateReport()">
                  <i className="fas fa-chart-pie"></i> Generar Reporte
                </button>
              </div>
              </div>
              <div  className={styles.stats_grid}>
                <div  className={styles.stat_card}>
                    <div className={styles.stat_value}>$24,580</div>
                    <div className={styles.stat_title}>Ventas Totales</div>
                </div>
                <div className={styles.stat_card}>
                        <div className={styles.stat_value}>1,248</div>
                        <div  className={styles.stat_title}>Clientes Registrados</div>
                </div>
                <div className={styles.stat_card}>
                        <div className={styles.stat_value}>356</div>
                        <div  className={styles.stat_title}>Productos Activos</div>
                </div>
                <div className={styles.stat_card}>
                        <div className={styles.stat_value}>84%</div>
                        <div  className={styles.stat_title}>Tasa de Conversión</div>
                </div>
              </div>
    <div className={styles.charts}>
      <div className={styles.chart_container}>
        <div className={styles.chart_title}>Distribución de Ventas por Categoría</div>
        <div className={styles.chart}>
          {/* Llamada con gráfico tipo doughnut */}
          <ReportAnalyze type="doughnut" data={categoryData} />
        </div>
      </div>

      <div className={styles.chart_container}>
        <div className={styles.chart_title}>Métodos de Pago</div>
        <div className={styles.chart}>
          {/* Llamada con gráfico tipo pie */}
          <ReportAnalyze  data={paymentData} />
        </div>
      </div>
    </div>

        <div className={styles.charts}>
      <div className={styles.chart_container}>
        <div className={styles.chart_title}>Rendimiento Mensual </div>
        <div className={styles.chart}>
          {/* Llamada con gráfico tipo doughnut */}
          <ReportAnalyze type="line" data={ performanceData} />
        </div>
      </div>

      <div className={styles.chart_container}>
        <div className={styles.chart_title}>Regiones con Más Ventas</div>
        <div className={styles.chart}>
          {/* Llamada con gráfico tipo pie */}
          <ReportAnalyze type="polarArea" data={regionData} />
        </div>
      </div>
    </div>
  
              </div>}
          {activeTab === 'settings' && <div className={styles.tabContent}>
            <div className={styles.page_title}>
              <h2>Configuración del Sistema</h2>
            </div>
            <div className={styles.settings_container}>
              <div className={styles.settings_card}>
                <div  className={styles.settings_title}>Información de la Tienda</div>
                <form id="storeSettings">
                  <div  className={styles.form_group}>
                      <label  className={styles.form_label}>Nombre de la Tienda</label>
                         <input type="text" className={styles.form_control} value="Fashion Luxe"
                            readOnly // evita que se edite
                            style={{ cursor: 'not-allowed' }} // cambia el cursor a prohibido
                          />
                  </div>
                  <br />
                  <div  className={styles.form_group}>
                      <label  className={styles.form_label}>Email de la tienda </label>
                         <input type="email" className={styles.form_control} value="FashionLuxe@gmail.com"
                            readOnly // evita que se edite
                            style={{ cursor: 'not-allowed' }} // cambia el cursor a prohibido
                          />
                  </div>
                  <br />
                  <div  className={styles.form_group}>
                      <label  className={styles.form_label}>Teléfono</label>
                         <input type="text" className={styles.form_control} value="7774658796"
                            readOnly // evita que se edite
                            style={{ cursor: 'not-allowed' }} // cambia el cursor a prohibido
                          />
                  </div>
                  <br />
                   <div  className={styles.form_group}>
                      <label  className={styles.form_label}>Dirección</label>
                         <input type="text" className={styles.form_control} value="Av. Principal #123, Ciudad, País"
                            readOnly // evita que se edite
                            style={{ cursor: 'not-allowed' }} // cambia el cursor a prohibido
                          />
                  </div>
                </form>
              </div>
              <div className={styles.settings_card}>
                <div className={styles.settings_title}>Configuracion de Notificaciones</div>
                <Notifications/>
              </div>
              <div className={styles.settings_card}>
                <div className={styles.settings_title}>Seguridad</div>
              <Update_Password/>
              </div>
              
              
              
              
              
              
              
              
          </div>  
          </div>}
        </div>
      </div>
    </div>
  );
}
