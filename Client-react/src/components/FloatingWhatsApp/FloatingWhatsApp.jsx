import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import "./FloatingWhatsApp.css";

export const FloatingWhatsApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [trackingFlow, setTrackingFlow] = useState(false);
  const [trackingStep, setTrackingStep] = useState(0); // 0: no activo, 1: número, 2: email
  const messagesEndRef = useRef(null);

  // Mensaje de bienvenida automático con delay
  useEffect(() => {
    const welcomeTimer = setTimeout(() => {
      if (!isOpen && messages.length === 0) {
        setUnreadCount(1);
      }
    }, 1500);

    return () => clearTimeout(welcomeTimer);
  }, [isOpen, messages.length]);

  // Simular cambios de estado de conexión
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOnline(Math.random() > 0.1);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  // Animaciones mejoradas
  const floatAnimation = {
    initial: { scale: 0, y: 50, rotate: -180 },
    animate: { 
      scale: 1, 
      y: 0,
      rotate: 0,
      transition: { 
        type: "spring", 
        stiffness: 400,
        damping: 15
      }
    },
    hover: { 
      scale: 1.1,
      y: -5,
      transition: { duration: 0.2 }
    },
    tap: { scale: 0.9 }
  };

  const windowAnimation = {
    initial: { opacity: 0, y: 30, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    },
    exit: { 
      opacity: 0, 
      y: 30, 
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  const messageAnimation = {
    initial: { opacity: 0, y: 10, scale: 0.8 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.3 }
    }
  };

  // Inicializar conversación con mensaje de bienvenida mejorado
  const initializeChat = () => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: "¡Hola! Soy Alex, tu especialista en Fashion Luxt. Estoy aquí para ayudarte con cualquier consulta sobre nuestros productos, pedidos o servicios corporativos.",
        isBot: true,
        timestamp: new Date(),
        type: "welcome",
        options: [
          "📦 Seguimiento de pedido",
          "🎯 Consultar productos", 
          "💼 Servicio corporativo",
          "🛠️ Soporte técnico",
          "👨‍💼 Hablar con agente"
        ]
      };
      setMessages([welcomeMessage]);
    }
  };

  const handleFloatClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setIsMinimized(false);
      initializeChat();
    } else {
      setIsMinimized(!isMinimized);
    }
  };
