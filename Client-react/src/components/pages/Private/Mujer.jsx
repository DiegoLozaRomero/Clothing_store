import React, { useState, useEffect } from 'react';
import { Header } from '../../Layout/header/Header';
import Swal from 'sweetalert2';
import './Mujer.css';
import { Footer } from '../../Layout/footer/Footer';
import { FloatingWhatsApp } from '../../FloatingWhatsApp/FloatingWhatsApp';

export default function Mujer() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularidad');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState('grid');
  const productsPerPage = 12;

  // Datos de ejemplo para la sección Mujer
  const mockProducts = [
    {
      id: 1,
      name: "Vestido Elegante de Noche",
      description: "Vestido largo para ocasiones especiales con detalles de encaje y corte femenino.",
      price: 89.99,
      oldPrice: 119.99,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=500&q=80",
      badge: "Nuevo",
      rating: 4.8,
      category: "vestidos",
      stock: 8,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Rojo", "Azul noche"],
      details: "• Tejido de satén premium\n• Corte sirena\n• Espalda descubierta\n• Forro interior suave"
    },
     {
      id: 2,
      name: "Blusa Floral Primaveral",
      description: "Blusa ligera con estampado floral perfecta para looks casuales y frescos.",
      price: 39.99,
      oldPrice: 49.99,
      image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=500&q=80",
      badge: "Floral",
      rating: 4.6,
      category: "blusas",
      stock: 15,
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Rosa", "Blanco", "Amarillo"],
      details: "• Algodón 100%\n• Manga larga volada\n• Botones perlados\n• Lavable a máquina"
    },
    {
      id: 3,
      name: "Falda Tableada Clásica",
      description: "Falda tableada de estilo escolar con corte A-line y tejido de calidad.",
      price: 45.99,
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=500&q=80",
      badge: "Clásico",
      rating: 4.7,
      category: "faldas",
      stock: 12,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Gris", "Azul marino"],
      details: "• Poliéster resistente\n• Tableados permanentes\n• Cintura elástica\n• Longitud midi"
    },
    {
      id: 4,
      name: "Jeans Mom Fit Premium",
      description: "Jeans de corte mom con tiro alto y efecto lavado vintage muy favorecedor.",
      price: 59.99,
      oldPrice: 79.99,
      image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=500&q=80",
      badge: "Trending",
      rating: 4.9,
      category: "pantalones",
      stock: 20,
      sizes: ["26", "28", "30", "32", "34"],
      colors: ["Azul claro", "Azul oscuro", "Negro"],
      details: "• Denim elastano\n• Corte mom fit\n• Tiro alto\n• 5 bolsillos funcionales"
    },
    {
      id: 5,
      name: "Abrigo de Lana Invierno",
      description: "Abrigo largo de lana merino para los días más fríos con diseño elegante.",
      price: 129.99,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=500&q=80",
      badge: "Invierno",
      rating: 4.8,
      category: "abrigos",
      stock: 6,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Camel", "Negro", "Gris oscuro"],
      details: "• Lana merino 80%\n• Forro interior\n• Botones de madera\n• Bolsillos laterales"
    },
    {
      id: 6,
      name: "Top Deportivo Fitness",
      description: "Top deportivo de soporte medio ideal para entrenamientos de alta intensidad.",
      price: 29.99,
      image: "https://images.unsplash.com/photo-1506629905607-e48b0e67d879?auto=format&fit=crop&w=500&q=80",
      badge: "Deporte",
      rating: 4.5,
      category: "deportivo",
      stock: 25,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Rosa", "Verde menta"],
      details: "• Material dry-fit\n• Soporte medio\n• Tirantes ajustables\n• Costuras planas"
    },
    {
      id: 7,
      name: "Conjunto de Playa Boho",
      description: "Set de dos piezas con estilo boho chic perfecto para vacaciones y verano.",
      price: 49.99,
      oldPrice: 69.99,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=500&q=80",
      badge: "Verano",
      rating: 4.7,
      category: "playa",
      stock: 18,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Blanco", "Azul turquesa", "Coral"],
      details: "• Top y falda\n• Material ligero\n• Estampado étnico\n• Ideal para playa"
    },
    {
      id: 8,
      name: "Chaqueta de Cuero Sintético",
      description: "Chaqueta estilo biker en cuero sintético de alta calidad con cremalleras.",
      price: 79.99,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=500&q=80",
      badge: "Edgy",
      rating: 4.6,
      category: "chaquetas",
      stock: 10,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Marrón", "Burdeos"],
      details: "• Cuero sintético\n• Cremalleras metálicas\n• Corte ajustado\n• Forro interior"
    },
    {
      id: 9,
      name: "Vestido Cocktail Elegante",
      description: "Vestido corto para eventos y fiestas con detalles de lentejuelas y corte princesa.",
      price: 69.99,
      oldPrice: 89.99,
      image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=500&q=80",
      badge: "Fiesta",
      rating: 4.9,
      category: "vestidos",
      stock: 7,
      sizes: ["XS", "S", "M"],
      colors: ["Dorado", "Plateado", "Negro"],
      details: "• Tejido con lentejuelas\n• Corte princesa\n• Escote en V\n• Largo midi"
    },
    {
      id: 10,
      name: "Sudadera Oversize Comfort",
      description: "Sudadera oversized perfecta para looks casuales y cómodos de diario.",
      price: 44.99,
      image: "https://images.unsplash.com/photo-1520006403909-838d6b92c22e?auto=format&fit=crop&w=500&q=80",
      badge: "Comfort",
      rating: 4.4,
      category: "sudaderas",
      stock: 22,
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gris", "Rosa blush", "Verde sage"],
      details: "• Algodón brushed\n• Corte oversized\n• Capucha con cordones\n• Bolsillo canguro"
    },
    {
      id: 11,
      name: "Pantalón Palazzo Fluido",
      description: "Pantalón palazzo de corte ancho y tejido fluido para looks elegantes.",
      price: 55.99,
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d77?auto=format&fit=crop&w=500&q=80",
      badge: "Elegante",
      rating: 4.7,
      category: "pantalones",
      stock: 14,
      sizes: ["XS", "S", "M", "L"],
      colors: ["Negro", "Blanco", "Azul cielo"],
      details: "• Tejido fluido\n• Corte palazzo\n• Cintura alta\n• Efecto flowy"
    },
    {
      id: 12,
      name: "Top de Encaje Romantic",
      description: "Top de encaje delicado perfecto para looks femeninos y románticos.",
      price: 35.99,
      oldPrice: 45.99,
      image: "https://images.unsplash.com/photo-1589810635657-232948472d98?auto=format&fit=crop&w=500&q=80",
      badge: "Romantic",
      rating: 4.5,
      category: "tops",
      stock: 16,
      sizes: ["XS", "S", "M"],
      colors: ["Blanco", "Negro", "Rojo"],
      details: "• Encaje delicado\n• Forro interior\n• Tirantes finos\n• Ajuste femenino"
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
      'Rojo': '#FF0000',
      'Azul noche': '#1e3a8a',
      'Rosa': '#ec4899',
      'Blanco': '#ffffff',
      'Amarillo': '#fbbf24',
      'Gris': '#6b7280',
      'Azul marino': '#1e40af',
      'Azul claro': '#60a5fa',
      'Azul oscuro': '#1e40af',
      'Camel': '#d97706',
      'Gris oscuro': '#374151',
      'Verde menta': '#6ee7b7',
      'Azul turquesa': '#06b6d4',
      'Coral': '#fb7185',
      'Marrón': '#92400e',
      'Burdeos': '#831843',
      'Dorado': '#fbbf24',
      'Plateado': '#9ca3af',
      'Rosa blush': '#fecdd3',
      'Verde sage': '#86efac',
      'Azul cielo': '#7dd3fc'
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
          stars += '<i class="fas fa-star" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        } else if (i === fullStars + 1 && hasHalfStar) {
          stars += '<i class="fas fa-star-half-alt" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        } else {
          stars += '<i class="far fa-star" style="color: #FFD700; font-size: 14px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);"></i>';
        }
      }
      return stars;
    };
  
    // Función para determinar color del badge
    const getBadgeColor = (badge) => {
      const colors = {
        'Nuevo': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '-25%': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'Más Vendido': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'Eco': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'Vintage': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'Trending': 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
        '-15%': 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)'
      };
      return colors[badge] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };
  
    // Calcular ahorro
    const savings = product.oldPrice ? Math.round((1 - product.price/product.oldPrice) * 100) : 0;
  
    Swal.fire({
      title: '',
      html: `
        <div class="quickview-ultra" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border-radius: 20px; overflow: hidden;">
          
          <!-- HEADER ELEGANTE -->
          <div class="product-header" style="background: white; padding: 25px 30px 0; border-bottom: 1px solid #f1f5f9;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
              <div style="display: flex; align-items: center; gap: 15px;">
                ${product.badge ? `
                  <div class="badge-premium" style="background: ${getBadgeColor(product.badge)}; color: white; padding: 10px 24px; border-radius: 30px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
                    ${product.badge}
                  </div>
                ` : ''}
                <div class="product-meta" style="display: flex; align-items: center; gap: 20px;">
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
  
          <div class="product-main-content" style="padding: 0;">
            <div class="product-layout" style="display: grid; grid-template-columns: 480px 1fr; min-height: 600px;">
              
              <!-- SIDEBAR DE IMAGEN LUXURY -->
              <div class="image-sidebar" style="background: white; padding: 30px; border-right: 1px solid #f1f5f9; position: relative;">
                
                <!-- IMAGEN PRINCIPAL CON ZOOM -->
                <div class="main-image-container" style="position: relative; margin-bottom: 25px;">
                  <div class="image-wrapper" style="width: 100%; height: 400px; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); position: relative;">
                    <img 
                      src="${product.image}" 
                      alt="${product.name}" 
                      style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s ease;"
                      onerror="this.src='https://via.placeholder.com/500x400/f8fafc/94a3b8?text=Imagen+Premium'"
                      class="zoom-image"
                    />
                    <!-- OVERLAY DE ACCIONES -->
                    <div class="image-actions" style="position: absolute; top: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px;">
                      <button class="action-btn" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.95); border: 1px solid rgba(226,232,240,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                        <i class="fas fa-expand" style="color: #475569; font-size: 14px;"></i>
                      </button>
                      <button class="action-btn" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.95); border: 1px solid rgba(226,232,240,0.8); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(10px); box-shadow: 0 8px 25px rgba(0,0,0,0.1);">
                        <i class="fas fa-heart" style="color: #ef4444; font-size: 14px;"></i>
                      </button>
                    </div>
                  </div>
                  
                  <!-- BADGE DE STOCK FLOTANTE -->
                  <div class="stock-floating" style="position: absolute; bottom: 20px; left: 20px;">
                    <div style="background: ${product.stock > 0 ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #ef4444, #dc2626)'}; color: white; padding: 10px 20px; border-radius: 25px; font-weight: 700; font-size: 13px; box-shadow: 0 8px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 8px;">
                      <i class="fas ${product.stock > 0 ? 'fa-check' : 'fa-clock'}"></i>
                      ${product.stock > 0 ? `${product.stock} en stock` : 'Agotado'}
                    </div>
                  </div>
                </div>
  
                <!-- GALLERÍA DE MINIATURAS ENHANCED -->
                <div class="thumbnail-gallery" style="display: flex; gap: 12px; justify-content: center; padding: 20px 0;">
                  <div class="thumbnail active" style="width: 70px; height: 70px; border-radius: 12px; overflow: hidden; border: 3px solid #3b82f6; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);">
                    <img src="${product.image}" alt="Thumb 1" style="width: 100%; height: 100%; object-fit: cover;">
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
  
                <!-- FEATURES BAR LATERAL -->
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
  
              <!-- CONTENIDO PRINCIPAL LUXURY -->
              <div class="product-content" style="background: white; padding: 30px 40px; position: relative;">
                
                <!-- NOMBRE Y RATING -->
                <div class="product-title-section" style="margin-bottom: 25px;">
                  <h1 class="product-name" style="font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.2; margin-bottom: 15px; background: linear-gradient(135deg, #0f172a, #475569); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                    ${product.name}
                  </h1>
                  
                  <div class="rating-section" style="display: flex; align-items: center; gap: 20px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
                    <div class="stars" style="display: flex; align-items: center; gap: 6px;">
                      ${generateRatingStars(product.rating)}
                      <span style="color: #475569; font-size: 15px; font-weight: 600; margin-left: 10px;">${product.rating}/5</span>
                    </div>
                    <div class="reviews" style="color: #3b82f6; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: underline;">
                      128 reseñas verificadas
                    </div>
                    <div class="best-seller" style="background: #fef3c7; color: #d97706; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 700;">
                      <i class="fas fa-crown" style="margin-right: 5px;"></i>Best Seller
                    </div>
                  </div>
                </div>
  
                <!-- PRECIO Y DESCUENTO -->
                <div class="price-section" style="margin-bottom: 30px;">
                  <div class="price-display" style="display: flex; align-items: center; gap: 20px; margin-bottom: 10px;">
                    <span style="font-size: 42px; font-weight: 900; color: #0f172a; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">$${product.price}</span>
                    ${product.oldPrice ? `
                      <div style="display: flex; align-items: center; gap: 15px;">
                        <span style="font-size: 24px; color: #94a3b8; text-decoration: line-through; font-weight: 600;">$${product.oldPrice}</span>
                        <span style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 8px 16px; border-radius: 25px; font-size: 16px; font-weight: 800; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
                          -${savings}% OFF
                        </span>
                      </div>
                    ` : ''}
                  </div>
                  <div class="price-savings" style="color: #059669; font-size: 15px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                    <i class="fas fa-piggy-bank"></i>
                    ${savings > 0 ? `Estás ahorrando $${(product.oldPrice - product.price).toFixed(2)}` : 'Precio final • IVA incluido'}
                  </div>
                </div>
  
                <!-- SELECTOR DE OPCIONES -->
                <div class="options-section" style="margin-bottom: 35px;">
                  
                  <!-- SELECTOR DE TALLA -->
                  <div class="size-selector" style="margin-bottom: 25px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                      <label style="font-weight: 700; color: #1e293b; font-size: 16px;">Selecciona tu talla:</label>
                      <a href="#" style="color: #3b82f6; font-size: 14px; font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                        <i class="fas fa-ruler"></i>Guía de tallas
                      </a>
                    </div>
                    <div class="size-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px;">
                      ${product.sizes.map((size, index) => `
                        <button 
                          type="button"
                          class="size-option ${index === 2 ? 'active' : ''}"
                          style="padding: 16px 8px; border: 2px solid ${index === 2 ? '#3b82f6' : '#e2e8f0'}; 
                                 background: ${index === 2 ? '#3b82f6' : 'white'}; 
                                 color: ${index === 2 ? 'white' : '#475569'}; 
                                 border-radius: 12px; 
                                 font-weight: 700;
                                 font-size: 15px;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 position: relative;"
                        >
                          ${size}
                          ${index === 2 ? '<div style="position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 10px;"><i class="fas fa-check"></i></div>' : ''}
                        </button>
                      `).join('')}
                    </div>
                  </div>
  
                  <!-- SELECTOR DE COLOR -->
                  <div class="color-selector" style="margin-bottom: 30px;">
                    <label style="font-weight: 700; color: #1e293b; font-size: 16px; display: block; margin-bottom: 15px;">Color:</label>
                    <div class="color-grid" style="display: flex; gap: 12px; flex-wrap: wrap;">
                      ${product.colors.map((color, index) => `
                        <button 
                          type="button"
                          class="color-option ${index === 0 ? 'active' : ''}"
                          style="padding: 14px 20px; 
                                 border: 2px solid ${index === 0 ? '#3b82f6' : '#e2e8f0'}; 
                                 background: white; 
                                 color: #475569; 
                                 border-radius: 12px; 
                                 font-weight: 600;
                                 cursor: pointer;
                                 transition: all 0.3s ease;
                                 display: flex;
                                 align-items: center;
                                 gap: 10px;
                                 min-width: 160px;
                                 min-height: 60px"
                        >
                          <div style="width: 20px; height: 20px; border-radius: 50%; background: ${getColorHex(color)}; border: 2px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"></div>
                          ${color}
                        </button>
                      `).join('')}
                    </div>
                  </div>
  
                  <!-- SELECTOR DE CANTIDAD Y ACCIONES -->
                  <div class="action-section" style="display: grid; grid-template-columns: auto 1fr; gap: 15px; align-items: center;">
                    <div class="quantity-selector" style="display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white;">
                      <button style="width: 50px; height: 50px; border: none; background: #f8fafc; cursor: pointer; font-size: 18px; color: #475569; transition: all 0.3s ease;">-</button>
                      <input type="text" value="1" style="width: 70px; height: 50px; border: none; text-align: center; font-weight: 700; background: white; font-size: 16px; color: #1e293b;" readonly>
                      <button style="width: 50px; height: 50px; border: none; background: #f8fafc; cursor: pointer; font-size: 18px; color: #475569; transition: all 0.3s ease;">+</button>
                    </div>
                    
                    <button 
                      class="add-to-cart-main"
                      style="height: 54px; 
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
                      ${product.stock > 0 ? 'Agregar al Carrito - $' + product.price : 'Producto Agotado'}
                    </button>
                  </div>
                </div>
  
                <!-- GARANTÍA PREMIUM -->
                <div class="premium-guarantee" style="background: linear-gradient(135deg, #fef7ed, #fffbeb); border: 1px solid #fed7aa; border-radius: 16px; padding: 20px; margin-bottom: 25px;">
                  <div style="display: flex; align-items: center; gap: 15px;">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b, #d97706); display: flex; align-items: center; justify-content: center;">
                      <i class="fas fa-crown" style="color: white; font-size: 16px;"></i>
                    </div>
                    <div>
                      <div style="font-weight: 800; color: #92400e; font-size: 16px; margin-bottom: 4px;">Garantía Premium</div>
                      <div style="color: #b45309; font-size: 14px;">Este producto incluye 2 años de garantía extendida y soporte premium</div>
                    </div>
                  </div>
                </div>
  
  
              </div>
            </div>
          </div>
        </div>
      `,
      width: 1100,
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: product.stock > 0 ? 
        `<div style="display: flex; align-items: center; gap: 10px; font-weight: 700;">
          <i class="fas fa-bolt"></i>
          Comprar Ahora
        </div>` : 
        `<div style="display: flex; align-items: center; gap: 10px; font-weight: 700;">
          <i class="fas fa-bell"></i>
          Notificar Disponibilidad
        </div>`,
      confirmButtonColor: product.stock > 0 ? '#059669' : '#64748b',
      cancelButtonText: `<div style="display: flex; align-items: center; gap: 10px; font-weight: 700;">
        <i class="fas fa-shopping-cart"></i>
        Agregar al Carrito
      </div>`,
      cancelButtonColor: '#3b82f6',
      focusConfirm: false,
      customClass: {
        popup: 'ultra-premium-popup',
        actions: 'premium-actions',
        confirmButton: 'premium-confirm-btn',
        cancelButton: 'premium-cancel-btn'
      },
      showDenyButton: true,
      denyButtonText: `<div style="display: flex; align-items: center; gap: 10px; font-weight: 700;">
        <i class="far fa-heart"></i>
        Favoritos
      </div>`,
      denyButtonColor: '#ef4444',
      preConfirm: () => {
        if (product.stock > 0) {
          Swal.fire({
            title: '🚀 ¡Compra Rápida!',
            html: `
              <div style="text-align: center; padding: 30px;">
                <div style="font-size: 5em; margin-bottom: 20px;">🎉</div>
                <h3 style="color: #0f172a; margin-bottom: 15px; font-weight: 800;">Redirigiendo al checkout seguro...</h3>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Estamos preparando tu pedido de <strong style="color: #059669;">${product.name}</strong><br>
                  Serás redirigido en segundos a nuestro sistema de pago seguro.
                </p>
              </div>
            `,
            icon: 'success',
            showConfirmButton: false,
            timer: 2500,
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)'
          });
        } else {
          Swal.fire({
            title: '🔔 Notificación Premium',
            html: `
              <div style="text-align: center; padding: 30px;">
                <div style="font-size: 5em; color: #3b82f6; margin-bottom: 20px;">⭐</div>
                <h3 style="color: #0f172a; margin-bottom: 15px; font-weight: 800;">Te avisaremos primero</h3>
                <p style="color: #475569; line-height: 1.6; font-size: 16px;">
                  Has sido añadido a la lista de espera exclusiva para<br>
                  <strong style="color: #3b82f6;">${product.name}</strong>.<br>
                  Recibirás una notificación premium cuando esté disponible.
                </p>
              </div>
            `,
            confirmButtonText: '¡Perfecto!',
            confirmButtonColor: '#3b82f6',
            background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)'
          });
        }
      }
    });
  };
  

  const handleAddToWishlist = (productId) => {
    Swal.fire({
      title: '¡Agregado a Favoritos!',
      text: 'El producto se ha agregado a tu lista de deseos',
      icon: 'success',
      confirmButtonText: 'Continuar',
      timer: 2000
    });
  };

  const handleAddToCart = (productId) => {
    const product = products.find(p => p.id === productId);
    Swal.fire({
      title: '¡Producto Agregado!',
      html: `
        <div style="text-align: center;">
          <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;"/>
          <p><strong>${product.name}</strong></p>
          <p>Precio: $${product.price}</p>
        </div>
      `,
      icon: 'success',
      confirmButtonText: 'Continuar',
      confirmButtonColor: '#ec4899'
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
      <div className='mujerContainer'>
        <Header />
        <div className='loading'>
          <i className="fas fa-spinner fa-spin" style={{marginRight: '10px'}}></i>
          Cargando productos para mujer...
        </div>
      </div>
    );
  }

  return (
    <div className='mujerContainer'>
      <Header />

      {/* HERO SECTION */}
      <section className='heroSection'>
        <h1 className='heroTitle'>COLECCIÓN MUJER</h1>
        <p className='heroSubtitle'>
          Descubre nuestra exclusiva selección de moda femenina. 
          Desde looks casuales hasta elegancia sofisticada, encuentra tu estilo único.
        </p>
        
        <div className='heroStats'>
          <div className='statItem'>
            <span className='statNumber'>600+</span>
            <span className='statLabel'>Productos</span>
          </div>
          <div className='statItem'>
            <span className='statNumber'>4.9</span>
            <span className='statLabel'>Rating Promedio</span>
          </div>
          <div className='statItem'>
            <span className='statNumber'>99%</span>
            <span className='statLabel'>Clientes Satisfechas</span>
          </div>
        </div>
      </section>

      {/* FILTERS BAR */}
      <section className='filtersBar'>
        <div className='filtersContainer'>
          <form onSubmit={handleSearch} className='searchBox'>
            <input
              type="text"
              className='searchInput'
              placeholder="Buscar en moda femenina..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className='searchButton'>
              <i className="fas fa-search"></i>
            </button>
          </form>

          <div className='filterControls'>
            <select 
              className='sortSelect'
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="popularidad">Ordenar por: Popularidad</option>
              <option value="precio_asc">Precio: Menor a Mayor</option>
              <option value="precio_desc">Precio: Mayor a Menor</option>
              <option value="nuevo">Más Nuevos</option>
              <option value="valoracion">Mejor Valorados</option>
            </select>

            <div className='viewToggle'>
              <button 
                className={`viewButton ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <i className="fas fa-th"></i>
              </button>
              <button 
                className={`viewButton ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <i className="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className='productsSection'>
        <div className='productsHeader'>
          <div className='resultsCount'>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''} para mujer
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className='noProducts'>
            <div className='noProductsIcon'>
              <i className="fas fa-search"></i>
            </div>
            <h3>No se encontraron productos</h3>
            <p>Intenta con otros términos de búsqueda o ajusta los filtros</p>
          </div>
        ) : (
          <>
            <div className='productsGrid'>
              {currentProducts.map((product) => (
                <div key={product.id} className='productCard'>
                  {product.badge && (
                    <div className='productBadge'>{product.badge}</div>
                  )}
                  
                  <div className='productImage'>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300/fdf2f8/f9a8d4?text=Imagen+No+Disponible';
                      }}
                    />
                    <div className='productActions'>
                      <button 
                        className='actionButton'
                        onClick={() => handleQuickView(product)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button 
                        className='actionButton'
                        onClick={() => handleAddToWishlist(product.id)}
                      >
                        <i className="fas fa-heart"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className='productInfo'>
                    <h3 className='productTitle'>{product.name}</h3>
                    <p className='productDescription'>{product.description}</p>
                    
                    <div className='productRating'>
                      <span className='ratingStars'>
                        {renderRatingStars(product.rating)}
                      </span>
                      <span className='ratingCount'>({product.rating})</span>
                    </div>
                    
                    <div className='productPrice'>
                      <div className='priceContainer'>
                        {product.oldPrice && (
                          <span className='oldPrice'>${product.oldPrice}</span>
                        )}
                        <span className='currentPrice'>${product.price}</span>
                      </div>
                      <button 
                        className='addToCartButton'
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
              <div className='pagination'>
                <button 
                  className='paginationButton'
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`paginationButton ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => setCurrentPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className='paginationButton'
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
