import styles from './Button.module.css'

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  fullWidth = false,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], fullWidth && styles.full].filter(Boolean).join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}