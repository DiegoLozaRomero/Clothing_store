import { useState, useEffect } from 'react';
import './Favorito.css';
import { Footer } from '../../Layout/footer/Footer';
import { Favoritos, Header } from '../../Layout/header/Header';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
import Swal from 'sweetalert2';

// Servicio para manejar las llamadas a la API de favoritos
const favoritesService = {
  async getFavorites(userId) {
    try {
      const response = await fetch(`http://localhost:5000/favorites/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId, productId) {
    try {
      const response = await fetch('http://localhost:5000/favorites/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  }
};

export default function Favorito() {
  const [favorites, setFavorites] = useState([]);
  const [filteredFavorites, setFilteredFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [filters, setFilters] = useState({
    categories: {
      camisas: false,
      pantalones: false,
      chaquetas: false,
      calzado: false,
      accesorios: false
    },
    colors: {
      azul: false,
      negro: false,
      blanco: false,
      gris: false,
      rojo: false,
      verde: false
    },
    price: {
      "price-1": false, // Menos de $50
      "price-2": false, // $50 - $100
      "price-3": false  // Más de $100
    }
  });
  const [sortBy, setSortBy] = useState('recent');
  const [addedToCart, setAddedToCart] = useState({});

  // Obtener el usuario del localStorage
  useEffect(() => {
    const getCurrentUser = () => {
      const userData = localStorage.getItem('user');
      console.log('🔍 User data from localStorage:', userData);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log('✅ User parsed:', user);
          setCurrentUserId(user.id);
        } catch (error) {
          console.error('❌ Error parsing user data:', error);
        }
      } else {
        console.warn('⚠️ No hay usuario logueado en localStorage');
        setLoading(false);
      }
    };
    
    getCurrentUser();
  }, []);

  // Cargar favoritos del usuario cuando esté disponible el ID
  useEffect(() => {
    if (currentUserId) {
      loadUserFavorites();
    }
  }, [currentUserId]);

  // Aplicar filtros cuando cambien los filtros, ordenamiento o favoritos
  useEffect(() => {
    applyFilters();
  }, [filters, sortBy, favorites]);

  // Cargar favoritos del usuario desde la API
  const loadUserFavorites = async () => {
    if (!currentUserId) {
      console.warn('⏹️ Cannot load favorites: no user ID');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading favorites for user:', currentUserId);
      const favoritesData = await favoritesService.getFavorites(currentUserId);
      
      if (favoritesData.status === 'success') {
        console.log('✅ Favorites loaded:', favoritesData.data);
        setFavorites(favoritesData.data);
        setFilteredFavorites(favoritesData.data);
      } else {
        console.error('❌ Error in favorites response:', favoritesData);
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron cargar los favoritos',
          icon: 'error',
          timer: 2000
        });
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
      Swal.fire({
        title: 'Error',
        text: 'Error al cargar los favoritos',
        icon: 'error',
        timer: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  const applyFilters = () => {
    let filtered = [...favorites];

    // Filtrar por categorías
    const activeCategories = Object.keys(filters.categories).filter(
      key => filters.categories[key]
    );
    
    if (activeCategories.length > 0) {
      filtered = filtered.filter(favorite => {
        const categoryName = favorite.producto.categoria_nombre?.toLowerCase() || '';
        return activeCategories.some(cat => categoryName.includes(cat));
      });
    }

    // Filtrar por colores
    const activeColors = Object.keys(filters.colors).filter(
      key => filters.colors[key]
    );
    
    if (activeColors.length > 0) {
      filtered = filtered.filter(favorite => {
        const productColors = favorite.producto.colores || [];
        return activeColors.some(color => 
          productColors.some(productColor => 
            productColor.toLowerCase().includes(color.toLowerCase())
          )
        );
      });
    }

    // Filtrar por precio
    const activePriceRanges = Object.keys(filters.price).filter(
      key => filters.price[key]
    );
    
    if (activePriceRanges.length > 0) {
      filtered = filtered.filter(favorite => {
        const price = favorite.producto.precio;
        return activePriceRanges.some(range => {
          switch (range) {
            case 'price-1': return price < 50;
            case 'price-2': return price >= 50 && price <= 100;
            case 'price-3': return price > 100;
            default: return true;
          }
        });
      });
    }

    // Ordenar
    filtered = sortFavorites(filtered);

    setFilteredFavorites(filtered);
  };

  // Ordenar favoritos
  const sortFavorites = (favoritesList) => {
    return [...favoritesList].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.producto.precio - b.producto.precio;
        case 'price-high':
          return b.producto.precio - a.producto.precio;
        case 'name':
          return a.producto.nombre.localeCompare(b.producto.nombre);
        case 'recent':
        default:
          return new Date(b.agregado_en) - new Date(a.agregado_en);
      }
    });
  };

  // Eliminar producto de favoritos - CONECTADO A LA API
  const removeFavorite = async (favoriteId, productId) => {
    if (!currentUserId) {
      Swal.fire({
        title: 'Error',
        text: 'Debes iniciar sesión para gestionar favoritos',
        icon: 'warning',
        timer: 2000
      });
      return;
    }

    try {
      const product = document.getElementById(`favorite-${favoriteId}`);
      if (product) {
        product.style.animation = 'fadeOut 0.5s forwards';
      }

      // Llamar a la API para eliminar el favorito
      const result = await favoritesService.removeFromFavorites(currentUserId, productId);
      
      if (result.status === 'success') {
        setTimeout(() => {
          setFavorites(prev => prev.filter(item => item.favorite_id !== favoriteId));
        }, 500);
        
        Swal.fire({
          title: 'Eliminado de favoritos',
          text: 'El producto se ha removido de tus favoritos',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        throw new Error(result.message || 'Error al eliminar de favoritos');
      }
    } catch (error) {
      console.error('❌ Error removing favorite:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo eliminar el producto de favoritos',
        icon: 'error',
        timer: 2000
      });
    }
  };

  // Añadir producto al carrito
  const addToCart = (product) => {
    setAddedToCart(prev => ({
      ...prev,
      [product.id]: true
    }));

    setCartCount(prev => prev + 1);

    Swal.fire({
      title: '¡Agregado al carrito!',
      html: `
        <div style="text-align: center;">
          <img src="${product.imagen_url}" alt="${product.nombre}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;"/>
          <p><strong>${product.nombre}</strong></p>
          <p>Precio: $${product.precio}</p>
        </div>
      `,
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Ver Carrito',
      cancelButtonText: 'Seguir Comprando',
      confirmButtonColor: '#007bff'
    });

    setTimeout(() => {
      setAddedToCart(prev => ({
        ...prev,
        [product.id]: false
      }));
    }, 1500);
  };

  // Función auxiliar para obtener colores HEX
  const getColorHex = (color) => {
    const colorMap = {
      'Blanco': '#FFFFFF',
      'Negro': '#000000',
      'Azul': '#3B82F6',
      'Gris': '#6B7280',
      'Beige': '#FEF3C7',
      'Khaki': '#C3B091',
      'Azul marino': '#1E3A8A',
      'Azul oscuro': '#1E3A8A',
      'Azul claro': '#93C5FD',
      'Rojo': '#EF4444',
      'Verde': '#10B981',
      'Azul Rey': '#1E40AF'
    };
    return colorMap[color] || '#6B7280';
  };

  // Manejar cambios en filtros
  const handleFilterChange = (type, key) => {
    setFilters(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [key]: !prev[type][key]
      }
    }));
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    setFilters({
      categories: {
        camisas: false,
        pantalones: false,
        chaquetas: false,
        calzado: false,
        accesorios: false
      },
      colors: {
        azul: false,
        negro: false,
        blanco: false,
        gris: false,
        rojo: false,
        verde: false
      },
      price: {
        "price-1": false,
        "price-2": false,
        "price-3": false
      }
    });
  };

  // Verificar si hay filtros activos
  const hasActiveFilters = () => {
    return Object.values(filters.categories).some(Boolean) ||
           Object.values(filters.colors).some(Boolean) ||
           Object.values(filters.price).some(Boolean);
  };

  // Contar productos filtrados
  const getFilteredCount = () => {
    return filteredFavorites.length;
  };

  // Función auxiliar para obtener badge según condiciones
  const getProductBadge = (favorite) => {
    const product = favorite.producto;
    if (product.stock === 0) {
      return { text: 'Agotado', type: 'agotado' };
    }
    
    // Si el producto fue agregado recientemente (últimos 7 días)
    if (favorite.agregado_en && new Date(favorite.agregado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { text: 'Nuevo', type: 'nuevo' };
    }
    
    return null;
  };

  // Vista rápida del producto (igual que en el componente anterior)
  const handleQuickView = (product) => {
    const generateRatingStars = (rating = 4.5) => {
      let stars = '';
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars += '<i class="fas fa-star" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars += '<i class="fas fa-star-half-alt" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        } else {
          stars += '<i class="far fa-star" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        }
      }
      return stars;
    };

    const getBadgeColor = (badge) => {
      const colors = {
        'Nuevo': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Agotado': 'linear-gradient(135deg, #ef4444, #dc2626)'
      };
      return colors[badge] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    const getProductBadge = (product) => {
      if (product.stock === 0) return { text: 'Agotado', color: getBadgeColor('Agotado') };
      if (product.creado_en && new Date(product.creado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
        return { text: 'Nuevo', color: getBadgeColor('Nuevo') };
      }
      return null;
    };

    const badgeInfo = getProductBadge(product);
    const productRating = product.rating || 4.5;

    Swal.fire({
      title: '',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; overflow: hidden;">
          
          <!-- HEADER ELEGANTE -->
          <div style="background: white; padding: 25px 30px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                ${badgeInfo ? `
                  <div style="background: ${badgeInfo.color}; color: white; padding: 10px 24px; border-radius: 30px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    ${badgeInfo.text}
                  </div>
                ` : ''}
                <div style="display: flex; align-items: center; gap: 20px;">
                  <div style="color: #64748b; font-size: 13px; font-weight: 600; background: #f8fafc; padding: 6px 12px; border-radius: 20px;">
                    <i class="fas fa-hashtag" style="margin-right: 5px;"></i>SKU: ${String(product.id).padStart(6, '0')}
                  </div>
                  <div style="color: #10b981; font-size: 13px; font-weight: 600; background: #ecfdf5; padding: 6px 12px; border-radius: 20px;">
                    <i class="fas fa-check-circle" style="margin-right: 5px;"></i>Verificado
                  </div>
                </div>
              </div>
              <div class="social-share" style="display: flex; gap: 8px;">
                <button style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; color: #64748b;">
                  <i class="fas fa-share-alt"></i>
                </button>
              </div>
            </div>
          </div>

          <div style="padding: 0;">
            <div style="display: grid; grid-template-columns: 400px 1fr; min-height: 500px;">
              
              <!-- SIDEBAR DE IMAGEN -->
              <div style="background: white; padding: 30px; border-right: 1px solid #f1f5f9; position: relative;">
                
                <!-- IMAGEN PRINCIPAL -->
                <div style="position: relative; margin-bottom: 25px;">
                  <div style="width: 100%; height: 350px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); position: relative;">
                    <img 
                      src="${product.imagen_url}" 
                      alt="${product.nombre}" 
                      style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease;"
                      onerror="this.src='https://via.placeholder.com/400x350/f8fafc/94a3b8?text=Imagen+Premium'"
                    />
                  </div>
                  
                  <!-- BADGE DE STOCK -->
                  <div style="position: absolute; bottom: 20px; left: 20px;">
                    <div style="background: ${product.stock > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white; padding: 10px 20px; border-radius: 25px; font-weight: 700; font-size: 13px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px;">
                      <i class="fas ${product.stock > 0 ? 'fa-check' : 'fa-clock'}"></i>
                      ${product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </div>
                  </div>
                </div>

                <!-- DETALLES DEL PRODUCTO -->
                <div class="thumbnail-gallery" style="display: flex; gap: 12px; justify-content: center; padding: 20px 0;">
                  <div class="thumbnail active" style="width: 70px; height: 70px; border-radius: 12px; overflow: hidden; border: 3px solid #3b82f6; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                    <img src="${product.imagen_url}" alt="Thumb 1" style="width: 100%; height: 100%; object-fit: cover;">
                  </div>
                  ${[2, 3, 4].map(i => `
                    <div class="thumbnail" style="width: 70px; height: 70px; border-radius: 12px; overflow: hidden; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.3s ease; position: relative;">
                      <div style="width: 100%; height: 100%; background: linear-gradient(135deg, #f8fafc, #e2e8f0); display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 20px;">
                        <i class="fas fa-plus"></i>
                      </div>
                      <div style="position: absolute; bottom: 5px; right: 5px; background: #64748b; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700;">
                        +${i}
                      </div>
                    </div>
                  `).join('')}
                </div>

                <div class="side-features" style="background: white; border-radius: 16px; padding: 25px; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                  <h4 style="color: #1e293b; font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-gem" style="color: #8b5cf6;"></i>
                    Beneficios Exclusivos
                  </h4>
                  <div style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #3b82f6, #1d4ed8); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-shipping-fast" style="color: white; font-size: 14px;"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Envío Express</div>
                        <div style="color: #64748b; font-size: 12px;">Entrega en 24-48h</div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-shield-alt" style="color: white; font-size: 14px;"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Garantía Extendida</div>
                        <div style="color: #64748b; font-size: 12px;">2 años oficial</div>
                      </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <div style="width: 32px; height: 32px; border-radius: 8px; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-undo" style="color: white; font-size: 14px;"></i>
                      </div>
                      <div>
                        <div style="font-weight: 600; color: #1e293b; font-size: 14px;">Devolución Fácil</div>
                        <div style="color: #64748b; font-size: 12px;">30 días sin preguntas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO PRINCIPAL -->
              <div style="background: white; padding: 30px; position: relative;">
                
                <!-- NOMBRE Y RATING -->
                <div style="margin-bottom: 25px;">
                  <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 15px;">
                    ${product.nombre}
                  </h1>
                  
                  <div style="display: flex; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${generateRatingStars(productRating)}
                      <span style="color: #475569; font-size: 15px; font-weight: 600; margin-left: 10px;">${productRating}/5</span>
                    </div>
                    <div style="color: #3b82f6; font-size: 14px; font-weight: 600; cursor: pointer;">
                      42 reseñas verificadas
                    </div>
                  </div>
                </div>

                <!-- PRECIO -->
                <div style="margin-bottom: 30px;">
                  <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 10px;">
                    <span style="font-size: 36px; font-weight: 900; color: #0f172a;">$${product.precio}</span>
                  </div>
                  <div style="color: #059669; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-tag"></i>
                    Precio final • IVA incluido
                  </div>
                </div>

                <!-- DESCRIPCIÓN -->
                <div style="margin-bottom: 25px;">
                  <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
                    ${product.descripcion}
                  </p>
                </div>

                <!-- SELECTOR DE TALLA -->
                <div style="margin-bottom: 25px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                    <label style="font-weight: 700; color: #1e293b; font-size: 16px;">Selecciona tu talla:</label>
                  </div>
                  <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                    ${(['S', 'M', 'L', 'XL']).map((talla, index) => `
                      <button 
                        type="button"
                        style="padding: 16px 8px; border: 2px solid #e2e8f0; 
                               background: white; 
                               color: #475569; 
                               border-radius: 12px; 
                               font-weight: 700;
                               font-size: 15px;
                               cursor: pointer;
                               transition: all 0.3s ease;"
                      >
                        ${talla}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- SELECTOR DE COLOR -->
                <div style="margin-bottom: 30px;">
                  <label style="font-weight: 700; color: #1e293b; font-size: 16px; display: block; margin-bottom: 15px;">Color:</label>
                  <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                    ${(['Blanco', 'Negro', 'Azul']).map((color, index) => `
                      <button 
                        type="button"
                        style="padding: 14px 20px; 
                               border: 2px solid #e2e8f0; 
                               background: white; 
                               color: #475569; 
                               border-radius: 12px; 
                               font-weight: 600;
                               cursor: pointer;
                               transition: all 0.3s ease;
                               display: flex;
                               align-items: center;
                               gap: 10px;"
                      >
                        <div style="width: 20px; height: 20px; border-radius: 50%; background: ${getColorHex(color)}; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                        ${color}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- BOTÓN DE ACCIÓN -->
                <div style="display: flex; gap: 15px; align-items: center;">
                  <button 
                    style="height: 54px; 
                           flex: 1;
                           background: ${product.stock > 0 ? 'linear-gradient(135deg, #0f172a, #1e293b)' : '#94a3b8'}; 
                           color: white; 
                           border: none; 
                           border-radius: 12px; 
                           font-weight: 700; 
                           font-size: 16px;
                           cursor: ${product.stock > 0 ? 'pointer' : 'not-allowed'};
                           transition: all 0.3s ease;
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           gap: 12px;
                           box-shadow: 0 8px 25px rgba(0,0,0,0.15);"
                    onclick="handleAddToCartFromModal(${product.id})"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock > 0 ? 'Agregar al Carrito' : 'Producto Agotado'}
                  </button>
                </div>

                <!-- GARANTÍA -->
                <div style="background: linear-gradient(135deg, #fef7ed, #fffbeb); border: 1px solid #fed7aa; border-radius: 16px; padding: 20px; margin-top: 25px;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center;">
                      <i class="fas fa-crown" style="color: white; font-size: 16px;"></i>
                    </div>
                    <div>
                      <div style="font-weight: 800; color: #92400e; font-size: 16px; margin-bottom: 4px;">Garantía Premium</div>
                      <div style="color: #b45309; font-size: 14px;">Este producto incluye 1 año de garantía y soporte premium</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      width: 1000,
      showCloseButton: true,
      showConfirmButton: false,
      focusConfirm: false,
      didOpen: () => {
        // Agregar event listeners para los botones dentro del modal
        const addToCartBtn = document.querySelector('[onclick*="handleAddToCartFromModal"]');
        if (addToCartBtn) {
          addToCartBtn.onclick = () => {
            addToCart(product);
            Swal.close();
          };
        }
      }
    });
  };

  // Efecto para añadir estilos de animación
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeOut {
        from { opacity: 1; transform: translateY(0); }
        to { opacity: 0; transform: translateY(20px); }
      }
      
      .cart-badge-animation {
        animation: badgePulse 0.3s ease-in-out;
      }
      
      @keyframes badgePulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.3); }
        100% { transform: scale(1); }
      }

      .favorite-badge.nuevo {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .favorite-badge.agotado {
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }

      .quick-view-btn {
        background: rgba(255, 255, 255, 0.9);
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #64748b;
      }

      .quick-view-btn:hover {
        background: white;
        color: #3b82f6;
        transform: scale(1.1);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading) {
    return (
      <div>
        <Header/>
        <Favoritos/>
        <div className="favorites-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin me-2"></i>
            Cargando tus favoritos...
          </div>
        </div>
        <Footer/>
        <FloatingWhatsApp/>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div>
        <Header/>
        <Favoritos/>
        <div className="favorites-container">
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-user-slash"></i>
            </div>
            <h3 className="empty-title">Inicia sesión</h3>
            <p className="empty-text">
              Debes iniciar sesión para ver tus productos favoritos.
            </p>
            <a href="/login" className="btn-primary">Iniciar Sesión</a>
          </div>
        </div>
        <Footer/>
        <FloatingWhatsApp/>
      </div>
    );
  }

  return (
    <div>
      <Header/>
      <Favoritos/>

      <div className="favorites-container">
        <div className="section-title">
          <h2>Artículos que te encantan</h2>
        </div>
        <p className="section-subtitle">Guarda tus productos favoritos para comprarlos más tarde</p>
        
        <div className="favorites-content">
          {/* Filters Sidebar */}
          <div className="filters-sidebar">
            <div className="filter-section">
              <div className="filter-title">
                <span>Filtrar por</span>
                {hasActiveFilters() && (
                  <button 
                    className="clear-filters-btn"
                    onClick={clearAllFilters}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
            
            <div className="filter-section">
              <div className="filter-title">
                <span>Categorías</span>
              </div>
              <ul className="filter-options">
                {Object.entries(filters.categories).map(([key, value]) => (
                  <li key={key}>
                    <input 
                      type="checkbox" 
                      id={`cat-${key}`}
                      checked={value}
                      onChange={() => handleFilterChange('categories', key)}
                    />
                    <label htmlFor={`cat-${key}`}>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="filter-section">
              <div className="filter-title">
                <span>Colores</span>
              </div>
              <ul className="filter-options">
                {Object.entries(filters.colors).map(([key, value]) => (
                  <li key={key}>
                    <input 
                      type="checkbox" 
                      id={`color-${key}`}
                      checked={value}
                      onChange={() => handleFilterChange('colors', key)}
                    />
                    <label htmlFor={`color-${key}`}>
                      <div className={`color-option color-${key}`}></div>
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="filter-section">
              <div className="filter-title">
                <span>Precio</span>
              </div>
              <ul className="filter-options">
                <li>
                  <input 
                    type="checkbox" 
                    id="price-1"
                    checked={filters.price['price-1']}
                    onChange={() => handleFilterChange('price', 'price-1')}
                  />
                  <label htmlFor="price-1">Menos de $50</label>
                </li>
                <li>
                  <input 
                    type="checkbox" 
                    id="price-2"
                    checked={filters.price['price-2']}
                    onChange={() => handleFilterChange('price', 'price-2')}
                  />
                  <label htmlFor="price-2">$50 - $100</label>
                </li>
                <li>
                  <input 
                    type="checkbox" 
                    id="price-3"
                    checked={filters.price['price-3']}
                    onChange={() => handleFilterChange('price', 'price-3')}
                  />
                  <label htmlFor="price-3">Más de $100</label>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Favorites Main */}
          <div className="favorites-main">
            <div className="sort-options">
              <div className="favorites-count">
                {getFilteredCount()} de {favorites.length} artículo{favorites.length !== 1 ? 's' : ''} en favoritos
                {hasActiveFilters() && (
                  <span className="filter-active-badge">Filtros activos</span>
                )}
              </div>
              <div>
                <label htmlFor="sort">Ordenar por: </label>
                <select 
                  id="sort" 
                  className="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-low">Precio: menor a mayor</option>
                  <option value="price-high">Precio: mayor a menor</option>
                  <option value="name">Nombre A-Z</option>
                </select>
              </div>
            </div>
            
            {filteredFavorites.length > 0 ? (
              <div className="favorites-grid">
                {filteredFavorites.map(favorite => {
                  const product = favorite.producto;
                  const badgeInfo = getProductBadge(favorite);
                  
                  return (
                    <div 
                      key={favorite.favorite_id} 
                      id={`favorite-${favorite.favorite_id}`}
                      className="favorite-card"
                    >
                      {badgeInfo && (
                        <div className={`favorite-badge ${badgeInfo.type}`}>
                          {badgeInfo.text}
                        </div>
                      )}
                      <div className="favorite-actions">
                        <button 
                          className="favorite-remove" 
                          title="Eliminar de favoritos"
                          onClick={() => removeFavorite(favorite.favorite_id, product.id)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                        <button 
                          className="quick-view-btn" 
                          title="Vista rápida"
                          onClick={() => handleQuickView(product)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                      <div className="favorite-image">
                        <img 
                          src={product.imagen_url} 
                          alt={product.nombre}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
                          }}
                        />
                      </div>
                      <div className="favorite-info">
                        <h3>{product.nombre}</h3>
                        <p>{product.descripcion}</p>
                        <div className="product-category">
                          {product.categoria_nombre || 'Sin categoría'}
                        </div>
                        <div className="favorite-price">
                          <div>
                            <span className="price">${product.precio}</span>
                          </div>
                          <button 
                            className={`add-to-cart ${addedToCart[product.id] ? 'added' : ''}`}
                            onClick={() => addToCart(product)}
                            disabled={product.stock === 0}
                          >
                            <i className={`fas ${addedToCart[product.id] ? 'fa-check' : 'fa-shopping-cart'}`}></i>
                            {addedToCart[product.id] ? 'Añadido' : (product.stock === 0 ? 'Agotado' : 'Añadir')}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <i className="far fa-heart"></i>
                </div>
                <h3 className="empty-title">
                  {hasActiveFilters() ? 'No hay resultados con estos filtros' : 'No hay artículos favoritos'}
                </h3>
                <p className="empty-text">
                  {hasActiveFilters() 
                    ? 'Intenta ajustar los filtros para ver más productos.'
                    : 'Aún no has guardado ningún producto en tu lista de favoritos. Explora nuestra colección y guarda los artículos que más te gusten.'
                  }
                </p>
                {hasActiveFilters() ? (
                  <button className="btn-primary" onClick={clearAllFilters}>
                    Limpiar Filtros
                  </button>
                ) : (
                  <a href="/productos" className="btn-primary">Explorar Productos</a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer/>
      <FloatingWhatsApp/>
    </div>
  );
}
