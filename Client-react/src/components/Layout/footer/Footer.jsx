import React from 'react'
import { useAlert } from '../../../hooks/useAlert'
import Alert from '../../Common/Alert/Alert'
import './footer.css'
export const Footer = () => {
 const handleSubscribe = (e) => {
    e.preventDefault()
    showAlert('¡Te has suscrito correctamente!', 'success')
  }

   const { alert, showAlert, hideAlert } = useAlert()
  return (
      <footer>
         <Alert alert={alert} onClose={hideAlert} />
        <div className="footer-col">
          <h4>Fashion Luxe</h4>
          <p>Tu tienda de moda en línea con las últimas tendencias.</p>
          <div className="social-icons">
            <a href="#facebook" onClick={() => showAlert('Redirigiendo a Facebook', 'info')}><i className="fab fa-facebook-f"></i></a>
            <a href="#instagram" onClick={() => showAlert('Redirigiendo a Instagram', 'info')}><i className="fab fa-instagram"></i></a>
            <a href="#twitter" onClick={() => showAlert('Redirigiendo a Twitter', 'info')}><i className="fab fa-twitter"></i></a>
            <a href="#pinterest" onClick={() => showAlert('Redirigiendo a Pinterest', 'info')}><i className="fab fa-pinterest-p"></i></a>
          </div>
        </div>
        <div className="footer-col">
          <h4>Enlaces</h4>
          <ul>
            <li><a href="#acerca">Acerca de</a></li>
            <li><a href="#terminos">Términos y condiciones</a></li>
            <li><a href="#privacidad">Política de privacidad</a></li>
            <li><a href="#ayuda">Ayuda</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Contacto</h4>
          <ul>
            <li>Email: info@fashionluxe.com</li>
            <li>Tel: +52 777 501 58 75</li>
            <li>Dirección: CDMX, México</li>
          </ul>
        </div>
    </footer>
  )
}

export const Suscribirme = () =>{

   const { alert, showAlert, hideAlert } = useAlert()
   const handleSubscribe = (e) => {
      e.preventDefault()
      showAlert('¡Te has suscrito correctamente!', 'success')
    }

return(
    <section class="newsletter">
      <Alert alert={alert} onClose={hideAlert} />
      <h2>Recibe Ofertas Exclusivas</h2>
      <p>Suscríbete y sé el primero en conocer nuestras promociones</p>
      <form onSubmit={handleSubscribe}>
        <input type="email" placeholder="Ingresa tu correo" required />
        <button type="submit">Suscribirme</button>
      </form>
    </section>)
}
