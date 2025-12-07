import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Carrito.css';
import { Header, Header_Carrito } from '../../Layout/header/Header';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
import Swal from 'sweetalert2';

// Servicio para manejar las llamadas a la API
const apiService = {
  async getCart(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  },

  async updateCartItem(itemId, cantidad) {
    try {
      const response = await fetch('${API_BASE_URL}/cart/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          cantidad: cantidad
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating cart:', error);
      throw error;
    }
  },

  async removeFromCart(itemId) {
    try {
      const response = await fetch('${API_BASE_URL}/cart/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  },

  async clearCart(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/clear`, {
        method: 'DELETE'
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  },

  async getProducts() {
    try {
      const response = await fetch('${API_BASE_URL}/products');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },

  async addToCart(userId, productId, cantidad = 1) {
    try {
      const response = await fetch('${API_BASE_URL}/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId,
          cantidad: cantidad
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }
};

export default function Carrito() {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartItems, setCartItems] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Obtener el usuario del localStorage
  useEffect(() => {
    const getCurrentUser = () => {
      const userData = localStorage.getItem('user');
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

  // Cargar carrito y productos recomendados
  useEffect(() => {
    if (currentUserId) {
      loadUserCart();
      loadRecommendedProducts();
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
      
      if (cartData.status === 'success') {
        const cartItems = cartData.data.items || [];
        setItems(cartItems);
        setCartItems(cartItems.length);
      } else {
        console.error('Error loading cart:', cartData);
        setItems([]);
        setCartItems(0);
      }
    } catch (error) {
      console.error('Error loading cart:', error);
      setItems([]);
      setCartItems(0);
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendedProducts = async () => {
    try {
      const productsResponse = await apiService.getProducts();
      if (productsResponse.status === 'success') {
        // Filtrar productos recomendados (excluyendo los que ya están en el carrito)
        const cartProductIds = items.map(item => item.product_id);
        const recommended = productsResponse.data
          .filter(product => 
            product.activo && 
            product.stock > 0 && 
            !cartProductIds.includes(product.id)
          )
          .slice(0, 3) // Tomar solo 3 productos
          .map(product => ({
            id: product.id,
            name: product.nombre,
            description: product.descripcion,
            price: product.precio,
            image: product.imagen_url,
            badge: product.stock < 10 ? 'Pocas unidades' : 'Nuevo'
          }));
        
        setRecommendedProducts(recommended);
      }
    } catch (error) {
      console.error('Error loading recommended products:', error);
      // Productos recomendados por defecto
      setRecommendedProducts([
        {
          id: 1,
          name: "Camisa Oxford Gris",
          description: "Clásica camisa Oxford en color gris, versátil para looks casuales.",
          price: 42.49,
          image: "https://images.unsplash.com/photo-1525450824782-b60f5a1d654a?auto=format&fit=crop&w=500&q=80",
          badge: "-15%"
        },
        {
          id: 2,
          name: "Polo Clásico Blanco",
          description: "Polo de algodón pima, ideal para looks casuales y semi-formales.",
          price: 34.99,
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
          badge: "Nuevo"
        },
        {
          id: 3,
          name: "Camisa Denim Azul",
          description: "Camisa de mezclilla resistente, perfecta para un estilo casual.",
          price: 45.99,
          image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=500&q=80",
          badge: "Popular"
        }
      ]);
    }
  };

  const handleProceedToPay = () => {
    if (!currentUserId) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para proceder al pago',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    if (items.length === 0) {
      Swal.fire({
        title: 'Carrito vacío',
        text: 'Agrega productos al carrito antes de proceder al pago',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    navigate('/Pagar');
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const result = await apiService.removeFromCart(itemId);
      if (result.status === 'success') {
        // Actualizar estado local
        const updatedItems = items.filter(item => item.item_id !== itemId);
        setItems(updatedItems);
        setCartItems(updatedItems.length);
        
        Swal.fire({
          title: 'Eliminado',
          text: 'Producto eliminado del carrito',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message || 'Error al eliminar producto');
      }
    } catch (error) {
      console.error('Error removing item:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto del carrito',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const handleQuantityChange = async (itemId, change) => {
    try {
      const item = items.find(item => item.item_id === itemId);
      if (!item) return;

      const newQuantity = item.cantidad + change;
      if (newQuantity < 1) return;

      // Verificar stock
      if (item.stock_disponible < newQuantity) {
        Swal.fire({
          title: 'Stock insuficiente',
          text: `Solo quedan ${item.stock_disponible} unidades disponibles`,
          icon: 'warning',
          timer: 2000
        });
        return;
      }

      const result = await apiService.updateCartItem(itemId, newQuantity);
      if (result.status === 'success') {
        // Actualizar estado local
        const updatedItems = items.map(item => 
          item.item_id === itemId 
            ? { ...item, cantidad: newQuantity, subtotal: newQuantity * item.precio_unitario }
            : item
        );
        setItems(updatedItems);
      } else {
        throw new Error(result.message || 'Error al actualizar cantidad');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar la cantidad',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const handleClearCart = async () => {
    if (!currentUserId) return;

    try {
      const result = await Swal.fire({
        title: '¿Vaciar carrito?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, vaciar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const clearResult = await apiService.clearCart(currentUserId);
        if (clearResult.status === 'success') {
          setItems([]);
          setCartItems(0);
          Swal.fire({
            title: 'Carrito vaciado',
            text: 'Todos los productos han sido eliminados',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(clearResult.message || 'Error al vaciar carrito');
        }
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo vaciar el carrito',
        icon: 'error',
        timer: 2000
      });
    }
  };

  const handleAddRecommended = async (product) => {
    if (!currentUserId) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return;
    }

    try {
      const result = await apiService.addToCart(currentUserId, product.id, 1);
      if (result.status === 'success') {
        // Recargar el carrito para obtener los datos actualizados
        await loadUserCart();
        
        Swal.fire({
          title: '¡Agregado!',
          text: 'Producto agregado al carrito',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message || 'Error al agregar producto');
      }
    } catch (error) {
      console.error('Error adding recommended product:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito',
        icon: 'error',
        timer: 2000
      });
    }
  };

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const shipping = items.length > 0 ? 5.99 : 0;
  const discount = items.length > 0 ? 10.00 : 0;
  const total = subtotal + shipping - discount;

  if (loading) {
    return (
      <div className="carrito-page">
        <Header/>
        <Header_Carrito/>
        <div className="cart-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i>
            <p>Cargando tu carrito...</p>
          </div>
        </div>
        <Footer/>
        <FloatingWhatsApp/>
      </div>
    );
  }

  return (
    <div className="carrito-page">
      <Header/>
      <Header_Carrito/>
      
      <div className="cart-container">
        <div className="section-title">
          <h2>Tu selección de productos</h2>
        </div>
        <p className="section-subtitle">Revisa y modifica los artículos antes de finalizar tu compra</p>

        <div className="cart-content">
          <div className="cart-main">
            <div className="cart-header">
              <div className="cart-count">{cartItems} artículo{cartItems !== 1 ? 's' : ''} en el carrito</div>
              {cartItems > 0 && (
                <button className="clear-cart" onClick={handleClearCart}>
                  Vaciar carrito
                </button>
              )}
            </div>

            {cartItems === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="fas fa-shopping-cart"></i>
                </div>
                <h3 className="empty-title">Tu carrito está vacío</h3>
                <p className="empty-text">
                  {currentUserId 
                    ? "Aún no has añadido ningún producto a tu carrito. Explora nuestra colección y añade los artículos que más te gusten."
                    : "Inicia sesión para ver tu carrito de compras. Si ya tienes una cuenta, inicia sesión para ver tus productos guardados."
                  }
                </p>
                <a href="/productos" className="btn-primary">Explorar Productos</a>
                {!currentUserId && (
                  <a href="/login" className="btn-secondary" style={{marginLeft: '10px'}}>
                    Iniciar Sesión
                  </a>
                )}
              </div>
            ) : (
              <>
                <div className="cart-items" id="cart-items">
                  {items.map(item => (
                    <div key={item.item_id} className="cart-item">
                      <div className="cart-item-image">
                        <img 
                          src={item.imagen_url || 'https://via.placeholder.com/100x100?text=Imagen+No+Disponible'} 
                          alt={item.nombre}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=Imagen+No+Disponible';
                          }}
                        />
                      </div>
                      <div className="cart-item-details">
                        <div>
                          <h3 className="cart-item-title">{item.nombre}</h3>
                          <p className="cart-item-description">{item.descripcion}</p>
                          <div className="cart-item-price">
                            <span className="price">${item.precio_unitario?.toFixed(2) || '0.00'}</span>
                          </div>
                          {item.stock_disponible !== undefined && (
                            <div className="stock-info">
                              {item.stock_disponible > 0 ? (
                                <span className="in-stock">
                                  <i className="fas fa-check"></i> 
                                  {item.stock_disponible} disponibles
                                </span>
                              ) : (
                                <span className="out-of-stock">
                                  <i className="fas fa-times"></i> Agotado
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="cart-item-controls">
                          <div className="quantity-controls">
                            <button 
                              className="quantity-btn minus" 
                              onClick={() => handleQuantityChange(item.item_id, -1)}
                              disabled={item.cantidad <= 1}
                            >
                              -
                            </button>
                            <input 
                              type="text" 
                              className="quantity-input" 
                              value={item.cantidad} 
                              readOnly
                            />
                            <button 
                              className="quantity-btn plus" 
                              onClick={() => handleQuantityChange(item.item_id, 1)}
                              disabled={item.stock_disponible !== undefined && item.cantidad >= item.stock_disponible}
                            >
                              +
                            </button>
                          </div>
                          <div className="item-subtotal">
                            ${item.subtotal?.toFixed(2) || '0.00'}
                          </div>
                          <button 
                            className="remove-item"
                            onClick={() => handleRemoveItem(item.item_id)}
                          >
                            <i className="fas fa-trash"></i> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {recommendedProducts.length > 0 && (
                  <div className="recommendations">
                    <h3 className="section-title" style={{fontSize: '1.8rem', textAlign: 'left'}}>
                      Productos que te pueden gustar
                    </h3>
                    <div className="recommendations-grid">
                      {recommendedProducts.map(product => (
                        <div key={product.id} className="product-card">
                          {product.badge && (
                            <div className="product-badge">{product.badge}</div>
                          )}
                          <div className="product-image">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '';
                              }}
                            />
                          </div>
                          <div className="product-info">
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <div className="product-price">
                              <div>
                                <span className="price">${product.price?.toFixed(2)}</span>
                              </div>
                              <button 
                                className="add-to-cart"
                                onClick={() => handleAddRecommended(product)}
                              >
                                <i className="fas fa-plus"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
          
          {cartItems > 0 && (
            <div className="cart-summary">
              <h3 className="summary-title">Resumen de compra</h3>
              
              <div className="summary-row">
                <span>Subtotal ({cartItems} producto{cartItems !== 1 ? 's' : ''})</span>
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
              
              <div className="promo-code">
                <p style={{marginBottom: '10px', fontWeight: '600'}}>¿Tienes un código de descuento?</p>
                <div className="promo-input">
                  <input type="text" placeholder="Ingresa tu código"/>
                  <button className="btn-apply">Aplicar</button>
                </div>
              </div>
              
              <button className="checkout-btn" onClick={handleProceedToPay}>
                <i className="fas fa-lock"></i> Proceder al pago
              </button>
              
              <div className="secure-checkout">
                <i className="fas fa-shield-alt"></i>
                <span>Compra 100% segura y protegida</span>
              </div>

              <div className="cart-features">
                <div className="secure-checkout">
                  <i className="fas fa-shipping-fast"></i>
                  <span>Envío gratis en compras mayores a $100</span>
                </div>
                <div className="secure-checkout">
                  <i className="fas fa-undo"></i>
                  <span>Devoluciones gratis en 30 días</span>
                </div>
                <div className="secure-checkout">
                  <i className="fas fa-shield-alt"></i>
                  <span>Garantía del producto incluida</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer/>
      <FloatingWhatsApp/>
    </div>
  );
}
