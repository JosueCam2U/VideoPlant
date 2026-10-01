import Avatar from '../../atoms/Avatar/index.jsx';
import { formatDate } from '../../../utils/formatDate.js';
import styles from './CommentItem.module.css';

export default function CommentItem({ comment }) {
  return <article className={styles.item}>
    <Avatar src={comment.user?.avatar_url} alt={comment.user?.name} size={36} />
    <section className={styles.body}>
      <p className={styles.head}><strong>{comment.user?.name}</strong><time className={styles.time} dateTime={comment.created_at}>{formatDate(comment.created_at)}</time></p>
      <p className={styles.content}>{comment.content}</p>
    </section>
  </article>;
}
