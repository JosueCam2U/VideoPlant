import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/index.jsx';
import TopBar from '../TopBar/index.jsx';
import styles from './Layout.module.css';

export default function Layout() {
  return <>
    <Sidebar />
    <TopBar />
    <main className={styles.main}><Outlet /></main>
    <footer className={styles.footer}><p>Creado por Josue 2026</p></footer>
  </>;
}
