'use client';
import { useState } from 'react';
import { Search } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { panel } from '@/components/ui';
import { text } from '@/content/ptbr';
import { rules, summary } from '@/content/rules';
const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('pt-BR');
export default function Rules() {
  const [query, setQuery] = useState('');
  const shown = rules.filter((r) =>
    normalize(`${r.title} ${r.text}`).includes(normalize(query)),
  );
  return (
    <AppShell title={text.rules}>
      <label className="relative mb-6 block">
        <span className="sr-only">{text.search}</span>
        <Search
          className="absolute left-4 top-3.5 text-[var(--teal)]"
          size={21}
        />
        <input
          className="!pl-12"
          type="search"
          placeholder={text.search}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      <section className={`${panel} mb-6 border-l-4 !border-l-[var(--orange)]`}>
        <h2 className="mb-4 text-[var(--teal-dark)]">{text.summary}</h2>
        <ol className="list-decimal space-y-3 pl-5 leading-relaxed">
          {summary.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </section>
      <div className="space-y-3">
        {shown.map((r, i) => (
          <details
            key={`${r.id}-${query}`}
            id={r.id}
            open={!!query || i === 0}
            className={panel}
          >
            <summary className="cursor-pointer py-1 text-lg font-bold text-[var(--teal-dark)]">
              {r.title}
            </summary>
            <p className="mt-4 leading-relaxed">{r.text}</p>
          </details>
        ))}
        {!shown.length && <p>{text.noRules}</p>}
      </div>
    </AppShell>
  );
}
