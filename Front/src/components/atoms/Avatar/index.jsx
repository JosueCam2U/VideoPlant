import styles from './Avatar.module.css';

export default function Avatar({ src, alt, name, size = 40 }) {
  const label = alt || name || 'Usuario';
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(label)}&background=random`;
  return <img className={styles.avatar} src={src || fallback} alt={label} width={size} height={size} />;
}
