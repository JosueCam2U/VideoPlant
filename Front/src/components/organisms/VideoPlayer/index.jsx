import styles from './VideoPlayer.module.css';

export default function VideoPlayer({ src, poster }) {
  return <figure className={styles.wrap}><video className={styles.video} src={src} poster={poster} controls playsInline preload="metadata" /></figure>;
}
