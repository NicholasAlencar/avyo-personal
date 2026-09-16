import { useMemo, useState } from 'react'
import { RotateCcw, ShieldCheck, Sparkles, Trash2 } from 'lucide-react'
import { useFinanceStore } from '../context/FinanceContext'
import { formatCurrency } from '../lib/format'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { ConfirmDialog } from '../components/avyo/ConfirmDialog'
import { PageHeader } from '../components/avyo/PageHeader'

const input = 'mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 outline-none focus:border-cyan-400/50'

export function SettingsPage() {
  const { state, updateProfile, updateSettings, resetDemo, clearAll } = useFinanceStore()
  const [profile, setProfile] = useState(state.profile)
  const [confirm, setConfirm] = useState(null)
  const initials = useMemo(() => String(profile.name || 'AVYO').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase(), [profile.name])
  const target = Number(profile.essentialCost || 0) * Number(profile.monthsGoal || 0)
  const covered = Number(profile.essentialCost || 0) > 0 ? Number(profile.reserveAmount || 0) / Number(profile.essentialCost) : 0
  const set = (key) => (event) => setProfile((value) => ({ ...value, [key]: event.target.type === 'number' ? Number(event.target.value) : event.target.value }))

  return <><PageHeader eyebrow="Sua conta local" title="Configurações" subtitle="Ajuste premissas financeiras, privacidade e recursos opcionais do AVYO." />
    <div className="grid gap-4 lg:grid-cols-[.7fr_1.3fr]"><Card className="p-6"><div className="grid size-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-400/15 font-heading text-xl font-bold text-cyan-100" aria-label="Avatar do perfil">{initials}</div><h2 className="mt-4 font-heading text-xl font-semibold">{profile.name || 'Seu perfil'}</h2><p className="mt-1 text-sm text-slate-500">Perfil armazenado somente neste navegador.</p><div className="mt-5 rounded-xl bg-white/[0.035] p-4"><div className="flex items-center gap-2 text-cyan-300"><ShieldCheck size={16} /><span className="text-xs font-semibold uppercase tracking-[.14em]">Proteção atual</span></div><strong className="mt-2 block text-xl">{covered.toFixed(1)} meses</strong><p className="mt-1 text-xs text-slate-500">{formatCurrency(profile.reserveAmount)} de {formatCurrency(target)}</p></div><div className="mt-3 rounded-xl bg-white/[0.035] p-4"><p className="text-xs text-slate-500">Perfil de investimento</p><strong className="mt-1 block capitalize text-violet-200">{state.investmentProfile.profile || 'equilibrado'}</strong><p className="mt-1 text-xs text-slate-500">Pode ser recalculado em Investimentos → Encontre meu perfil.</p></div></Card>

      <Card className="p-6"><h2 className="font-heading text-xl font-semibold">Perfil financeiro</h2><form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={(event) => { event.preventDefault(); updateProfile(profile) }}>{[['name', 'Nome', 'text'], ['income', 'Renda mensal', 'number'], ['essentialCost', 'Custo essencial', 'number'], ['monthsGoal', 'Meses de reserva', 'number'], ['payday', 'Dia do recebimento', 'number'], ['closingDay', 'Fechamento do cartão', 'number']].map(([key, label, type]) => <label key={key} className="text-sm text-slate-300">{label}<input className={input} aria-label={label} type={type} min={type === 'number' ? 0 : undefined} step={type === 'number' ? 'any' : undefined} value={profile[key] ?? ''} onChange={set(key)} /></label>)}<div className="sm:col-span-2"><Button type="submit">Salvar alterações</Button></div></form></Card></div>

    <Card className="mt-5 p-6"><div className="flex items-center gap-2 text-violet-300"><Sparkles size={16} /><span className="text-xs font-semibold uppercase tracking-[.15em]">Base44 opcional</span></div><h2 className="mt-2 font-heading text-xl font-semibold">Inteligência artificial e privacidade</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">O Base44 é usado somente no Planejador, na narrativa do relatório mensal e na leitura assistida de extratos. O financeiro principal continua local e funciona sem IA.</p><div className="mt-5 grid gap-3 md:grid-cols-2"><label className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-slate-300"><input className="mt-1" type="checkbox" checked={Boolean(state.settings.aiEnabled)} onChange={(event) => updateSettings({ aiEnabled: event.target.checked })} /> <span><strong className="block text-slate-200">Permitir recursos de IA Base44</strong><span className="mt-1 block text-xs text-slate-500">Habilita a possibilidade de enviar resumos sanitizados quando você aciona um recurso.</span></span></label><label className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4 text-sm text-slate-300"><input className="mt-1" type="checkbox" checked={Boolean(state.settings.aiDisclosureAccepted)} onChange={(event) => updateSettings({ aiDisclosureAccepted: event.target.checked })} /> <span><strong className="block text-slate-200">Consentimento de envio aceito</strong><span className="mt-1 block text-xs text-slate-500">Pode ser revogado a qualquer momento. Sem ele, nenhuma chamada externa é feita.</span></span></label></div></Card>

    <Card className="mt-5 p-6"><h2 className="font-heading text-xl font-semibold">Dados deste navegador</h2><p className="mt-2 text-sm text-slate-500">Seus dados ficam neste navegador. Você pode restaurar a demonstração ou apagar tudo e voltar ao onboarding. Não existe sessão remota nem botão de logout nesta versão local.</p><div className="mt-5 flex flex-wrap gap-3"><Button variant="secondary" onClick={() => setConfirm('reset')}><RotateCcw size={17} />Restaurar demonstração</Button><Button variant="danger" onClick={() => setConfirm('clear')}><Trash2 size={17} />Apagar tudo</Button></div></Card>

    <footer className="mt-6 text-center text-xs text-slate-600">Versão de validação · 0.2</footer>
    <ConfirmDialog open={confirm === 'reset'} title="Restaurar dados de demonstração" description="Suas alterações atuais serão substituídas pelos dados de exemplo." confirmLabel="Restaurar demonstração" onConfirm={resetDemo} onClose={() => setConfirm(null)} /><ConfirmDialog open={confirm === 'clear'} title="Apagar todos os dados" description="Esta ação remove as informações salvas neste navegador e retorna ao início." confirmLabel="Apagar meus dados" onConfirm={clearAll} onClose={() => setConfirm(null)} />
  </>
}
