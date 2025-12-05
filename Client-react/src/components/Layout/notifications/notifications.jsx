import React from 'react';
import styles from "./Notifications.module.css";

export default function Notifications() {
  return (
    <div>
        <form action="">
    <div className={styles.form_group}>
      <label className={styles.form_label}>Notificaciones por Email</label><br /><br />

      <div className={styles.checkbox_group}>
        <label>
           <input type="checkbox" className={styles.Notify}  /> Nuevos pedidos
        </label>
        <label>
          <input type="checkbox" className={styles.Notify}  /> Pedidos cancelados
        </label>
        <label>
          <input type="checkbox" className={styles.Notify} /> Productos con stock bajo
        </label>
        <label>
          <input type="checkbox"  className={styles.Notify} /> Nuevos usuarios registrados
        </label>
      </div>
    </div><br /><br />
     <button type="button" className="btn btn-primary" >Guardar Preferencias</button>
    </form>
    </div>
  );
}
