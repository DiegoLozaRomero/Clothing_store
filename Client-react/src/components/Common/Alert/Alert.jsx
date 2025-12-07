import { useEffect, useState } from 'react';

const Alert = ({ alert, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (alert.show) {
      setIsVisible(true);
      setIsExiting(false);
      
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [alert.show]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!alert.show && !isVisible) return null;

  // Estilos en línea para evitar conflictos
  const containerStyles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 10000,
    minWidth: '350px',
    maxWidth: '500px',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    fontFamily: "'Poppins', sans-serif",
    borderLeft: '4px solid',
    transform: isExiting ? 'translateX(400px)' : 'translateX(0)',
    opacity: isExiting ? 0 : 1,
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    // Colores según el tipo
    ...(alert.type === 'success' && {
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
      borderLeftColor: '#16a34a',
      color: '#166534'
    }),
    ...(alert.type === 'error' && {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
      borderLeftColor: '#dc2626',
      color: '#991b1b'
    }),
    ...(alert.type === 'warning' && {
      background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
      borderLeftColor: '#d97706',
      color: '#92400e'
    }),
    ...(alert.type === 'info' && {
      background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
      borderLeftColor: '#2563eb',
      color: '#1e40af'
    })
  };

  const iconStyles = {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    background: 'rgba(255, 255, 255, 0.9)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
  };

  const contentStyles = {
    flex: 1,
    minWidth: 0
  };

  const titleStyles = {
    fontWeight: 600,
    fontSize: '14px',
    marginBottom: '4px',
    letterSpacing: '0.5px',
    textTransform: 'uppercase'
  };

  const closeButtonStyles = {
    flexShrink: 0,
    width: '24px',
    height: '24px',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'currentColor',
    opacity: 0.7,
    transition: 'all 0.2s ease'
  };

  const progressStyles = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    background: 'currentColor',
    opacity: 0.3,
    borderRadius: '0 0 0 12px',
    animation: 'progress 5s linear forwards'
  };

  // Iconos SVG
  const getIcon = () => {
    const iconProps = { width: "20", height: "20", fill: "currentColor" };

    switch (alert.type) {
      case 'success':
        return <svg {...iconProps} viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>;
      case 'error':
        return <svg {...iconProps} viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>;
      case 'warning':
        return <svg {...iconProps} viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
      default:
        return <svg {...iconProps} viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>;
    }
  };

  const getTitle = () => {
    const titles = { success: 'Éxito', error: 'Error', warning: 'Advertencia', info: 'Información' };
    return titles[alert.type];
  };

  return (
    <div style={containerStyles}>
      <div style={iconStyles}>{getIcon()}</div>
      
      <div style={contentStyles}>
        <div style={titleStyles}>{getTitle()}</div>
        <div style={{ fontSize: '14px', lineHeight: '1.4', opacity: 0.9 }}>{alert.message}</div>
      </div>
      
      <button 
        style={closeButtonStyles}
        onClick={handleClose}
        aria-label="Cerrar alerta"
        onMouseOver={(e) => e.target.style.opacity = '1'}
        onMouseOut={(e) => e.target.style.opacity = '0.7'}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <path d="M13.707 1.707L12.293 0.293L7 5.586L1.707 0.293L0.293 1.707L5.586 7L0.293 12.293L1.707 13.707L7 8.414L12.293 13.707L13.707 12.293L8.414 7L13.707 1.707Z"/>
        </svg>
      </button>
      
      <div style={progressStyles}></div>

      <style>
        {`
          @keyframes progress {
            from { width: 100%; }
            to { width: 0%; }
          }
        `}
      </style>
    </div>
  );
};

export default Alert;
