import { clsx } from 'clsx'

export function Card({ className, children, ...props }) {
  return <section className={clsx('avyo-card', className)} {...props}>{children}</section>
}
