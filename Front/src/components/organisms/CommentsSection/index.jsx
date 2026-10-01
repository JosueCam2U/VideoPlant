import CommentForm from '../../molecules/CommentForm/index.jsx';
import CommentItem from '../../molecules/CommentItem/index.jsx';
import { useAuth } from '../../../hooks/useAuth.js';
import styles from './CommentsSection.module.css';

export default function CommentsSection({ comments = [], onCreate }) {
  const { isAuthenticated } = useAuth();
  return <section className={styles.section} aria-label="Comentarios">
    <h2 className={styles.title}>{comments.length} comentarios</h2>
    {isAuthenticated && <CommentForm onSubmit={onCreate} />}
    <ul className={styles.list}>{comments.map((comment) => <li key={comment.id}><CommentItem comment={comment} /></li>)}</ul>
  </section>;
}
