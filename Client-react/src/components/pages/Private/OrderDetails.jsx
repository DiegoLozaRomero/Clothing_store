// OrderDetails.jsx - Completamente corregido
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "../../Layout/header/Header";
import { Footer } from "../../Layout/footer/Footer";
import { FloatingWhatsApp } from "../../FloatingWhatsApp/FloatingWhatsApp";
import styles from "./OrderDetails.module.css";

const apiService = {
  async getOrderDetails(orderId) {
    try {
      console.log(`🔍 Obteniendo detalles para ID: ${orderId}`);
      console.log(`📏 Longitud del ID: ${orderId.length}`);
      
      // Detectar si el ID parece encriptado
      // Los IDs encriptados de Fernet generalmente:
      // - Tienen 44 caracteres
      // - Comienzan con 'gAAAA'
      // - Contienen solo caracteres base64
      const isLikelyEncrypted = orderId.length === 44 && orderId.startsWith('gAAAA');
      
      let url;
      if (isLikelyEncrypted) {
        console.log('🔐 ID parece encriptado, usando endpoint especial');
        // Usar el endpoint que maneja IDs encriptados
        url = `${API_BASE_URL}/orders/encrypted/${encodeURIComponent(orderId)}`;
      } else {
        console.log('📋 ID parece normal');
        // Usar el endpoint normal
        url = `${API_BASE_URL}/orders/${orderId}`;
      }
      
      console.log(`📡 Llamando a: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        // Si falla con el endpoint especial, intentar con el normal
        if (isLikelyEncrypted) {
          console.log('⚠️ Falló con endpoint encriptado, intentando con normal...');
          const normalUrl = `${API_BASE_URL}/orders/${orderId}`;
          const normalResponse = await fetch(normalUrl);
          
          if (!normalResponse.ok) {
            throw new Error(`HTTP error! status: ${normalResponse.status}`);
          }
          
          const data = await normalResponse.json();
          return data;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }
};

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const receiptRef = useRef();

  // Definir los pasos del proceso
  const orderSteps = [
    { id: 1, name: "Pendiente", description: "Pedido recibido y en espera de confirmación", icon: "fas fa-clock" },
    { id: 2, name: "Confirmado", description: "Pedido confirmado y validado", icon: "fas fa-check-circle" },
    { id: 3, name: "En preparación", description: "Productos siendo preparados y empaquetados", icon: "fas fa-box" },
    { id: 4, name: "Enviado", description: "Pedido en camino a su destino", icon: "fas fa-shipping-fast" },
    { id: 5, name: "Entregado", description: "Pedido entregado satisfactoriamente", icon: "fas fa-home" }
  ];

  // Mapeo de estados a pasos
  const getCurrentStep = (status) => {
    console.log('Estado recibido desde BD:', status);
    
    switch (status?.toLowerCase().trim()) {
      case 'pendiente': return 1;
      case 'confirmado': return 2;
      case 'en preparación': 
      case 'en preparacion': 
      case 'procesando': return 3;
      case 'enviado': 
      case 'en camino': return 4;
      case 'entregado': 
      case 'completado': return 5;
      case 'cancelado': return 0;
      default: return 1;
    }
  };

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando carga de detalles del pedido...');
      
      const orderDetails = await apiService.getOrderDetails(orderId);
      
      if (orderDetails.status === 'success') {
        setOrder(orderDetails.data);
        console.log('✅ Datos del pedido cargados:', orderDetails.data);
        
        // Verificar que el ID del pedido esté correcto
        if (orderDetails.data.original_id) {
          console.log(`📝 ID original: ${orderDetails.data.original_id}`);
          console.log(`🔐 ID encriptado: ${orderDetails.data.id}`);
        }
      } else {
        setError(orderDetails.message || 'No se pudieron cargar los detalles del pedido');
        console.error('❌ Error en respuesta:', orderDetails);
      }
    } catch (err) {
      setError('Error al cargar los detalles del pedido');
      console.error('❌ Error en fetchOrderDetails:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase().trim()) {
      case 'entregado': 
      case 'completado': return '#10b981';
      case 'enviado': 
      case 'en camino': return '#3b82f6';
      case 'en preparación': 
      case 'en preparacion': 
      case 'procesando': return '#f59e0b';
      case 'confirmado': return '#8b5cf6';
      case 'pendiente': return '#6b7280';
      case 'cancelado': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return dateString;
    }
  };

  const formatDateForReceipt = (dateString) => {
    if (!dateString) return 'Fecha no disponible';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formateando fecha para recibo:', error);
      return dateString;
    }
  };

  const calculateProgress = (status) => {
    const currentStep = getCurrentStep(status);
    if (currentStep === 0) return 0;
    return ((currentStep - 1) / (orderSteps.length - 1)) * 100;
  };

  const handlePrintReceipt = () => {
    if (!order) return;
    
    const printWindow = window.open('', '_blank');
    
    // Usar el ID encriptado o mostrar los primeros 8 caracteres
    const displayOrderId = order.id ? order.id.substring(0, 8).toUpperCase() : 'N/A';
    
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Comprobante - Pedido #${order.id.substring(0, 8).toUpperCase()}</title>
        <meta charset="utf-8">
        <style>
          /* Reset básico */
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Arial', sans-serif; 
            background: #fff; 
            color: #000; 
            line-height: 1.4; 
            padding: 20px; 
            font-size: 12px;
          }
          
          .receipt { 
            max-width: 700px; 
            margin: 0 auto; 
            border: 2px solid #000; 
            padding: 0;
            background: white;
          }
          
          /* Header */
          .header { 
            background: #000; 
            color: white; 
            padding: 25px; 
            text-align: center; 
            border-bottom: 3px solid #ff9f1c; 
          }
          
          .company-name { 
            font-size: 24px; 
            font-weight: bold; 
            margin-bottom: 5px; 
            text-transform: uppercase;
          }
          
          .company-tagline { 
            font-size: 12px; 
            opacity: 0.9; 
            margin-bottom: 15px;
          }
          
          .receipt-title { 
            font-size: 18px; 
            font-weight: bold; 
            margin: 15px 0; 
            color: #ff9f1c; 
            text-transform: uppercase;
          }
          
          /* Información del pedido */
          .order-info { 
            padding: 20px; 
            background: #f8f8f8; 
            border-bottom: 1px dashed #ccc;
          }
          
          .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 10px; 
          }
          
          .info-item { 
            display: flex; 
            justify-content: space-between; 
            padding: 5px 0; 
            border-bottom: 1px solid #eee; 
          }
          
          .info-label { 
            font-weight: bold; 
            color: #333; 
          }
          
          /* Tabla de productos */
          .products { 
            padding: 20px; 
          }
          
          .products-table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
            font-size: 11px;
          }
          
          .products-table th { 
            background: #f0f0f0; 
            padding: 8px; 
            text-align: left; 
            font-weight: bold; 
            border-bottom: 2px solid #ddd; 
          }
          
          .products-table td { 
            padding: 8px; 
            border-bottom: 1px solid #eee; 
            vertical-align: top;
          }
          
          .product-name { 
            font-weight: bold; 
          }
          
          /* Resumen */
          .summary { 
            padding: 20px; 
            background: #f8f8f8; 
            border-top: 1px dashed #ccc;
          }
          
          .summary-row { 
            display: flex; 
            justify-content: space-between; 
            padding: 6px 0; 
            border-bottom: 1px solid #ddd; 
          }
          
          .summary-total { 
            font-size: 16px; 
            font-weight: bold; 
            border-bottom: none; 
            border-top: 2px solid #000; 
            margin-top: 8px; 
            padding-top: 10px; 
          }
          
          /* Footer */
          .footer { 
            padding: 15px; 
            text-align: center; 
            background: #000; 
            color: white; 
            border-top: 3px solid #ff9f1c; 
          }
          
          .thank-you { 
            font-size: 14px; 
            margin-bottom: 8px; 
            font-weight: bold;
          }
          
          .contact { 
            font-size: 10px; 
            opacity: 0.8; 
          }
          
          .status { 
            background: ${getStatusColor(order.estado)}; 
            color: white; 
            padding: 4px 8px; 
            border-radius: 10px; 
            font-size: 10px; 
            font-weight: bold; 
          }
          
          @media print {
            body { padding: 0; margin: 0; }
            .receipt { border: none; box-shadow: none; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <!-- Header -->
          <div class="header">
            <div class="company-name">FASHION LUXE</div>
            <div class="company-tagline">Premium Fashion & Lifestyle</div>
            <div class="receipt-title">Comprobante de Pedido</div>
          </div>
          
          <!-- Información del Pedido -->
          <div class="order-info">
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">N° de Pedido:</span>
                <span>#${order.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Fecha:</span>
                <span>${formatDateForReceipt(order.creado_en)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Estado:</span>
                <span class="status">${order.estado}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Método de Pago:</span>
                <span>${order.metodo_pago || 'No especificado'}</span>
              </div>
            </div>
          </div>
          
          <!-- Productos -->
          <div class="products">
            <h3 style="margin-bottom: 15px; color: #333;">PRODUCTOS</h3>
            <table class="products-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                ${order.detalles.map(detalle => `
                  <tr>
                    <td class="product-name">${detalle.producto_nombre}</td>
                    <td>$${detalle.precio_unitario}</td>
                    <td>${detalle.cantidad}</td>
                    <td>$${detalle.subtotal}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Resumen -->
          <div class="summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>$${order.total}</span>
            </div>
            <div class="summary-row">
              <span>Envío:</span>
              <span>Gratis</span>
            </div>
            <div class="summary-row">
              <span>Impuestos:</span>
              <span>Incluidos</span>
            </div>
            <div class="summary-row summary-total">
              <span>TOTAL:</span>
              <span>$${order.total}</span>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <div class="thank-you">¡Gracias por su compra!</div>
            <div class="contact">Fashion Luxe • contacto@fashionluxe.com</div>
            <div class="contact" style="margin-top: 5px; font-size: 9px;">
              Este comprobante es válido como factura informal
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHtml);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    }, 500);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Cargando detalles del pedido...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className={styles.errorContainer}>
        <i className="fas fa-exclamation-triangle"></i>
        <h3>{error || 'Pedido no encontrado'}</h3>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/perfil')}
        >
          Volver a Mis Pedidos
        </button>
      </div>
    );
  }

  const currentStep = getCurrentStep(order.estado);
  const progress = calculateProgress(order.estado);

  // Si el pedido está cancelado, mostrar estado especial
  if (order.estado?.toLowerCase() === 'cancelado') {
    return (
      <div className={styles.container}>
        <Header />
        <br /><br /><br />
        <main className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>Detalles del Pedido</h1>
              <p className={styles.orderNumber}># {order.id.substring(0, 8).toUpperCase()}</p>
            </div>
            <button 
              className={styles.backButton}
              onClick={() => navigate('/perfil', { state: { activeSection: 'orders' } })}
            >
              <i className="fas fa-arrow-left"></i>
              Volver a Pedidos
            </button>
          </div>

          <div className={styles.canceledOrder}>
            <div className={styles.canceledIcon}>
              <i className="fas fa-times-circle"></i>
            </div>
            <h2>Pedido Cancelado</h2>
            <p>Este pedido ha sido cancelado y no está activo.</p>
            
            <div className={styles.orderInfoCanceled}>
              <div className={styles.infoCard}>
                <h3 className={styles.cardTitle}>
                  <i className="fas fa-info-circle"></i>
                  Información del Pedido Cancelado
                </h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Estado:</span>
                    <span 
                      className={styles.statusBadge}
                      style={{ backgroundColor: getStatusColor(order.estado) }}
                    >
                      {order.estado}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Fecha:</span>
                    <span>{formatDate(order.creado_en)}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Total:</span>
                    <span className={styles.totalAmount}>${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <FloatingWhatsApp />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <br /><br /><br />
      <main className={styles.main}>
        {/* Header del pedido */}
        <div className={styles.header}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Detalles del Pedido</h1>
            <p className={styles.orderNumber}># {order.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/perfil', { state: { activeSection: 'orders' } })}
          >
            <i className="fas fa-arrow-left"></i>
            Volver a Pedidos
          </button>
        </div>

        {/* Progreso de 5 pasos */}
        <div className={styles.progressSection}>
          <h2 className={styles.sectionTitle}>Seguimiento del Pedido</h2>
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className={styles.steps}>
              {orderSteps.map((step, index) => (
                <div 
                  key={step.id}
                  className={`${styles.step} ${currentStep >= step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                >
                  <div className={styles.stepIcon}>
                    <i className={step.icon}></i>
                  </div>
                  <div className={styles.stepContent}>
                    <h4 className={styles.stepName}>{step.name}</h4>
                    <p className={styles.stepDescription}>{step.description}</p>
                  </div>
                  {index < orderSteps.length - 1 && (
                    <div className={styles.stepConnector}></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Información del pedido */}
          <div className={styles.orderInfo}>
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>
                <i className="fas fa-info-circle"></i>
                Información del Pedido
              </h3>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Estado:</span>
                  <span 
                    className={styles.statusBadge}
                    style={{ backgroundColor: getStatusColor(order.estado) }}
                  >
                    {order.estado}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Fecha:</span>
                  <span>{formatDate(order.creado_en)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Método de Pago:</span>
                  <span>{order.metodo_pago || 'No especificado'}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Total:</span>
                  <span className={styles.totalAmount}>${order.total}</span>
                </div>
              </div>
            </div>

            {/* Productos del pedido */}
            <div className={styles.infoCard}>
              <h3 className={styles.cardTitle}>
                <i className="fas fa-boxes"></i>
                Productos ({order.detalles.length})
              </h3>
              <div className={styles.productsList}>
                {order.detalles.map((detalle) => (
                  <div key={detalle.id} className={styles.productItem}>
                    <img 
                      src={detalle.producto_imagen || 'https://via.placeholder.com/80x80?text=Imagen'} 
                      alt={detalle.producto_nombre}
                      className={styles.productImage}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Imagen';
                      }}
                    />
                    <div className={styles.productInfo}>
                      <h4 className={styles.productName}>{detalle.producto_nombre}</h4>
                      <p className={styles.productDetails}>
                        Cantidad: {detalle.cantidad} × ${detalle.precio_unitario}
                      </p>
                      <p className={styles.productSubtotal}>
                        Subtotal: ${detalle.subtotal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen y acciones */}
          <div className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.cardTitle}>Resumen</h3>
              <div className={styles.summaryItem}>
                <span>Subtotal:</span>
                <span>${order.total}</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Envío:</span>
                <span>Gratis</span>
              </div>
              <div className={styles.summaryItem}>
                <span>Impuestos:</span>
                <span>Incluidos</span>
              </div>
              <div className={styles.summaryTotal}>
                <span>Total:</span>
                <span>${order.total}</span>
              </div>
            </div>

            <div className={styles.actionsCard}>
              <h3 className={styles.cardTitle}>Acciones</h3>
              <div className={styles.actions}>
                <button 
                  className={styles.actionButton}
                  onClick={handlePrintReceipt}
                >
                  <i className="fas fa-receipt"></i>
                  Imprimir Comprobante
                </button>
                <button className={styles.actionButton}>
                  <i className="fas fa-redo"></i>
                  Volver a Comprar
                </button>
                <button className={styles.actionButton}>
                  <i className="fas fa-headset"></i>
                  Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
