import styles from './IconButton.module.css';

export default function IconButton({ label, children, ...props }) {
  return <button className={styles.iconBtn} aria-label={label} title={label} {...props}>{children}</button>;
}
