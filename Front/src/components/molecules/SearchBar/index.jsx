import { useState } from 'react';
import Icon from '../../atoms/Icon/Icon.jsx';
import styles from './SearchBar.module.css';

export default function SearchBar({ onSearch, placeholder = 'Buscar' }) {
  const [query, setQuery] = useState('');
  function handleSubmit(event) {
    event.preventDefault();
    onSearch?.(query.trim());
  }
  return <form className={styles.form} role="search" onSubmit={handleSubmit}>
    <Icon name="search" size={20} />
    <input type="search" className={styles.input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={placeholder} aria-label="Buscar videos" />
  </form>;
}
