import { useMemo, useState } from 'react'
import { Bot, Database, LockKeyhole, RotateCcw, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { PageHeader } from '../components/avyo/PageHeader'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

function initials(name) {
  const parts = String(name || 'AVYO').trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'AV'
}

function NumberField({ label, value, onChange, min = 0 }) {
  return <label className="text-sm text-slate-300">{label}<input aria-label={label} className={input} type="number" step="any" min={min} value={value ?? 0} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function TextField({ label, value, onChange, type = 'text' }) {
  return <label className="text-sm text-slate-300">{label}<input aria-label={label} className={input} type={type} value={value ?? ''} onChange={(event) => onChange(event.target.value)} /></label>
}

export function SettingsPage() {
  const { state, updateProfile, resetDemo, clearAll } = useFinanceStore()
  const [profile, setProfile] = useState(state.profile)
  const [confirm, setConfirm] = useState(null)
  const reserveTarget = Math.max(0, Number(profile.essentialCost) || 0) * Math.max(0, Number(profile.monthsGoal) || 0)
  const investorProfile = useMemo(() => String(state.investmentProfile?.profile || 'não definido').replace(/^./, (letter) => letter.toUpperCase()), [state.investmentProfile?.profile])
  const patch = (key, value) => setProfile((current) => ({ ...current, [key]: value }))

  const saveProfile = (event) => {
    event.preventDefault()
    updateProfile(profile)
  }

  return <>
    <PageHeader eyebrow="Sua conta local" title="Configurações" subtitle="Ajuste premissas financeiras, privacidade e os recursos locais do AVYO." />

    <form onSubmit={saveProfile} className="space-y-5">
      <Card className="p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid size-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 font-heading text-lg font-bold text-white"><span aria-hidden="true">{initials(profile.name)}</span></div>
          <div>
            <div className="flex items-center gap-2"><UserRound size={17} className="text-cyan-300" /><h2 className="font-heading text-xl font-semibold">Perfil financeiro</h2></div>
            <p className="mt-1 text-sm text-slate-500">Dados usados somente nos cálculos e telas deste navegador.</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <TextField label="Nome" value={profile.name} onChange={(value) => patch('name', value)} />
          <TextField label="E-mail" type="email" value={profile.email} onChange={(value) => patch('email', value)} />
          <NumberField label="Renda mensal" value={profile.income} onChange={(value) => patch('income', value)} />
          <NumberField label="Dia do recebimento" value={profile.payday} min={1} onChange={(value) => patch('payday', value)} />
          <NumberField label="Fechamento do cartão" value={profile.closingDay} min={1} onChange={(value) => patch('closingDay', value)} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center gap-2"><ShieldCheck size={18} className="text-emerald-300" /><h2 className="font-heading text-xl font-semibold">Proteção</h2></div>
          <p className="mt-2 text-sm text-slate-500">Referência atual de reserva: <strong className="text-slate-300">R$ {reserveTarget.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField label="Custo essencial" value={profile.essentialCost} onChange={(value) => patch('essentialCost', value)} />
            <NumberField label="Meses de reserva" value={profile.monthsGoal} min={1} onChange={(value) => patch('monthsGoal', value)} />
            <NumberField label="Reserva atual" value={profile.reserveAmount} onChange={(value) => patch('reserveAmount', value)} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-xl font-semibold">Investimentos</h2>
          <p className="mt-2 text-sm text-slate-500">Perfil de investidor: <strong className="text-violet-200">{investorProfile}</strong>.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <NumberField label="Meta mensal de investimentos" value={profile.monthlyInvestmentGoal} onChange={(value) => patch('monthlyInvestmentGoal', value)} />
            <NumberField label="Meta total de investimentos" value={profile.investmentTotalGoal} onChange={(value) => patch('investmentTotalGoal', value)} />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-heading text-xl font-semibold">Perfil empresarial local</h2>
        <p className="mt-2 text-sm text-slate-500">Os valores abaixo são os mesmos usados pelo AVYO Connect e não criam integração bancária ou contábil.</p>
        <div className="mt-5 flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={Boolean(profile.hasBusiness)} onChange={(event) => patch('hasBusiness', event.target.checked)} />Tenho empresa</label>
          <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={Boolean(profile.businessConnected)} onChange={(event) => patch('businessConnected', event.target.checked)} />Dados PJ conectados localmente</label>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <NumberField label="Pró-labore mensal" value={profile.proLabore} onChange={(value) => patch('proLabore', value)} />
          <NumberField label="Distribuição de lucros" value={profile.profitDistribution} onChange={(value) => patch('profitDistribution', value)} />
          <NumberField label="Despesas pessoais pagas pela empresa" value={profile.businessPersonalExpenses} onChange={(value) => patch('businessPersonalExpenses', value)} />
          <NumberField label="Patrimônio líquido da empresa" value={profile.businessNetWorth} onChange={(value) => patch('businessNetWorth', value)} />
        </div>
      </Card>

      <div><Button type="submit">Salvar alterações</Button></div>
    </form>

    <Card className="mt-5 p-6">
      <div className="flex items-center gap-2"><Bot size={18} className="text-violet-300" /><h2 className="font-heading text-xl font-semibold">IA remota protegida</h2></div>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.06] p-4 text-sm text-slate-300">
        <LockKeyhole className="mt-0.5 shrink-0 text-amber-200" size={18} aria-hidden="true" />
        <p><strong className="block text-white">Chamadas externas bloqueadas nesta versão</strong>O AVYO usa apenas respostas locais. A integração Base44 será liberada somente depois de existir login e uma proteção autenticada no backend.</p>
      </div>
    </Card>

    <Card className="mt-5 p-6">
      <div className="flex items-center gap-2"><Database size={18} className="text-cyan-300" /><h2 className="font-heading text-xl font-semibold">Dados somente neste navegador</h2></div>
      <p className="mt-2 text-sm text-slate-500">O AVYO salva seus dados financeiros no armazenamento local deste navegador. Você pode restaurar a demonstração ou apagar tudo quando quiser.</p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button variant="secondary" onClick={() => setConfirm('reset')}><RotateCcw size={17} />Restaurar demonstração</Button>
        <Button variant="danger" onClick={() => setConfirm('clear')}><Trash2 size={17} />Apagar tudo</Button>
      </div>
    </Card>

    <footer className="py-7 text-center text-xs text-slate-600">Versão de validação · 0.2</footer>

    <ConfirmDialog open={confirm === 'reset'} title="Restaurar dados de demonstração" description="Suas alterações atuais serão substituídas pelos dados de exemplo." confirmLabel="Restaurar demonstração" onConfirm={resetDemo} onClose={() => setConfirm(null)} />
    <ConfirmDialog open={confirm === 'clear'} title="Apagar todos os dados" description="Esta ação remove as informações salvas neste navegador e retorna ao início." confirmLabel="Apagar meus dados" onConfirm={clearAll} onClose={() => setConfirm(null)} />
  </>
}