const handleQuickAction = async (action) => {
    switch(action) {
      case "👨‍💼 Hablar con agente":
        const { value: contactMethod } = await Swal.fire({
          title: 'Conectar con Agente',
          html: `
            <div class="agent-modal">
              <div class="agent-avatar">👨‍💼</div>
              <h4>¿Cómo prefiere contactar con nuestro agente?</h4>
              <p>Seleccione el método de contacto preferido:</p>
              <div class="contact-options">
                <button type="button" class="contact-btn whatsapp" onclick="this.closest('.swal2-container').querySelector('.swal2-confirm').dataset.method='whatsapp'">
                  <span>📱</span>
                  <span>WhatsApp</span>
                </button>
                <button type="button" class="contact-btn phone" onclick="this.closest('.swal2-container').querySelector('.swal2-confirm').dataset.method='phone'">
                  <span>📞</span>
                  <span>Llamada</span>
                </button>
                <button type="button" class="contact-btn email" onclick="this.closest('.swal2-container').querySelector('.swal2-confirm').dataset.method='email'">
                  <span>✉️</span>
                  <span>Email</span>
                </button>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Continuar',
          confirmButtonColor: 'var(--primary)',
          preConfirm: () => {
            const confirmBtn = document.querySelector('.swal2-confirm');
            return confirmBtn.dataset.method || null;
          },
          customClass: {
            popup: 'corporate-swal'
          },
          didOpen: () => {
            // Establecer por defecto
            const confirmBtn = document.querySelector('.swal2-confirm');
            confirmBtn.dataset.method = 'whatsapp';
          }
        });
        
        if (contactMethod) {
          await handleContactMethod(contactMethod);
        }
        break;
      
      case "💼 Servicio corporativo":
        await Swal.fire({
          title: 'Servicio Corporativo',
          html: `
            <div class="corporate-modal">
              <h4>Fashion Luxt Business</h4>
              <p>Soluciones para empresas y mayoristas:</p>
              <ul>
                <li>✅ Descuentos corporativos</li>
                <li>✅ Pedidos personalizados</li>
                <li>✅ Facturación electrónica</li>
                <li>✅ Account management</li>
              </ul>
            </div>
          `,
          confirmButtonText: 'Solicitar información',
          confirmButtonColor: 'var(--primary)'
        });
        break;
    }
  };

  // Nueva función para manejar el método de contacto seleccionado
  const handleContactMethod = async (method) => {
    switch(method) {
      case 'whatsapp':
        // Número de WhatsApp (agrega tu número)
        const whatsappNumber = "521XXXXXXXXXX"; // Reemplaza con tu número
        const whatsappMessage = encodeURIComponent("¡Hola! Me gustaría hablar con un agente de Fashion Luxt.");
        window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');
        
        // Agregar mensaje al chat
        const whatsappMessageBot = {
          id: Date.now(),
          text: "Perfecto, te he redirigido a WhatsApp. Nuestro agente te atenderá en breve.",
          isBot: true,
          timestamp: new Date(),
          options: ["📦 Seguimiento", "🎯 Productos", "💼 Corporativo", "🛠️ Soporte", "⬅️ Menú principal"]
        };
        setMessages(prev => [...prev, whatsappMessageBot]);
        break;
        
      case 'phone':
        // Número de teléfono (agrega tu número)
        const phoneNumber = "+527442333172"; // Reemplaza con tu número
        
        // Mostrar confirmación para llamada
        const { value: confirmCall } = await Swal.fire({
          title: 'Iniciar Llamada',
          html: `
            <div class="call-modal">
              <div class="call-icon">📞</div>
              <h4>¿Desea llamar a nuestro agente?</h4>
              <p>Se redirigirá a la aplicación de teléfono para llamar a:</p>
              <div class="phone-number-display">
                <strong>${phoneNumber}</strong>
              </div>
              <p class="call-hours">
                Horario de atención: Lunes a Viernes 9:00 - 18:00 hrs
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: 'Llamar ahora',
          cancelButtonText: 'Cancelar',
          confirmButtonColor: '#25D366',
          customClass: {
            popup: 'call-swal'
          }
        });
        
        if (confirmCall) {
          // Iniciar llamada telefónica
          window.open(`tel:${phoneNumber}`, '_self');
          
          // Agregar mensaje al chat
          const phoneMessageBot = {
            id: Date.now(),
            text: `Perfecto, se está conectando la llamada al número: ${phoneNumber}. Nuestro agente te atenderá en breve.`,
            isBot: true,
            timestamp: new Date(),
            options: ["📦 Seguimiento", "🎯 Productos", "💼 Corporativo", "🛠️ Soporte", "⬅️ Menú principal"]
          };
          setMessages(prev => [...prev, phoneMessageBot]);
        }
        break;
        
      case 'email':
  // Modifica la función handleContactMethod para el caso 'email'
case 'email':
  // Mostrar formulario de email en el chat
  const { value: formValues } = await Swal.fire({
    title: 'Enviar Email',
    html: `
      <div class="email-form-modal">
        <div class="email-icon">✉️</div>
        <p>Complete el formulario y nuestro agente se pondrá en contacto:</p>
        
        <div class="form-group">
          <label for="email-name">Nombre completo:</label>
          <input 
            type="text" 
            id="email-name" 
            class="swal2-input" 
            placeholder="Tu nombre"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email-email">Email de contacto:</label>
          <input 
            type="email" 
            id="email-email" 
            class="swal2-input" 
            placeholder="tucorreo@ejemplo.com"
            required
          >
        </div>
        
        <div class="form-group">
          <label for="email-subject">Asunto:</label>
          <input 
            type="text" 
            id="email-subject" 
            class="swal2-input" 
            placeholder="Consulta sobre..."
            value="Consulta - Fashion Luxt"
          >
        </div>
        
        <div class="form-group">
          <label for="email-message">Mensaje:</label>
          <textarea 
            id="email-message" 
            class="swal2-textarea" 
            placeholder="Describe tu consulta aquí..."
            rows="4"
            required
          ></textarea>
        </div>
        
        <div class="email-note">
          <small>Nuestro equipo te responderá en un máximo de 24 horas hábiles.</small>
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: 'Enviar consulta',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#EA4335',
    focusConfirm: false,
    preConfirm: () => {
      const name = document.getElementById('email-name').value;
      const email = document.getElementById('email-email').value;
      const subject = document.getElementById('email-subject').value;
      const message = document.getElementById('email-message').value;
      
      if (!name || !email || !subject || !message) {
        Swal.showValidationMessage('Por favor complete todos los campos');
        return false;
      }
      
      if (!/^\S+@\S+\.\S+$/.test(email)) {
        Swal.showValidationMessage('Por favor ingrese un email válido');
        return false;
      }
      
      return { name, email, subject, message };
    },
    customClass: {
      popup: 'email-swal'
    }
  });
  
  if (formValues) {
    // Aquí puedes enviar el email a tu backend
    try {
      // Opción 1: Enviar a tu API (recomendado)
      const response = await fetch('${API_BASE_URL}/api/contact/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          email: formValues.email,
          subject: formValues.subject,
          message: formValues.message,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        await Swal.fire({
          title: '¡Consulta enviada!',
          html: `
            <div class="success-email">
              <div class="success-icon">✅</div>
              <p><strong>Gracias, ${formValues.name}</strong></p>
              <p>Tu consulta ha sido enviada correctamente.</p>
              <p class="response-time">Recibirás una respuesta a: <strong>${formValues.email}</strong></p>
              <p class="small-note">Tiempo estimado de respuesta: 24 horas hábiles</p>
            </div>
          `,
          icon: 'success',
          confirmButtonColor: '#EA4335'
        });
      }
    } catch (error) {
      console.error('Error al enviar email:', error);
      // Si falla la API, mostrar confirmación local
      await Swal.fire({
        title: '¡Consulta registrada!',
        html: `
          <div class="local-success">
            <p>Hemos registrado tu consulta:</p>
            <div class="consult-summary">
              <p><strong>Nombre:</strong> ${formValues.name}</p>
              <p><strong>Email:</strong> ${formValues.email}</p>
              <p><strong>Asunto:</strong> ${formValues.subject}</p>
            </div>
            <p>Nuestro equipo se pondrá en contacto contigo.</p>
          </div>
        `,
        icon: 'info',
        confirmButtonColor: '#EA4335'
      });
    }
    
    // Agregar mensaje al chat
    const emailMessageBot = {
      id: Date.now(),
      text: `📧 **Consulta enviada exitosamente**\n\nHola ${formValues.name}, hemos recibido tu consulta sobre "${formValues.subject}".\n\n• **Email registrado:** ${formValues.email}\n• **Estado:** En proceso\n• **Tiempo estimado:** 24 horas hábiles\n\nTe contactaremos pronto. Mientras tanto, ¿en qué más puedo ayudarte?`,
      isBot: true,
      timestamp: new Date(),
      options: ["📦 Seguimiento", "🎯 Productos", "💼 Corporativo", "🛠️ Soporte", "⬅️ Menú principal"]
    };
    setMessages(prev => [...prev, emailMessageBot]);
  }
  break;
    }
  };

  // Función para consultar el estado del paquete
  const fetchTrackingStatus = async (trackingNumber) => {
    setIsTyping(true);
    
    try {
      const response = await fetch('${API_BASE_URL}/api/tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tracking_number: trackingNumber
        })
      });

      if (!response.ok) {
        throw new Error('Error en la consulta');
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        const errorMessage = {
          id: Date.now() + 2,
          text: `❌ ${data.message}\n\n¿Desea intentar de otra forma?`,
          isBot: true,
          timestamp: new Date(),
          options: ["📧 Buscar por email", "📞 Contactar soporte", "⬅️ Menú principal"]
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const statusMessage = {
          id: Date.now() + 2,
          text: formatTrackingResponse(data.data),
          isBot: true,
          timestamp: new Date(),
          options: ["🔄 Actualizar estado", "📞 Contactar mensajería", "📋 Más detalles", "⬅️ Menú principal"]
        };
        
        setMessages(prev => [...prev, statusMessage]);
      }
      
      // Resetear flujo de seguimiento
      setTrackingFlow(false);
      setTrackingStep(0);
      
    } catch (error) {
      console.error('Error al consultar seguimiento:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: `😕 Lo siento, hubo un problema al consultar el estado.\n\nPor favor, intente de nuevo o contacte a nuestro equipo de soporte.`,
        isBot: true,
        timestamp: new Date(),
        options: ["🔢 Intentar otro número", "📧 Buscar por email", "📞 Contactar soporte"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Función para buscar por email
  const fetchOrdersByEmail = async (email) => {
    setIsTyping(true);
    
    try {
      const response = await fetch('${API_BASE_URL}/api/tracking/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (!response.ok) {
        throw new Error('Error en la consulta');
      }

      const data = await response.json();
      
      if (data.status === 'error') {
        const errorMessage = {
          id: Date.now() + 2,
          text: `❌ ${data.message}\n\nPor favor, verifique el email e intente de nuevo.`,
          isBot: true,
          timestamp: new Date(),
          options: ["🔢 Buscar por número", "📞 Contactar soporte", "⬅️ Menú principal"]
        };
        setMessages(prev => [...prev, errorMessage]);
      } else if (data.data.ordenes.length === 0) {
        const noOrdersMessage = {
          id: Date.now() + 2,
          text: `📭 No se encontraron órdenes para el email: ${email}\n\n¿Desea buscar con otro email o consultar por número de seguimiento?`,
          isBot: true,
          timestamp: new Date(),
          options: ["🔢 Buscar por número", "✏️ Ingresar otro email", "⬅️ Menú principal"]
        };
        setMessages(prev => [...prev, noOrdersMessage]);
      } else {
        const ordersList = data.data.ordenes.map(order => 
          `• #${order.order_id.slice(0, 8)} - ${order.estado} - $${order.total}`
        ).join('\n');
        
        const ordersMessage = {
          id: Date.now() + 2,
          text: `📋 **Órdenes encontradas para ${data.data.cliente}**

Encontradas ${data.data.total_ordenes} orden(es):

${ordersList}

Para consultar el estado completo de una orden, por favor ingrese el número de seguimiento completo.`,
          isBot: true,
          timestamp: new Date(),
          options: ["🔢 Ingresar número de seguimiento", "📋 Ver otra cuenta", "⬅️ Menú principal"]
        };
        
        setMessages(prev => [...prev, ordersMessage]);
      }
      
    } catch (error) {
      console.error('Error al buscar por email:', error);
      
      const errorMessage = {
        id: Date.now() + 2,
        text: `😕 Lo siento, hubo un problema al buscar por email.\n\nPor favor, intente de nuevo o use el número de seguimiento.`,
        isBot: true,
        timestamp: new Date(),
        options: ["🔢 Buscar por número", "📞 Contactar soporte", "⬅️ Menú principal"]
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setTrackingFlow(false);
      setTrackingStep(0);
    }
  };

  // Función para formatear la respuesta del seguimiento
  const formatTrackingResponse = (trackingData) => {
    const statusEmoji = {
      'Pendiente': '⏳',
      'Confirmado': '✅', 
      'En preparación': '📦',
      'Enviado': '🚚',
      'Entregado': '🏠',
      'Cancelado': '❌'
    };
    
    const emoji = statusEmoji[trackingData.estado] || '📋';
    
    // Formatear fecha
    const orderDate = new Date(trackingData.fecha_creacion);
    const formattedDate = orderDate.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    return `
${emoji} **ESTADO DEL PEDIDO**

📦 **Número de seguimiento:** #${trackingData.order_id}
📋 **Estado actual:** ${trackingData.estado}
📍 **Progreso:** ${trackingData.progreso}% completado

💳 **Total:** $${trackingData.total.toFixed(2)}
👤 **Cliente:** ${trackingData.cliente.nombre}
📅 **Fecha del pedido:** ${formattedDate}

${trackingData.mensaje_estado}

📦 **Productos incluidos:**
${trackingData.detalles.map(item => `• ${item.producto} (x${item.cantidad}) - $${item.subtotal.toFixed(2)}`).join('\n')}

¿En qué más puedo ayudarle?
    `;
  };

  const handleResponse = async (option) => {
    const userMessage = {
      id: Date.now(),
      text: option,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    // Manejar acciones rápidas
    if (option === "👨‍💼 Hablar con agente" || option === "💼 Servicio corporativo") {
      await handleQuickAction(option);
      // IMPORTANTE: Salir después de manejar la acción rápida
      return;
    }

    // Manejar el flujo de seguimiento
    if (option === "📦 Seguimiento de pedido" || option === "🔢 Número de orden") {
      setTrackingFlow(true);
      setTrackingStep(1);
    }

    // Manejar búsqueda por email
    if (option === "📧 Buscar por email") {
      setTrackingFlow(true);
      setTrackingStep(2);
    }

    setIsTyping(true);
    
    setTimeout(() => {
      let botResponse;
      
      switch(option) {
        case "📦 Seguimiento de pedido":
          botResponse = {
            id: Date.now() + 1,
            text: "¡Perfecto! Para localizar su pedido, puedo ayudarle de varias formas. ¿Tiene a mano su número de seguimiento o prefiere buscarlo por email?",
            isBot: true,
            timestamp: new Date(),
            options: ["🔢 Número de seguimiento", "📧 Buscar por email", "📞 Contactar soporte", "⬅️ Menú principal"]
          };
          break;
        
        case "🔢 Número de orden":
        case "🔢 Número de seguimiento":
          botResponse = {
            id: Date.now() + 1,
            text: "Por favor, ingrese su **número de seguimiento** (puede encontrarlo en su email de confirmación o en su cuenta):",
            isBot: true,
            timestamp: new Date(),
            options: ["📧 No tengo el número", "📞 Contactar soporte"]
          };
          setTrackingFlow(true);
          setTrackingStep(1);
          break;
        
        case "📧 Buscar por email":
          botResponse = {
            id: Date.now() + 1,
            text: "Por favor, ingrese su **dirección de email** registrada en Fashion Luxt:",
            isBot: true,
            timestamp: new Date(),
            options: ["🔢 Tengo el número de seguimiento", "⬅️ Menú principal"]
          };
          setTrackingFlow(true);
          setTrackingStep(2);
          break;
        
        case "🎯 Consultar productos":
          botResponse = {
            id: Date.now() + 1,
            text: "Perfecto. Tenemos varias categorías disponibles. ¿Le interesa ver nuestra nueva colección o busca algo específico?",
            isBot: true,
            timestamp: new Date(),
            options: ["🆕 Nueva colección", "🔥 Productos populares", "🎁 Ofertas especiales", "🔍 Búsqueda personalizada", "⬅️ Menú principal"]
          };
          break;
        
        case "🛠️ Soporte técnico":
          botResponse = {
            id: Date.now() + 1,
            text: "Para soporte técnico, puedo ayudarle con:\n\n• Problemas con la web\n• Consultas de cuenta\n• Facturación\n• Otros temas técnicos",
            isBot: true,
            timestamp: new Date(),
            options: ["🌐 Problemas web", "👤 Cuenta usuario", "🧾 Facturación", "⚙️ Otros temas", "⬅️ Menú principal"]
          };
          break;
        
        case "⬅️ Menú principal":
          botResponse = {
            id: Date.now() + 1,
            text: "Volviendo al menú principal. ¿En qué más puedo asistirle hoy?",
            isBot: true,
            timestamp: new Date(),
            options: [
              "📦 Seguimiento de pedido",
              "🎯 Consultar productos", 
              "💼 Servicio corporativo",
              "🛠️ Soporte técnico",
              "👨‍💼 Hablar con agente"
            ]
          };
          setTrackingFlow(false);
          setTrackingStep(0);
          break;
        
        case "📧 No tengo el número":
          botResponse = {
            id: Date.now() + 1,
            text: "No hay problema. Puedo ayudarle a encontrar su pedido de otras formas:\n\n1. **Por email**: Envíeme su correo electrónico registrado\n2. **Contactar a soporte**: Le conecto con nuestro equipo\n\n¿Cómo prefiere proceder?",
            isBot: true,
            timestamp: new Date(),
            options: ["📧 Buscar por email", "📞 Contactar soporte", "⬅️ Menú principal"]
          };
          setTrackingFlow(false);
          break;
        
        case "🔄 Actualizar estado":
          botResponse = {
            id: Date.now() + 1,
            text: "Para actualizar el estado de su pedido, necesito consultarlo nuevamente. ¿Podría proporcionarme el número de seguimiento?",
            isBot: true,
            timestamp: new Date(),
            options: ["🔢 Sí, tengo el número", "📧 Buscar por email", "⬅️ Menú principal"]
          };
          break;
        
        // CASOS PARA LAS OPCIONES DEL MENÚ REDUCIDO
        case "📦 Seguimiento":
          botResponse = {
            id: Date.now() + 1,
            text: "Perfecto, sobre seguimiento de pedidos ¿En qué específicamente puedo ayudarle?",
            isBot: true,
            timestamp: new Date(),
            options: ["🔢 Número de seguimiento", "📧 Buscar por email", "📞 Contactar soporte", "⬅️ Menú principal"]
          };
          break;
        
        case "🎯 Productos":
          botResponse = {
            id: Date.now() + 1,
            text: "Perfecto, sobre productos ¿Qué le gustaría consultar?",
            isBot: true,
            timestamp: new Date(),
            options: ["🆕 Nueva colección", "🔥 Productos populares", "🎁 Ofertas especiales", "🔍 Búsqueda personalizada", "⬅️ Menú principal"]
          };
          break;
        
        case "💼 Corporativo":
          botResponse = {
            id: Date.now() + 1,
            text: "Perfecto, sobre servicio corporativo ¿En qué puedo asistirle?",
            isBot: true,
            timestamp: new Date(),
            options: ["🏢 Solicitar información", "📞 Contactar ventas", "📊 Cotizaciones", "⬅️ Menú principal"]
          };
          break;
        
        case "🛠️ Soporte":
          botResponse = {
            id: Date.now() + 1,
            text: "Perfecto, sobre soporte técnico ¿En qué puedo ayudarle?",
            isBot: true,
            timestamp: new Date(),
            options: ["🌐 Problemas web", "👤 Cuenta usuario", "🧾 Facturación", "⚙️ Otros temas", "⬅️ Menú principal"]
          };
          break;
        
        default:
          // Si estamos en flujo de seguimiento y el usuario ingresa algo
          if (trackingFlow && trackingStep === 1) {
            // Es un número de seguimiento
            botResponse = {
              id: Date.now() + 1,
              text: `🔍 Consultando estado para: "${option}"...`,
              isBot: true,
              timestamp: new Date()
            };
            
            // Llamar a la función para consultar el seguimiento
            fetchTrackingStatus(option);
            return; // Salir temprano porque fetchTrackingStatus manejará la respuesta
          } 
          else if (trackingFlow && trackingStep === 2) {
            // Es un email
            botResponse = {
              id: Date.now() + 1,
              text: `📧 Buscando órdenes para: "${option}"...`,
              isBot: true,
              timestamp: new Date()
            };
            
            // Llamar a la función para buscar por email
            fetchOrdersByEmail(option);
            return; // Salir temprano porque fetchOrdersByEmail manejará la respuesta
          }
          else {
            // Para cualquier otro mensaje no reconocido
            botResponse = {
              id: Date.now() + 1,
              text: "Entendido. He tomado nota de su consulta y nuestro equipo se pondrá en contacto si es necesario. ¿Hay algo más en lo que pueda asistirle?",
              isBot: true,
              timestamp: new Date(),
              options: ["📦 Seguimiento", "🎯 Productos", "💼 Corporativo", "🛠️ Soporte", "⬅️ Menú principal"]
            };
          }
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1200 + Math.random() * 800);
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        text: inputMessage,
        isBot: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      
      // Si estamos en flujo de seguimiento
      if (trackingFlow && trackingStep === 1) {
        // Es un número de seguimiento
        const botResponse = {
          id: Date.now() + 1,
          text: `🔍 Consultando estado para: "${inputMessage}"...`,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        fetchTrackingStatus(inputMessage);
        setInputMessage("");
        return; // IMPORTANTE: Salir aquí
      }
      else if (trackingFlow && trackingStep === 2) {
        // Es un email
        const botResponse = {
          id: Date.now() + 1,
          text: `📧 Buscando órdenes para: "${inputMessage}"...`,
          isBot: true,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botResponse]);
        fetchOrdersByEmail(inputMessage);
        setInputMessage("");
        return; // IMPORTANTE: Salir aquí
      }
      else {
        // Para mensajes normales, usar handleResponse para procesarlos
        setInputMessage("");
        handleResponse(inputMessage);
      }
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    if (messages.length > 0) {
      setUnreadCount(prev => prev + 1);
    }
  };

  return (
    <div className="corporate-chatbot-enhanced">
      {/* Botón flotante mejorado */}
      <motion.div
        className="corporate-chat-float-enhanced"
        onClick={handleFloatClick}
        variants={floatAnimation}
        initial="initial"
        animate="animate"
        whileHover="hover"
        whileTap="tap"
      >
        <motion.div 
          className="float-icon-enhanced"
          animate={{ 
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatDelay: 5
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>
          </svg>
        </motion.div>
        
        {unreadCount > 0 && (
          <motion.div 
            className="unread-badge-enhanced"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {unreadCount}
          </motion.div>
        )}

        {/* Efecto de pulso sutil */}
        <div className="pulse-ring"></div>
      </motion.div>

      {/* Ventana de chat mejorada */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            className="corporate-chat-window-enhanced"
            variants={windowAnimation}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {/* Header mejorado */}
            <div className="corporate-chat-header-enhanced">
              <div className="chat-header-info-enhanced">
                <div className="company-avatar-enhanced">
                  <span>FL</span>
                  <div className={`online-status ${isOnline ? 'online' : 'away'}`}></div>
                </div>
                <div className="chat-header-text-enhanced">
                  <h4>Fashion Luxt Support</h4>
                  <span className="chat-status-enhanced">
                    {isOnline ? (
                      <>
                        <div className="status-indicator-online"></div>
                        En línea • Responde al instante
                      </>
                    ) : (
                      <>
                        <div className="status-indicator-away"></div>
                        Fuera de línea • Responderemos pronto
                      </>
                    )}
                  </span>
                </div>
              </div>
              <div className="chat-header-actions-enhanced">
                <button 
                  className="header-btn-enhanced video-btn"
                  title="Video llamada"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                </button>
                <button 
                  className="header-btn-enhanced minimize-btn"
                  onClick={handleMinimize}
                  title="Minimizar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13H5v-2h14v2z"/>
                  </svg>
                </button>
                <button 
                  className="header-btn-enhanced close-btn"
                  onClick={() => setIsOpen(false)}
                  title="Cerrar"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Área de mensajes mejorada */}
            <div className="corporate-chat-messages-enhanced">
              <div className="chat-welcome-note">
                <div className="welcome-avatar">FL</div>
                <div className="welcome-text">
                  <strong>Fashion Luxt Assistant</strong>
                  <span>Normalmente responde en segundos</span>
                </div>
              </div>

              <AnimatePresence>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    className={`corporate-message-enhanced ${message.isBot ? 'bot-message' : 'user-message'} ${message.type === 'welcome' ? 'welcome-message' : ''}`}
                    variants={messageAnimation}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="message-content-enhanced">
                      {message.isBot && (
                        <div className="bot-avatar">FL</div>
                      )}
                      <div className="message-bubble-enhanced">
                        <p style={{ whiteSpace: 'pre-line' }}>{message.text}</p>
                        <span className="message-time-enhanced">
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                    </div>
                    
                    {message.options && (
                      <motion.div 
                        className="message-options-enhanced"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        {message.options.map((option, index) => (
                          <motion.button
                            key={index}
                            className="option-button-enhanced"
                            onClick={() => handleResponse(option)}
                            whileHover={{ scale: 1.02, x: 4 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {option}
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div 
                  className="typing-indicator-enhanced"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="typing-avatar">FL</div>
                  <div className="typing-content">
                    <div className="typing-dots-enhanced">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    <span>Escribiendo...</span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input de mensaje mejorado */}
            <div className="corporate-chat-input-enhanced">
              <div className="quick-actions">
                <button className="quick-btn">📎</button>
                <button className="quick-btn">😊</button>
                <button className="quick-btn">📷</button>
              </div>
              <div className="input-container-enhanced">
                <input
                  type="text"
                  placeholder={
                    trackingFlow && trackingStep === 1 
                      ? "Ingrese número de seguimiento..." 
                      : trackingFlow && trackingStep === 2
                      ? "Ingrese su email..."
                      : "Escribe tu mensaje..."
                  }
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="message-input-enhanced"
                />
                <motion.button 
                  onClick={handleSendMessage}
                  className="send-button-enhanced"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!inputMessage.trim()}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                  </svg>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat minimizado mejorado */}
      {isMinimized && (
        <motion.div
          className="corporate-chat-minimized-enhanced"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          onClick={() => setIsMinimized(false)}
        >
          <div className="minimized-content-enhanced">
            <div className="minimized-avatar">
              <span>FL</span>
              <div className="minimized-status"></div>
            </div>
            <div className="minimized-text">
              <span>Fashion Luxt</span>
              {unreadCount > 0 && (
                <div className="minimized-badge">{unreadCount} nuevo{unreadCount > 1 ? 's' : ''}</div>
              )}
            </div>
            <button 
              className="minimized-close"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                setIsMinimized(false);
              }}
            >
              ×
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
