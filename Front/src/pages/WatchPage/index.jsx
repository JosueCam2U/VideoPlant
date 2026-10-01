import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar/index.jsx';
import Spinner from '../../components/atoms/Spinner/index.jsx';
import CommentsSection from '../../components/organisms/CommentsSection/index.jsx';
import VideoPlayer from '../../components/organisms/VideoPlayer/index.jsx';
import RecommendedList from '../../components/organisms/RecommendedList/index.jsx';
import { createComment } from '../../api/comments.js';
import { getRecommended, getVideo } from '../../api/videos.js';
import { formatDate, formatViews } from '../../utils/formatDate.js';
import styles from './WatchPage.module.css';

export default function WatchPage() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([getVideo(id), getRecommended(id)]).then(([result, suggestions]) => {
      if (!active) return;
      setVideo(result);
      setRecommended(suggestions || []);
    }).catch((requestError) => { if (active) setError(requestError.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleCreateComment = useCallback(async (content) => {
    const created = await createComment(id, content);
    setVideo((current) => ({ ...current, comments: [created, ...(current.comments || [])] }));
  }, [id]);
  if (loading) return <Spinner />;
  if (error) return <p className={styles.error} role="alert">{error}</p>;
  if (!video) return null;
  return <section className={styles.layout}>
    <article className={styles.main}>
      <VideoPlayer src={video.video_url} poster={video.thumbnail_url} />
      <header className={styles.head}><h1 className={styles.title}>{video.title}</h1><p className={styles.stats}>{formatViews(video.views)} · {formatDate(video.created_at)}</p></header>
      <section className={styles.authorBar}><Avatar src={video.owner?.avatar_url} alt={video.owner?.name} size={44} /><Link to={`/profile/${video.owner?.id}`} className={styles.authorName}>{video.owner?.name}</Link></section>
      {video.description && <section className={styles.description}><p>{video.description}</p></section>}
      <CommentsSection comments={video.comments || []} onCreate={handleCreateComment} />
    </article>
    <RecommendedList videos={recommended} />
  </section>;
}
