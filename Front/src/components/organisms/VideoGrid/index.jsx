import VideoCard from '../../molecules/VideoCard/index.jsx';
import styles from './VideoGrid.module.css';

export default function VideoGrid({ videos, empty = 'No hay videos todavía' }) {
  if (!videos?.length) return <p className={styles.empty}>{empty}</p>;
  return <section className={styles.grid} aria-label="Lista de videos">{videos.map((video) => <VideoCard key={video.id} video={video} />)}</section>;
}
