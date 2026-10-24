'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Apple,
  Droplet,
  Flower,
  Leaf,
  Mountain,
  Wheat,
  Rat,
  Layers,
  Grid2X2,
  RefreshCw,
  Expand,
  X,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { panel, secondary } from '@/components/ui';
import { SUITS } from '@/domain/cards';
import { cardsPerPlayer } from '@/domain/rounds';
import type { RoundNumber } from '@/domain/types';

function Grass() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="32"
      height="32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 22 1 9l7 8L5 2l7 12L15 1l1 15 7-9-3 15Z" />
    </svg>
  );
}

function RoundSymbol() {
  return (
    <span
      className="relative inline-flex size-9 shrink-0 items-center justify-center"
      aria-hidden="true"
    >
      <RefreshCw size={36} className="absolute inset-0" />
      <span className="text-lg font-bold">#</span>
    </span>
  );
}

function Sack() {
  return (
    <svg
      viewBox="0 0 64 64"
      width="40"
      height="40"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <path d="m23 18-5-12 14 3 14-3-5 12M23 19h18M24 22C7 36 9 55 22 57h20c13-2 15-21-2-35Z" />
      <path d="M32 32v17m0-9-6-5m6 10 6-6" />
    </svg>
  );
}

const symbols = {
  menta: { name: 'Fruta', Icon: Apple },
  laranja: { name: 'Folha', Icon: Leaf },
  azul: { name: 'Gota de água', Icon: Droplet },
  amarelo: { name: 'Flor', Icon: Flower },
  lima: { name: 'Tufo de grama', Icon: Grass },
  rosa: { name: 'Montanha', Icon: Mountain },
};
const colors = {
  menta: 'Menta',
  laranja: 'Laranja',
  azul: 'Azul',
  amarelo: 'Amarelo',
  lima: 'Verde-lima',
  rosa: 'Rosa',
};

function ZoomFigure({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (open) dialog.current?.showModal();
  }, [open]);
  const close = () => {
    dialog.current?.close();
    setOpen(false);
    trigger.current?.focus();
  };
  return (
    <figure className="min-w-0">
      <div className="rounded-2xl bg-[#ead4bf55] p-4 sm:p-6">{children}</div>
      <figcaption className="mt-3">
        <button
          ref={trigger}
          type="button"
          onClick={() => setOpen(true)}
          className={secondary}
          aria-label={`Ampliar: ${title}`}
        >
          <Expand size={18} aria-hidden="true" />
          Ampliar ilustração
        </button>
      </figcaption>
      {open && (
        <dialog
          ref={dialog}
          aria-label={title}
          className="w-[900px] !max-w-[94vw] max-h-[90dvh] overflow-auto"
          onCancel={(event) => {
            event.preventDefault();
            close();
          }}
        >
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2>{title}</h2>
            <button
              autoFocus
              type="button"
              onClick={close}
              className={secondary}
              aria-label="Fechar ilustração"
            >
              <X aria-hidden="true" />
            </button>
          </div>
          {children}
        </dialog>
      )}
    </figure>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--teal-dark)] text-sm font-bold text-white">
      {children}
    </span>
  );
}

function AnimalCards() {
  return (
    <div className="mx-auto grid max-w-lg grid-cols-2 gap-4 text-center">
      {[true, false].map((front) => (
        <div key={String(front)}>
          <div className="flex min-h-60 flex-col justify-between rounded-2xl border-4 border-[#5B8BD0] bg-[#e3edfb] p-3 text-[#234c85]">
            <div className="flex items-center justify-between">
              <Badge>{front ? 1 : 3}</Badge>
              {front ? (
                <strong className="text-5xl">3</strong>
              ) : (
                <Droplet size={36} aria-hidden="true" />
              )}
            </div>
            <div className="my-4 flex justify-center">
              <Droplet size={64} aria-hidden="true" />
            </div>
            <div className="flex flex-wrap justify-center gap-1">
              {[1, 2, 3, 4, 5, 7].map((n) => (
                <span
                  key={n}
                  className={`rounded px-1.5 py-1 font-bold ${front && n === 3 ? 'bg-[#234c85] text-white ring-2 ring-[#234c85]' : ''}`}
                >
                  {n}
                </span>
              ))}
            </div>
            <div className="mt-2 flex justify-center">
              <Badge>2</Badge>
            </div>
          </div>
          <p className="mt-3 font-bold">
            {front ? 'Frente · valor 3' : 'Verso · valor oculto'}
          </p>
        </div>
      ))}
    </div>
  );
}

