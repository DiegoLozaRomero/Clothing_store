import React, { useState, useEffect } from 'react';
import { Header } from '../../Layout/header/Header';
import Swal from 'sweetalert2';
import styles from './Accesorios.module.css';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';

export default function Accesorios() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularidad');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const productsPerPage = 12;

  // Datos de ejemplo para la sección Accesorios
 const mockProducts = [
    {
      id: 1,
      name: "Reloj Deportivo Inteligente",
      description: "Reloj inteligente con monitor de actividad, GPS y notificaciones inteligentes.",
      price: 199.99,
      oldPrice: 249.99,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80",
      badge: "Smart",
      rating: 4.8,
      category: "relojes",
      stock: 15,
      sizes: ["Único"],
      colors: ["Negro", "Azul", "Plateado"],
      details: "• Pantalla AMOLED 1.4\"\n• Resistente al agua 50m\n• Batería 7 días\n• GPS integrado\n• Monitor de sueño"
    },
    {
      id: 2,
      name: "Bolso Tote Cuero Genuino",
      description: "Bolso tote espacioso en cuero genuino con múltiples compartimentos organizados.",
      price: 159.99,
      oldPrice: 199.99,
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=80",
      badge: "Cuero",
      rating: 4.9,
      category: "bolsos",
      stock: 8,
      sizes: ["Mediano"],
      colors: ["Marrón", "Negro", "Beige"],
      details: "• Cuero genuino premium\n• Asas ajustables\n• 5 compartimentos\n• Cierre magnético\n• Base reforzada"
    },
    {
      id: 3,
      name: "Gafas de Sol Aviador",
      description: "Gafas de sol estilo aviador con lentes polarizadas y protección UV400.",
      price: 89.99,
      image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80",
      badge: "Clásico",
      rating: 4.7,
      category: "gafas",
      stock: 25,
      sizes: ["Único"],
      colors: ["Dorado", "Plateado", "Negro"],
      details: "• Lentes polarizadas\n• Protección UV400\n• Montura metálica\n• Incluye estuche\n• Garantía 2 años"
    },
    {
      id: 4,
      name: "Cinturón de Cuero Reversible",
      description: "Cinturón reversible en cuero con hebilla de acero inoxidable y dos colores.",
      price: 45.99,
      oldPrice: 59.99,
      image: "https://images.unsplash.com/photo-1601924582970-9238bcb495d9?auto=format&fit=crop&w=500&q=80",
      badge: "Reversible",
      rating: 4.6,
      category: "cinturones",
      stock: 30,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Marrón/Negro", "Negro/Marrón"],
      details: "• Cuero genuino\n• Diseño reversible\n• Hebilla de acero\n• 2 colores en 1\n• Longitud ajustable"
    },
    {
      id: 5,
      name: "Bufanda de Lana Merino",
      description: "Bufanda extra suave de lana merino para máxima calidez y confort en invierno.",
      price: 39.99,
      image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5b?auto=format&fit=crop&w=500&q=80",
      badge: "Invierno",
      rating: 4.5,
      category: "bufandas",
      stock: 40,
      sizes: ["Estándar"],
      colors: ["Gris", "Burdeos", "Azul marino", "Verde"],
      details: "• 100% lana merino\n• Extra suave\n• No pica\n• Lavable a máquina\n• Tamaño 180x70cm"
    },
    {
      id: 6,
      name: "Gorra Baseball Premium",
      description: "Gorra de baseball ajustable con diseño clásico y materiales de alta calidad.",
      price: 29.99,
      oldPrice: 39.99,
      image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=500&q=80",
      badge: "Ajustable",
      rating: 4.4,
      category: "gorras",
      stock: 35,
      sizes: ["Ajustable"],
      colors: ["Negro", "Azul", "Rojo", "Verde"],
      details: "• Ajuste trasero\n• Visera curva\n• Material transpirable\n• Lavable\n• Diseño unisex"
    },
    {
      id: 7,
      name: "Collar de Plata Sterling",
      description: "Collar elegante en plata sterling 925 con diseño minimalista y moderno.",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=500&q=80",
      badge: "Plata",
      rating: 4.8,
      category: "joyeria",
      stock: 12,
      sizes: ["45cm", "50cm", "55cm"],
      colors: ["Plata"],
      details: "• Plata sterling 925\n• Cierre seguro\n• Diseño minimalista\n• Incluye estuche\n• No se oxida"
    },
    {
      id: 8,
      name: "Mochila Urbana Antirrobo",
      description: "Mochila urbana con compartimentos antirrobo y diseño moderno para ciudad.",
      price: 129.99,
      oldPrice: 159.99,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=500&q=80",
      badge: "Segura",
      rating: 4.7,
      category: "mochilas",
      stock: 18,
      sizes: ["25L"],
      colors: ["Negro", "Gris", "Azul", "Verde"],
      details: "• Compartimentos antirrobo\n• Puerto USB externo\n• Material resistente al agua\n• Correas acolchadas\n• Portátil hasta 15\""
    },
    {
      id: 9,
      name: "Guantes de Piel Suave",
      description: "Guantes de piel suave con forro polar para máxima calidez y elegancia.",
      price: 49.99,
      image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=500&q=80",
      badge: "Piel",
      rating: 4.6,
      category: "guantes",
      stock: 22,
      sizes: ["S", "M", "L"],
      colors: ["Negro", "Marrón", "Gris"],
      details: "• Piel genuina\n• Forro polar\n• Tacto sensitivo\n• Costuras reforzadas\n• Lavado profesional"
    },
    {
      id: 10,
      name: "Paraguas Automático Compacto",
      description: "Paraguas automático compacto con sistema de apertura rápida y diseño portátil.",
      price: 34.99,
      oldPrice: 44.99,
      image: "https://images.unsplash.com/photo-1532635242-8e2e1e2d4ff1?auto=format&fit=crop&w=500&q=80",
      badge: "Automático",
      rating: 4.3,
      category: "paraguas",
      stock: 28,
      sizes: ["Compacto"],
      colors: ["Negro", "Azul", "Rojo", "Transparente"],
      details: "• Apertura automática\n• Diseño compacto\n• 8 varillas de fibra\n• Resistente al viento\n• Incluye funda"
    },
    {
      id: 11,
      name: "Cartera RFID Segura",
      description: "Cartera delgada con protección RFID para tarjetas y diseño minimalista.",
      price: 42.99,
      image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=500&q=80",
      badge: "RFID",
      rating: 4.7,
      category: "carteras",
      stock: 33,
      sizes: ["Delgada"],
      colors: ["Negro", "Marrón", "Azul", "Verde"],
      details: "• Protección RFID\n• 8 ranuras para tarjetas\n• Cuero ecológico\n• Diseño delgado\n• Compartimento para billetes"
    },
    {
      id: 12,
      name: "Set de Brazaletes Bohemios",
      description: "Set de 5 brazaletes con estilo bohemio y detalles étnicos para looks casuales.",
      price: 25.99,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=500&q=80",
      badge: "Set",
      rating: 4.4,
      category: "brazaletes",
      stock: 45,
      sizes: ["Ajustables"],
      colors: ["Multicolor", "Dorado", "Plateado"],
      details: "• Set de 5 piezas\n• Ajustables\n• Materiales variados\n• Estilo bohemio\n• Perfectos para stacking"
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
      default:
        // Popularidad (por defecto)
        filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchTerm, sortBy]);

  // Paginación
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  // Función auxiliar para obtener colores HEX
  const getColorHex = (colorName) => {
    const colorMap = {
      'Negro': '#000000',
      'Azul': '#3b82f6',
      'Plateado': '#c0c0c0',
      'Marrón': '#92400e',
      'Beige': '#f5f5dc',
      'Dorado': '#ffd700',
      'Multicolor': 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4)',
      'Gris': '#6b7280',
      'Burdeos': '#831843',
      'Azul marino': '#1e3a8a',
      'Verde': '#10b981',
      'Rojo': '#ef4444',
      'Transparente': 'rgba(255,255,255,0.3)',
      'Plata': '#c0c0c0'
    };
    return colorMap[colorName] || '#6b7280';
  };

  const handleQuickView = (product) => {
    // Función para generar estrellas de rating
    const generateRatingStars = (rating) => {
      let stars = '';
      const fullStars = Math.floor(rating);
      const hasHalfStar = rating % 1 !== 0;

      for (let i = 1; i <= 5; i++) {
        if (i <= fullStars) {
          stars += '<i class="fas fa-star" style="color: #FFD700; font-size: 14px;"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars += '<i class="fas fa-star-half-alt" style="color: #FFD700; font-size: 14px;"></i>';
        } else {
          stars += '<i class="far fa-star" style="color: #FFD700; font-size: 14px;"></i>';
        }
      }
      return stars;
    };

    // Función para determinar color del badge
    const getBadgeColor = (badge) => {
      const colors = {
        'Smart': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'Cuero': 'linear-gradient(135deg, #8B4513, #A0522D)',
        'Clásico': 'linear-gradient(135deg, #6b7280, #374151)',
        'Reversible': 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        'Invierno': 'linear-gradient(135deg, #0ea5e9, #0369a1)',
        'Ajustable': 'linear-gradient(135deg, #10b981, #059669)',
        'Plata': 'linear-gradient(135deg, #c0c0c0, #a8a8a8)',
        'Segura': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'Piel': 'linear-gradient(135deg, #8B4513, #A0522D)',
        'Automático': 'linear-gradient(135deg, #f59e0b, #d97706)',
        'RFID': 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
        'Set': 'linear-gradient(135deg, #ec4899, #db2777)'
      };
      return colors[badge] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };

    // Calcular ahorro
    const savings = product.oldPrice ? Math.round((1 - product.price/product.oldPrice) * 100) : 0;

    Swal.fire({
      title: '',
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 20px; overflow: hidden;">
          
          <!-- HEADER -->
          <div style="background: white; padding: 25px 30px 0; border-bottom: 1px solid #e0f2fe;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                ${product.badge ? `
                  <div style="background: ${getBadgeColor(product.badge)}; color: white; padding: 10px 20px; border-radius: 25px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">
                    ${product.badge}
                  </div>
                ` : ''}
                <div style="display: flex; align-items: center; gap: 15px;">
                  <div style="color: #64748b; font-size: 12px; font-weight: 600; background: #f8fafc; padding: 6px 12px; border-radius: 20px;">
                    <i class="fas fa-hashtag" style="margin-right: 5px;"></i>SKU: ${String(product.id).padStart(6, '0')}
                  </div>
                  <div style="color: #10b981; font-size: 12px; font-weight: 600; background: #ecfdf5; padding: 6px 12px; border-radius: 20px;">
                    <i class="fas fa-check-circle" style="margin-right: 5px;"></i>Verificado
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style="padding: 0;">
            <div style="display: grid; grid-template-columns: 350px 1fr; min-height: 450px;">
              
              <!-- SIDEBAR DE IMAGEN -->
              <div style="background: white; padding: 25px; border-right: 1px solid #e0f2fe; position: relative;">
                
                <!-- IMAGEN PRINCIPAL -->
                <div style="position: relative; margin-bottom: 20px;">
                  <div style="width: 100%; height: 300px; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.1); position: relative;">
                    <img 
                      src="${product.image}" 
                      alt="${product.name}" 
                      style="width: 100%; height: 100%; object-fit: cover;"
                      onerror="this.src='https://via.placeholder.com/350x300/f0f9ff/7dd3fc?text=Accesorio+No+Disponible'"
                    />
                  </div>
                  
                  <!-- BADGE DE STOCK -->
                  <div style="position: absolute; bottom: 15px; left: 15px;">
                    <div style="background: ${product.stock > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white; padding: 8px 16px; border-radius: 20px; font-weight: 700; font-size: 12px; display: flex; align-items: center; gap: 6px;">
                      <i class="fas ${product.stock > 0 ? 'fa-check' : 'fa-clock'}"></i>
                      ${product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </div>
                  </div>
                </div>
              </div>

              <!-- CONTENIDO PRINCIPAL -->
              <div style="background: white; padding: 25px; position: relative;">
                
                <!-- NOMBRE Y RATING -->
                <div style="margin-bottom: 20px;">
                  <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 12px;">
                    ${product.name}
                  </h1>
                  
                  <div style="display: flex; align-items: center; gap: 12px; padding-bottom: 15px; border-bottom: 1px solid #e0f2fe;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                      ${generateRatingStars(product.rating)}
                      <span style="color: #475569; font-size: 14px; font-weight: 600; margin-left: 8px;">${product.rating}/5</span>
                    </div>
                    <div style="color: #0ea5e9; font-size: 13px; font-weight: 600;">
                      36 reseñas verificadas
                    </div>
                  </div>
                </div>

                <!-- PRECIO Y DESCUENTO -->
                <div style="margin-bottom: 20px;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
                    <span style="font-size: 32px; font-weight: 900; color: #0f172a;">$${product.price}</span>
                    ${product.oldPrice ? `
                      <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 18px; color: #94a3b8; text-decoration: line-through; font-weight: 600;">$${product.oldPrice}</span>
                        <span style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 800;">
                          -${savings}% OFF
                        </span>
                      </div>
                    ` : ''}
                  </div>
                  ${savings > 0 ? `
                    <div style="color: #059669; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 6px;">
                      <i class="fas fa-piggy-bank"></i>
                      Ahorras $${(product.oldPrice - product.price).toFixed(2)}
                    </div>
                  ` : ''}
                </div>

                <!-- DESCRIPCIÓN -->
                <div style="margin-bottom: 20px;">
                  <p style="color: #64748b; line-height: 1.6; font-size: 14px;">
                    ${product.description}
                  </p>
                </div>

                <!-- SELECTOR DE COLOR -->
                <div style="margin-bottom: 20px;">
                  <label style="font-weight: 700; color: #1e293b; font-size: 14px; display: block; margin-bottom: 10px;">Color:</label>
                  <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${product.colors.map((color, index) => `
                      <button 
                        type="button"
                        style="padding: 10px 16px; 
                               border: 2px solid #e2e8f0; 
                               background: white; 
                               color: #475569; 
                               border-radius: 10px; 
                               font-weight: 600;
                               font-size: 13px;
                               cursor: pointer;
                               display: flex;
                               align-items: center;
                               gap: 8px;
                               transition: all 0.2s ease;"
                        onmouseover="this.style.borderColor='#0ea5e9'; this.style.color='#0ea5e9'"
                        onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#475569'"
                      >
                        <div style="width: 16px; height: 16px; border-radius: 50%; background: ${getColorHex(color)}; border: 2px solid #e2e8f0;"></div>
                        ${color}
                      </button>
                    `).join('')}
                  </div>
                </div>

                <!-- BOTÓN DE ACCIÓN -->
                <div style="display: flex; gap: 12px; align-items: center;">
                  <button 
                    style="height: 48px; 
                           flex: 1;
                           background: ${product.stock > 0 ? 'linear-gradient(135deg, #0ea5e9, #0369a1)' : '#94a3b8'}; 
                           color: white; 
                           border: none; 
                           border-radius: 12px; 
                           font-weight: 700; 
                           font-size: 15px;
                           cursor: ${product.stock > 0 ? 'pointer' : 'not-allowed'};
                           display: flex;
                           align-items: center;
                           justify-content: center;
                           gap: 10px;
                           transition: all 0.2s ease;"
                    onmouseover="this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.transform='translateY(0)'"
                  >
                    <i class="fas fa-shopping-cart"></i>
                    ${product.stock > 0 ? 'Agregar al Carrito' : 'Producto Agotado'}
                  </button>
                </div>

                <!-- GARANTÍA -->
                <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 15px; margin-top: 20px;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 32px; height: 32px; border-radius: 50%; background: #0ea5e9; display: flex; align-items: center; justify-content: center;">
                      <i class="fas fa-shield-alt" style="color: white; font-size: 14px;"></i>
                    </div>
                    <div>
                      <div style="font-weight: 700; color: #0369a1; font-size: 14px;">Garantía Premium Accesorios</div>
                      <div style="color: #0ea5e9; font-size: 12px;">30 días para devolución • 1 año de garantía</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      width: 800,
      showCloseButton: true,
      showConfirmButton: false,
      showCancelButton: false,
      focusConfirm: false
    });
  };

  const handleAddToWishlist = (productId) => {
    Swal.fire({
      title: '¡Agregado a Favoritos!',
      text: 'El accesorio se ha agregado a tu lista de deseos',
      icon: 'success',
      confirmButtonText: 'Continuar',
      timer: 2000
    });
  };

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    Swal.fire({
      title: '¡Accesorio Agregado!',
      html: `
        <div style="text-align: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;"/>
          <p><strong>${product.name}</strong></p>
          <p>Precio: $${product.price}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#0ea5e9'
    });
  };

  const renderRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star" style={{color: '#FFD700'}}></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt" style={{color: '#FFD700'}}></i>);
      } else {
        stars.push(<i key={i} className="far fa-star" style={{color: '#FFD700'}}></i>);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className={styles.accesoriosContainer}>
        <Header />
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin" style={{marginRight: '10px'}}></i>
          Cargando accesorios de moda...
        </div>
      </div>
    );
  }

  return (
    <div className={styles.accesoriosContainer}>
      <Header />

      {/* HERO SECTION */}
      <section className={styles.heroSection}>
        <h1 className={styles.heroTitle}>ACCESORIOS DE MODA</h1>
        <p className={styles.heroSubtitle}>
          Completa tu estilo con nuestra exclusiva colección de accesorios. 
          Desde joyería elegante hasta complementos funcionales, encuentra el toque perfecto.
        </p>
        
        <div className={styles.heroStats}>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>300+</span>
            <span className={styles.statLabel}>Accesorios</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>4.7</span>
            <span className={styles.statLabel}>Rating Promedio</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNumber}>97%</span>
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
              placeholder="Buscar accesorios, joyería, complementos..."
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
              <option value="popularidad">Ordenar por: Popularidad</option>
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
            {filteredProducts.length} accesorio{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className={styles.noProducts}>
            <div className={styles.noProductsIcon}>
              <i className="fas fa-search"></i>
            </div>
            <h3>No se encontraron accesorios</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          </div>
        ) : (
          <>
            <div className={styles.productsGrid}>
              {currentProducts.map((product) => (
                <div key={product.id} className={styles.productCard}>
                  {product.badge && (
                    <div className={styles.productBadge}>{product.badge}</div>
                  )}
                  
                  <div className={styles.productImage}>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/f0f9ff/7dd3fc?text=Accesorio+No+Disponible';
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
                        {product.oldPrice && (
                          <span className={styles.oldPrice}>${product.oldPrice}</span>
                        )}
                        <span className={styles.currentPrice}>${product.price}</span>
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
