import { useId } from 'react';
import styles from './Input.module.css';

export default function Input({ label, error, type = 'text', id: suppliedId, ...props }) {
  const generatedId = useId();
  const id = suppliedId || generatedId;
  return <label className={styles.wrap} htmlFor={id}>
    {label && <span className={styles.label}>{label}</span>}
    <input id={id} type={type} className={styles.input} aria-invalid={Boolean(error)} {...props} />
    {error && <span className={styles.error} role="alert">{error}</span>}
  </label>;
}