function AidCard() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border-2 border-[#b3855b] bg-[var(--surface)] p-4">
      <p className="mb-4 text-center font-bold text-[var(--teal-dark)]">
        Carta de apoio · pontuação
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[true, false].map((hit) => (
          <div
            key={String(hit)}
            className="rounded-xl border border-[#d9bda8] p-4 text-center"
          >
            <div className="flex items-center justify-center gap-3">
              <Layers size={32} aria-hidden="true" />
              <strong className="text-3xl">{hit ? '=' : '≠'}</strong>
              <Grid2X2 size={32} aria-hidden="true" />
            </div>
            <p className="mt-2 font-bold">
              Vazas {hit ? 'iguais ao' : 'diferentes do'} lance
            </p>
            <div
              className={`my-5 flex items-center justify-center gap-3 ${hit ? 'text-[#2e7d32]' : 'text-[#a42f24]'}`}
            >
              {hit ? (
                <RoundSymbol />
              ) : (
                <span className="font-bold">Diferença</span>
              )}
              <span>×</span>
              {hit ? (
                <Wheat size={36} aria-hidden="true" />
              ) : (
                <Rat size={36} aria-hidden="true" />
              )}
            </div>
            <p>
              {hit
                ? 'Número da rodada × 1 ponto'
                : 'Diferença absoluta × −1 ponto'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Guide() {
  return (
    <AppShell title="Guia visual do Farm Hand">
      <p className="mb-5 max-w-2xl leading-relaxed text-[var(--muted)]">
        Reconheça os símbolos da sua carta, leia o apoio da mesa e entenda cada
        marcador. Ilustrações esquemáticas para consultar durante a partida.
      </p>
      <nav aria-label="Seções do guia" className="mb-8 flex flex-wrap gap-2">
        {[
          ['cartas', 'Ler uma carta'],
          ['naipes', 'Naipes'],
          ['apoio', 'Carta de apoio'],
          ['tokens', 'Tokens'],
          ['marcadores', 'Lance e rodada'],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className={secondary}>
            {label}
          </a>
        ))}
      </nav>
      <div className="space-y-8">
        <section id="cartas" className={`${panel} scroll-mt-6`}>
          <h2 className="mb-5 text-[var(--teal-dark)]">Como ler uma carta</h2>
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <ZoomFigure title="Frente e verso de uma carta">
              <AnimalCards />
            </ZoomFigure>
            <ol className="space-y-5 leading-relaxed">
              <li className="flex gap-3">
                <Badge>1</Badge>
                <span>
                  <strong>Valor da carta.</strong> O número grande é o valor
                  jogado na vaza. Aqui, é 3.
                </span>
              </li>
              <li className="flex gap-3">
                <Badge>2</Badge>
                <span>
                  <strong>Números possíveis.</strong> A sequência mostra os
                  valores existentes nesse naipe. Na frente, o valor da carta
                  fica destacado.
                </span>
              </li>
              <li className="flex gap-3">
                <Badge>3</Badge>
                <span>
                  <strong>Símbolo e cor do naipe.</strong> A gota identifica o
                  azul/água. O verso revela o naipe, mas esconde o valor.
                </span>
              </li>
              <li>
                Ao ver uma gota no verso do adversário, você sabe que a carta
                pode ser 1, 2, 3, 4, 5 ou 7. Nunca 6.
              </li>
            </ol>
          </div>
        </section>
        <section id="naipes" className={`${panel} scroll-mt-6`}>
          <h2 className="mb-2 text-[var(--teal-dark)]">
            Seis símbolos, seis naipes
          </h2>
          <p className="mb-5 leading-relaxed">
            A tabela da carta de apoio reúne estes números. Os símbolos
            identificam naipes; não concedem poderes especiais. Não há trunfo.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SUITS.map((suit) => {
              const id = suit.id as keyof typeof symbols;
              const { Icon, name } = symbols[id];
              return (
                <div
                  key={id}
                  className="flex items-center gap-4 rounded-xl border border-[#d9bda8] p-4"
                >
                  <span
                    className="flex size-14 shrink-0 items-center justify-center rounded-xl text-[#24312c]"
                    style={{ backgroundColor: suit.color }}
                  >
                    <Icon aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-bold">
                      {name} · {colors[id]}
                    </h3>
                    <p className="mt-1 font-bold tracking-wider">
                      {suit.numbers.join(' · ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-5 leading-relaxed text-[var(--muted)]">
            Siga o naipe da primeira carta se tiver. Ganha o maior número de
            qualquer naipe, mas valores iguais se anulam. Os nomes dos desenhos
            são descrições visuais.
          </p>
        </section>
        <section id="apoio" className={`${panel} scroll-mt-6`}>
          <h2 className="mb-5 text-[var(--teal-dark)]">
            Entenda a carta de apoio
          </h2>
          <ZoomFigure title="Carta de apoio e pontuação">
            <AidCard />
          </ZoomFigure>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="flex items-center gap-2 font-bold">
                <Layers aria-hidden="true" /> Pilha de cartas
              </dt>
              <dd className="mt-2">
                Quantidade de vazas ganhas, não de cartas individuais.
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-bold">
                <Grid2X2 aria-hidden="true" /> Grade numerada
              </dt>
              <dd className="mt-2">
                Seu lance: quantas vazas você previu ganhar.
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-2 font-bold">
                <RoundSymbol /> # com setas ao redor
              </dt>
              <dd className="mt-2">
                Número da rodada atual. A rodada 4 vale +4 pontos para quem
                acertar o lance.
              </dd>
            </div>
            <div>
              <dt className="font-bold">=, ≠ e ×</dt>
              <dd className="mt-2">
                Igual, diferente e multiplicação. No erro, conte a distância
                entre lance e vazas, sempre positiva, e multiplique por −1.
              </dd>
            </div>
          </dl>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <p className="rounded-xl bg-[#2e7d3210] p-4">
              <strong>Acerto na rodada 4:</strong> lance 0 e nenhuma vaza = +4
              pontos. Lance 3 e três vazas também = +4.
            </p>
            <p className="rounded-xl bg-[#c0392b10] p-4">
              <strong>Erro em qualquer rodada:</strong> lance 3 e uma vaza = −2
              pontos. Lance 1 e três vazas também = −2.
            </p>
          </div>
        </section>
        <section id="tokens" className={`${panel} scroll-mt-6`}>
          <h2 className="mb-2 text-[var(--teal-dark)]">
            Tokens: quanto vale cada um?
          </h2>
          <p className="mb-5">
            Os tokens de pontuação representam seu total acumulado, que pode
            ficar negativo.
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {[
              { name: 'Saco', value: '+5', Icon: Sack, color: '#8c5e2d' },
              { name: 'Espiga', value: '+1', Icon: Wheat, color: '#82600b' },
              { name: 'Rato', value: '−1', Icon: Rat, color: '#a42f24' },
            ].map(({ name, value, Icon, color }) => (
              <div
                key={name}
                className="rounded-xl border border-[#d9bda8] p-3 text-center"
              >
                <div
                  className="mx-auto mb-3 flex size-16 items-center justify-center rounded-full bg-[#ead4bf55]"
                  style={{ color }}
                >
                  <Icon size={40} aria-hidden="true" />
                </div>
                <h3 className="font-bold">{name}</h3>
                <p className="mt-2 text-3xl font-bold" style={{ color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-[#25756d12] p-5">
            <p className="font-bold">Uma soma na prática</p>
            <div className="my-4 flex flex-wrap items-center gap-3 text-xl font-bold">
              <span className="flex items-center gap-1">
                2 × <Sack />
                <span className="sr-only">sacos</span>
              </span>
              <span>+</span>
              <span className="flex items-center gap-1">
                3 × <Wheat aria-hidden="true" />
                <span className="sr-only">espigas</span>
              </span>
              <span>+</span>
              <span className="flex items-center gap-1">
                1 × <Rat aria-hidden="true" />
                <span className="sr-only">rato</span>
              </span>
              <span>= 12 pontos</span>
            </div>
            <p>
              10 + 3 − 1 = 12. Um saco equivale a cinco espigas; cada rato
              subtrai um ponto.
            </p>
          </div>
          <p className="mt-5 leading-relaxed">
            <strong>No app:</strong> os botões + e − alteram a quantidade de
            tokens. Adicionar um rato diminui a pontuação. Confirmar uma rodada
            também aplica pontos: não conte manualmente uma rodada que você já
            aplicou automaticamente.
          </p>
        </section>
        <section id="marcadores" className={`${panel} scroll-mt-6`}>
          <h2 className="mb-5 text-[var(--teal-dark)]">
            Marcadores de lance e rodada
          </h2>
          <div className="grid items-start gap-6 sm:grid-cols-2">
            <div>
              <div className="rounded-2xl border-2 border-[var(--teal)] bg-[#25756d12] p-5">
                <h3 className="mb-3 font-bold">Carta de lance</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((n) => (
                    <div
                      key={n}
                      className={`flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#25756d55] font-bold ${n === 0 ? 'col-span-2' : ''} ${n === 2 ? 'bg-[var(--teal-dark)] text-white' : ''}`}
                    >
                      {n}
                      {n === 2 && (
                        <span aria-label="Marcador no lance 2">●</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-4 leading-relaxed">
                Depois de revelar o lance, coloque seu token de madeira sobre o
                número escolhido. Aqui, o jogador prevê{' '}
                <strong>duas vazas</strong>. Esse marcador não vale pontos.
              </p>
            </div>
            <div>
              <div className="rounded-2xl border-2 border-[#b3855b] bg-[#ead4bf55] p-4">
                <h3 className="mb-3 font-bold">Carta de rodada</h3>
                <table className="w-full text-center">
                  <caption className="mb-3 text-sm">
                    Cartas por jogador · cubo na rodada 4
                  </caption>
                  <thead>
                    <tr>
                      {['Rodada', '2–3', '4', '5'].map((label) => (
                        <th key={label} scope="col" className="p-2">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {([1, 2, 3, 4, 5, 6] as RoundNumber[]).map((round) => (
                      <tr
                        key={round}
                        className={
                          round === 4 ? 'bg-[var(--teal-dark)] text-white' : ''
                        }
                      >
                        <th scope="row" className="p-2">
                          {round === 4 && (
                            <span aria-label="Cubo na rodada 4">■ </span>
                          )}
                          {round}
                        </th>
                        {[3, 4, 5].map((players) => (
                          <td key={players} className="p-2">
                            {cardsPerPlayer(round, players)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-4 leading-relaxed">
                As colunas 2–3, 4 e 5 indicam a quantidade de jogadores. Cruze a
                coluna com a rodada para distribuir as cartas. Avance o cubo a
                cada nova rodada. Com dois humanos, Mac também recebe cartas.
              </p>
            </div>
          </div>
        </section>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-[var(--muted)]">
        Referência: cartas de apoio de Farm Hand e manual, páginas 4–9 e 13.
        Diagramas próprios; não são reproduções das cartas. Farm Hand: Craig
        Somerton, arte original de Samuel Bouvant, © 2025 Grail Games.
      </p>
    </AppShell>
  );
}
