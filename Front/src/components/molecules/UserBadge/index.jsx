import Avatar from '../../atoms/Avatar/index.jsx';
import styles from './UserBadge.module.css';

export default function UserBadge({ user, subtitle, size = 36 }) {
  if (!user) return null;
  return <article className={styles.badge}>
    <Avatar src={user.avatar_url} alt={user.name} size={size} />
    <section className={styles.meta}><span className={styles.name}>{user.name}</span>{subtitle && <span className={styles.sub}>{subtitle}</span>}</section>
  </article>;
}
