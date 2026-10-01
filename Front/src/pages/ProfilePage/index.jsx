import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Avatar from '../../components/atoms/Avatar/index.jsx';
import Button from '../../components/atoms/Button/Button.jsx';
import Icon from '../../components/atoms/Icon/Icon.jsx';
import Spinner from '../../components/atoms/Spinner/index.jsx';
import UploadForm from '../../components/molecules/UploadForm/index.jsx';
import VideoGrid from '../../components/organisms/VideoGrid/index.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { getUser } from '../../api/users.js';
import { createVideo, deleteVideo, listVideos, updateVideo } from '../../api/videos.js';
import { formatDate } from '../../utils/formatDate.js';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const profileId = id === 'me' ? me?.id : id;
  const isOwner = String(me?.id) === String(profileId);
  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [profileData, allVideos] = await Promise.all([getUser(profileId), listVideos()]);
      setProfile(profileData);
      setVideos((Array.isArray(allVideos) ? allVideos : []).filter((video) => String(video.owner?.id) === String(profileId)));
    } catch (requestError) { setError(requestError.message); }
    finally { setLoading(false); }
  }, [profileId]);

  useEffect(() => { refresh(); }, [refresh]);
  async function handleCreate(payload) { await createVideo(payload); setShowCreate(false); await refresh(); }
  async function handleUpdate(payload) { await updateVideo(editing.id, payload); setEditing(null); await refresh(); }
  async function handleDelete(video) {
    if (!window.confirm(`¿Eliminar "${video.title}"?`)) return;
    try { await deleteVideo(video.id); await refresh(); }
    catch (requestError) { setError(requestError.message); }
  }

  if (loading) return <Spinner />;
  if (error && !profile) return <p className={styles.error} role="alert">{error}</p>;
  if (!profile) return null;
  return <section className={styles.page}>
    <header className={styles.header}>
      <Avatar src={profile.avatar_url} alt={profile.name} size={96} />
      <section className={styles.info}><h1 className={styles.name}>{profile.name}</h1><p className={styles.email}>{profile.email}</p><p className={styles.meta}>{videos.length} {videos.length === 1 ? 'video' : 'videos'} · Se unió el {formatDate(profile.created_at)}</p></section>
      {isOwner && <section className={styles.actions}><Button onClick={() => setShowCreate((shown) => !shown)}><Icon name="upload" size={18} /> Subir video</Button></section>}
    </header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    {isOwner && showCreate && <section className={styles.panel}><h2 className={styles.panelTitle}>Nuevo video</h2><UploadForm onSubmit={handleCreate} onCancel={() => setShowCreate(false)} submitLabel="Publicar" /></section>}
    {isOwner && editing && <section className={styles.panel}><h2 className={styles.panelTitle}>Editar video</h2><UploadForm initial={editing} onSubmit={handleUpdate} onCancel={() => setEditing(null)} submitLabel="Guardar cambios" /></section>}
    <section className={styles.listSection}>
      <h2 className={styles.listTitle}>Videos publicados</h2>
      {!videos.length ? <p className={styles.empty}>Aún no hay videos.</p> : <ul className={styles.videoList}>{videos.map((video) => <li key={video.id} className={styles.videoItem}>
        <VideoGrid videos={[video]} />
        {isOwner && <menu className={styles.itemActions}><Button variant="secondary" onClick={() => setEditing(video)}><Icon name="edit" size={16} /> Editar</Button><Button variant="danger" onClick={() => handleDelete(video)}><Icon name="trash" size={16} /> Eliminar</Button></menu>}
      </li>)}</ul>}
    </section>
  </section>;
}
