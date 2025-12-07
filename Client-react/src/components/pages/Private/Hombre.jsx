import React, { useState, useEffect } from 'react';
import { Header } from '../../Layout/header/Header';
import Swal from 'sweetalert2';
import styles from './Hombre.module.css';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
import { useNavigate } from 'react-router-dom';

// Servicio para manejar las llamadas a la API
const apiService = {
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

  async getCategories() {
    try {
      const response = await fetch('${API_BASE_URL}/categories');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  async getProductsByGender(gender) {
    try {
      const response = await fetch('${API_BASE_URL}/products');
      const data = await response.json();
      
      if (data.status === 'success') {
        return data.data.filter(product => 
          product.genero && product.genero.toLowerCase() === gender.toLowerCase()
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching products by gender:', error);
      throw error;
    }
  },

  // SERVICIO DE FAVORITOS
  async getFavorites(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/favorites/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  async addToFavorites(userId, productId) {
    try {
      const response = await fetch('${API_BASE_URL}/favorites/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId, productId) {
    try {
      const response = await fetch('${API_BASE_URL}/favorites/remove', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      throw error;
    }
  },

  async checkFavorite(userId, productId) {
    try {
      const response = await fetch('${API_BASE_URL}/favorites/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: productId
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error checking favorite:', error);
      throw error;
    }
  },
  
  // SERVICIO DEL CARRITO
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

  async getCartCount(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cart/${userId}/count`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error getting cart count:', error);
      throw error;
    }
  }
};

export default function Hombre() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('aleatorio');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [applySearch, setApplySearch] = useState(false);
  const [categories, setCategories] = useState([]);
  
  const navigate = useNavigate();
  // ESTADOS PARA FAVORITOS
  const [favorites, setFavorites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

    // ESTADOS PARA EL CARRITO
    const [cart, setCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);

  const productsPerPage = 12;

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
      }
    };
    
    getCurrentUser();
  }, []);

  // useEffect principal - AHORA DEPENDE DE currentUserId
  useEffect(() => {
    console.log('🎯 Main useEffect running, currentUserId:', currentUserId);
    loadDataFromAPI();
    
    if (currentUserId) {
      console.log('👤 Loading favorites for user:', currentUserId);
      loadUserFavorites();
    } else {
      console.log('⏳ Waiting for user ID to load favorites...');
    }
  }, [currentUserId]);

  // Cargar favoritos del usuario
  const loadUserFavorites = async () => {
    if (!currentUserId) {
      console.warn('⏹️ Cannot load favorites: no user ID');
      return;
    }

    try {
      console.log('🔄 Loading favorites for user:', currentUserId);
      const favoritesData = await apiService.getFavorites(currentUserId);
      if (favoritesData.status === 'success') {
        const favoriteIds = favoritesData.data.map(fav => fav.producto.id);
        console.log('✅ Favorites loaded:', favoriteIds);
        setFavorites(favoriteIds);
      } else {
        console.error('❌ Error in favorites response:', favoritesData);
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error);
    }
  };


  // Cargar carrito del usuario
  const loadUserCart = async () => {
    if (!currentUserId) {
      console.warn(' Cannot load cart: no user ID');
      return;
    }

    try {
      console.log('🛒 Loading cart for user:', currentUserId);
      const cartData = await apiService.getCart(currentUserId);
      
      if (cartData.status === 'success') {
        console.log('✅ Cart loaded:', cartData.data);
        setCart(cartData.data);
        setCartItems(cartData.data.items || []);
        setCartTotal(cartData.data.total_precio || 0);
        setCartCount(cartData.data.total_items || 0);
      } else {
        console.error('❌ Error in cart response:', cartData);
      }
    } catch (error) {
      console.error('❌ Error loading cart:', error);
    }
  };

  // Verificar si un producto es favorito
  const isProductFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Manejar toggle de favoritos
  const handleToggleFavorite = async (productId) => {
    // Verificar que el usuario esté logueado
    if (!currentUserId) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos a favoritos',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        timer: 3000
      });
      return;
    }

    try {
      const isCurrentlyFavorite = isProductFavorite(productId);
      console.log('🎯 Toggle favorite - Product:', productId, 'User:', currentUserId, 'Currently favorite:', isCurrentlyFavorite);
      
      if (isCurrentlyFavorite) {
        // Remover de favoritos
        const result = await apiService.removeFromFavorites(currentUserId, productId);
        if (result.status === 'success') {
          setFavorites(prev => prev.filter(id => id !== productId));
          Swal.fire({
            title: 'Removido de Favoritos',
            text: 'El producto se ha removido de tus favoritos',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(result.message || 'Error al remover de favoritos');
        }
      } else {
        // Agregar a favoritos
        const result = await apiService.addToFavorites(currentUserId, productId);
        if (result.status === 'success') {
          setFavorites(prev => [...prev, productId]);
          Swal.fire({
            title: '¡Agregado a Favoritos!',
            text: 'El producto se ha agregado a tus favoritos',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          });
        } else {
          throw new Error(result.message || 'Error al agregar a favoritos');
        }
      }
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo actualizar tus favoritos',
        icon: 'error',
        timer: 2000
      });
    }
  };

  // Manejar agregar al carrito
  const handleAddToCart = async (productId) => {
    // Verificar que el usuario esté logueado
    if (!currentUserId) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para agregar productos al carrito',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        timer: 3000
      });
      return;
    }

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      // Verificar stock
      if (product.stock === 0) {
        Swal.fire({
          title: 'Producto Agotado',
          text: 'Lo sentimos, este producto no está disponible en este momento',
          icon: 'warning',
          timer: 2000
        });
        return;
      }

      console.log('🛒 Adding to cart - Product:', productId, 'User:', currentUserId);
      
      const result = await apiService.addToCart(currentUserId, productId, 1);
      
      if (result.status === 'success') {
        // Actualizar el carrito local
        await loadUserCart();
        
        Swal.fire({
          title: '¡Agregado al Carrito!',
          html: `
            <div style="text-align: center;">
              <img src="${product.imagen_url}" alt="${product.nombre}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;"/>
              <p><strong>${product.nombre}</strong></p>
              <p>Precio: $${product.precio}</p>
            </div>
          `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'Ver Carrito',
          cancelButtonText: 'Seguir Comprando',
          confirmButtonColor: '#007bff'
        }).then((result) => {
          if (result.isConfirmed) {
            //Redirigir al carrito (puedes implementar esta función)
             navigate('/Carrito');
            console.log('Ir al carrito...');
          }
        });
      } else {
        throw new Error(result.message || 'Error al agregar al carrito');
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo agregar el producto al carrito',
        icon: 'error',
        timer: 2000
      });
    }
  };


  // Función para manejar compra rápida
  const handleQuickBuy = async (productId) => {
    if (!currentUserId) {
      Swal.fire({
        title: 'Inicia sesión',
        text: 'Debes iniciar sesión para comprar productos',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        timer: 3000
      });
      return;
    }

    try {
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('Producto no encontrado');
      }

      if (product.stock === 0) {
        Swal.fire({
          title: 'Producto Agotado',
          text: 'Lo sentimos, este producto no está disponible',
          icon: 'warning',
          timer: 2000
        });
        return;
      }

      // Agregar al carrito
      const result = await apiService.addToCart(currentUserId, productId, 1);
      
      if (result.status === 'success') {
        await loadUserCart();
        
        Swal.fire({
          title: '¡Producto Agregado!',
          text: 'Redirigiendo al checkout...',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          // Redirigir al checkout
           //navigate('/Carrito');
          console.log('Ir al checkout...');
        });
      } else {
        throw new Error(result.message || 'Error al procesar la compra');
      }
    } catch (error) {
      console.error('❌ Error in quick buy:', error);
      Swal.fire({
        title: 'Error',
        text: error.message || 'No se pudo procesar la compra',
        icon: 'error',
        timer: 2000
      });
    }
  };


  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      
      // Cargar productos para hombre desde la API
      const productsHombre = await apiService.getProductsByGender('hombre');
      
      if (productsHombre.length === 0) {
        // Si no hay productos, usar datos mock como fallback
        loadMockData();
      } else {
        setProducts(productsHombre);
        setFilteredProducts(productsHombre);
      }
      
      // Cargar categorías
      const categoriesResponse = await apiService.getCategories();
      if (categoriesResponse.status === 'success') {
        setCategories(categoriesResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading data from API:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los productos. Mostrando datos de ejemplo.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Datos mock como fallback
  const loadMockData = () => {
    const mockProducts = [
      {
        id: 1,
        nombre: "Camiseta Básica Premium",
        descripcion: "Camiseta de algodón 100% de alta calidad, perfecta para looks casuales y elegantes.",
        precio: 29.99,
        imagen_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80",
        genero: "hombre",
        categoria_id: 1,
        categoria_nombre: "Camisetas",
        stock: 15,
        creado_en: new Date().toISOString(),
        rating: 4.5,
        tallas: ["S", "M", "L", "XL"],
        colores: ["Blanco", "Negro", "Azul", "Gris"]
      },
      {
        id: 2,
        nombre: "Jeans Slim Fit Modernos",
        descripcion: "Jeans ajustados con tecnología stretch para máxima comodidad y estilo urbano.",
        precio: 59.99,
        imagen_url: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=500&q=80",
        genero: "hombre",
        categoria_id: 2,
        categoria_nombre: "Pantalones",
        stock: 8,
        creado_en: new Date().toISOString(),
        rating: 4.8,
        tallas: ["30", "32", "34", "36"],
        colores: ["Azul oscuro", "Negro", "Gris"]
      },
      {
        id: 3,
        nombre: "Chaqueta Deportiva Performance",
        descripcion: "Chaqueta técnica para actividades outdoor con protección contra el viento y agua.",
        precio: 89.99,
        imagen_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
        genero: "hombre",
        categoria_id: 3,
        categoria_nombre: "Chaquetas",
        stock: 12,
        creado_en: new Date().toISOString(),
        rating: 4.6,
        tallas: ["M", "L", "XL", "XXL"],
        colores: ["Negro", "Azul marino", "Verde"]
      },
      {
        id: 4,
        nombre: "Zapatos Casuales Urbanos",
        descripcion: "Calzado urbano que combina estilo y comodidad para el día a día.",
        precio: 79.99,
        imagen_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
        genero: "hombre",
        categoria_id: 4,
        categoria_nombre: "Calzado",
        stock: 20,
        creado_en: new Date().toISOString(),
        rating: 4.7,
        tallas: ["40", "41", "42", "43", "44"],
        colores: ["Marrón", "Negro", "Azul"]
      }
    ];
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
  };

  // Función para mezclar array aleatoriamente (Fisher-Yates shuffle)
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // FILTRADO MANUAL - useEffect modificado
  useEffect(() => {
    let filtered = [...products];

    // Filtrar por búsqueda - solo si hay término de búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoria_nombre && product.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Ordenar
    switch (sortBy) {
      case 'precio_asc':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'precio_desc':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      case 'nuevo':
        filtered.sort((a, b) => new Date(b.creado_en) - new Date(a.creado_en));
        break;
      case 'valoracion':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'aleatorio':
        // Mezclar aleatoriamente
        filtered = shuffleArray(filtered);
        break;
      default:
        // Popularidad (por defecto) - ordenar por ID o rating
        filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, applySearch]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Función handleSearch con filtrado manual
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') {
      Swal.fire({
        title: 'Búsqueda vacía',
        text: 'Por favor ingresa un término de búsqueda',
        icon: 'info',
        timer: 2000
      });
      return;
    }
    
    // Activar el filtrado manual
    setApplySearch(prev => !prev);
    console.log('Búsqueda manual realizada:', searchTerm);
  };

  // Función para manejar cambios en el input
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    // Si el usuario borra el texto, mostrar todos los productos
    if (e.target.value.trim() === '') {
      setApplySearch(prev => !prev);
    }
  };

  // Función para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setApplySearch(prev => !prev);
  };

  // Función auxiliar para obtener colores HEX
  const getColorHex = (colorName) => {
    const colorMap = {
      'Blanco': '#ffffff',
      'Negro': '#000000',
      'Azul': '#3b82f6',
      'Gris': '#6b7280',
      'Azul oscuro': '#1e40af',
      'Azul marino': '#1e3a8a',
      'Verde': '#10b981',
      'Marrón': '#92400e',
      'Burdeos': '#831843',
      'Azul real': '#1d4ed8',
      'Rosa palo': '#fecdd3',
      'Azul claro': '#93c5fd',
      'Gris oscuro': '#374151'
    };
    return colorMap[colorName] || '#6b7280';
  };

  // Función para determinar badge del producto
  const getProductBadge = (product) => {
    if (product.stock === 0) return { text: 'Agotado', color: 'linear-gradient(135deg, #ef4444, #dc2626)' };
    if (product.creado_en && new Date(product.creado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return { text: 'Nuevo', color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' };
    }
    if (product.stock < 5) return { text: 'Últimas unidades', color: 'linear-gradient(135deg, #f59e0b, #d97706)' };
    return null;
  };


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
     const isFavorite = isProductFavorite(product.id);
 
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
                 <button 
                   id="favorite-btn" 
                   style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; color: ${isFavorite ? '#ef4444' : '#64748b'};"
                 >
                   <i class="fas fa-heart"></i>
                 </button>
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
                     ${(product.tallas || ['S', 'M', 'L', 'XL']).map((talla, index) => `
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
                     ${(product.colores || ['Blanco', 'Negro', 'Azul']).map((color, index) => `
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
                     id="quick-buy-btn"
                     style="height: 54px; 
                            flex: 1;
                            background: ${product.stock > 0 ? 'linear-gradient(135deg, #059669, #047857)' : '#94a3b8'}; 
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
                   >
                     <i class="fas fa-bolt"></i>
                     Comprar Ahora
                   </button>
                   <button 
                     id="add-to-cart-btn"
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
                       <div style="color: #b45309; font-size: 14px;">Este pantalón incluye 1 año de garantía y soporte premium</div>
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
         const addToCartBtn = document.getElementById('add-to-cart-btn');
         if (addToCartBtn) {
           addToCartBtn.onclick = () => {
             handleAddToCart(product.id);
             Swal.close();
           };
         }

         const quickBuyBtn = document.getElementById('quick-buy-btn');
         if (quickBuyBtn) {
           quickBuyBtn.onclick = () => {
             handleQuickBuy(product.id);
             Swal.close();
           };
         }
 
         // Event listener para el botón de favoritos en el modal
         const favoriteBtn = document.getElementById('favorite-btn');
         if (favoriteBtn) {
           favoriteBtn.onclick = () => {
             handleToggleFavorite(product.id);
             // Actualizar el color del corazón inmediatamente
             const isCurrentlyFavorite = isProductFavorite(product.id);
             favoriteBtn.style.color = !isCurrentlyFavorite ? '#ef4444' : '#64748b';
           };
         }
       }
     });
   };


  const renderRatingStars = (rating = 4.5) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return <span className={styles.ratingStars}>{stars}</span>;
  };

  if (loading) {
    return (
      <div className={styles.hombreContainer}>
        <Header />
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin" style={{marginRight: '10px'}}></i>
          Cargando productos para hombre...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.hombreContainer}>
      <Header />

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>COLECCIÓN HOMBRE</h1>
        <p className={styles.heroSubtitle}>
          Descubre nuestra exclusiva selección de moda masculina. 
          Desde looks casuales hasta elegancia formal, encuentra tu estilo perfecto.
        </p>
        
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>{products.length}+</span>
            <span className={styles.statLabel}>Productos</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>4.8</span>
            <span className={styles.statLabel}>Rating Promedio</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>98%</span>
            <span className={styles.statLabel}>Clientes Satisfechos</span>
          </div>
        </div>
      </section>

      {/* FILTERS BAR */}
      <section className={styles.filtersBar}>
        <div className={styles.filtersContainer}>
          <form onSubmit={handleSearch} className={styles.searchBox}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Buscar en moda masculina..."
              value={searchTerm}
              onChange={handleInputChange}
            />
            <button type="submit" className={styles.searchButton}>
              <i className="fas fa-search"></i>
            </button>
            {searchTerm && (
              <button 
                type="button"
                className={styles.clearButton}
                onClick={handleClearSearch}
                title="Limpiar búsqueda"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </form>

          <div className={styles.filterControls}>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="aleatorio">Ordenar por: Aleatorio</option>
              <option value="popularidad">Popularidad</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nuevo">Más Nuevos</option>
              <option value="valoracion">Mejor Valorados</option>
            </select>

            <div className={styles.viewToggle}>
              <button 
                className={`${styles.viewButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`${styles.viewButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <div className={styles.resultsCount}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''} para hombre
            {searchTerm && (
              <span className={styles.searchFilter}>
                para "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <div className={styles.noProductsIcon}>
              <i className="fas fa-search"></i>
            </div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
            {searchTerm && (
              <button 
                className={styles.clearSearchBtn}
                onClick={handleClearSearch}
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' ? styles.productsGrid : styles.productsList}>
              {currentProducts.map((product) => {
                const badgeInfo = getProductBadge(product);
                const isFavorite = isProductFavorite(product.id);
                
                return (
                  <div key={product.id} className={styles.productCard}>
                    {badgeInfo && (
                      <div 
                        className={styles.productBadge}
                        style={{background: badgeInfo.color}}
                      >
                        {badgeInfo.text}
                      </div>
                    )}
                    
                    <div className={styles.productImage}>
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300/f8fafc/94a3b8?text=Imagen+No+Disponible';
                        }}
                      />
                      <div className={styles.productActions}>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleQuickView(product)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className={`${styles.actionButton} ${isFavorite ? styles.favorited : ''}`}
                          onClick={() => handleToggleFavorite(product.id)}
                          title={isFavorite ? "Remover de favoritos" : "Añadir a favoritos"}
                        >
                          <i className={`fas fa-heart ${isFavorite ? styles.active : ''}`}></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className={styles.productInfo}>
                      <h3 className={styles.productTitle}>{product.nombre}</h3>
                      <p className={styles.productDescription}>{product.descripcion}</p>
                      
                      <div className={styles.productCategory}>
                        {product.categoria_nombre}
                      </div>
                      
                      <div className={styles.productRating}>
                        <span className={styles.ratingStars}>
                          {renderRatingStars(product.rating || 4.5)}
                        </span>
                        <span className={styles.ratingCount}>({product.rating || 4.5})</span>
                      </div>
                      
                      <div className={styles.productPrice}>
                        <div className={styles.priceContainer}>
                          <span className={styles.currentPrice}>${product.precio}</span>
                        </div>
                        <button 
                          className={styles.addToCartButton}
                          onClick={() => handleAddToCart(product.id)}
                          disabled={product.stock === 0}
                        >
                          <i className="fas fa-shopping-cart"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button 
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`${styles.paginationButton} ${currentPage === index + 1 ? styles.active : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className={styles.paginationButton}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            )}
          </>
        )}
      </section>
      <Footer/>
      <FloatingWhatsApp/>
    </div>
  );
}
