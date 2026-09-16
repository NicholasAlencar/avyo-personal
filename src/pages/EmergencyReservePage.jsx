import { useState } from 'react'
import { useFinanceStore } from '../context/FinanceContext'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'
import { RecordDialog } from '../components/avyo/RecordDialog'
import { ReserveShield } from '../components/avyo/ReserveShield'
import { planningNav, RouteNav } from '../components/avyo/RouteNav'

const targetFields = [
  { name: 'essentialCost', label: 'Custo essencial', type: 'number', min: 0, required: true },
  { name: 'monthsGoal', label: 'Meses de proteção', type: 'number', min: 1, required: true },
]

export function EmergencyReservePage() {
  const { state, updateProfile } = useFinanceStore()
  const [targetDraft, setTargetDraft] = useState(null)
  const target = Number(state.profile.essentialCost || 0) * Number(state.profile.monthsGoal || 0)
  const covered = state.profile.essentialCost ? Math.round(state.profile.reserveAmount / state.profile.essentialCost * 10) / 10 : 0

  const deposit = (amount) => updateProfile({ reserveAmount: Number(state.profile.reserveAmount || 0) + amount })
  const openTarget = () => setTargetDraft({ essentialCost: state.profile.essentialCost, monthsGoal: state.profile.monthsGoal })
  const saveTarget = (record) => updateProfile({ essentialCost: Number(record.essentialCost || 0), monthsGoal: Number(record.monthsGoal || 1) })

  return <>
    <RouteNav items={planningNav} />
    <PageHeader eyebrow="Planejamento" title="Reserva de emergência" subtitle="Dinheiro para atravessar imprevistos sem transformar urgência em dívida." />
    <Card className="p-8">
      <ReserveShield current={state.profile.reserveAmount} target={target} monthsGoal={state.profile.monthsGoal} monthsCovered={covered} onDeposit={deposit} onEdit={openTarget} />
    </Card>

    <div className="mt-4 grid gap-4 md:grid-cols-3">
      {[
        ['Primeiro marco', 'Comece protegendo um mês essencial.'],
        ['Meta saudável', `${state.profile.monthsGoal} meses dão mais tempo para reorganizar a vida.`],
        ['Onde deixar', 'Priorize liquidez e baixo risco para acessar quando precisar.'],
      ].map(([title, description]) => <Card key={title} className="p-5"><h3 className="font-heading font-semibold">{title}</h3><p className="mt-2 text-sm text-slate-400">{description}</p></Card>)}
    </div>

    <RecordDialog
      open={Boolean(targetDraft)}
      title="Editar meta da reserva"
      initial={targetDraft || {}}
      fields={targetFields}
      onClose={() => setTargetDraft(null)}
      onSave={saveTarget}
    />
  </>
}
