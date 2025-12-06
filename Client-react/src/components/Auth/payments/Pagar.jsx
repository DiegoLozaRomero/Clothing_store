import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pagar.css';
import { Header, Finalizar_Compra } from '../../Layout/header/Header';
import { Footer } from '../../Layout/footer/Footer';
import axios from "axios";
import Swal from "sweetalert2";

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Servicio para manejar las llamadas a la API
const apiService = {
  async getCart(userId) {
    try {
      // 🚨 2. REEMPLAZO en getCart
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  async createOrder(orderData) {
    try {
      console.log('📤 Enviando orden a la API:', orderData);
      // 🚨 3. REEMPLAZO en createOrder
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📥 Respuesta de la API de órdenes:', data);
      return data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  async clearCart(userId) {
    try {
      // 🚨 4. REEMPLAZO en clearCart
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/clear`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }
};

export default function Pagar() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expiry: '',
    cvv: ''
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [cardType, setCardType] = useState('');
  const [cardLogo, setCardLogo] = useState(<i className="fas fa-credit-card"></i>);

  // Obtener el usuario del localStorage
  useEffect(() => {
    const getCurrentUser = () => {
      const userData = localStorage.getItem('user');
      console.log('👤 User data from localStorage:', userData);
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentUserId(user.id);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };
    
    getCurrentUser();
  }, []);

  // Cargar carrito del usuario
  useEffect(() => {
    if (currentUserId) {
      loadUserCart();
    } else {
      setLoading(false);
    }
  }, [currentUserId]);

  const loadUserCart = async () => {
    if (!currentUserId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const cartData = await apiService.getCart(currentUserId);
      console.log('🛒 Carrito cargado:', cartData);
      
      if (cartData.status === 'success' && cartData.data.items) {
        setCartItems(cartData.data.items);
      } else {
        console.error('Error loading cart:', cartData);
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales basados en el carrito real
  const subtotal = cartItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const shipping = cartItems.length > 0 ? 5.99 : 0;
  const discount = cartItems.length > 0 ? 10.00 : 0;
  const total = subtotal + shipping - discount;

  const detectCardType = (number) => {
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) {
      setCardType('visa');
      setCardLogo(<i className="fab fa-cc-visa"></i>);
    } else if (cleanNumber.startsWith('5')) {
      setCardType('mastercard');
      setCardLogo(<i className="fab fa-cc-mastercard"></i>);
    } else if (cleanNumber.startsWith('3')) {
      setCardType('amex');
      setCardLogo(<i className="fab fa-cc-amex"></i>);
    } else if (cleanNumber.startsWith('6')) {
      setCardType('discover');
      setCardLogo(<i className="fab fa-cc-discover"></i>);
    } else {
      setCardType('');
      setCardLogo(<i className="fas fa-credit-card"></i>);
    }
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handleInputChange = (field, value) => {
    let formattedValue = value;
    
    if (field === 'number') {
      formattedValue = formatCardNumber(value);
      detectCardType(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    }
    
    setCardData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const processPayment = async () => {
    if (!currentUserId) {
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Debes iniciar sesión para realizar el pago
            </p>
          </div>
        `,
        confirmButtonText: "Entendido",
        width: "420px",
      });
      return false;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        title: "Carrito vacío",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-cart-shopping" 
               style="font-size: 60px; color: #f59e0b; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              No hay productos en el carrito
            </p>
          </div>
        `,
        confirmButtonText: "Volver a productos",
        width: "420px",
      }).then(() => {
        navigate('/productos');
      });
      return false;
    }

    // Verificar stock antes de procesar el pago
    const outOfStockItems = cartItems.filter(item => 
      item.stock_disponible !== undefined && item.cantidad > item.stock_disponible
    );

    if (outOfStockItems.length > 0) {
      Swal.fire({
        title: "Stock insuficiente",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-exclamation-triangle" 
               style="font-size: 60px; color: #f59e0b; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Algunos productos no tienen stock suficiente
            </p>
          </div>
        `,
        confirmButtonText: "Revisar carrito",
        width: "420px",
      }).then(() => {
        navigate('/carrito');
      });
      return false;
    }

    return true;
  };

  const createOrderInDatabase = async () => {
    try {
      const orderData = {
        user_id: currentUserId,
        total: total,
        metodo_pago: cardType || 'credit_card',
        detalles: cartItems.map(item => ({
          product_id: item.product_id,
          cantidad: item.cantidad,
          precio_unitario: item.precio_unitario,
          subtotal: item.subtotal
        }))
      };

      console.log('📦 Enviando datos de orden:', orderData);

      const result = await apiService.createOrder(orderData);
      
      if (result.status === 'success') {
        console.log('✅ Orden creada exitosamente:', result.data);
        return result;
      } else {
        throw new Error(result.message || 'Error al crear la orden');
      }
    } catch (error) {
      console.error('❌ Error creating order:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Iniciando proceso de pago...');
    console.log('👤 User ID:', currentUserId);
    console.log('🛒 Cart items:', cartItems);
    
    // Validar que el usuario esté logueado y tenga productos
    if (!await processPayment()) {
      return;
    }

    // Validaciones de tarjeta
    const cardNumber = cardData.number.replace(/\s/g, '');
    if (cardNumber.length < 16) {
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Por favor, ingresa un número de tarjeta válido
            </p>
          </div>
        `,
        confirmButtonText: "Reintentar",
        width: "420px",
      });
      return;
    }
    
    if (cardData.holder.length < 3) {
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
             Por favor, ingresa el nombre del titular de la tarjeta
            </p>
          </div>
        `,
        confirmButtonText: "Reintentar",
        width: "420px",
      });
      return;
    }
    
    if (cardData.expiry.length !== 5) {
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Por favor, ingresa una fecha de vencimiento válida (MM/AA)
            </p>
          </div>
        `,
        confirmButtonText: "Reintentar",
        width: "420px",
      });
      return;
    }
    
    if (cardData.cvv.length < 3) {
      Swal.fire({
        title: "Error",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Por favor, ingresa un CVV válido
            </p>
          </div>
        `,
        confirmButtonText: "Reintentar",
        width: "420px",
      });
      return;
    }

    // Iniciar procesamiento
    setProcessing(true);
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;

    submitBtn.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div class="spinner-border spinner-border-sm" 
             style="width: 16px; height: 16px; border-width: 2px;"></div>
        Procesando pago...
      </div>
    `;
    submitBtn.disabled = true;

    try {
      // Simular procesamiento de pago con gateway
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Crear orden en la base de datos
      const orderResult = await createOrderInDatabase();
      
      if (orderResult.status === 'success') {
        // Limpiar carrito después del pago exitoso
        await apiService.clearCart(currentUserId);

        // Mostrar alerta de éxito - CORREGIDO
        const orderId = orderResult.data.id || orderResult.data.order_id;
        const orderNumber = orderId ? `#${orderId.substring(0, 8).toUpperCase()}` : '#000001';
        
        Swal.fire({
          title: "¡Pago exitoso!",
          html: `
            <div style="text-align: center; padding: 15px;">
              <i class="fa-solid fa-circle-check" 
                 style="font-size: 60px; color: #4ade80; margin-bottom: 15px;"></i>
              <p style="font-size: 16px; color: #000000ff; margin-bottom: 5px;">
                ¡Pago procesado exitosamente!
              </p>
              <p style="font-size: 14px; color: #666; margin: 0;">
                Número de orden: ${orderNumber}
              </p>
              <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">
                Total pagado: $${total.toFixed(2)}
              </p>
            </div>
          `,
          confirmButtonColor: "#6366F1",
          confirmButtonText: "Ver mis pedidos",
          width: "450px",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/Perfil');
          } else {
            // Redirigir al home
            setTimeout(() => {
              navigate('/');
            }, 3000);
          }
        });
      } else {
        throw new Error(orderResult.message || 'Error al crear la orden');
      }

    } catch (error) {
      console.error('Payment error:', error);
      Swal.fire({
        title: "Error en el pago",
        html: `
          <div style="text-align: center; padding: 15px;">
            <i class="fa-solid fa-circle-xmark" 
               style="font-size: 60px; color: #ef4444; margin-bottom: 15px;"></i>
            <p style="font-size: 16px; color: #010101ff;">
              Hubo un problema al procesar tu pago. Por favor, intenta nuevamente.
            </p>
            <p style="font-size: 14px; color: #666; margin: 5px 0 0 0;">
              ${error.message}
            </p>
          </div>
        `,
        confirmButtonText: "Reintentar",
        width: "450px",
      });
    } finally {
      // Restaurar el botón
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      setProcessing(false);
    }
  };

  const handleBackToCart = () => {
    navigate('/carrito');
  };

  if (loading) {
    return (
      <div className="pagar-page">
        <Header/>
        <Finalizar_Compra/>
        <div className="payment-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando información de pago...</p>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="pagar-page">
        <Header/>
        <Finalizar_Compra/>
        <div className="payment-container">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-lock"></i>
            </div>
            <h3 className="empty-title">Inicia sesión para pagar</h3>
            <p className="empty-text">
              Debes iniciar sesión para proceder con el pago de tu pedido.
            </p>
            <div className="auth-actions">
              <a href="/login" className="btn-primary">Iniciar Sesión</a>
              <a href="/registro" className="btn-secondary">Crear Cuenta</a>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="pagar-page">
        <Header/>
        <Finalizar_Compra/>
        <div className="payment-container">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <h3 className="empty-title">Carrito vacío</h3>
            <p className="empty-text">
              No hay productos en tu carrito. Agrega algunos productos antes de proceder al pago.
            </p>
            <div className="auth-actions">
              <a href="/productos" className="btn-primary">Explorar Productos</a>
              <a href="/carrito" className="btn-secondary">Ver Carrito</a>
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="pagar-page">
      <Header/>
      <Finalizar_Compra/>
    
      {/* CONTENIDO PRINCIPAL DEL PAGO */}
      <div className="payment-container">
        <div className="section-title">
          <h2>Información de Pago</h2>
        </div>
        <p className="section-subtitle">Completa tus datos de pago de forma segura</p>
        
        <div className="payment-content">
          {/* FORMULARIO DE PAGO */}
          <div className="payment-form-container">
            <div className="payment-form">
              <h3 className="form-title">Detalles de la Tarjeta</h3>
              
              {/* TARJETA DIGITAL */}
              <div className="card-container">
                <div 
                  className={`card ${cardType} ${isCardFlipped ? 'flipped' : ''}`} 
                  onClick={() => setIsCardFlipped(!isCardFlipped)}
                >
                  {/* FRENTE DE LA TARJETA */}
                  <div className="card-front">
                    <div className="card-logo">
                      {cardLogo}
                    </div>
                    <div className="card-chip"></div>
                    <div className="card-number">
                      {cardData.number || '**** **** **** ****'}
                    </div>
                    <div className="card-details">
                      <div className="card-holder">
                        <div className="card-label">TITULAR DE LA TARJETA</div>
                        <div>{cardData.holder.toUpperCase() || 'NOMBRE DEL TITULAR'}</div>
                      </div>
                      <div className="card-expiry">
                        <div className="card-label">VÁLIDO HASTA</div>
                        <div>{cardData.expiry || 'MM/AA'}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* REVERSO DE LA TARJETA */}
                  <div className="card-back">
                    <div className="card-stripe"></div>
                    <div className="card-signature">
                      <div>Firma del titular</div>
                    </div>
                    <div className="card-cvv">
                      <div className="card-label">CVV</div>
                      <div>{cardData.cvv || '***'}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* FORMULARIO */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Número de Tarjeta</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    value={cardData.number}
                    onChange={(e) => handleInputChange('number', e.target.value)}
                    disabled={processing}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Nombre del Titular</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Como aparece en la tarjeta"
                    value={cardData.holder}
                    onChange={(e) => handleInputChange('holder', e.target.value)}
                    disabled={processing}
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">Fecha de Vencimiento</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="MM/AA"
                        maxLength="5"
                        value={cardData.expiry}
                        onChange={(e) => handleInputChange('expiry', e.target.value)}
                        disabled={processing}
                      />
                    </div>
                  </div>
                  <div className="form-col">
                    <div className="form-group">
                      <label className="form-label">CVV</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="123"
                        maxLength="3"
                        value={cardData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value)}
                        onFocus={() => setIsCardFlipped(true)}
                        onBlur={() => setIsCardFlipped(false)}
                        disabled={processing}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={handleBackToCart}
                    disabled={processing}
                  >
                    <i className="fas fa-arrow-left"></i> Volver al Carrito
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i> Procesando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-lock"></i> Pagar ${total.toFixed(2)}
                      </>
                    )}
                  </button>
                </div>
                
                <div className="secure-payment">
                  <i className="fas fa-shield-alt"></i>
                  <span>Pago 100% seguro y encriptado</span>
                </div>
              </form>
            </div>
          </div>
          
          {/* RESUMEN DE COMPRA */}
          <div className="order-summary">
            <h3 className="summary-title">Resumen de Pedido</h3>
            
            <div className="summary-row">
              <span>Subtotal ({cartItems.length} producto{cartItems.length !== 1 ? 's' : ''})</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Envío</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Descuento</span>
              <span style={{color: '#4CAF50'}}>-${discount.toFixed(2)}</span>
            </div>
            
            <div className="summary-row summary-total">
              <span>Total</span>
              <span className="amount">${total.toFixed(2)}</span>
            </div>
            
            <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee'}}>
              <h4 style={{marginBottom: '10px'}}>Productos en el pedido:</h4>
              {cartItems.map(item => (
                <div key={item.item_id} style={{display: 'flex', alignItems: 'center', marginBottom: '10px'}}>
                  <img 
                    src={item.imagen_url || 'https://via.placeholder.com/50x50?text=Imagen'} 
                    alt={item.nombre} 
                    style={{width: '50px', height: '50px', borderRadius: '5px', marginRight: '10px', objectFit: 'cover'}}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/50x50?text=Imagen';
                    }}
                  />
                  <div style={{flex: 1}}>
                    <div style={{fontSize: '0.9rem', fontWeight: '500'}}>{item.nombre}</div>
                    <div style={{fontSize: '0.8rem', color: '#666'}}>
                      Cantidad: {item.cantidad} × ${item.precio_unitario?.toFixed(2)}
                    </div>
                    {item.stock_disponible !== undefined && (
                      <div style={{fontSize: '0.7rem', color: item.stock_disponible >= item.cantidad ? '#4CAF50' : '#f44336'}}>
                        {item.stock_disponible >= item.cantidad ? '✓ En stock' : '✗ Stock insuficiente'}
                      </div>
                    )}
                  </div>
                  <div style={{fontSize: '0.9rem', fontWeight: '600'}}>
                    ${item.subtotal?.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-features">
              <div className="feature">
                <i className="fas fa-shipping-fast"></i>
                <span>Envío gratis en compras mayores a $100</span>
              </div>
              <div className="feature">
                <i className="fas fa-undo"></i>
                <span>Devoluciones gratis en 30 días</span>
              </div>
              <div className="feature">
                <i className="fas fa-shield-alt"></i>
                <span>Garantía del producto incluida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer/>
    </div>
  );
}