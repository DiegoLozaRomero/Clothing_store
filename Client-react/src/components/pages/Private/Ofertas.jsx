import React, { useState, useEffect } from 'react';
import { Header } from '../../Layout/header/Header';
import Swal from 'sweetalert2';
import styles from './Ofertas.module.css';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';
export default function Ofertas() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('descuento');
  const [discountFilter, setDiscountFilter] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 12,
    minutes: 30,
    seconds: 45
  });
  const productsPerPage = 12;

  // Datos de ejemplo para la sección Ofertas (productos con descuento)
  const mockProducts = [
    {
      id: 1,
      name: "Smartwatch Deportivo Pro",
      description: "Reloj inteligente con GPS, monitor cardiaco y 7 días de batería.",
      price: 149.99,
      oldPrice: 249.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
      badge: "40% OFF",
      discount: 40,
      rating: 4.8,
      category: "tecnologia",
      stock: 8,
      sizes: ["Único"],
      colors: ["Negro", "Azul", "Plateado"],
      details: "• Pantalla AMOLED 1.4\"\n• GPS integrado\n• Monitor de sueño\n• Resistente al agua\n• 7 días batería"
    },
    {
      id: 2,
      name: "Zapatillas Running Elite",
      description: "Zapatillas técnicas para running con amortiguación premium y diseño aerodinámico.",
      price: 79.99,
      oldPrice: 129.99,
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
      badge: "38% OFF",
      discount: 38,
      rating: 4.7,
      category: "calzado",
      stock: 15,
      sizes: ["40", "41", "42", "43", "44"],
      colors: ["Negro/Rojo", "Azul/Blanco", "Gris/Negro"],
      details: "• Amortiguación Air\n• Suela de goma\n• Material transpirable\n• Peso ligero\n• Tecnología anti-impacto"
    },
    {
      id: 3,
      name: "Jeans Slim Fit Premium",
      description: "Jeans de diseño slim fit con tecnología stretch para máximo confort.",
      price: 49.99,
      oldPrice: 89.99,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80",
      badge: "44% OFF",
      discount: 44,
      rating: 4.6,
      category: "ropa",
      stock: 12,
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Azul oscuro", "Negro", "Gris"],
      details: "• Denim elastano\n• Corte slim fit\n• 5 bolsillos\n• Lavado vintage\n• Tiro medio"
    },
    {
      id: 4,
      name: "Bolso Tote Cuero Genuino",
      description: "Bolso espacioso en cuero genuino con múltiples compartimentos organizados.",
      price: 99.99,
      oldPrice: 199.99,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
      badge: "50% OFF",
      discount: 50,
      rating: 4.9,
      category: "accesorios",
      stock: 6,
      sizes: ["Mediano"],
      colors: ["Marrón", "Negro", "Beige"],
      details: "• Cuero genuino\n• Asas ajustables\n• 5 compartimentos\n• Cierre magnético\n• Base reforzada"
    },
    {
      id: 5,
      name: "Auriculares Inalámbricos Pro",
      description: "Auriculares con cancelación de ruido activa y 30 horas de autonomía.",
      price: 129.99,
      oldPrice: 199.99,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80",
      badge: "35% OFF",
      discount: 35,
      rating: 4.8,
      category: "tecnologia",
      stock: 10,
      sizes: ["Único"],
      colors: ["Negro", "Blanco", "Azul"],
      details: "• Cancelación activa de ruido\n• 30 horas batería\n• Carga rápida\n• Resistentes al agua\n• Sonido surround"
    },
    {
      id: 6,
      name: "Chaqueta Deportiva Performance",
      description: "Chaqueta técnica con tecnología dry-fit y protección UV para actividades outdoor.",
      price: 59.99,
      oldPrice: 99.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
      badge: "40% OFF",
      discount: 40,
      rating: 4.5,
      category: "ropa",
      stock: 18,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Negro", "Azul marino", "Verde"],
      details: "• Tecnología dry-fit\n• Protección UV 50+\n• Capucha integrada\n• Bolsillos seguros\n• Material ligero"
    },
    {
      id: 7,
      name: "Gafas de Sol Polarizadas",
      description: "Gafas de sol con lentes polarizadas y protección UV400 total.",
      price: 69.99,
      oldPrice: 119.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
      badge: "42% OFF",
      discount: 42,
      rating: 4.7,
      category: "accesorios",
      stock: 25,
      sizes: ["Único"],
      colors: ["Dorado", "Plateado", "Negro"],
      details: "• Lentes polarizadas\n• Protección UV400\n• Montura metálica\n• Incluye estuche\n• Garantía 2 años"
    },
    {
      id: 8,
      name: "Set de Maletas Viaje 3 Piezas",
      description: "Set completo de maletas en ABS resistente con ruedas 360° y bloqueo TSA.",
      price: 199.99,
      oldPrice: 349.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
      badge: "43% OFF",
      discount: 43,
      rating: 4.9,
      category: "viaje",
      stock: 5,
      sizes: ["20\"", "24\"", "28\""],
      colors: ["Negro", "Azul", "Plateado"],
      details: "• ABS resistente\n• Ruedas 360°\n• Bloqueo TSA\n• 3 tamaños\n• 10 años garantía"
    },
    {
      id: 9,
      name: "Vestido de Noche Elegante",
      description: "Vestido largo para ocasiones especiales con detalles de encaje y seda natural.",
      price: 89.99,
      oldPrice: 159.99,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
      badge: "44% OFF",
      discount: 44,
      rating: 4.8,
      category: "ropa",
      stock: 7,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Rojo", "Azul noche"],
      details: "• Seda natural\n• Corte sirena\n• Espalda descubierta\n• Forro interior\n• Lavado profesional"
    },
    {
      id: 10,
      name: "Mochila Gaming Profesional",
      description: "Mochila especializada para gaming con compartimentos para laptop y accesorios.",
      price: 79.99,
      oldPrice: 129.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
      badge: "38% OFF",
      discount: 38,
      rating: 4.6,
      category: "accesorios",
      stock: 12,
      sizes: ["17\"", "15\""],
      colors: ["Negro", "Rojo", "Verde"],
      details: "• Portátil hasta 17\"\n• Compartimento para ratón\n• Cable management\n• Correas acolchadas\n• Material resistente"
    },
    {
      id: 11,
      name: "Zapatos Formales de Cuero",
      description: "Zapatos formales en cuero genuino con suela de goma y diseño clásico.",
      price: 89.99,
      oldPrice: 149.99,
      image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80",
      badge: "40% OFF",
      discount: 40,
      rating: 4.7,
      category: "calzado",
      stock: 14,
      sizes: ["40", "41", "42", "43", "44"],
      colors: ["Negro", "Marrón", "Azul marino"],
      details: "• Cuero genuino\n• Suela de goma\n• Plantilla acolchada\n• Costura Goodyear\n• Elegante y duradero"
    },
    {
      id: 12,
      name: "Tablet Android Pro 10\"",
      description: "Tablet de 10 pulgadas con 128GB almacenamiento y lápiz digital incluido.",
      price: 299.99,
      oldPrice: 499.99,
      image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=500&q=80",
      badge: "40% OFF",
      discount: 40,
      rating: 4.8,
      category: "tecnologia",
      stock: 8,
      sizes: ["10\""],
      colors: ["Negro", "Gris", "Azul"],
      details: "• Pantalla 10\" FHD\n• 128GB almacenamiento\n• Lápiz digital incluido\n• 8GB RAM\n• Android 12"
    }
  ];

  useEffect(() => {
    // Simular carga de API
    const timer = setTimeout(() => {
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = {...prevTime};
        
        if (newTime.seconds > 0) {
          newTime.seconds--;
        } else {
          newTime.seconds = 59;
          if (newTime.minutes > 0) {
            newTime.minutes--;
          } else {
            newTime.minutes = 59;
            if (newTime.hours > 0) {
              newTime.hours--;
            } else {
              newTime.hours = 23;
              if (newTime.days > 0) {
                newTime.days--;
              }
            }
          }
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filtrar y ordenar productos
  useEffect(() => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por descuento
    if (discountFilter !== 'todos') {
      const minDiscount = parseInt(discountFilter);
      filtered = filtered.filter(product => product.discount >= minDiscount);
    }

    // Ordenar
    switch (sortBy) {
      case 'precio_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'precio_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'nuevo':
        filtered.sort((a, b) => b.id - a.id);
        break;
      case 'valoracion':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'descuento':
      default:
        // Por descuento (por defecto)
        filtered.sort((a, b) => b.discount - a.discount);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy, discountFilter]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleQuickView = (product) => {
    Swal.fire({
      title: `🔥 OFERTA ESPECIAL - ${product.discount}% OFF`,
      html: `
        <div style="text-align: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 200px; height: 200px; object-fit: cover; border-radius: 15px; margin-bottom: 20px;"/>
          <h3 style="color: #dc2626; margin-bottom: 10px;">${product.name}</h3>
          <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 15px;">
            <span style="font-size: 1.2em; color: #666; text-decoration: line-through;">$${product.oldPrice}</span>
            <span style="font-size: 2em; color: #dc2626; font-weight: 800;">$${product.price}</span>
          </div>
          <div style="background: #10b981; color: white; padding: 10px; border-radius: 20px; font-weight: 700; display: inline-block;">
            Estás ahorrando $${(product.oldPrice - product.price).toFixed(2)}
          </div>
        </div>
      `,
      confirmButtonText: '¡Aprovechar Oferta!',
      confirmButtonColor: '#dc2626',
      showCancelButton: true,
      cancelButtonText: 'Seguir Viendo'
    });
  };

  const handleAddToWishlist = (productId) => {
    Swal.fire({
      title: '¡Oferta Guardada!',
      text: 'La oferta se ha agregado a tu lista de deseos',
      icon: 'success',
      confirmButtonText: 'Continuar',
      timer: 2000
    });
  };

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    Swal.fire({
      title: '🎉 ¡Oferta Agregada!',
      html: `
        <div style="text-align: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;"/>
          <p><strong>${product.name}</strong></p>
          <p style="color: #dc2626; font-weight: 700; font-size: 1.2em;">
            $${product.price} <span style="color: #666; text-decoration: line-through; font-size: 0.9em;">$${product.oldPrice}</span>
          </p>
          <p style="color: #10b981; font-weight: 600;">
            Ahorras $${(product.oldPrice - product.price).toFixed(2)}
          </p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Ver Carrito',
      confirmButtonColor: '#dc2626',
      showCancelButton: true,
      cancelButtonText: 'Seguir Comprando'
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star"></i>);
      }
    }
    return stars;
  };

  const calculateSavings = () => {
    return products.reduce((total, product) => {
      return total + (product.oldPrice - product.price);
    }, 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className={styles.ofertasContainer}>
        <Header />
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin" style={{marginRight: '10px'}}></i>
          Cargando ofertas especiales...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.ofertasContainer}>
      <Header />

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>OFERTAS ESPECIALES</h1>
        <p className={styles.heroSubtitle}>
          ¡Aprovecha nuestros descuentos exclusivos! Precios increíbles en tecnología, 
          moda, accesorios y mucho más. Ofertas por tiempo limitado.
        </p>
        
        <div className={styles.countdownTimer}>
          <div className={styles.countdownTitle}>🔥 OFERTA TERMINA EN:</div>
          <div className={styles.countdownNumbers}>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.days}</div>
              <div className={styles.countdownLabel}>DÍAS</div>
            </div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.hours}</div>
              <div className={styles.countdownLabel}>HORAS</div>
            </div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.minutes}</div>
              <div className={styles.countdownLabel}>MIN</div>
            </div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.seconds}</div>
              <div className={styles.countdownLabel}>SEG</div>
            </div>
          </div>
        </div>
        
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>50+</span>
            <span className={styles.statLabel}>Ofertas Activas</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>${calculateSavings()}</span>
            <span className={styles.statLabel}>Total Ahorro</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>Hasta 60%</span>
            <span className={styles.statLabel}>Descuento</span>
          </div>
        </div>
      </section>

      {/* OFFER BANNERS */}
      <section className={styles.offerBanners}>
        <div className={styles.bannersGrid}>
          <div className={styles.offerBanner}>
            <div className={styles.bannerIcon}>🚚</div>
            <h3 className={styles.bannerTitle}>Envío Gratis</h3>
            <p className={styles.bannerText}>En compras mayores a $50</p>
          </div>
          <div className={styles.offerBanner}>
            <div className={styles.bannerIcon}>💳</div>
            <h3 className={styles.bannerTitle}>12 MSI</h3>
            <p className={styles.bannerText}>En todas las tarjetas</p>
          </div>
          <div className={styles.offerBanner}>
            <div className={styles.bannerIcon}>🔄</div>
            <h3 className={styles.bannerTitle}>Devolución Fácil</h3>
            <p className={styles.bannerText}>30 días garantía</p>
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
              placeholder="Buscar en ofertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className={styles.searchButton}>
              <i className="fas fa-search"></i>
            </button>
          </form>

          <div className={styles.filterControls}>
            <select 
              className={styles.sortSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="descuento">Ordenar por: Mayor Descuento</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nuevo">Más Nuevos</option>
              <option value="valoracion">Mejor Valorados</option>
            </select>

            <select 
              className={styles.discountFilter}
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
            >
              <option value="todos">Todos los descuentos</option>
              <option value="50">50% o más</option>
              <option value="40">40% o más</option>
              <option value="30">30% o más</option>
              <option value="20">20% o más</option>
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

      {/* FLASH SALE SECTION */}
      <section className={styles.flashSale}>
        <h2 className={styles.flashSaleTitle}>🔥 FLASH SALE</h2>
        <p className={styles.flashSaleSubtitle}>Ofertas relámpago con los mejores precios</p>
        <div className={styles.flashSaleTimer}>
          <div className={styles.countdownNumbers}>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.hours}</div>
              <div className={styles.countdownLabel}>HORAS</div>
            </div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.minutes}</div>
              <div className={styles.countdownLabel}>MIN</div>
            </div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownValue}>{timeLeft.seconds}</div>
              <div className={styles.countdownLabel}>SEG</div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className={styles.productsSection}>
        <div className={styles.productsHeader}>
          <div className={styles.resultsCount}>
            {filteredProducts.length} oferta{filteredProducts.length !== 1 ? 's' : ''} especial{filteredProducts.length !== 1 ? 'es' : ''} encontrada{filteredProducts.length !== 1 ? 's' : ''}
          </div>
          <div className={styles.hotOffersBadge}>
            <i className="fas fa-fire"></i>
            OFERTAS CALIENTES
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <div className={styles.noProductsIcon}>
              <i className="fas fa-tag"></i>
            </div>
            <h3>No se encontraron ofertas</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros de descuento</p>
          </div>
        ) : (
          <>
            <div className={styles.productsGrid}>
              {currentProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.discountBadge}>
                    -{product.discount}%
                  </div>
                  {product.badge && (
                    <div className={styles.productBadge}>{product.badge}</div>
                  )}
                  
                  <div className={styles.productImage}>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/fef7ed/fbbf24?text=Oferta+Especial';
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
                        className={styles.actionButton}
                        onClick={() => handleAddToWishlist(product.id)}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.productInfo}>
                    <h3 className={styles.productTitle}>{product.name}</h3>
                    <p className={styles.productDescription}>{product.description}</p>
                    
                    <div className={styles.productRating}>
                      <span className={styles.ratingStars}>
                        {renderRatingStars(product.rating)}
                      </span>
                      <span className={styles.ratingCount}>({product.rating})</span>
                    </div>
                    
                    <div className={styles.productPrice}>
                      <div className={styles.priceContainer}>
                        <span className={styles.oldPrice}>${product.oldPrice}</span>
                        <span className={styles.currentPrice}>${product.price}</span>
                        <span className={styles.discountPrice}>
                          Ahorras ${(product.oldPrice - product.price).toFixed(2)}
                        </span>
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
              ))}
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
