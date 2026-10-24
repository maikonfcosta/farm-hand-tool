import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { secondary } from './ui';

export function GuideLink({ tokens = false }: { tokens?: boolean }) {
  return (
    <Link
      href={`/guia/${tokens ? '#tokens' : ''}`}
      className={`${secondary} mb-6`}
    >
      <BookOpen size={20} aria-hidden="true" />
      {tokens ? 'Entenda os tokens' : 'Guia visual: símbolos e cartas de apoio'}
    </Link>
  );
}
