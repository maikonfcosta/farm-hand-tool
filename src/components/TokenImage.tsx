'use client';
import { useState } from 'react';
import type { TokenType } from '@/domain/types';
import { text } from '@/content/ptbr';
const assets = { saco: 'saco-5', espiga: 'espiga-1', rato: 'rato-menos-1' };
const colors = { saco: '#C8A57A', espiga: '#E2A92B', rato: '#8A8A8A' };
export function TokenImage({ type }: { type: TokenType }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <svg
      className="size-16 sm:size-24"
      viewBox="0 0 96 96"
      role="img"
      aria-label={text.tokenNames[type]}
    >
      <circle cx="48" cy="48" r="44" fill={colors[type]} />
      <text
        x="48"
        y="62"
        textAnchor="middle"
        fill="white"
        fontSize="42"
        fontWeight="bold"
      >
        {type === 'saco' ? '5' : type === 'espiga' ? '1' : '−1'}
      </text>
    </svg>
  ) : (
    <img
      className="size-16 object-contain sm:size-24"
      width={96}
      height={96}
      src={`/assets/tokens/${assets[type]}.png`}
      alt={text.tokenNames[type]}
      onError={() => setFailed(true)}
    />
  );
}
