import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/atoms/Button/Button.jsx';
import Input from '../../components/atoms/Input/index.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import styles from './AuthPage.module.css';

export default function AuthPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;
  function update(field) { return (event) => setForm((previous) => ({ ...previous, [field]: event.target.value })); }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'register') await register(form);
      else await login({ email: form.email, password: form.password });
      navigate(from, { replace: true });
    } catch (submitError) { setError(submitError.message); }
    finally { setBusy(false); }
  }

  return <main className={styles.page}><section className={styles.card}>
    <header className={styles.head}><h1 className={styles.title}>VideoPlat</h1><p className={styles.sub}>{mode === 'login' ? 'Inicia sesión para continuar' : 'Crea una cuenta nueva'}</p></header>
    <form className={styles.form} onSubmit={handleSubmit}>
      {mode === 'register' && <Input label="Nombre" value={form.name} onChange={update('name')} required autoComplete="name" />}
      <Input label="Correo" type="email" value={form.email} onChange={update('email')} required autoComplete="email" />
      <Input label="Contraseña" type="password" value={form.password} onChange={update('password')} required minLength={6} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
      {error && <p className={styles.error} role="alert">{error}</p>}
      <Button type="submit" fullWidth disabled={busy}>{busy ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</Button>
    </form>
    <footer className={styles.foot}><p>{mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
      <button type="button" className={styles.switch} onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button>
    </p></footer>
  </section></main>;
}
