import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listVideos } from '../../api/videos.js';
import Spinner from '../../components/atoms/Spinner/index.jsx';
import VideoGrid from '../../components/organisms/VideoGrid/index.jsx';
import useFetch from '../../hooks/useFetch.js';
import styles from './HomePage.module.css';

export default function HomePage() {
  const [params] = useSearchParams();
  const query = (params.get('q') || '').toLocaleLowerCase();
  const { data, loading, error } = useFetch(listVideos, []);
  const videos = useMemo(() => {
    if (!Array.isArray(data)) return [];
    if (!query) return data;
    return data.filter((video) => `${video.title} ${video.owner?.name || ''}`.toLocaleLowerCase().includes(query));
  }, [data, query]);
  return <section className={styles.page} aria-label="Catálogo de videos">
    <header className={styles.head}><h1 className={styles.title}>{query ? `Resultados para “${query}”` : 'Videos recientes'}</h1></header>
    {loading && <Spinner />}{error && <p className={styles.error} role="alert">{error}</p>}
    {!loading && !error && <VideoGrid videos={videos} />}
  </section>;
}
