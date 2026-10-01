import styles from './Spinner.module.css';

export default function Spinner({ size = 32 }) {
  return <span className={styles.spinner} style={{ width: size, height: size }} role="status" aria-label="Cargando" />;
}
