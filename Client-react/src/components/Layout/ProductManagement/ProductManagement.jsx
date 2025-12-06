import React, { useState, useEffect } from 'react';
import styles from "./ProductManagement.module.css";
import axios from 'axios';
import Swal from 'sweetalert2';

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    categoria: '',
    estado: ''
  });

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.categoria) params.append('categoria', filters.categoria);
      if (filters.estado) params.append('estado', filters.estado);
      
      // 🚨 2. REEMPLAZO en loadProducts
      const response = await axios.get(`${API_BASE_URL}/admin/products?${params}`);
      
      if (response.data.status === 'success') {
        setProducts(response.data.data.products);
      } else {
        throw new Error(response.data.message);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      Swal.fire({
        title: 'Error',
        text: 'No se pudieron cargar los productos',
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías
  const loadCategories = async () => {
    try {
      console.log('🔄 Cargando categorías...');
      // 🚨 3. REEMPLAZO en loadCategories
      const response = await axios.get(`${API_BASE_URL}/admin/categories`);
      console.log('✅ Respuesta de categorías:', response.data);
      
      if (response.data.status === 'success') {
        setCategories(response.data.data);
        console.log(`✅ ${response.data.data.length} categorías cargadas`);
      } else {
        console.error('❌ Error en respuesta:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      console.error('❌ Response data:', error.response?.data);
      console.error('❌ Response status:', error.response?.status);
      
      Swal.fire({
        title: 'Error',
        text: `Error al cargar categorías: ${error.response?.data?.message || error.message}`,
        icon: 'error',
        confirmButtonText: 'Entendido'
      });
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // Manejar cambios en filtros
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Aplicar filtros
  const applyFilters = () => {
    loadProducts();
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      search: '',
      categoria: '',
      estado: ''
    });
  };

  // Ver producto
  const viewProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    Swal.fire({
      title: `<div style="display: flex; align-items: center; gap: 10px;">
                <span>${product.nombre}</span>
                <span style="background: #f1f5f9; color: #64748b; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500;">ID: ${product.id}</span>
              </div>`,
      html: `
        <div style="text-align: left; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          ${product.imagen_url ? `
            <div style="text-align: center; margin-bottom: 20px;">
              <img src="${product.imagen_url}" 
                   alt="${product.nombre}" 
                   style="max-width: 200px; max-height: 200px; border-radius: 8px; border: 1px solid #e2e8f0;">
            </div>
          ` : ''}
          
          <div style="margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;"><strong>Descripción:</strong></div>
            <div style="color: #334155; line-height: 1.5;">${product.descripcion || '<em style="color: #94a3b8;">Sin descripción</em>'}</div>
          </div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Precio</div>
              <div style="font-size: 18px; font-weight: bold; color: #059669;">$${product.precio}</div>
            </div>
            
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Stock</div>
              <div style="font-size: 18px; font-weight: bold; color: ${product.stock > 0 ? '#059669' : '#dc2626'};">${product.stock}</div>
            </div>
            
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Género</div>
              <div style="font-size: 14px; font-weight: 600; color: #334155;">${product.genero}</div>
            </div>
            
            <div style="padding: 12px; background: white; border-radius: 8px; border: 1px solid #e2e8f0;">
              <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Categoría</div>
              <div style="font-size: 14px; font-weight: 600; color: #334155;">${product.categoria}</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <div style="padding: 10px 16px; background: ${product.activo ? '#d1fae5' : '#fef2f2'}; border-radius: 20px; border: 1px solid ${product.activo ? '#a7f3d0' : '#fecaca'};">
              <span style="font-size: 12px; font-weight: 600; color: ${product.activo ? '#065f46' : '#991b1b'};">
                ${product.activo ? '🟢 Activo' : '🔴 Inactivo'}
              </span>
            </div>
            
            <div style="padding: 10px 16px; background: #eff6ff; border-radius: 20px; border: 1px solid #dbeafe;">
              <span style="font-size: 12px; font-weight: 600; color: #1e40af;">
                ID: ${product.id}
              </span>
            </div>
          </div>
        </div>
      `,
      confirmButtonText: 'Cerrar',
      width: '650px',
      padding: '20px',
      customClass: {
        popup: 'custom-swal-popup'
      },
      background: '#ffffff',
      showCloseButton: true,
      confirmButtonColor: '#3b82f6'
    });
  };

  // Eliminar producto
  const confirmDeleteProduct = (productId) => {
    const product = products.find(p => p.id === productId);
    
    Swal.fire({
      title: '¿Eliminar producto?',
      html: `¿Estás seguro de que quieres eliminar <strong>${product.nombre}</strong>?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await axios.delete(`http://127.0.0.1:5000/admin/products/${productId}`);
          
          if (response.data.status === 'success') {
            Swal.fire('Eliminado!', 'El producto ha sido eliminado.', 'success');
            loadProducts();
          }
        } catch (error) {
          console.error('Error completo al eliminar:', error);
          Swal.fire('Error!', 'No se pudo eliminar el producto.', 'error');
        }
      }
    });
  };

  // Mostrar modal para editar/crear producto
  const showEditProductModal = (productId = null) => {
    const product = productId ? products.find(p => p.id === productId) : null;
    
    Swal.fire({
      title: `<h3 style="color: #2D3748; font-weight: 600; margin-bottom: 10px;">${product ? 'Editar Producto' : 'Nuevo Producto'}</h3>`,
      html: `
        <div style="text-align: left; max-height: 70vh; overflow-y: auto; padding: 0 5px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
            <div>
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-tag" style="margin-right: 8px; color: #667EEA;"></i>
                  Nombre del Producto *
                </label>
                <input 
                  id="product-name" 
                  class="swal2-input" 
                  placeholder="Ej: Camisa Casual Hombre" 
                  value="${product ? product.nombre : ''}"
                  style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; transition: all 0.3s;"
                >
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-dollar-sign" style="margin-right: 8px; color: #48BB78;"></i>
                  Precio *
                </label>
                <div style="position: relative;">
                  <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #718096; font-weight: 600;">$</span>
                  <input 
                    id="product-price" 
                    type="number" 
                    step="0.01"
                    min="0"
                    class="swal2-input" 
                    placeholder="0.00" 
                    value="${product ? product.precio : ''}"
                    style="width: 100%; padding: 12px 12px 12px 30px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px;"
                  >
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-boxes" style="margin-right: 8px; color: #ED8936;"></i>
                  Stock
                </label>
                <input 
                  id="product-stock" 
                  type="number" 
                  min="0"
                  class="swal2-input" 
                  placeholder="Cantidad en inventario" 
                  value="${product ? product.stock : ''}"
                  style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px;"
                >
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-venus-mars" style="margin-right: 8px; color: #F56565;"></i>
                  Género *
                </label>
                <select 
                  id="product-gender" 
                  style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; background: white; color: #4A5568;"
                >
                  <option value="">Seleccionar género</option>
                  <option value="Hombre" ${product?.genero === 'Hombre' ? 'selected' : ''}>Hombre</option>
                  <option value="Mujer" ${product?.genero === 'Mujer' ? 'selected' : ''}>Mujer</option>
                  <option value="Unisex" ${product?.genero === 'Unisex' ? 'selected' : ''}>Unisex</option>
                  <option value="Niños" ${product?.genero === 'Niños' ? 'selected' : ''}>Niños</option>
                </select>
              </div>
            </div>

            <div style="margin-left: 50px;">
              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-layer-group" style="margin-right: 8px; color: #9F7AEA;"></i>
                  Categoría *
                </label>
                <select 
                  id="product-category" 
                  style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; background: white; color: #4A5568;"
                >
                  <option value="">Seleccionar categoría</option>
                  ${categories.map(cat => 
                    `<option value="${cat.id}" ${product?.categoria_id === cat.id ? 'selected' : ''}>${cat.nombre}</option>`
                  ).join('')}
                </select>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-image" style="margin-right: 8px; color: #4299E1;"></i>
                  URL de Imagen
                </label>
                <input 
                  id="product-image" 
                  class="swal2-input" 
                  placeholder="https://ejemplo.com/imagen.jpg" 
                  value="${product ? product.imagen_url : ''}"
                  style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px;"
                >
              </div>

              <div id="image-preview-container" style="margin-bottom: 20px; display: ${product?.imagen_url ? 'block' : 'none'};">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
                  <i class="fas fa-eye" style="margin-right: 8px; color: #4299E1;"></i>
                  Vista Previa
                </label>
                <div id="image-preview" style="width: 100%; height: 120px; border: 2px dashed #E2E8F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #F7FAFC;">
                  ${product?.imagen_url ? 
                    `<img src="${product.imagen_url}" alt="Vista previa" style="max-width: 100%; max-height: 100%; object-fit: contain;">` : 
                    '<span style="color: #A0AEC0; font-size: 12px;">No hay imagen para previsualizar</span>'
                  }
                </div>
              </div>

              <div style="margin-bottom: 20px;">
                <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 12px; font-size: 14px;">
                  <i class="fas fa-toggle-on" style="margin-right: 8px; color: #38B2AC;"></i>
                  Estado del Producto
                </label>
                <label style="display: flex; align-items: center; cursor: pointer; padding: 12px; background: ${product ? (product.activo ? '#F0FFF4' : '#FED7D7') : '#F0FFF4'}; border: 1px solid ${product ? (product.activo ? '#9AE6B4' : '#FEB2B2') : '#9AE6B4'}; border-radius: 8px;">
                  <input 
                    id="product-active" 
                    type="checkbox" 
                    ${product ? (product.activo ? 'checked' : '') : 'checked'}
                    style="margin-right: 10px; transform: scale(1.2);"
                  >
                  <div>
                    <div style="font-weight: 600; color: ${product ? (product.activo ? '#276749' : '#9B2C2C') : '#276749'};">
                      ${product ? (product.activo ? 'Producto Activo' : 'Producto Inactivo') : 'Producto Activo'}
                    </div>
                    <div style="font-size: 12px; color: ${product ? (product.activo ? '#48BB78' : '#F56565') : '#48BB78'};">
                      ${product ? (product.activo ? 'Visible para los clientes' : 'Oculto para los clientes') : 'Visible para los clientes'}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 8px; font-size: 14px;">
              <i class="fas fa-align-left" style="margin-right: 8px; color: #667EEA;"></i>
              Descripción del Producto
            </label>
            <textarea 
              id="product-description" 
              class="swal2-textarea" 
              placeholder="Describe las características, materiales y beneficios del producto..."
              rows="4"
              style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit;"
            >${product ? product.descripcion : ''}</textarea>
            <div style="text-align: right; margin-top: 5px;">
              <small style="color: #A0AEC0; font-size: 12px;">Recomendado: 150-300 caracteres</small>
            </div>
          </div>

          <div style="background: #EBF8FF; border: 1px solid #BEE3F8; border-radius: 8px; padding: 15px; margin-top: 20px;">
            <div style="display: flex; align-items: flex-start;">
              <i class="fas fa-info-circle" style="color: #3182CE; margin-right: 10px; margin-top: 2px;"></i>
              <div>
                <div style="font-weight: 600; color: #2C5282; margin-bottom: 5px;">Información Importante</div>
                <div style="color: #4A5568; font-size: 13px; line-height: 1.4;">
                  Los campos marcados con <span style="color: #E53E3E;">*</span> son obligatorios. 
                  Asegúrese de que la URL de la imagen sea válida y accesible.
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      width: '800px',
      background: '#FFFFFF',
      padding: '30px',
      showCancelButton: true,
      confirmButtonText: product ? 
        '<i class="fas fa-save" style="margin-right: 8px;"></i> Actualizar Producto' : 
        '<i class="fas fa-plus" style="margin-right: 8px;"></i> Crear Producto',
      cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i> Cancelar',
      confirmButtonColor: '#667EEA',
      cancelButtonColor: '#A0AEC0',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const nombre = document.getElementById('product-name').value.trim();
        const descripcion = document.getElementById('product-description').value.trim();
        const precio = document.getElementById('product-price').value;
        const stock = document.getElementById('product-stock').value;
        const genero = document.getElementById('product-gender').value;
        const categoria_id = document.getElementById('product-category').value;
        const imagen_url = document.getElementById('product-image').value.trim();
        const activo = document.getElementById('product-active').checked;

        if (!nombre) {
          Swal.showValidationMessage('El nombre del producto es requerido');
          return false;
        }
        if (!precio || parseFloat(precio) <= 0) {
          Swal.showValidationMessage('El precio debe ser mayor a 0');
          return false;
        }
        if (!genero) {
          Swal.showValidationMessage('Seleccione un género');
          return false;
        }
        if (!categoria_id) {
          Swal.showValidationMessage('Seleccione una categoría');
          return false;
        }

        try {
          const productData = {
            nombre,
            descripcion,
            precio: parseFloat(precio),
            stock: parseInt(stock) || 0,
            genero,
            categoria_id,
            imagen_url,
            activo
          };

          if (product) {
            const response = await axios.put(`http://127.0.0.1:5000/admin/products/${product.id}`, productData);
            return response.data;
          } else {
            const response = await axios.post('http://127.0.0.1:5000/admin/products', productData);
            return response.data;
          }
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Error al guardar el producto';
          Swal.showValidationMessage(errorMsg);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: '¡Éxito!',
          text: product ? 'Producto actualizado correctamente' : 'Producto creado correctamente',
          icon: 'success',
          confirmButtonText: 'Entendido'
        });
        loadProducts();
      }
    });

    setTimeout(() => {
      const imageInput = document.getElementById('product-image');
      const previewContainer = document.getElementById('image-preview-container');
      const preview = document.getElementById('image-preview');
      
      if (imageInput) {
        imageInput.addEventListener('input', function() {
          if (this.value) {
            previewContainer.style.display = 'block';
            preview.innerHTML = `<img src="${this.value}" alt="Vista previa" style="max-width: 100%; max-height: 100%; object-fit: contain;" onerror="this.parentElement.innerHTML='<span style=\"color: #F56565; font-size: 12px;\">Error al cargar imagen</span>'">`;
          } else {
            previewContainer.style.display = 'none';
          }
        });
      }
    }, 100);
  };

  // Mostrar modal para categorías
  const showCreateCategoryModal = () => {
    console.log('🔄 Abriendo modal de categoría...');
    console.log('📊 Categorías actuales:', categories);
    
    Swal.fire({
      title: '<h3 style="color: #2D3748; font-weight: 600; margin-bottom: 20px;">➕ Nueva Categoría</h3>',
      html: `
        <div style="text-align: left;">
          <div style="margin-bottom: 25px;">
            <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 10px; font-size: 14px;">
              <i class="fas fa-tag" style="margin-right: 8px; color: #667EEA;"></i>
              Nombre de la Categoría *
            </label>
            <input 
              id="category-name" 
              class="swal2-input" 
              placeholder="Ej: Ropa Deportiva, Accesorios, Calzado..." 
              style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px;"
            >
          </div>

          <div style="margin-bottom: 20px;">
            <label style="display: block; font-weight: 600; color: #4A5568; margin-bottom: 10px; font-size: 14px;">
              <i class="fas fa-align-left" style="margin-right: 8px; color: #9F7AEA;"></i>
              Descripción (Opcional)
            </label>
            <textarea 
              id="category-description" 
              class="swal2-textarea" 
              placeholder="Describe brevemente esta categoría..."
              rows="3"
              style="width: 100%; padding: 12px; border: 1px solid #E2E8F0; border-radius: 8px; font-size: 14px; resize: vertical; font-family: inherit;"
            ></textarea>
          </div>

          <div style="background: #F0FFF4; border: 1px solid #9AE6B4; border-radius: 8px; padding: 15px;">
            <div style="display: flex; align-items: flex-start;">
              <i class="fas fa-lightbulb" style="color: #38A169; margin-right: 10px; margin-top: 2px;"></i>
              <div>
                <div style="font-weight: 600; color: #276749; margin-bottom: 5px;">Sugerencia</div>
                <div style="color: #4A5568; font-size: 13px; line-height: 1.4;">
                  Usa nombres descriptivos y únicos. Las categorías ayudan a organizar tus productos y mejorar la experiencia de búsqueda para tus clientes.
                </div>
              </div>
            </div>
          </div>
        </div>
      `,
      width: '500px',
      background: '#FFFFFF',
      padding: '30px',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-plus" style="margin-right: 8px;"></i> Crear Categoría',
      cancelButtonText: '<i class="fas fa-times" style="margin-right: 8px;"></i> Cancelar',
      confirmButtonColor: '#48BB78',
      cancelButtonColor: '#A0AEC0',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        const nombre = document.getElementById('category-name').value.trim();
        const descripcion = document.getElementById('category-description').value.trim();

        if (!nombre) {
          Swal.showValidationMessage('El nombre de la categoría es requerido');
          return false;
        }

        if (nombre.length < 2) {
          Swal.showValidationMessage('El nombre debe tener al menos 2 caracteres');
          return false;
        }

        try {
          const categoryData = {
            nombre,
            descripcion: descripcion || ''
          };

          const response = await axios.post('http://127.0.0.1:5000/admin/categories', categoryData);
          return response.data;
        } catch (error) {
          const errorMsg = error.response?.data?.message || 'Error al crear la categoría';
          Swal.showValidationMessage(errorMsg);
          return false;
        }
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Categoría creada correctamente',
          icon: 'success',
          confirmButtonText: 'Entendido'
        });
        loadCategories();
      }
    });
  };

  // Función para obtener badge de stock
  const getStockBadge = (stock, activo) => {
    if (!activo) return 'badge-secondary';
    if (stock > 0) return 'badge-success';
    return 'badge-danger';
  };

  // Función para obtener texto de stock
  const getStockText = (stock, activo) => {
    if (!activo) return 'Inactivo';
    if (stock > 0) return 'En stock';
    return 'Sin stock';
  };

  return (
    <div>   
      {/* Header con botones */}
      <div className={styles.page_header}>
        <div className={styles.header_title}>
          <h2>Gestión de Productos</h2>
          <p className={styles.subtitle}>Administra y organiza tu inventario de productos</p>
        </div>
        <div className={styles.header_actions}>
          <button 
            className={styles.secondary_button}
            onClick={showCreateCategoryModal}
          >
            <i className="fas fa-folder-plus"></i> Nueva Categoría
          </button>
          <button 
            className={styles.primary_button}
            onClick={() => showEditProductModal()}
          >
            <i className="fas fa-plus"></i> Agregar Producto
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.search_filters}>
        <div className={styles.search_box}>
          <input 
            type="text" 
            className={styles.form_control} 
            placeholder="Buscar productos..." 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
          />
          <i className="fas fa-search"></i>
        </div>
        
        <select 
          className={`${styles.form_control} ${styles.filter_select}`}
          value={filters.categoria}
          onChange={(e) => handleFilterChange('categoria', e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
          ))}
        </select>
        
        <select 
          className={`${styles.form_control} ${styles.filter_select}`}
          value={filters.estado}
          onChange={(e) => handleFilterChange('estado', e.target.value)}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="outofstock">Sin stock</option>
        </select>

        <button 
          className={styles.apply_filters}
          onClick={applyFilters}
        >
          Aplicar
        </button>

        <button 
          className={styles.clear_filters}
          onClick={clearFilters}
        >
          Limpiar
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className={styles.quick_stats}>
        <div className={styles.stat_card}>
          <i className="fas fa-boxes"></i>
          <div>
            <span className={styles.stat_number}>{products.length}</span>
            <span className={styles.stat_label}>Productos</span>
          </div>
        </div>
        <div className={styles.stat_card}>
          <i className="fas fa-folder"></i>
          <div>
            <span className={styles.stat_number}>{categories.length}</span>
            <span className={styles.stat_label}>Categorías</span>
          </div>
        </div>
        <div className={styles.stat_card}>
          <i className="fas fa-check-circle"></i>
          <div>
            <span className={styles.stat_number}>
              {products.filter(p => p.activo && p.stock > 0).length}
            </span>
            <span className={styles.stat_label}>Disponibles</span>
          </div>
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i> Cargando productos...
        </div>
      ) : (
        <div className={styles.product_grid}>
          {products.length === 0 ? (
            <div className={styles.no_products}>
              <i className="fas fa-box-open fa-3x"></i>
              <h3>No se encontraron productos</h3>
              <p>Intenta ajustar los filtros o agregar nuevos productos</p>
              <button 
                className={styles.primary_button}
                onClick={() => showEditProductModal()}
              >
                <i className="fas fa-plus"></i> Agregar Primer Producto
              </button>
            </div>
          ) : (
            products.map(product => (
              <div key={product.id} className={styles.product_card}>
                <div className={styles.product_image}>
                  {product.imagen_url ? (
                    <img src={product.imagen_url} alt={product.nombre} />
                  ) : (
                    <i className="fas fa-box fa-3x"></i>
                  )}
                </div>
                
                <div className={styles.product_info}>
                  <div className={styles.product_name}>{product.nombre}</div>
                  <div className={styles.product_category}>{product.categoria}</div>
                  <div className={styles.product_price}>${product.precio}</div>
                  <div className={styles.product_stock}>
                    <span>Stock: {product.stock}</span>
                    <span className={`badge ${getStockBadge(product.stock, product.activo)}`}>
                      {getStockText(product.stock, product.activo)}
                    </span>
                  </div>
                  <div className={styles.actions}>
                    <button 
                      className="btn btn-sm btn-info" 
                      onClick={() => viewProduct(product.id)}
                      title="Ver detalles"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-warning" 
                      onClick={() => showEditProductModal(product.id)}
                      title="Editar producto"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button 
                      className="btn btn-sm btn-danger" 
                      onClick={() => confirmDeleteProduct(product.id)}
                      title="Eliminar producto"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}