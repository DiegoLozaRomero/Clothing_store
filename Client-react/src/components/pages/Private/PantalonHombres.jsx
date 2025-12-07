import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Footer } from '../../Layout/footer/Footer';
import { Header } from '../../Layout/header/Header';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
import Swal from 'sweetalert2';
import './PantalonHombre.css';

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

  // SERVICIO DE FAVORITOS
  async getFavorites(userId) {
    try {
      console.log(' Getting favorites for user:', userId);
      const response = await fetch(`${API_BASE_URL}/favorites/${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(' Favorites response:', data);
      return data;
    } catch (error) {
      console.error(' Error fetching favorites:', error);
      throw error;
    }
  },

  async addToFavorites(userId, productId) {
    try {
      console.log(' Adding to favorites:', { userId, productId });
      
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
      
      console.log(' Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(' Server response error:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(' Add favorite response:', data);
      return data;
    } catch (error) {
      console.error(' Error adding to favorites:', error);
      throw error;
    }
  },

  async removeFromFavorites(userId, productId) {
    try {
      console.log(' Removing from favorites:', { userId, productId });
      
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
      
      console.log(' Remove response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Remove favorite response:', data);
      return data;
    } catch (error) {
      console.error(' Error removing from favorites:', error);
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
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
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


export default function PantalonHombres() {
  const navigate =useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [sortBy, setSortBy] = useState('popularidad');
  const [categories, setCategories] = useState([]);
  const [applySearch, setApplySearch] = useState(false);
  
  // ESTADOS PARA FAVORITOS
  const [favorites, setFavorites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

    // ESTADOS PARA EL CARRITO
    const [cart, setCart] = useState(null);
    const [cartItems, setCartItems] = useState([]);
    const [cartTotal, setCartTotal] = useState(0);
    const [cartCount, setCartCount] = useState(0);

  // Categorías específicas para pantalones
  const initialPantalonesCategories = [
    { id: 'todos', name: 'Todos los Pantalones', count: 0 },
    { id: 'jeans', name: 'Jeans', count: 0 },
    { id: 'chinos', name: 'Chinos', count: 0 },
    { id: 'joggers', name: 'Joggers', count: 0 },
    { id: 'formales', name: 'Formales', count: 0 },
    { id: 'shorts', name: 'Shorts', count: 0 },
    { id: 'cargo', name: 'Cargo', count: 0 }
  ];

  // Obtener el usuario del localStorage 
  useEffect(() => {
    const getCurrentUser = () => {
      const userData = localStorage.getItem('user');
      console.log(' User data from localStorage:', userData);
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log(' User parsed:', user);
          setCurrentUserId(user.id); // ← ID real de la base de datos
        } catch (error) {
          console.error(' Error parsing user data:', error);
        }
      } else {
        console.warn('No hay usuario logueado en localStorage');
      }
    };
    
    getCurrentUser();
  }, []);

  // useEffect principal - AHORA DEPENDE DE currentUserId
  useEffect(() => {
    console.log(' Main useEffect running, currentUserId:', currentUserId);
    setCategories(initialPantalonesCategories);
    loadDataFromAPI();
    
    if (currentUserId) {
      console.log(' Loading favorites for user:', currentUserId);
      loadUserFavorites();
    } else {
      console.log(' Waiting for user ID to load favorites...');
    }
  }, [currentUserId]); // ← Agregar currentUserId como dependencia

  // Cargar favoritos del usuario - ACTUALIZADA
  const loadUserFavorites = async () => {
    if (!currentUserId) {
      console.warn(' Cannot load favorites: no user ID');
      return;
    }

    try {
      console.log(' Loading favorites for user:', currentUserId);
      const favoritesData = await apiService.getFavorites(currentUserId);
      if (favoritesData.status === 'success') {
        const favoriteIds = favoritesData.data.map(fav => fav.producto.id);
        console.log(' Favorites loaded:', favoriteIds);
        setFavorites(favoriteIds);
      } else {
        console.error(' Error in favorites response:', favoritesData);
      }
    } catch (error) {
      console.error(' Error loading favorites:', error);
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
      console.log(' Toggle favorite - Product:', productId, 'User:', currentUserId, 'Currently favorite:', isCurrentlyFavorite);
      
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
      console.error(' Error toggling favorite:', error);
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
              // Redirigir al carrito (puedes implementar esta función)
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
              navigate('/Pagar');
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

    // Filtrar por categoría de camisa
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        mapProductToPantalonCategory(product) === selectedCategory
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
      default:
        filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, sortBy, applySearch]);

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      
      const ProductsResponse = await apiService.getProducts();
      
      if (ProductsResponse.status === 'success') {
        const pantalonesHombre = ProductsResponse.data.filter(product =>
          product.genero &&
          product.genero.toLowerCase() === 'hombre' &&
          (product.categoria_nombre?.toLowerCase().includes('pantalon') ||
           product.categoria_nombre?.toLowerCase().includes('panta') ||
           product.nombre?.toLowerCase().includes('pantalon') || 
           product.nombre?.toLowerCase().includes('panta') ||
           product.descripcion?.toLowerCase().includes('pantalon') ||
           product.descripcion?.toLowerCase().includes('panta'))
        );

        if (pantalonesHombre.length === 0) {
          loadMockData();
        } else {
          setProducts(pantalonesHombre);
          setFilteredProducts(pantalonesHombre);
          updateCategoriesCount(pantalonesHombre);
        }
      } else {
        throw new Error('Error en la respuesta de la API');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los pantalones. Mostrando datos de ejemplo.',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  // Función para mapear productos a categorías de pantalones
  const mapProductToPantalonCategory = (product) => {
    const nombre = product.nombre?.toLowerCase() || '';
    const descripcion = product.descripcion?.toLowerCase() || '';
    const categoria = product.categoria_nombre?.toLowerCase() || '';

    // Primero verificar categoría de la API
    if (categoria.includes('jeans') || categoria.includes('denim') || nombre.includes('jeans')) {
      return 'jeans';
    }
    if (categoria.includes('chino') || nombre.includes('chino')) {
      return 'chinos';
    }
    if (categoria.includes('jogger') || nombre.includes('jogger') || descripcion.includes('jogger')) {
      return 'joggers';
    }
    if (categoria.includes('formal') || nombre.includes('formal') || descripcion.includes('formal') || descripcion.includes('oficina')) {
      return 'formales';
    }
    if (categoria.includes('short') || nombre.includes('short') || descripcion.includes('short')) {
      return 'shorts';
    }
    if (categoria.includes('cargo') || nombre.includes('cargo') || descripcion.includes('cargo') || descripcion.includes('bolsillos')) {
      return 'cargo';
    }

    // Por defecto asignar a jeans
    return 'jeans';
  };

  // Función para cargar datos mock de pantalones
  const loadMockData = () => {
    const mockProducts = [
      {
        id: 1,
        nombre: "Jeans Slim Fit Azul",
        descripcion: "Jeans de corte slim en color azul oscuro",
        precio: 39.99,
        imagen_url: "https://via.placeholder.com/300x300/1E3A8A/FFFFFF?text=Jeans+Azul",
        stock: 15,
        genero: "hombre",
        categoria_nombre: "pantalones jeans",
        rating: 4.3,
        creado_en: new Date().toISOString(),
        tallas: ['28', '30', '32', '34'],
        colores: ['Azul oscuro', 'Azul claro', 'Negro']
      },
      {
        id: 2,
        nombre: "Chinos Beige Clásicos",
        descripcion: "Pantalones chinos en color beige para look casual",
        precio: 34.99,
        imagen_url: "https://via.placeholder.com/300x300/FEF3C7/000000?text=Chinos+Beige",
        stock: 8,
        genero: "hombre",
        categoria_nombre: "pantalones chinos",
        rating: 4.5,
        creado_en: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tallas: ['30', '32', '34', '36'],
        colores: ['Beige', 'Khaki', 'Azul marino']
      },
      {
        id: 3,
        nombre: "Joggers Deportivos Negros",
        descripcion: "Pantalones joggers para deporte y uso casual",
        precio: 29.99,
        imagen_url: "https://via.placeholder.com/300x300/000000/FFFFFF?text=Joggers+Negro",
        stock: 0,
        genero: "hombre",
        categoria_nombre: "pantalones joggers",
        rating: 4.2,
        creado_en: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        tallas: ['S', 'M', 'L', 'XL'],
        colores: ['Negro', 'Gris', 'Azul oscuro']
      },
      {
        id: 4,
        nombre: "Pantalón Formal Gris",
        descripcion: "Pantalón formal para ocasiones especiales y oficina",
        precio: 49.99,
        imagen_url: "https://via.placeholder.com/300x300/6B7280/FFFFFF?text=Formal+Gris",
        stock: 12,
        genero: "hombre",
        categoria_nombre: "pantalones formales",
        rating: 4.7,
        creado_en: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        tallas: ['30', '32', '34', '36', '38'],
        colores: ['Gris', 'Negro', 'Azul marino']
      }
    ];
    
    setProducts(mockProducts);
    setFilteredProducts(mockProducts);
    updateCategoriesCount(mockProducts);
  };

  // Actualizar contadores de categorías
   // Actualizar contadores de categorías usando estado
  const updateCategoriesCount = (productsList) => {
    const updatedCategories =initialPantalonesCategories .map(category => {
      if (category.id === 'todos') {
        return { ...category, count: productsList.length };
      }
      
      const count = productsList.filter(product =>
         
        mapProductToPantalonCategory(product) === category.id
      ).length;
      
      return { ...category, count };
    });
    
    setCategories(updatedCategories);
  };

  // Función handleSearch
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
    
    setApplySearch(prev => !prev);
  };

  // Función para limpiar búsqueda
  const handleClearSearch = () => {
    setSearchTerm('');
    setApplySearch(prev => !prev);
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
      'Azul claro': '#93C5FD'
    };
    return colorMap[color] || '#6B7280';
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
                  <button style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; color: #64748b;"
                  id ="shareBtnInSwal">
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
 
          // EVENT para el boton de compartir los articulos 
           document.getElementById('shareBtnInSwal').addEventListener('click', () => {
            // Mostrar opciones de compartir directamente
            showShareOptions(product);
          });
          // En el handleQuickView, dentro del didOpen:

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
 


// Función para mostrar opciones de compartir
// Función para mostrar opciones de compartir (solo personalizadas)
const showShareOptions = (product) => {
  // Construir la URL del producto
  const productUrl = `${window.location.origin}/PantalonHombres/${product.id}`;
  const productTitle = product.nombre;
  const productDescription = product.descripcion || 'Mira esta camisa exclusiva';

  Swal.fire({
    title: 'Compartir Artículo',
    html: `
      <div style="text-align: center; padding: 20px;">
        <div style="margin-bottom: 25px;">
          <img src="${product.imagen_url}" 
               alt="${productTitle}" 
               style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 15px; border: 2px solid #f1f5f9;">
          <h4 style="margin: 10px 0 5px 0; color: #1e293b; font-size: 16px;">${productTitle}</h4>
          <p style="color: #64748b; font-size: 13px; margin: 0;">$${product.precio}</p>
        </div>
        
        <p style="color: #64748b; margin-bottom: 20px; font-size: 14px;">
          Comparte esta camisa con tus amigos
        </p>
        
        <div style="display: flex; gap: 15px; justify-content: center; margin-bottom: 25px;">
          <!-- WhatsApp -->
          <button 
            id="share-whatsapp" 
            style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #25D366, #128C7E); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(37, 211, 102, 0.3);"
            title="Compartir en WhatsApp"
          >
            <i class="fab fa-whatsapp"></i>
          </button>
          
          <!-- Facebook -->
          <button 
            id="share-facebook" 
            style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #4267B2, #365899); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(66, 103, 178, 0.3);"
            title="Compartir en Facebook"
          >
            <i class="fab fa-facebook-f"></i>
          </button>
          
          <!-- Twitter -->
          <button 
            id="share-twitter" 
            style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #1DA1F2, #1A91DA); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(29, 161, 242, 0.3);"
            title="Compartir en Twitter"
          >
            <i class="fab fa-twitter"></i>
          </button>
          
          <!-- Email -->
          <button 
            id="share-email" 
            style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #EA4335, #D14836); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(234, 67, 53, 0.3);"
            title="Compartir por Email"
          >
            <i class="fas fa-envelope"></i>
          </button>
          
          <!-- Copiar enlace -->
          <button 
            id="share-copy" 
            style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #8B5CF6, #7C3AED); border: none; color: white; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 24px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);"
            title="Copiar enlace"
          >
            <i class="fas fa-copy"></i>
          </button>
        </div>
        
        <!-- Mostrar el enlace para copiar -->
        <div style="margin-top: 20px; padding: 15px; background: #f8fafc; border-radius: 10px; border: 1px solid #e2e8f0;">
          <p style="margin: 0 0 10px 0; color: #475569; font-size: 14px; font-weight: 600;">
            <i class="fas fa-link" style="margin-right: 8px;"></i>
            Enlace para compartir:
          </p>
          <div style="display: flex; gap: 10px; align-items: center;">
            <input 
              type="text" 
              id="share-link-input" 
              value="${productUrl}" 
              readonly 
              style="flex: 1; padding: 10px 15px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 14px; background: white; color: #475569;"
            />
            <button 
              id="copy-link-btn" 
              style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.3s ease;"
            >
              <i class="fas fa-copy"></i>
              Copiar
            </button>
          </div>
        </div>
        
        <!-- Mensaje de confirmación -->
        <div id="copy-success" style="margin-top: 15px; padding: 10px; background: #d1fae5; border-radius: 8px; color: #065f46; display: none;">
          <i class="fas fa-check-circle" style="margin-right: 8px;"></i>
          Enlace copiado al portapapeles
        </div>
      </div>
    `,
    width: 500,
    showCloseButton: true,
    showConfirmButton: false,
    didOpen: () => {
      // Configurar URLs para compartir
      const shareUrls = {
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`*${productTitle}*%0A%0A${productDescription}%0A%0A${productUrl}`)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}&quote=${encodeURIComponent(productTitle)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(productUrl)}&text=${encodeURIComponent(`${productTitle} - ${productDescription}`)}`,
        email: `mailto:?subject=${encodeURIComponent(productTitle)}&body=${encodeURIComponent(`${productDescription}%0A%0A${productUrl}`)}`
      };

      // WhatsApp
      document.getElementById('share-whatsapp').addEventListener('click', () => {
        window.open(shareUrls.whatsapp, '_blank');
        Swal.close();
      });

      // Facebook
      document.getElementById('share-facebook').addEventListener('click', () => {
        window.open(shareUrls.facebook, '_blank', 'width=600,height=400');
        Swal.close();
      });

      // Twitter
      document.getElementById('share-twitter').addEventListener('click', () => {
        window.open(shareUrls.twitter, '_blank', 'width=600,height=400');
        Swal.close();
      });

      // Email
      document.getElementById('share-email').addEventListener('click', () => {
        window.location.href = shareUrls.email;
        Swal.close();
      });

      // Copiar enlace (botón circular)
      document.getElementById('share-copy').addEventListener('click', () => {
        copyToClipboard(productUrl);
      });

      // Copiar enlace (botón grande)
      const copyLinkBtn = document.getElementById('copy-link-btn');
      const shareLinkInput = document.getElementById('share-link-input');
      
      copyLinkBtn.addEventListener('click', () => {
        copyToClipboard(productUrl);
      });

      // Función para copiar al portapapeles
      const copyToClipboard = (text) => {
        // Seleccionar el texto del input
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        
        // Copiar usando la API moderna
        navigator.clipboard.writeText(text).then(() => {
          // Mostrar mensaje de éxito
          const successMsg = document.getElementById('copy-success');
          successMsg.style.display = 'block';
          
          // Cambiar texto del botón
          copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
          copyLinkBtn.style.background = '#10b981';
          copyLinkBtn.disabled = true;
          
          // Restaurar después de 2 segundos
          setTimeout(() => {
            successMsg.style.display = 'none';
            copyLinkBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar';
            copyLinkBtn.style.background = '#3b82f6';
            copyLinkBtn.disabled = false;
          }, 2000);
          
          // También para el botón circular
          const copyCircleBtn = document.getElementById('share-copy');
          copyCircleBtn.innerHTML = '<i class="fas fa-check"></i>';
          copyCircleBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
          
          setTimeout(() => {
            copyCircleBtn.innerHTML = '<i class="fas fa-copy"></i>';
            copyCircleBtn.style.background = 'linear-gradient(135deg, #8B5CF6, #7C3AED)';
          }, 2000);
          
        }).catch(err => {
          console.error('Error al copiar:', err);
          
          // Fallback para navegadores antiguos
          try {
            document.execCommand('copy');
            Swal.fire({
              icon: 'success',
              title: '¡Copiado!',
              text: 'Enlace copiado al portapapeles',
              timer: 1500,
              showConfirmButton: false
            });
          } catch (fallbackErr) {
            Swal.fire('Error', 'No se pudo copiar el enlace', 'error');
          }
        });
      };

      // Animación de hover para botones
      const buttons = document.querySelectorAll('button[id^="share-"]');
      buttons.forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-3px)';
          btn.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        });
        
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
        });
      });
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
    return <span className="art-rating-stars">{stars}</span>;
  };

  if (loading) {
    return (
      <div className="art-hombre">
        <Header />
        <div className="art-loading">
          <i className="fas fa-spinner fa-spin me-2"></i>
          Cargando pantalones para hombre...
        </div>
      </div>
    );
  }

  return (
    <div className="art-hombre">
      <Header />

      {/* SECCIÓN DE PANTALONES */}
      <section className="art-featured-products">
        <div className="container">
          <div className="art-section-title">
            <h2>Pantalones para Hombre</h2>
            <p className="art-subtitle">
              Descubre nuestra exclusiva colección de pantalones masculinos para cada ocasión
            </p>
          </div>

          {/* BARRA DE BÚSQUEDA */}
          <div className="art-search-container">
            <form onSubmit={handleSearch} className="art-search-box">
              <input
                type="text"
                className="art-search-input"
                placeholder="Buscar pantalones por nombre, descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="art-search-button">
                <i className="fas fa-search"></i>
              </button>
              {searchTerm && (
                <button 
                  type="button"
                  className="art-clear-button"
                  onClick={handleClearSearch}
                  title="Limpiar búsqueda"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </form>
          </div>

          <div className="art-main-layout">
            {/* SIDEBAR DE CATEGORÍAS DE PANTALONES */}
            <aside className="art-categories-sidebar">
              <h3 className="art-categories-title">Tipos de Pantalones</h3>
              <ul className="art-category-list">
                {categories.map(category => (
                  <li
                    key={category.id}
                    className={`art-category-item ${selectedCategory === category.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <span>{category.name}</span>
                    <span className="art-category-count">({category.count})</span>
                  </li>
                ))}
              </ul>
            </aside>

            {/* SECCIÓN DE PRODUCTOS */}
            <main className="art-products-section">
              <div className="art-products-header">
                <div className="art-products-count">
                  {filteredProducts.length} pantalón{filteredProducts.length !== 1 ? 'es' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                  {selectedCategory !== 'todos' && (
                    <span className="art-category-filter">
                      en {categories.find(cat => cat.id === selectedCategory)?.name}
                    </span>
                  )}
                  {searchTerm && (
                    <span className="art-search-filter">
                      para "{searchTerm}"
                    </span>
                  )}
                </div>
                <select 
                  className="art-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="popularidad">Ordenar por: Popularidad</option>
                  <option value="precio_asc">Precio: Menor a Mayor</option>
                  <option value="precio_desc">Precio: Mayor a Menor</option>
                  <option value="nuevo">Más Nuevos</option>
                  <option value="valoracion">Mejor Valorados</option>
                </select>
              </div>

              <div className="art-product-grid">
                {filteredProducts.length === 0 ? (
                  <div className="art-no-products">
                    <i className="fas fa-search fa-3x mb-3" style={{color: '#ddd'}}></i>
                    <h3>No se encontraron pantalones</h3>
                    <p>Intenta con otros términos de búsqueda o categorías</p>
                    {searchTerm && (
                      <button 
                        className="art-clear-search-btn"
                        onClick={handleClearSearch}
                      >
                        Limpiar búsqueda
                      </button>
                    )}
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isFavorite = isProductFavorite(product.id);
                    
                    return (
                      <div key={product.id} className="art-product-card">
                        {/* Badge dinámico - Agotado tiene prioridad */}
                        {product.stock === 0 ? (
                          <div className="art-product-badge agotado">Agotado</div>
                        ) : product.creado_en && new Date(product.creado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                          <div className="art-product-badge nuevo">Nuevo</div>
                        ) : null}
                        
                        <div className="art-product-image">
                          <img
                            src={product.imagen_url}
                            alt={product.nombre}
                            onError={(e) => {
                              e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
                            }}
                          />
                          <div className="art-product-actions">
                            <button 
                              title="Vista rápida"
                              onClick={() => handleQuickView(product)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              title={isFavorite ? "Remover de favoritos" : "Añadir a favoritos"}
                              onClick={() => handleToggleFavorite(product.id)}
                              className={isFavorite ? "favorited" : ""}
                            >
                              <i className={`fas fa-heart ${isFavorite ? "active" : ""}`}></i>
                            </button>
                          </div>
                        </div>
                        
                        <div className="art-product-info">
                          <h3>{product.nombre}</h3>
                          <p>{product.descripcion}</p>
                          
                          <div className="art-product-category">
                            {categories.find(cat => cat.id === mapProductToPantalonCategory(product))?.name}
                          </div>
                          
                          <div className="art-product-rating">
                            {renderRatingStars()}
                            <span className="art-rating-count">({product.rating || 4.5})</span>
                          </div>
                          
                          <div className="art-product-price">
                            <div className="art-price-container">
                              <span className="art-price">${product.precio}</span>
                            </div>
                            <button 
                              className="art-add-to-cart"
                              title="Añadir al carrito"
                              onClick={() => handleAddToCart(product.id)}
                              disabled={product.stock === 0}
                            >
                              <i className="fas fa-shopping-cart"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </main>
          </div>
        </div>
      </section>
      <Footer/>
      <FloatingWhatsApp/>
    </div>
  );
}
