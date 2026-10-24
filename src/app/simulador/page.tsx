'use client';

import { useState, useEffect } from 'react';
import {
  RotateCcw,
  Trophy,
  Play,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  User,
  Bot,
} from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { panel, primary, secondary } from '@/components/ui';
import {
  type SoloGameState,
  type Card,
  type SoloPlayerId,
  startSoloGame,
  setHumanBid,
  playCard,
  advanceToNextRound,
} from '@/domain/simulator';
import { totalPoints } from '@/domain/tokens';

const STORAGE_KEY = 'farmhand_solo_sim_v1';

export default function SimulatorPage() {
  const [gameState, setGameState] = useState<SoloGameState | null>(null);
  const [selectedBid, setSelectedBid] = useState<number>(0);
  const [lastActionMsg, setLastActionMsg] = useState<string>('');

  // Carrega estado persistido
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGameState(JSON.parse(saved));
      } else {
        const initial = startSoloGame('Você');
        setGameState(initial);
      }
    } catch {
      const initial = startSoloGame('Você');
      setGameState(initial);
    }
  }, []);

  // Salva alterações
  useEffect(() => {
    if (gameState) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
      } catch {
        // silencioso
      }
    }
  }, [gameState]);

  if (!gameState) {
    return (
      <AppShell title="Simulador Solo">
        <div className="h-48 rounded-2xl bg-[#fff4ea] motion-safe:animate-pulse" />
      </AppShell>
    );
  }

  const roundState = gameState.currentRoundState;
  const isBidding = roundState.phase === 'bidding';
  const isPlaying = roundState.phase === 'playing';
  const isRoundEnd = roundState.phase === 'round_end';
  const isGameFinished = gameState.finished;

  const handleStartNewGame = () => {
    if (confirm('Iniciar nova partida do zero?')) {
      const newGame = startSoloGame(gameState.playerName);
      setGameState(newGame);
      setSelectedBid(0);
      setLastActionMsg('Nova partida iniciada.');
    }
  };

  const handleConfirmBid = () => {
    const updated = setHumanBid(gameState, selectedBid);
    setGameState(updated);
    setLastActionMsg(`Você deu o lance de ${selectedBid} vaza(s).`);
  };

  const handlePlayBotTurn = () => {
    if (!isPlaying) return;
    const currentTurn = roundState.currentTurnPlayerId;
    if (currentTurn === 'human') return;

    const botName = currentTurn === 'mac' ? 'Mac' : 'Donald';
    const nextState = playCard(gameState);
    setGameState(nextState);
    setLastActionMsg(`${botName} jogou uma carta.`);
  };

  const handlePlayHumanCard = (card: Card) => {
    if (!isPlaying || roundState.currentTurnPlayerId !== 'human') return;

    // Validação de naipe
    const leadSuit =
      roundState.currentTrickCards.length > 0
        ? roundState.currentTrickCards[0].card.suitId
        : undefined;
    if (leadSuit && card.suitId !== leadSuit) {
      const hasLeadSuit = roundState.playerHand.some(
        (c) => c.suitId === leadSuit,
      );
      if (hasLeadSuit) {
        setLastActionMsg('Você é obrigado a seguir o naipe da vaza!');
        return;
      }
    }

    const nextState = playCard(gameState, card.id);
    setGameState(nextState);
    setLastActionMsg(`Você jogou ${card.suitName} ${card.number}.`);
  };

  const handleAdvanceRound = () => {
    const nextState = advanceToNextRound(gameState);
    setGameState(nextState);
    setSelectedBid(0);
    setLastActionMsg(`Rodada ${nextState.currentRound} iniciada.`);
  };

  // Jogadores e suas pontuações acumuladas
  const humanScore = totalPoints(gameState.tokens.human);
  const macScore = totalPoints(gameState.tokens.mac);
  const donaldScore = totalPoints(gameState.tokens.donald);

  const getPlayerLabel = (id: SoloPlayerId) => {
    if (id === 'human') return gameState.playerName;
    if (id === 'mac') return 'Mac (à esquerda)';
    return 'Donald (à direita)';
  };

  return (
    <AppShell title="Simulador Solo">
      {/* Placar Superior */}
      <section
        className={`${panel} mb-6 grid grid-cols-3 gap-2 border-l-4 !border-l-[var(--teal)] text-center sm:gap-4`}
      >
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 font-bold text-[var(--teal-dark)]">
            <User size={16} /> {gameState.playerName}
          </div>
          <span className="text-xl font-extrabold sm:text-2xl">
            {humanScore} pts
          </span>
          <span className="text-xs text-[var(--muted)]">
            Vazas: {roundState.tricksWon.human} | Lance:{' '}
            {isBidding ? '?' : roundState.bids.human}
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-[#d9bda8] px-2">
          <div className="flex items-center gap-1 font-bold text-[var(--teal-dark)]">
            <Bot size={16} /> Mac
          </div>
          <span className="text-xl font-extrabold sm:text-2xl">
            {macScore} pts
          </span>
          <span className="text-xs text-[var(--muted)]">
            Vazas: {roundState.tricksWon.mac} | Lance: {roundState.bids.mac}
          </span>
        </div>
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1 font-bold text-[var(--teal-dark)]">
            <Bot size={16} /> Donald
          </div>
          <span className="text-xl font-extrabold sm:text-2xl">
            {donaldScore} pts
          </span>
          <span className="text-xs text-[var(--muted)]">
            Vazas: {roundState.tricksWon.donald} | Lance:{' '}
            {roundState.bids.donald}
          </span>
        </div>
      </section>

      {/* Info da Rodada e Turno */}
      <section className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold tracking-wider text-[var(--teal)] uppercase">
            Rodada {gameState.currentRound} de 6
          </span>
          <h2 className="text-xl font-bold text-[var(--teal-dark)]">
            {isGameFinished
              ? 'Fim de Jogo!'
              : isRoundEnd
                ? 'Fim da Rodada'
                : isBidding
                  ? 'Fase de Lances'
                  : `Vaza ${roundState.currentTrickNumber} de ${roundState.round}`}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStartNewGame}
            className={`${secondary} !py-2 text-sm`}
            title="Reiniciar partida solo"
          >
            <RotateCcw size={16} /> Reiniciar
          </button>
        </div>
      </section>

      {lastActionMsg && (
        <div
          role="status"
          className="mb-4 rounded-xl bg-[#25756d15] p-3 text-sm font-medium text-[var(--teal-dark)]"
        >
          {lastActionMsg}
        </div>
      )}

      {/* TELA DE FIM DE JOGO */}
      {isGameFinished && (
        <section className={`${panel} mb-6 space-y-4 text-center`}>
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-[var(--teal)] text-white">
            <Trophy size={32} />
          </div>
          <h3 className="text-2xl font-bold text-[var(--teal-dark)]">
            Resultado Final da Partida
          </h3>
          <p className="text-lg">
            Sua pontuação: <strong>{humanScore} pontos</strong> (Meta: 21
            pontos)
          </p>
          <div className="inline-block space-y-2 text-left">
            <p className="flex items-center gap-2 font-medium">
              {humanScore > macScore && humanScore > donaldScore ? (
                <CheckCircle2 className="text-[var(--positive)]" size={20} />
              ) : (
                <AlertCircle className="text-[var(--negative)]" size={20} />
              )}
              Venceu Mac e Donald:{' '}
              {humanScore > macScore && humanScore > donaldScore
                ? 'SIM'
                : 'NÃO'}
            </p>
            <p className="flex items-center gap-2 font-medium">
              {humanScore >= 21 ? (
                <CheckCircle2 className="text-[var(--positive)]" size={20} />
              ) : (
                <AlertCircle className="text-[var(--negative)]" size={20} />
              )}
              Meta de 21 pontos alcançada: {humanScore >= 21 ? 'SIM' : 'NÃO'}
            </p>
          </div>
          <div className="pt-4">
            <button
              type="button"
              onClick={handleStartNewGame}
              className={primary}
            >
              Jogar Novamente
            </button>
          </div>
        </section>
      )}

      {/* FASE DE LANCES */}
      {isBidding && !isGameFinished && (
        <section className={`${panel} mb-6 space-y-4`}>
          <h3 className="text-lg font-bold text-[var(--teal-dark)]">
            Quantas vazas você prevê que vai ganhar?
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Na rodada {roundState.round}, você tem {roundState.round} carta(s).
            Lances dos bots: Mac = {roundState.bids.mac}, Donald ={' '}
            {roundState.bids.donald}.
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {Array.from({ length: roundState.round + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                data-testid={`bid-option-${i}`}
                onClick={() => setSelectedBid(i)}
                className={`flex size-14 items-center justify-center rounded-2xl text-xl font-bold transition-all ${
                  selectedBid === i
                    ? 'scale-105 bg-[var(--teal)] text-white shadow-md'
                    : 'border border-[var(--teal)] bg-white text-[var(--teal-dark)]'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
          <div className="pt-2">
            <button
              type="button"
              data-testid="confirm-bid-button"
              onClick={handleConfirmBid}
              className={primary}
            >
              Confirmar Lance ({selectedBid})
            </button>
          </div>
        </section>
      )}

      {/* MESA DE JOGO (VAZA ATUAL) */}
      {isPlaying && !isGameFinished && (
        <section className={`${panel} mb-6 space-y-4`}>
          <div className="flex items-center justify-between border-b border-[#d9bda8] pb-3">
            <div>
              <span className="text-xs text-[var(--muted)]">Vez de jogar:</span>
              <p className="font-bold text-[var(--teal-dark)]">
                {roundState.currentTurnPlayerId === 'human'
                  ? '👉 SUA VEZ! Escolha uma carta abaixo'
                  : `Aguardando ${getPlayerLabel(roundState.currentTurnPlayerId)}`}
              </p>
            </div>
            {roundState.currentTurnPlayerId !== 'human' && (
              <button
                type="button"
                data-testid="play-bot-turn-button"
                onClick={handlePlayBotTurn}
                className={primary}
              >
                <Play size={18} /> Jogar Vez do Bot
              </button>
            )}
          </div>

          {/* Cartas na mesa */}
          <div>
            <span className="mb-2 block text-xs font-semibold text-[var(--muted)]">
              Cartas jogadas nesta vaza:
            </span>
            <div className="grid min-h-24 grid-cols-3 gap-3">
              {['mac', 'human', 'donald'].map((pid) => {
                const played = roundState.currentTrickCards.find(
                  (p) => p.playerId === pid,
                );
                return (
                  <div
                    key={pid}
                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#a48f80] p-2 text-center"
                  >
                    <span className="mb-1 text-xs text-[var(--muted)]">
                      {pid === 'human'
                        ? 'Você'
                        : pid === 'mac'
                          ? 'Mac'
                          : 'Donald'}
                    </span>
                    {played ? (
                      <div
                        data-testid={`table-card-${played.card.id}`}
                        style={{
                          backgroundColor: played.card.suitColor,
                          color: '#1F1F1F',
                        }}
                        className="flex h-16 w-12 items-center justify-center rounded-lg text-xl font-extrabold shadow-sm"
                      >
                        {played.card.number}
                      </div>
                    ) : (
                      <span className="text-xs text-[#a48f80]">Vazio</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FIM DA RODADA */}
      {isRoundEnd && !isGameFinished && (
        <section className={`${panel} mb-6 space-y-4`}>
          <h3 className="text-lg font-bold text-[var(--teal-dark)]">
            Encerramento da Rodada {roundState.round}
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#fffaf5] p-3">
              <span className="block text-xs text-[var(--muted)]">Você</span>
              <p className="font-bold">
                Lance: {roundState.bids.human} | Vazas:{' '}
                {roundState.tricksWon.human}
              </p>
              <span
                className={`text-lg font-extrabold ${roundState.roundPoints.human >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
              >
                {roundState.roundPoints.human >= 0 ? '+' : ''}
                {roundState.roundPoints.human} pts
              </span>
            </div>
            <div className="rounded-xl bg-[#fffaf5] p-3">
              <span className="block text-xs text-[var(--muted)]">Mac</span>
              <p className="font-bold">
                Lance: {roundState.bids.mac} | Vazas: {roundState.tricksWon.mac}
              </p>
              <span
                className={`text-lg font-extrabold ${roundState.roundPoints.mac >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
              >
                {roundState.roundPoints.mac >= 0 ? '+' : ''}
                {roundState.roundPoints.mac} pts
              </span>
            </div>
            <div className="rounded-xl bg-[#fffaf5] p-3">
              <span className="block text-xs text-[var(--muted)]">Donald</span>
              <p className="font-bold">
                Lance: {roundState.bids.donald} | Vazas:{' '}
                {roundState.tricksWon.donald}
              </p>
              <span
                className={`text-lg font-extrabold ${roundState.roundPoints.donald >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
              >
                {roundState.roundPoints.donald >= 0 ? '+' : ''}
                {roundState.roundPoints.donald} pts
              </span>
            </div>
          </div>
          <button
            type="button"
            data-testid="advance-round-button"
            onClick={handleAdvanceRound}
            className={primary}
          >
            Avançar para a Rodada {gameState.currentRound + 1}
          </button>
        </section>
      )}

      {/* SUA MÃO DE CARTAS */}
      <section className={`${panel} mb-6`}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-[var(--teal-dark)]">
            Sua Mão ({roundState.playerHand.length} carta(s))
          </h3>
          <span className="text-xs text-[var(--muted)]">
            {isPlaying && roundState.currentTurnPlayerId === 'human'
              ? 'Toque numa carta para jogar'
              : 'Suas cartas nesta rodada'}
          </span>
        </div>

        {roundState.playerHand.length === 0 ? (
          <p className="py-4 text-center text-sm text-[var(--muted)]">
            Nenhuma carta na mão.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {roundState.playerHand.map((card) => {
              const leadSuit =
                roundState.currentTrickCards.length > 0
                  ? roundState.currentTrickCards[0].card.suitId
                  : undefined;
              const hasLead =
                leadSuit &&
                roundState.playerHand.some((c) => c.suitId === leadSuit);
              const disabled =
                !isPlaying ||
                roundState.currentTurnPlayerId !== 'human' ||
                Boolean(leadSuit && hasLead && card.suitId !== leadSuit);

              return (
                <button
                  key={card.id}
                  type="button"
                  data-testid={`player-card-${card.id}`}
                  disabled={disabled}
                  onClick={() => handlePlayHumanCard(card)}
                  style={{
                    backgroundColor: card.suitColor,
                    color: '#1F1F1F',
                  }}
                  className={`flex h-24 w-16 flex-col justify-between rounded-xl p-2 font-extrabold shadow-md transition-all sm:h-28 sm:w-20 ${
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:-translate-y-1 hover:shadow-lg active:scale-95'
                  }`}
                >
                  <span className="text-left text-xs opacity-80">
                    {card.suitName.slice(0, 3)}
                  </span>
                  <span className="self-center text-3xl font-black">
                    {card.number}
                  </span>
                  <span className="text-right text-xs opacity-80">
                    {card.number}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* MÃOS DOS BOTS (COSTAS VISÍVEIS) */}
      <section className={`${panel} mb-6 grid gap-4 sm:grid-cols-2`}>
        <div>
          <h4 className="mb-2 text-sm font-bold text-[var(--teal-dark)]">
            Mão de Mac ({roundState.macHand.length} carta(s) fechadas)
          </h4>
          <div className="flex flex-wrap gap-2">
            {roundState.macHand.map((c, i) => (
              <div
                key={c.id}
                style={{ backgroundColor: c.suitColor }}
                title={`Naipe: ${c.suitName}`}
                className="flex h-14 w-10 items-center justify-center rounded-lg border-2 border-white/60 text-xs font-bold text-black/70 shadow-inner"
              >
                #{i + 1}
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            O verso revela o naipe da carta. O valor numérico fica oculto até
            ser jogada.
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold text-[var(--teal-dark)]">
            Mão de Donald ({roundState.donaldHand.length} carta(s) fechadas)
          </h4>
          <div className="flex flex-wrap gap-2">
            {roundState.donaldHand.map((c, i) => (
              <div
                key={c.id}
                style={{ backgroundColor: c.suitColor }}
                title={`Naipe: ${c.suitName}`}
                className="flex h-14 w-10 items-center justify-center rounded-lg border-2 border-white/60 text-xs font-bold text-black/70 shadow-inner"
              >
                #{i + 1}
              </div>
            ))}
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            O verso revela o naipe da carta. O valor numérico fica oculto até
            ser jogada.
          </p>
        </div>
      </section>

      {/* Regras do Modo Solo Rápidas */}
      <section
        className={`${panel} text-sm leading-relaxed text-[var(--muted)]`}
      >
        <div className="mb-2 flex items-center gap-2 font-bold text-[var(--teal-dark)]">
          <HelpCircle size={18} /> Resumo do Modo Solo
        </div>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Oponentes:</strong> Mac (à sua esquerda) e Donald (à sua
            direita).
          </li>
          <li>
            <strong>Líder da 1ª vaza:</strong> Rodadas 1 e 4: Mac | Rodadas 2 e
            5: Donald | Rodadas 3 e 6: Você.
          </li>
          <li>
            <strong>Lances fixos dos bots:</strong> Mac = [0, 1, 0, 2, 0, 3] |
            Donald = [1, 0, 1, 0, 2, 0].
          </li>
          <li>
            <strong>Regra de jogo dos bots:</strong> Jogam a carta do topo; se
            precisarem seguir naipe, jogam a do topo do naipe pedido.
          </li>
          <li>
            <strong>Resolução de vaza:</strong> Maior número vence. Números
            iguais na vaza se anulam!
          </li>
        </ul>
      </section>
    </AppShell>
  );
}
