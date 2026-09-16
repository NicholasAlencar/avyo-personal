import { Card } from '../ui/Card'

export function CalculatorCard({ title, description, children }) {
  return (
    <Card className="p-5" aria-label={title}>
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      <div className="mt-5">{children}</div>
    </Card>
  )
}
