import { Link } from 'react-router-dom';
import Avatar from '../../atoms/Avatar/index.jsx';
import { formatDate, formatViews } from '../../../utils/formatDate.js';
import styles from './VideoCard.module.css';

export default function VideoCard({ video }) {
  const owner = video.owner;
  return <article className={styles.card}>
    <Link to={`/watch/${video.id}`} className={styles.thumbLink} aria-label={video.title}>
      <figure className={styles.thumb}><img src={video.thumbnail_url} alt={video.title} loading="lazy" /></figure>
    </Link>
    <section className={styles.body}>
      <Avatar src={owner?.avatar_url} alt={owner?.name} size={36} />
      <section className={styles.info}>
        <h2 className={styles.title}><Link to={`/watch/${video.id}`}>{video.title}</Link></h2>
        <p className={styles.meta}><Link to={`/profile/${owner?.id}`} className={styles.author}>{owner?.name}</Link></p>
        <p className={styles.stats}>{formatViews(video.views)} · {formatDate(video.created_at)}</p>
      </section>
    </section>
  </article>;
}
