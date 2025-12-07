import { useState, useEffect } from 'react'
import './home.css'
import { useAlert } from '../../../hooks/useAlert'
import Alert from '../../Common/Alert/Alert'
import { Link } from 'react-router-dom'
import { Footer } from '../../Layout/footer/Footer'
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const [users, setUsers] = useState([])
  const [isMenuActive, setIsMenuActive] = useState(false)
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const { alert, showAlert, hideAlert } = useAlert()
  const navigate = useNavigate()

  // Cargar productos destacados
  useEffect(() => {
    loadFeaturedProducts()
    
    const checkScroll = () => {
      const elements = document.querySelectorAll('.fade-in')
      elements.forEach((el) => {
        const top = el.getBoundingClientRect().top
        if (top < window.innerHeight - 100) el.classList.add('visible')
      })
    }
    checkScroll()
    window.addEventListener('scroll', checkScroll)
    return () => window.removeEventListener('scroll', checkScroll)
  }, [])

  const loadFeaturedProducts = async () => {
    try {
      // Simular carga de productos destacados
      const mockProducts = [
        {
          id: 1,
          nombre: "Camiseta Básica Premium",
          descripcion: "Camiseta de algodón 100% de alta calidad, perfecta para looks casuales y elegantes.",
          precio: 29.99,
          precio_anterior: 39.99,
          imagen_url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=500&q=80",
          stock: 10,
          genero: "unisex",
          categoria_nombre: "ropa",
          rating: 4.5,
          badge: "Nuevo"
        },
        {
          id: 2,
          nombre: "Zapatos Deportivos Elite",
          descripcion: "Comodidad y estilo para tu día a día. Diseño moderno con tecnología de amortiguación.",
          precio: 89.99,
          precio_anterior: 119.99,
          imagen_url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
          stock: 15,
          genero: "unisex",
          categoria_nombre: "calzado",
          rating: 4.7,
          badge: "-25%"
        },
        {
          id: 3,
          nombre: "Reloj Elegante Clásico",
          descripcion: "Precisión suiza con diseño atemporal. La elección perfecta para ocasiones especiales.",
          precio: 199.99,
          imagen_url: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80",
          stock: 5,
          genero: "unisex",
          categoria_nombre: "accesorios",
          rating: 4.8,
          badge: null
        },
        {
          id: 4,
          nombre: "Auriculares Inalámbricos",
          descripcion: "Sonido premium con cancelación de ruido. Hasta 30 horas de autonomía.",
          precio: 149.99,
          imagen_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
          stock: 20,
          genero: "unisex",
          categoria_nombre: "electrónicos",
          rating: 4.6,
          badge: "Más Vendido"
        },
        {
          id: 5,
          nombre: "Vestido de Noche Elegante",
          descripcion: "Vestido largo para ocasiones especiales con detalles en encaje.",
          precio: 129.99,
          imagen_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
          stock: 8,
          genero: "mujer",
          categoria_nombre: "vestidos",
          rating: 4.9,
          badge: "Nuevo"
        },
        {
          id: 6,
          nombre: "Chaqueta de Cuero Genuino",
          descripcion: "Chaqueta de cuero 100% genuino, perfecta para looks urbanos.",
          precio: 299.99,
          precio_anterior: 399.99,
          imagen_url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
          stock: 12,
          genero: "hombre",
          categoria_nombre: "chaquetas",
          rating: 4.7,
          badge: "-25%"
        },
        {
          id: 7,
          nombre: "Bolso de Diseño Premium",
          descripcion: "Bolso elegante con materiales de primera calidad y diseño moderno.",
          precio: 179.99,
          imagen_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
          stock: 7,
          genero: "mujer",
          categoria_nombre: "accesorios",
          rating: 4.5,
          badge: "Exclusivo"
        },
        {
          id: 8,
          nombre: "Sneakers Urbanos Limited",
          descripcion: "Edición limitada de sneakers con diseño único y materiales premium.",
          precio: 159.99,
          imagen_url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=500&q=80",
          stock: 3,
          genero: "unisex",
          categoria_nombre: "calzado",
          rating: 4.8,
          badge: "Limited"
        }
      ]
      
      setFeaturedProducts(mockProducts)
    } catch (error) {
      console.error('Error loading featured products:', error)
      showAlert('Error al cargar productos destacados', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleMenu = () => setIsMenuActive(!isMenuActive)

  const handleRedirect = (productName = '') => {
    const message = productName ? 
      `Redirigiendo a login para comprar: ${productName}` : 
      'Redirigiendo a Login...'
    
    showAlert(message, 'info')
    setTimeout(() => {
      try {
        navigate('/login')
      } catch (error) {
        console.error('Error al redirigir:', error)
        showAlert('Error: La página de login no existe', 'error')
      }
    }, 1500)
  }

  const handleSubscribe = (e) => {
    e.preventDefault()
    showAlert('¡Te has suscrito correctamente!', 'success')
  }

  const renderRatingStars = (rating = 4.5) => {
    const stars = []
    const fullStars = Math.floor(rating)

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>)
      } else {
        stars.push(<i key={i} className="far fa-star"></i>)
      }
    }
    return <span className="rating-stars">{stars}</span>
  }

  return (
    <>
      <Alert alert={alert} onClose={hideAlert} />

      <header>
        <div className="logo">Fashion Luxe</div>
        <i
          className="fas fa-bars menu-toggle"
          onClick={toggleMenu}
          style={{ cursor: 'pointer' }}
        ></i>
        <nav className={isMenuActive ? 'active' : ''}>
          <ul>
            <li>
              <a href="#inicio" onClick={() => showAlert('Ya estás en la página de inicio', 'info')}>
                Inicio
              </a>
            </li>
            <li>
              <a href="#hombres">Hombres</a>
              <ul>
                <li><a href="#camisas">Camisas</a></li>
                <li><a href="#pantalones">Pantalones</a></li>
                <li><a href="#chaquetas">Chaquetas</a></li>
              </ul>
            </li>
            <li>
              <a href="#mujeres">Mujeres</a>
              <ul>
                <li><a href="#vestidos">Vestidos</a></li>
                <li><a href="#blusas">Blusas</a></li>
                <li><a href="#zapatos">Zapatos</a></li>
              </ul>
            </li>
            <li>
              <a href="#accesorios">Accesorios</a>
              <ul>
                <li><a href="#bolsos">Bolsos</a></li>
                <li><a href="#relojes">Relojes</a></li>
              </ul>
            </li>
            <li><a href="#ofertas">Ofertas</a></li>
          </ul>
        </nav>
        <div className="auth-buttons">
          <Link to="/login">Login</Link>
          <Link to="/Registro">Registro</Link>
        </div>
      </header>

      {/* --- Hero --- */}
      <section className="home-hero">
        <div className="hero-content">
          <h1>Nueva Colección 2025</h1>
          <p>Descubre las últimas tendencias en moda para él y para ella</p>
          <a href="#productos" onClick={() => showAlert('Redirigiendo a productos...', 'info')}>
            Comprar Ahora
          </a>
        </div>
      </section>

      {users.length > 0 && (
        <section className="users-section">
          <h2>Usuarios Registrados: {users.length}</h2>
        </section>
      )}

      {/* PRODUCTOS DESTACADOS */}
      <section id="productos" className="featured-products">
        <div className="container">
          <div className="section-title">
            <h2>Productos Destacados</h2>
            <p>Los artículos más populares y mejor valorados por nuestros clientes</p>
          </div>

          {loading ? (
            <div className="loading">
              <i className="fas fa-spinner fa-spin me-2"></i>
              Cargando productos destacados...
            </div>
          ) : (
            <div className="product-grid">
              {featuredProducts.map((product) => (
                <div key={product.id} className="product-card fade-in">
                  {/* Badge dinámico */}
                  {product.badge && (
                    <div className={`product-badge ${
                      product.badge === 'Nuevo' ? 'nuevo' : 
                      product.badge.includes('%') ? 'descuento' :
                      product.badge.toLowerCase()
                    }`}>
                      {product.badge}
                    </div>
                  )}
                  
                  <div className="product-image">
                    <img
                      src={product.imagen_url}
                      alt={product.nombre}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Imagen+No+Disponible'
                      }}
                    />
                    <div className="product-actions">
                      <button title="Ver detalles"><i className="fas fa-eye"></i></button>
                      <button title="Añadir a favoritos"><i className="fas fa-heart"></i></button>
                      <button title="Comparar producto"><i className="fas fa-exchange-alt"></i></button>
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
                      <span className="rating-count">({product.rating})</span>
                    </div>
                    
                    <div className="product-price">
                      <div className="price-container">
                        {product.precio_anterior && (
                          <span className="old-price">${product.precio_anterior}</span>
                        )}
                        <span className="price">${product.precio}</span>
                      </div>
                      <button 
                        className="add-to-cart" 
                        title="Añadir al carrito" 
                        onClick={() => handleRedirect(product.nombre)}
                      >
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Botón para ver más productos */}
          <div className="view-more-container">
            <button 
              className="view-more-btn"
              onClick={() => navigate('/shop')}
            >
              Ver Todos los Productos
              <i className="fas fa-arrow-right"></i>
            </button>
          </div>
        </div>
      </section>

      {/* Sección de Categorías */}
      <section className="categories-section">
        <div className="container">
          <div className="section-title">
            <h2>Explora por Categorías</h2>
            <p>Encuentra exactamente lo que buscas en nuestras categorías especializadas</p>
          </div>
          <div className="categories-grid">
            <div className="category-card" onClick={() => navigate('/hombre-camisas')}>
              <div className="category-image">
                <img src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80" alt="Ropa Hombre" />
              </div>
              <div className="category-info">
                <h3>Ropa para Hombre</h3>
                <p>Camisas, pantalones, chaquetas y más</p>
              </div>
            </div>
            
            <div className="category-card" onClick={() => navigate('/mujer-vestidos')}>
              <div className="category-image">
                <img src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=400&q=80" alt="Ropa Mujer" />
              </div>
              <div className="category-info">
                <h3>Ropa para Mujer</h3>
                <p>Vestidos, blusas, faldas y más</p>
              </div>
            </div>
            
            <div className="category-card" onClick={() => navigate('/zapatos')}>
              <div className="category-image">
                <img src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80" alt="Calzado" />
              </div>
              <div className="category-info">
                <h3>Calzado</h3>
                <p>Tenis, zapatos formales, sandalias</p>
              </div>
            </div>
            
            <div className="category-card" onClick={() => navigate('/accesorios')}>
              <div className="category-image">
                <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&q=80" alt="Accesorios" />
              </div>
              <div className="category-info">
                <h3>Accesorios</h3>
                <p>Bolsos, relojes, joyería y más</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newsletter">
        <h2>Suscríbete a nuestro boletín</h2>
        <p>Recibe ofertas exclusivas y novedades directamente en tu correo</p>
        <form onSubmit={handleSubscribe}>
          <input type="email" placeholder="Ingresa tu correo" required />
          <button type="submit">Suscribirme</button>
        </form>
      </section>
      
      <Footer/>
    <FloatingWhatsApp/>
    </>
  )
}
