import { Building2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/avyo/PageHeader'

const futureBenefits = [
  'Visão consolidada de pessoa física e empresa',
  'Pró-labore e distribuição de lucros sincronizados',
  'Patrimônio PF + PJ em uma leitura única',
]

export function ConnectPage() {
  return (
    <>
      <PageHeader
        eyebrow="AVYO Connect"
        title="Seus dados, no seu controle"
        subtitle="Uma ponte entre sua vida financeira pessoal e sua empresa, liberada somente quando a integração real e segura estiver disponível."
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
        <Card className="p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-3 py-1 text-xs font-semibold text-amber-200">
                Aguardando backend AVYO Empresas
              </span>
              <h2 className="mt-4 font-heading text-2xl font-bold">Conexão real, ou nenhuma conexão</h2>
              <p className="mt-3 leading-relaxed text-slate-400">
                A integração com o AVYO Empresas ainda não está disponível. Não simulamos uma conexão local nem pedimos que você preencha dados empresariais para parecer que existe uma integração ativa.
              </p>
            </div>
            <div className="grid size-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <LockKeyhole size={20} className="text-amber-200" aria-hidden="true" />
            </div>
          </div>

          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck size={19} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
              <div>
                <h3 className="font-heading font-semibold">Seus dados continuam separados</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">
                  Nenhum dado da sua empresa é conectado, sincronizado ou enviado por esta tela enquanto o backend oficial do AVYO Empresas não existir.
                </p>
              </div>
            </div>
          </div>

          <Button type="button" className="mt-6" disabled aria-disabled="true">
            <LockKeyhole size={16} aria-hidden="true" />
            Conectar AVYO Empresas
          </Button>
          <p className="mt-3 text-xs leading-relaxed text-slate-500">
            O acesso será liberado somente quando a conexão puder ser feita de verdade, com uma fronteira de dados definida e backend disponível.
          </p>
        </Card>

        <Card className="p-6 sm:p-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-violet-400/10">
              <Building2 size={19} className="text-violet-300" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">Quando estiver disponível</p>
              <h2 className="mt-1 font-heading text-xl font-semibold">O que o Connect vai liberar</h2>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {futureBenefits.map((benefit) => (
              <div key={benefit} className="rounded-xl border border-white/8 bg-white/[0.025] p-4 text-sm leading-relaxed text-slate-300">
                {benefit}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs leading-relaxed text-slate-500">
            Estes itens são uma prévia do benefício. Eles não representam uma conexão ativa nesta versão.
          </p>
        </Card>
      </div>
    </>
  )
}
