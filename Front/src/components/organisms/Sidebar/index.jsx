import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import Icon from '../../atoms/Icon/Icon.jsx';
import styles from './Sidebar.module.css';

export default function Sidebar() {
  const { user } = useAuth();
  return <aside className={styles.sidebar}>
    <nav className={styles.nav} aria-label="Navegación principal">
      <Link to="/" className={styles.logo} aria-label="Inicio"><Icon name="play" size={26} /></Link>
      <ul className={styles.list}>
        <li><NavLink to="/" end className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><Icon name="home" /><span className={styles.sr}>Inicio</span></NavLink></li>
        <li><NavLink to={user ? `/profile/${user.id}` : '/auth'} className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}><Icon name="user" /><span className={styles.sr}>Mi perfil</span></NavLink></li>
        <li><NavLink to={user ? `/profile/${user.id}` : '/auth'} className={styles.link}><Icon name="upload" /><span className={styles.sr}>Subir</span></NavLink></li>
      </ul>
    </nav>
  </aside>;
}
