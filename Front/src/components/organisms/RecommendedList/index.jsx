import { Link } from 'react-router-dom';
import { formatDate, formatViews } from '../../../utils/formatDate.js';
import styles from './RecommendedList.module.css';

export default function RecommendedList({ videos = [] }) {
  if (!videos.length) return null;
  return <aside className={styles.aside} aria-label="Videos recomendados">
    <h2 className={styles.title}>A continuación</h2>
    <ul className={styles.list}>{videos.map((video) => <li key={video.id}>
      <Link to={`/watch/${video.id}`} className={styles.item}>
        <figure className={styles.thumb}><img src={video.thumbnail_url} alt={video.title} loading="lazy" /></figure>
        <section className={styles.info}><h3 className={styles.vtitle}>{video.title}</h3><p className={styles.meta}>{video.owner?.name}</p><p className={styles.meta}>{formatViews(video.views)} · {formatDate(video.created_at)}</p></section>
      </Link>
    </li>)}</ul>
  </aside>;
}
