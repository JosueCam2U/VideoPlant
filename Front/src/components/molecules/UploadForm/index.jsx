import { useState } from 'react';
import Button from '../../atoms/Button/Button.jsx';
import Input from '../../atoms/Input/index.jsx';
import { uploadToS3 } from '../../../utils/uploadToS3.js';
import styles from './UploadForm.module.css';

export default function UploadForm({ initial, onSubmit, onCancel, submitLabel = 'Publicar' }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(initial);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!title.trim()) return setError('El título es obligatorio');
    if (!isEdit && !videoFile) return setError('Selecciona un video MP4');
    if (!isEdit && !thumbFile) return setError('Selecciona una miniatura');
    setBusy(true);
    try {
      let video_url = initial?.video_url;
      let thumbnail_url = initial?.thumbnail_url;
      if (videoFile) {
        if (videoFile.type !== 'video/mp4') throw new Error('El video debe ser MP4');
        if (videoFile.size > 100 * 1024 * 1024) throw new Error('Máx. 100 MB');
        video_url = await uploadToS3(videoFile, 'video');
      }
      if (thumbFile) {
        if (!['image/jpeg', 'image/png'].includes(thumbFile.type)) throw new Error('La miniatura debe ser JPG o PNG');
        thumbnail_url = await uploadToS3(thumbFile, 'thumbnail');
      }
      await onSubmit({ title: title.trim(), description: description.trim(), video_url, thumbnail_url });
    } catch (submitError) { setError(submitError.message); }
    finally { setBusy(false); }
  }

  return <form className={styles.form} onSubmit={handleSubmit}>
    <Input label="Título" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={200} required />
    <label className={styles.textareaWrap}><span className={styles.label}>Descripción</span><textarea className={styles.textarea} value={description} onChange={(event) => setDescription(event.target.value)} rows={4} /></label>
    <label className={styles.file}><span className={styles.label}>Video (MP4, máx. 100 MB)</span><input type="file" accept="video/mp4" onChange={(event) => setVideoFile(event.target.files?.[0] || null)} />{initial?.video_url && !videoFile && <small>Video actual conservado</small>}</label>
    <label className={styles.file}><span className={styles.label}>Miniatura (JPG/PNG)</span><input type="file" accept="image/jpeg,image/png" onChange={(event) => setThumbFile(event.target.files?.[0] || null)} />{initial?.thumbnail_url && !thumbFile && <small>Miniatura actual conservada</small>}</label>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <menu className={styles.actions}>{onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>}<Button type="submit" disabled={busy}>{busy ? 'Subiendo…' : submitLabel}</Button></menu>
  </form>;
}
