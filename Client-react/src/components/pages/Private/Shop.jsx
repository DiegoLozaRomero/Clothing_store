import { useState, useEffect } from 'react';
import { Header } from '../../Layout/header/Header';
import { Footer, Suscribirme } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './Shop.css';

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

  // SERVICIO DEL CARRITO
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
};

export default function Shop() {
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedGender, setSelectedGender] = useState('todos');
  const [sortBy, setSortBy] = useState('popularidad');
  const [categories, setCategories] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();
  
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(12); // 12 productos por página

  const normalizeUser = (raw) => {
    if (!raw) return null;
    const r = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      nombre: r.nombre || r.Nombre || r.name || '',
      apellido: r.apellido || r.Apellido || r.lastname || '',
      genero: r.genero || r.Genero || '',
      email: r.email || r.Email || '',
      raw: r,
    };
  };

  useEffect(() => {
    // cargar al montar
    const raw = localStorage.getItem('user');
    const normalizedUser = normalizeUser(raw);
    setUser(normalizedUser);
    
    if (normalizedUser && normalizedUser.raw && normalizedUser.raw.id) {
      setCurrentUserId(normalizedUser.raw.id);
    }

    // storage (otras pestañas)
    const onStorage = (e) => {
      if (e.key === 'user') {
        const updatedUser = normalizeUser(e.newValue);
        setUser(updatedUser);
        if (updatedUser && updatedUser.raw && updatedUser.raw.id) {
          setCurrentUserId(updatedUser.raw.id);
        }
      }
    };

    // evento custom (misma pestaña)
    const onUserUpdated = (e) => {
      const updatedUser = normalizeUser(e.detail);
      setUser(updatedUser);
      if (updatedUser && updatedUser.raw && updatedUser.raw.id) {
        setCurrentUserId(updatedUser.raw.id);
      }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener('userUpdated', onUserUpdated);

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('userUpdated', onUserUpdated);
    };
  }, []);

  // Cargar productos y categorías
  useEffect(() => {
    loadDataFromAPI();
    if (currentUserId) {
      loadUserFavorites();
    }
  }, [currentUserId]);

  // Filtrar productos cuando cambien los filtros
  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, selectedCategory, selectedGender, sortBy]);

  // Cargar favoritos del usuario
  const loadUserFavorites = async () => {
    if (!currentUserId) return;

    try {
      const favoritesData = await apiService.getFavorites(currentUserId);
      if (favoritesData.status === 'success') {
        const favoriteIds = favoritesData.data.map(fav => fav.producto.id);
        setFavorites(favoriteIds);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  // Verificar si un producto es favorito
  const isProductFavorite = (productId) => {
    return favorites.includes(productId);
  };

  // Manejar toggle de favoritos
  const handleToggleFavorite = async (productId) => {
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
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo actualizar tus favoritos',
        icon: 'error',
        timer: 2000
      });
    }
  };

  // Manejar agregar al carrito
  const handleAddToCart = async (productId) => {
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
      if (!product) return;

      // Verificar stock
      if (product.stock === 0) {
        Swal.fire({
          title: 'Producto Agotado',
          text: 'Lo sentimos, este producto no está disponible',
          icon: 'warning',
          timer: 2000
        });
        return;
      }

      const result = await apiService.addToCart(currentUserId, productId, 1);
      
      if (result.status === 'success') {
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
      }catch (error) {
      console.error('Error adding to cart:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudo agregar el producto al carrito',
        icon: 'error',
        timer: 2000
      });
    }
    
  };

  const loadDataFromAPI = async () => {
    try {
      setLoading(true);
      
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiService.getProducts(),
        apiService.getCategories()
      ]);

      if (productsResponse.status === 'success') {
        setProducts(productsResponse.data);
      }

      if (categoriesResponse.status === 'success') {
        setCategories(categoriesResponse.data);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      // Cargar datos de ejemplo si hay error
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm.trim() !== '') {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.categoria_nombre && product.categoria_nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(product => 
        product.categoria_id == selectedCategory || 
        product.categoria_nombre?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filtrar por género
    if (selectedGender !== 'todos') {
      filtered = filtered.filter(product => 
        product.genero?.toLowerCase() === selectedGender.toLowerCase()
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
        // Orden por defecto (popularidad)
        filtered.sort((a, b) => b.id - a.id);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Resetear a primera página cuando cambian los filtros
  };

  // Función para cargar datos mock
  const loadMockData = () => {
    const mockProducts = [
      {
        id: 1,
        nombre: "Camisa Casual Hombre",
        descripcion: "Camisa de algodón premium para look casual",
        precio: 45.99,
        imagen_url: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Camisa+H",
        stock: 10,
        genero: "hombre",
        categoria_nombre: "camisas",
        rating: 4.5,
        creado_en: new Date().toISOString()
      },
      {
        id: 2,
        nombre: "Vestido Elegante Mujer",
        descripcion: "Vestido largo para ocasiones especiales",
        precio: 89.99,
        imagen_url: "https://via.placeholder.com/300x300/EC4899/FFFFFF?text=Vestido+M",
        stock: 8,
        genero: "mujer",
        categoria_nombre: "vestidos",
        rating: 4.7,
        creado_en: new Date().toISOString()
      },
      {
        id: 3,
        nombre: "Tenis Running",
        descripcion: "Tenis deportivos para running con amortiguación",
        precio: 75.99,
        imagen_url: "https://via.placeholder.com/300x300/10B981/FFFFFF?text=Tenis",
        stock: 15,
        genero: "unisex",
        categoria_nombre: "calzado",
        rating: 4.6,
        creado_en: new Date().toISOString()
      },
      {
        id: 4,
        nombre: "Bolso de Cuero",
        descripcion: "Bolso elegante de cuero genuino",
        precio: 120.99,
        imagen_url: "https://via.placeholder.com/300x300/F59E0B/FFFFFF?text=Bolso",
        stock: 5,
        genero: "mujer",
        categoria_nombre: "accesorios",
        rating: 4.8,
        creado_en: new Date().toISOString()
      },
      {
        id: 5,
        nombre: "Reloj Deportivo",
        descripcion: "Reloj resistente al agua con múltiples funciones",
        precio: 150.99,
        imagen_url: "https://via.placeholder.com/300x300/6366F1/FFFFFF?text=Reloj",
        stock: 12,
        genero: "unisex",
        categoria_nombre: "accesorios",
        rating: 4.4,
        creado_en: new Date().toISOString()
      },
      {
        id: 6,
        nombre: "Jeans Slim Fit",
        descripcion: "Jeans ajustados de mezclilla de alta calidad",
        precio: 59.99,
        imagen_url: "https://via.placeholder.com/300x300/374151/FFFFFF?text=Jeans",
        stock: 20,
        genero: "hombre",
        categoria_nombre: "pantalones",
        rating: 4.3,
        creado_en: new Date().toISOString()
      },
      {
        id: 7,
        nombre: "Blusa de Seda",
        descripcion: "Blusa elegante de seda natural",
        precio: 65.99,
        imagen_url: "https://via.placeholder.com/300x300/8B5CF6/FFFFFF?text=Blusa",
        stock: 7,
        genero: "mujer",
        categoria_nombre: "blusas",
        rating: 4.7,
        creado_en: new Date().toISOString()
      },
      {
        id: 8,
        nombre: "Chaqueta Denim",
        descripcion: "Chaqueta estilo jean clásica",
        precio: 79.99,
        imagen_url: "https://via.placeholder.com/300x300/0EA5E9/FFFFFF?text=Chaqueta",
        stock: 9,
        genero: "unisex",
        categoria_nombre: "chaquetas",
        rating: 4.5,
        creado_en: new Date().toISOString()
      },
      {
        id: 9,
        nombre: "Falda Plisada",
        descripcion: "Falda elegante con pliegues perfectos",
        precio: 49.99,
        imagen_url: "https://via.placeholder.com/300x300/F97316/FFFFFF?text=Falda",
        stock: 14,
        genero: "mujer",
        categoria_nombre: "faldas",
        rating: 4.6,
        creado_en: new Date().toISOString()
      },
      {
        id: 10,
        nombre: "Sudadera con Capucha",
        descripcion: "Sudadera cómoda para uso casual",
        precio: 39.99,
        imagen_url: "https://via.placeholder.com/300x300/64748B/FFFFFF?text=Sudadera",
        stock: 18,
        genero: "unisex",
        categoria_nombre: "ropa deportiva",
        rating: 4.2,
        creado_en: new Date().toISOString()
      },
      {
        id: 11,
        nombre: "Zapatos Formales",
        descripcion: "Zapatos elegantes para ocasiones especiales",
        precio: 99.99,
        imagen_url: "https://via.placeholder.com/300x300/92400E/FFFFFF?text=Zapatos",
        stock: 6,
        genero: "hombre",
        categoria_nombre: "calzado",
        rating: 4.8,
        creado_en: new Date().toISOString()
      },
      {
        id: 12,
        nombre: "Gafas de Sol",
        descripcion: "Gafas de sol con protección UV",
        precio: 35.99,
        imagen_url: "https://via.placeholder.com/300x300/059669/FFFFFF?text=Gafas",
        stock: 25,
        genero: "unisex",
        categoria_nombre: "accesorios",
        rating: 4.4,
        creado_en: new Date().toISOString()
      },
      {
        id: 13,
        nombre: "Top Deportivo",
        descripcion: "Top cómodo para actividades deportivas",
        precio: 29.99,
        imagen_url: "https://via.placeholder.com/300x300/DC2626/FFFFFF?text=Top",
        stock: 22,
        genero: "mujer",
        categoria_nombre: "ropa deportiva",
        rating: 4.3,
        creado_en: new Date().toISOString()
      },
      {
        id: 14,
        nombre: "Cinturón de Cuero",
        descripcion: "Cinturón elegante de cuero genuino",
        precio: 25.99,
        imagen_url: "https://via.placeholder.com/300x300/7C3AED/FFFFFF?text=Cinturon",
        stock: 30,
        genero: "hombre",
        categoria_nombre: "accesorios",
        rating: 4.5,
        creado_en: new Date().toISOString()
      },
      {
        id: 15,
        nombre: "Bufanda de Lana",
        descripcion: "Bufanda cálida para temporada de frío",
        precio: 19.99,
        imagen_url: "https://via.placeholder.com/300x300/3B82F6/FFFFFF?text=Bufanda",
        stock: 35,
        genero: "unisex",
        categoria_nombre: "accesorios",
        rating: 4.6,
        creado_en: new Date().toISOString()
      }
    ];

    const mockCategories = [
      { id: 1, nombre: 'Camisas' },
      { id: 2, nombre: 'Vestidos' },
      { id: 3, nombre: 'Calzado' },
      { id: 4, nombre: 'Accesorios' },
      { id: 5, nombre: 'Pantalones' },
      { id: 6, nombre: 'Blusas' },
      { id: 7, nombre: 'Chaquetas' },
      { id: 8, nombre: 'Faldas' },
      { id: 9, nombre: 'Ropa Deportiva' }
    ];

    setProducts(mockProducts);
    setCategories(mockCategories);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterProducts();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    filterProducts();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('todos');
    setSelectedGender('todos');
    setSortBy('popularidad');
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
    return <span className="rating-stars">{stars}</span>;
  };

  // Lógica de paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  if (loading) {
    return (
      <div className="Shop">
        <Header />
        <div className="loading">
          <i className="fas fa-spinner fa-spin me-2"></i>
          Cargando productos...
        </div>
      </div>
    );
  }

  return (
    <div className="Shop">
      <Header />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>
            Bienvenid{user?.genero === 'Femenino' || user?.genero === 'femenino' ? 'a' :
                     user?.genero === 'Masculino' || user?.genero === 'masculino' ? 'o' : 'o/a'}, {user?.nombre || ''}
          </h1>
          <p>Descubre las últimas tendencias en moda para esta temporada</p>
          <a href="#productos">Ver Nueva Colección</a>
        </div>
      </section>

      {/* Sección de Productos */}
      <section id="productos" className="products-section">
        <div className="container">
          <div className="section-title">
            <h2>Todos Nuestros Productos</h2>
            <p className="subtitle">
              Explora nuestra completa colección de moda para hombre, mujer y accesorios
            </p>
          </div>

          {/* Barra de Búsqueda y Filtros */}
          <div className="filters-container">
            <div className="search-box">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="search-button">
                  <i className="fas fa-search"></i>
                </button>
                {searchTerm && (
                  <button 
                    type="button"
                    className="clear-button"
                    onClick={handleClearSearch}
                    title="Limpiar búsqueda"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </form>
            </div>

            <div className="filter-controls">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todas las categorías</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nombre}
                  </option>
                ))}
              </select>

              <select 
                value={selectedGender}
                onChange={(e) => setSelectedGender(e.target.value)}
                className="filter-select"
              >
                <option value="todos">Todos los géneros</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
                <option value="unisex">Unisex</option>
              </select>

              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="popularidad">Ordenar por: Popularidad</option>
                <option value="precio_asc">Precio: Menor a Mayor</option>
                <option value="precio_desc">Precio: Mayor a Menor</option>
                <option value="nuevo">Más Nuevos</option>
                <option value="valoracion">Mejor Valorados</option>
              </select>

              <button 
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                <i className="fas fa-times"></i>
                Limpiar Filtros
              </button>
            </div>
          </div>

          {/* Información de resultados */}
          <div className="results-info">
            <div className="products-count">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              {selectedCategory !== 'todos' && (
                <span className="category-filter">
                  en {categories.find(cat => cat.id == selectedCategory)?.nombre}
                </span>
              )}
              {selectedGender !== 'todos' && (
                <span className="gender-filter">
                  para {selectedGender}
                </span>
              )}
              {searchTerm && (
                <span className="search-filter">
                  para "{searchTerm}"
                </span>
              )}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="product-grid">
            {currentProducts.length === 0 ? (
              <div className="no-products">
                <i className="fas fa-search fa-3x mb-3"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda o filtros</p>
                <button 
                  className="clear-search-btn"
                  onClick={handleClearFilters}
                >
                  Limpiar todos los filtros
                </button>
              </div>
            ) : (
              currentProducts.map((product) => {
                const isFavorite = isProductFavorite(product.id);
                
                return (
                  <div key={product.id} className="product-card">
                    {/* Badge dinámico */}
                    {product.stock === 0 ? (
                      <div className="product-badge agotado">Agotado</div>
                    ) : product.creado_en && new Date(product.creado_en) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? (
                      <div className="product-badge nuevo">Nuevo</div>
                    ) : null}
                    
                    <div className="product-image">
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible';
                        }}
                      />
                      <div className="product-actions">
                        <button 
                          title={isFavorite ? "Remover de favoritos" : "Añadir a favoritos"}
                          onClick={() => handleToggleFavorite(product.id)}
                          className={isFavorite ? "favorited" : ""}
                        >
                          <i className={`fas fa-heart ${isFavorite ? "active" : ""}`}></i>
                        </button>
                      </div>
                    </div>
                    
                    <div className="product-info">
                      <h3>{product.nombre}</h3>
                      <p>{product.descripcion}</p>
                      
                      <div className="product-category">
                        {product.categoria_nombre} • {product.genero}
                      </div>
                      
                      <div className="product-rating">
                        {renderRatingStars(product.rating)}
                        <span className="rating-count">({product.rating || 4.5})</span>
                      </div>
                      
                      <div className="product-price">
                        <div className="price-container">
                          <span className="price">${product.precio}</span>
                        </div>
                        <button 
                          className="add-to-cart"
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

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="pagination-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                Anterior
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
              
              <button 
                className="pagination-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>

      <Suscribirme />
      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}
