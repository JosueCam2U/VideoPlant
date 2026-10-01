import { Link, useNavigate } from 'react-router-dom';
import Avatar from '../../atoms/Avatar/index.jsx';
import Icon from '../../atoms/Icon/Icon.jsx';
import SearchBar from '../../molecules/SearchBar/index.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import styles from './TopBar.module.css';

export default function TopBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  function handleSearch(query) { if (query) navigate(`/?q=${encodeURIComponent(query)}`); }
  return <header className={styles.topbar}>
    <SearchBar onSearch={handleSearch} />
    <nav className={styles.actions} aria-label="Cuenta">
      {isAuthenticated ? <>
        <Link to={`/profile/${user.id}`} className={styles.upload} aria-label="Subir video"><Icon name="upload" size={20} /></Link>
        <Link to={`/profile/${user.id}`}><Avatar src={user.avatar_url} alt={user.name} size={36} /></Link>
        <button className={styles.logout} onClick={logout} aria-label="Cerrar sesión" title="Cerrar sesión"><Icon name="logout" size={18} /></button>
      </> : <Link to="/auth" className={styles.signin}><Icon name="user" size={18} /><span>Iniciar sesión</span></Link>}
    </nav>
  </header>;
}
