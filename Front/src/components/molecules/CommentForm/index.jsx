import { useState } from 'react';
import Avatar from '../../atoms/Avatar/index.jsx';
import Button from '../../atoms/Button/Button.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import styles from './CommentForm.module.css';

export default function CommentForm({ onSubmit }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  async function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try { await onSubmit?.(text.trim()); setText(''); }
    finally { setBusy(false); }
  }
  return <form className={styles.form} onSubmit={handleSubmit}>
    <Avatar src={user?.avatar_url} alt={user?.name || 'Tú'} size={36} />
    <input className={styles.input} value={text} onChange={(event) => setText(event.target.value)} placeholder="Añade un comentario..." aria-label="Comentario" />
    <Button type="submit" disabled={!text.trim() || busy}>{busy ? 'Enviando…' : 'Comentar'}</Button>
  </form>;
}
