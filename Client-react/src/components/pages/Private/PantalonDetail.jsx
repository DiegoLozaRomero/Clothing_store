// components/pages/Private/PantalonDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { Header } from '../../Layout/header/Header';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';

// Servicio de API (puedes importarlo o copiar las funciones necesarias)
const apiService = {
  async getProductById(productId) {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }
};

export default function PantalonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Obtener usuario del localStorage
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCurrentUserId(user.id);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  // Obtener producto
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await apiService.getProductById(id);
        
        if (result.status === 'success') {
          setProduct(result.data);
        } else {
          Swal.fire({
            title: 'Producto no encontrado',
            text: 'El pantalón que buscas no está disponible',
            icon: 'error',
            confirmButtonText: 'Volver'
          }).then(() => {
            navigate('/PantalonHombres');
          });
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        Swal.fire({
          title: 'Error',
          text: 'No se pudo cargar el producto',
          icon: 'error',
          confirmButtonText: 'Volver'
        }).then(() => {
          navigate('/PantalonHombres');
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Función para añadir al carrito (similar a la que ya tienes)
  const handleAddToCart = async (productId) => {
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
      const response = await fetch('${API_BASE_URL}/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: currentUserId,
          product_id: productId,
          cantidad: 1
        })
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        Swal.fire({
          title: '¡Agregado al Carrito!',
          html: `
            <div style="text-align: center;">
              <img src="${product.imagen_url}" alt="${product.nombre}" 
                   style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"/>
              <p><strong>${product.nombre}</strong></p>
              <p>Precio: $${product.precio}</p>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ver Carrito',
          cancelButtonText: 'Seguir Comprando'
        }).then((result) => {
          if (result.isConfirmed) {
            navigate('/Carrito');
          }
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire('Error', 'No se pudo agregar al carrito', 'error');
    }
  };

  // Función de compartir (puedes usar la misma que ya tienes)
  const handleShare = () => {
    // Aquí puedes llamar a tu función showShareOptions
    // O implementarla directamente aquí
    const productUrl = window.location.href;
    
    Swal.fire({
      title: 'Compartir',
      html: `
        <div style="text-align: center;">
          <p>Comparte este pantalón</p>
          <div style="display: flex; gap: 15px; justify-content: center; margin: 20px 0;">
            <button id="share-whatsapp" style="background: #25D366; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 20px;">
              <i class="fab fa-whatsapp"></i>
            </button>
            <button id="share-facebook" style="background: #4267B2; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 20px;">
              <i class="fab fa-facebook-f"></i>
            </button>
            <button id="share-twitter" style="background: #1DA1F2; color: white; border: none; width: 50px; height: 50px; border-radius: 50%; font-size: 20px;">
              <i class="fab fa-twitter"></i>
            </button>
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const shareData = {
          title: product?.nombre || '',
          text: product?.descripcion || '',
          url: productUrl
        };

        document.getElementById('share-whatsapp').addEventListener('click', () => {
          window.open(`https://wa.me/?text=${encodeURIComponent(shareData.title + ' ' + shareData.url)}`, '_blank');
        });

        document.getElementById('share-facebook').addEventListener('click', () => {
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`, '_blank');
        });

        document.getElementById('share-twitter').addEventListener('click', () => {
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`, '_blank');
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="art-hombre">
        <Header />
        <div className="art-loading">
          <i className="fas fa-spinner fa-spin me-2"></i>
          Cargando pantalón...
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="art-hombre">
      <Header />
      
      <div className="container" style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ 
          background: 'white', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', padding: '40px' }}>
            
            {/* Columna de imagen */}
            <div>
              <div style={{ 
                borderRadius: '15px', 
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                marginBottom: '20px'
              }}>
                <img 
                  src={product.imagen_url} 
                  alt={product.nombre}
                  style={{ width: '100%', height: '400px', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x400?text=Imagen+No+Disponible';
                  }}
                />
              </div>
              
              {/* Miniaturas (si las tienes) */}
              <div style={{ display: 'flex', gap: '10px' }}>
                {[1, 2, 3].map((item, index) => (
                  <div key={index} style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '10px',
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    cursor: 'pointer'
                  }}></div>
                ))}
              </div>
            </div>
            
            {/* Columna de información */}
            <div>
              {/* Breadcrumb */}
              <div style={{ marginBottom: '20px', fontSize: '14px', color: '#64748b' }}>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Inicio</span>
                <span style={{ margin: '0 10px' }}>/</span>
                <span style={{ cursor: 'pointer' }} onClick={() => navigate('/PantalonHombres')}>Pantalones</span>
                <span style={{ margin: '0 10px' }}>/</span>
                <span style={{ color: '#1e293b', fontWeight: '600' }}>{product.nombre}</span>
              </div>
              
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '15px' }}>
                {product.nombre}
              </h1>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', color: '#fbbf24' }}>
                  {[...Array(5)].map((_, i) => (
                    <i key={i} className="fas fa-star"></i>
                  ))}
                </div>
                <span style={{ color: '#64748b' }}>(42 reseñas)</span>
                <span style={{ 
                  background: product.stock > 0 ? '#10b981' : '#ef4444',
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                </span>
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.6' }}>
                  {product.descripcion}
                </p>
              </div>
              
              <div style={{ 
                background: '#f8fafc', 
                padding: '20px', 
                borderRadius: '15px',
                marginBottom: '25px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '5px' }}>Precio</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a' }}>
                      ${product.precio}
                      <span style={{ fontSize: '16px', color: '#64748b', fontWeight: 'normal' }}></span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button 
                      onClick={handleShare}
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '20px'
                      }}
                      title="Compartir"
                    >
                      <i className="fas fa-share-alt"></i>
                    </button>
                    
                    <button 
                      style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '20px'
                      }}
                      title="Añadir a favoritos"
                    >
                      <i className="far fa-heart"></i>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '15px' }}>
                <button 
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  style={{
                    flex: 1,
                    height: '56px',
                    background: product.stock > 0 ? 'linear-gradient(135deg, #0f172a, #1e293b)' : '#94a3b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-shopping-cart"></i>
                  {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
                </button>
                
                <button 
                  onClick={() => navigate('/Pagar')}
                  disabled={product.stock === 0}
                  style={{
                    flex: 1,
                    height: '56px',
                    background: product.stock > 0 ? 'linear-gradient(135deg, #059669, #047857)' : '#94a3b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '700',
                    cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}
                >
                  <i className="fas fa-bolt"></i>
                  Comprar Ahora
                </button>
              </div>
              
              {/* Información adicional */}
              <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#1e293b' }}>
                  <i className="fas fa-truck" style={{ marginRight: '10px', color: '#3b82f6' }}></i>
                  Envío y garantía
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-shipping-fast" style={{ color: '#10b981' }}></i>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>Enviamos a todo México</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>3-5 días hábiles</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fas fa-undo" style={{ color: '#f59e0b' }}></i>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px' }}>Devoluciones gratis</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>30 días para cambiar</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
