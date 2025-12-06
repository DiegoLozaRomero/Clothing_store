import { useState, useEffect } from 'react';
import LogoutLink from '../../Auth/logout/LogoutLink';
import './header.css';
import { Link } from 'react-router-dom';

// 🚨 1. AÑADIR esta línea para obtener la URL base (http://3.139.232.5:5000)
const API_BASE_URL = import.meta.env.VITE_API_URL;

// Servicio para obtener los favoritos del usuario
const favoritesService = {
  async getFavoritesCount(userId) {
    try {
      // 🚨 2. REEMPLAZO en favoritesService
      const response = await fetch(`${API_BASE_URL}/favorites/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      return { status: 'error', data: [] };
    }
  }
};
const cartsService = {
  async getCartsCount(userId){
        try {
      // 🚨 3. REEMPLAZO en cartsService
      const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching favorites count:', error);
      return { status: 'error', data: [] };
    }
  }
}



export const Header = () => {
  const [user, setUser] = useState(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [cartsCount, setCartsCount] = useState(0);
  const [hasLoadedFavorites, setHasLoadedFavorites] = useState(false);
  const [hasLoadedCarts, setHasLoadedCarts] = useState(false);

  // Función para normalizar los datos del usuario
  const normalizeUser = (raw) => {
    if (!raw) return null;
    const r = typeof raw === "string" ? JSON.parse(raw) : raw;
    return {
      id: r.id || r.ID || null,
      nombre: r.nombre || r.Nombre || r.name || "",
      apellido: r.apellido || r.Apellido || r.lastname || "",
      genero: r.genero || r.Genero || "",
      email: r.email || r.Email || "",
      telefono: r.telefono || r.Telefono || "",
      foto: r.foto || r.Foto || r.avatar || "",
    };
  };

  // Cargar el usuario al montar el componente (SOLO UNA VEZ)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = normalizeUser(storedUser);
      setUser(userData);
    }

  }, []); // ← Array de dependencias vacío para que solo se ejecute una vez

  // Cargar favoritos solo cuando el usuario esté disponible
  useEffect(() => {
    if (user && user.id && !hasLoadedFavorites) {
      loadFavoritesCount(user.id);
    }
  }, [user, hasLoadedFavorites]);

    useEffect(() => {
    if (user && user.id && !hasLoadedCarts) {
      loadCartsCount(user.id);
    }
  }, [user, hasLoadedCarts]);

  // Función para cargar el contador de favoritos (SOLO UNA VEZ)
  const loadFavoritesCount = async (userId) => {
    try {
      console.log(' Loading favorites count for user:', userId);
      const favoritesData = await favoritesService.getFavoritesCount(userId);
      
      if (favoritesData.status === 'success') {
        const count = favoritesData.data.length;
        console.log(' Favorites count:', count);
        setFavoritesCount(count);
        setHasLoadedFavorites(true); // Marcar como cargado
      } else {
        console.error(' Error loading favorites count:', favoritesData);
        setFavoritesCount(0);
        setHasLoadedFavorites(true);
      }
    } catch (error) {
      console.error(' Error loading favorites count:', error);
      setFavoritesCount(0);
      setHasLoadedFavorites(true);
    }
  };

const loadCartsCount = async (userId) => {
    try {
      console.log(' Loading cart count for user:', userId);
      const cartsData = await cartsService.getCartsCount(userId);
      
      console.log(' Raw cart data:', cartsData); // Para debug
      
      if (cartsData.status === 'success') {
        // USAR total_items QUE YA VIENE CALCULADO DESDE LA API
        const count = cartsData.data.total_items || 0;
        console.log(' Cart count:', count);
        setCartsCount(count);
        setHasLoadedCarts(true);
      } else {
        console.error(' Error loading cart count:', cartsData);
        setCartsCount(0);
        setHasLoadedCarts(true);
      }
    } catch (error) {
      console.error(' Error loading cart count:', error);
      setCartsCount(0);
      setHasLoadedCarts(true);
    }
  };
  // Función para forzar actualización manual (opcional, para usar desde otros componentes)
  const refreshFavoritesCount = () => {
    if (user && user.id) {
      setHasLoadedFavorites(false); // Permitir recarga
    }
  };
  const refreshCartsCount = () => {
    if (user && user.id) {
      setHasLoadedCarts(false); // Permitir recarga
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart'); // Limpiar carrito también
    setFavoritesCount(0);
    setCartCount(0);
    setHasLoadedFavorites(false);
    setHasLoadedCarts(false);
    window.location.href = '/login';
  };

  return (
    <div>
      <header>
        <div className="logo">Fashion Luxe</div>
        <i className="fas fa-bars menu-toggle"></i>
        <nav>
          <ul>
            <li><Link to={"/Shop"}><i className="fas fa-home"></i> Inicio</Link></li>
            <li><Link to={"/Hombre"}><i className="fas fa-male"></i> Hombres</Link>
              <ul>
                <li><Link to={"/ArtHombre"}>Camisas</Link></li>
                <li><Link to={"/PantalonHombres"}>Pantalones</Link></li>
                <li><Link to={"/Chaquetas"}>Chaquetas</Link></li>
                <li><Link to={"/ArtHombreZapatosTenis"}>Tenis y Zapatos</Link></li>
              </ul>
            </li>
            <li><Link to={"/Mujer"}><i className="fas fa-female"></i> Mujeres</Link>
              <ul>
                <li><Link to={"/ArtMujerVestidos"}>Vestidos</Link></li>
                 <li><Link to={"/BlusasMujer"}>Blusas</Link></li>
                <li><Link to={"/ArtMujerZapatos"}>Zapatos</Link></li>
              </ul>
            </li>
            <li><Link to={"/Accesorios"}><i className="fas fa-gem"></i> Accesorios</Link>
              <ul>
                <li><a href="#">Bolsos</a></li>
                <li><Link to={"/AccesoriosRelojes"}>LiRelojes</Link></li>
              </ul>
            </li>
            <li><Link to={"/Ofertas"}><i className="fas fa-tag"></i> Ofertas</Link></li>
          </ul>
        </nav>
      
        {/*ICONOS DE USUARIO LOGEADO*/} 
        <div className="user-actions">
           
          <div className="icon-with-badge" title="Favoritos">
            <Link to={"/Favorito"}>
              <i className="fas fa-heart"></i>
              {favoritesCount > 0 && (
                <span className="badge" id="favorites-count">
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </Link>
          </div>

          <div className="icon-with-badge" title="Carrito de compras">
            <Link to={"/Carrito"}>
              <i className="fas fa-shopping-cart"></i>
              {cartsCount > 0 && (
                <span className="badge" id="cart-count">
                  {cartsCount > 99 ? '99+' : cartsCount}
                </span>
              )}
            </Link>
          </div>
        
          <div className="user-profile">
            <div className="user-avatar">
              {user?.nombre && user?.apellido 
                ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
                : user?.nombre 
                  ? user.nombre.charAt(0).toUpperCase()
                  : 'US'
              }
            </div>
            <span>
              {user?.nombre || ''} {user?.apellido || ''}
              {!user?.nombre && !user?.apellido && 'Usuario'}
            </span>
            <div className="user-dropdown">
              <Link to={"/Perfil"}><i className="fas fa-user"></i> Mi Perfil</Link>
              <LogoutLink/>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

// Exportar función para actualizar manualmente desde otros componentes
export const refreshHeaderCounts = () => {
  // Esta función puede ser llamada desde otros componentes cuando sea necesario
  window.dispatchEvent(new CustomEvent('refreshHeader'));
};



export const Mi_Cuenta = () => {
  return (
    <section className="profile-hero">
      <h1 className='Titulo'>Mi Cuenta</h1>
    </section>
  );
}

export const Favoritos = () => {
  return (
    <section className="profile-hero">
      <h1 className='Titulo'>Mis Favoritos</h1>
    </section>
  );
}

export const Header_Carrito = () => {
  return (
    <section className="profile-hero">
      <h1 className='Titulo'>Mi Carrito</h1>
    </section>
  );
}

export const Finalizar_Compra = () => {
  return (
    <section className="profile-hero">
      <h1 className='Titulo' style={{color: 'white', fontSize: '2.5rem'}}>Finalizar Compra</h1>
    </section>
  );
}