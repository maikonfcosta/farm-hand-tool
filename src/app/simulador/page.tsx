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
import {
  ConfirmDialog,
  panel,
  primary,
  secondary,
  type DialogAction,
} from '@/components/ui';
import {
  type SoloGameState,
  type Card,
  type SoloPlayerId,
  startSoloGame,
  setHumanBid,
  playCard,
  advanceToNextRound,
  startSoloTiebreak,
  canPlayCard,
} from '@/domain/simulator';
import { totalPoints } from '@/domain/tokens';
import { useHaptics } from '@/hooks/useHaptics';

const STORAGE_KEY = 'farmhand_solo_sim_v1';

export default function SimulatorPage() {
  const [gameState, setGameState] = useState<SoloGameState | null>(null);
  const [selectedBid, setSelectedBid] = useState<number>(0);
  const [lastActionMsg, setLastActionMsg] = useState<string>('');
  const [dialog, setDialog] = useState<DialogAction | null>(null);
  const vibrate = useHaptics();

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
    setDialog({
      title: 'Iniciar nova partida do zero?',
      confirm: 'Reiniciar',
      onConfirm: () => {
        const newGame = startSoloGame(gameState.playerName);
        setGameState(newGame);
        setSelectedBid(0);
        setLastActionMsg('Nova partida iniciada.');
        vibrate();
      },
    });
  };

  const handleConfirmBid = () => {
    const updated = setHumanBid(gameState, selectedBid);
    setGameState(updated);
    setLastActionMsg(`Você deu o lance de ${selectedBid} vaza(s).`);
    vibrate();
  };

  const handlePlayBotTurn = () => {
    if (!isPlaying) return;
    const currentTurn = roundState.currentTurnPlayerId;
    if (currentTurn === 'human') return;

    const botName = currentTurn === 'mac' ? 'Mac' : 'Donald';
    const nextState = playCard(gameState);
    setGameState(nextState);
    setLastActionMsg(`${botName} jogou uma carta.`);
    vibrate();
  };

  const handlePlayHumanCard = (card: Card) => {
    if (!isPlaying || roundState.currentTurnPlayerId !== 'human') return;

    const leadSuit =
      roundState.currentTrickCards.length > 0
        ? roundState.currentTrickCards[0].card.suitId
        : undefined;

    if (!canPlayCard(roundState.playerHand, card, leadSuit)) {
      setLastActionMsg('Você é obrigado a seguir o naipe da vaza!');
      return;
    }

    const nextState = playCard(gameState, card.id);
    setGameState(nextState);
    setLastActionMsg(`Você jogou ${card.suitName} ${card.number}.`);
    vibrate();
  };

  const handleAdvanceRound = () => {
    const nextState = advanceToNextRound(gameState);
    setGameState(nextState);
    setSelectedBid(0);
    if (!nextState.finished) {
      setLastActionMsg(`Rodada ${nextState.currentRound} iniciada.`);
    } else {
      setLastActionMsg('Partida encerrada.');
    }
    vibrate();
  };

  const handleTiebreak = () => {
    const nextState = startSoloTiebreak(gameState);
    setGameState(nextState);
    setSelectedBid(0);
    setLastActionMsg('Desempate na rodada 6 iniciado.');
    vibrate();
  };

  // Jogadores e suas pontuações acumuladas
  const humanScore = totalPoints(gameState.tokens.human);
  const macScore = totalPoints(gameState.tokens.mac);
  const donaldScore = totalPoints(gameState.tokens.donald);
  const maxScore = Math.max(humanScore, macScore, donaldScore);
  const isTiedAtTop =
    humanScore === maxScore &&
    (humanScore === macScore || humanScore === donaldScore);

  const getPlayerLabel = (id: SoloPlayerId) => {
    if (id === 'human') return gameState.playerName;
    if (id === 'mac') return 'Mac (à esquerda)';
    return 'Donald (à direita)';
  };

  const lastCompletedTrick =
    roundState.completedTricks.length > 0
      ? roundState.completedTricks[roundState.completedTricks.length - 1]
      : null;

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
            Vazas: {roundState.tricksWon.human}
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">
              Lance: {isBidding ? '?' : roundState.bids.human}
            </span>
          </span>
        </div>
        <div className="flex flex-col items-center border-x border-[#d9bda8] px-1 sm:px-2">
          <div className="flex items-center gap-1 font-bold text-[var(--teal-dark)]">
            <Bot size={16} /> Mac
          </div>
          <span className="text-xl font-extrabold sm:text-2xl">
            {macScore} pts
          </span>
          <span className="text-xs text-[var(--muted)]">
            Vazas: {roundState.tricksWon.mac}
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">
              Lance: {roundState.bids.mac}
            </span>
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
            Vazas: {roundState.tricksWon.donald}
            <span className="hidden sm:inline"> | </span>
            <span className="block sm:inline">
              Lance: {roundState.bids.donald}
            </span>
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
          <div className="flex flex-wrap justify-center gap-3 pt-4">
            {isTiedAtTop && (
              <button
                type="button"
                onClick={handleTiebreak}
                className={primary}
              >
                Rejogar Rodada 6 (Desempate)
              </button>
            )}
            <button
              type="button"
              onClick={handleStartNewGame}
              className={secondary}
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
                aria-pressed={selectedBid === i}
                aria-label={`Lance de ${i} vaza${i === 1 ? '' : 's'}`}
                onClick={() => setSelectedBid(i)}
                className={`flex size-14 items-center justify-center rounded-2xl text-xl font-bold transition-colors duration-150 ${
                  selectedBid === i
                    ? 'bg-[var(--teal)] text-white shadow-md'
                    : 'border border-[var(--teal)] bg-white text-[var(--teal-dark)] hover:bg-[#25756d12]'
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9bda8] pb-3">
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
                className={`${primary} w-full sm:w-auto`}
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
                      <span className="text-xs text-[var(--muted)]">Vazio</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo da última vaza concluída */}
          {lastCompletedTrick && (
            <div className="rounded-xl bg-[#25756d10] p-3 text-xs leading-relaxed text-[var(--teal-dark)]">
              <span className="font-bold">
                Última vaza (Vaza {lastCompletedTrick.trickNumber}):{' '}
              </span>
              {lastCompletedTrick.played.map((p, idx) => (
                <span key={p.card.id}>
                  {idx > 0 && ' · '}
                  <strong>{p.playerId === 'human' ? 'Você' : p.playerId === 'mac' ? 'Mac' : 'Donald'}:</strong>{' '}
                  {p.card.suitName} {p.card.number}
                </span>
              ))}
              {' → '}
              <span className="font-bold">
                {lastCompletedTrick.winnerId
                  ? `Venceu ${lastCompletedTrick.winnerId === 'human' ? 'Você' : lastCompletedTrick.winnerId === 'mac' ? 'Mac' : 'Donald'}`
                  : 'Anulada (empate)'}
              </span>
            </div>
          )}
        </section>
      )}

      {/* FIM DA RODADA */}
      {isRoundEnd && !isGameFinished && (
        <section className={`${panel} mb-6 space-y-4`}>
          <h3 className="text-lg font-bold text-[var(--teal-dark)]">
            Encerramento da Rodada {roundState.round}
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl bg-[#fffaf5] p-2 sm:p-3">
              <span className="block text-xs text-[var(--muted)]">Você</span>
              <p className="text-xs font-bold sm:text-sm">
                L: {roundState.bids.human} | V: {roundState.tricksWon.human}
              </p>
              <span
                className={`text-base font-extrabold sm:text-lg ${roundState.roundPoints.human >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
              >
                {roundState.roundPoints.human >= 0 ? '+' : ''}
                {roundState.roundPoints.human} pts
              </span>
            </div>
            <div className="rounded-xl bg-[#fffaf5] p-2 sm:p-3">
              <span className="block text-xs text-[var(--muted)]">Mac</span>
              <p className="text-xs font-bold sm:text-sm">
                L: {roundState.bids.mac} | V: {roundState.tricksWon.mac}
              </p>
              <span
                className={`text-base font-extrabold sm:text-lg ${roundState.roundPoints.mac >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
              >
                {roundState.roundPoints.mac >= 0 ? '+' : ''}
                {roundState.roundPoints.mac} pts
              </span>
            </div>
            <div className="rounded-xl bg-[#fffaf5] p-2 sm:p-3">
              <span className="block text-xs text-[var(--muted)]">Donald</span>
              <p className="text-xs font-bold sm:text-sm">
                L: {roundState.bids.donald} | V: {roundState.tricksWon.donald}
              </p>
              <span
                className={`text-base font-extrabold sm:text-lg ${roundState.roundPoints.donald >= 0 ? 'text-[var(--positive)]' : 'text-[var(--negative)]'}`}
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
            className={`${primary} w-full sm:w-auto`}
          >
            {roundState.round === 6
              ? 'Ver Resultado Final'
              : `Avançar para a Rodada ${gameState.currentRound + 1}`}
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
              const disabled =
                !isPlaying ||
                roundState.currentTurnPlayerId !== 'human' ||
                !canPlayCard(roundState.playerHand, card, leadSuit);

              return (
                <button
                  key={card.id}
                  type="button"
                  data-testid={`player-card-${card.id}`}
                  aria-label={`${card.suitName} ${card.number}`}
                  disabled={disabled}
                  onClick={() => handlePlayHumanCard(card)}
                  style={{
                    backgroundColor: card.suitColor,
                    color: '#1F1F1F',
                  }}
                  className={`flex h-24 w-16 flex-col justify-between rounded-xl p-2 font-extrabold shadow-md transition-opacity duration-150 sm:h-28 sm:w-20 ${
                    disabled
                      ? 'cursor-not-allowed opacity-40'
                      : 'hover:opacity-90 active:scale-95'
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

      {/* MÃOS DOS BOTS (VERSO CANÔNICO: NAIPE + NÚMEROS POSSÍVEIS) */}
      <section className={`${panel} mb-6 grid gap-4 sm:grid-cols-2`}>
        <div>
          <h4 className="mb-2 text-sm font-bold text-[var(--teal-dark)]">
            Mão de Mac ({roundState.macHand.length} carta(s) fechadas)
          </h4>
          <div className="flex flex-wrap gap-2">
            {roundState.macHand.map((c) => (
              <div
                key={c.id}
                style={{ backgroundColor: c.suitColor }}
                aria-label={`Carta de Mac: Naipe ${c.suitName}, possíveis ${c.suitNumbers ? c.suitNumbers.join(', ') : ''}`}
                className="flex h-16 w-14 flex-col justify-between rounded-lg border-2 border-white/80 p-1 text-[#1F1F1F] shadow-sm"
              >
                <span className="text-[10px] font-black tracking-tight uppercase">
                  {c.suitName.slice(0, 4)}
                </span>
                <span className="text-[9px] font-bold text-center leading-tight">
                  {c.suitNumbers ? c.suitNumbers.join('·') : ''}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            O verso revela o naipe e os números possíveis existentes nele. O valor exato fica oculto até ser jogado.
          </p>
        </div>
        <div>
          <h4 className="mb-2 text-sm font-bold text-[var(--teal-dark)]">
            Mão de Donald ({roundState.donaldHand.length} carta(s) fechadas)
          </h4>
          <div className="flex flex-wrap gap-2">
            {roundState.donaldHand.map((c) => (
              <div
                key={c.id}
                style={{ backgroundColor: c.suitColor }}
                aria-label={`Carta de Donald: Naipe ${c.suitName}, possíveis ${c.suitNumbers ? c.suitNumbers.join(', ') : ''}`}
                className="flex h-16 w-14 flex-col justify-between rounded-lg border-2 border-white/80 p-1 text-[#1F1F1F] shadow-sm"
              >
                <span className="text-[10px] font-black tracking-tight uppercase">
                  {c.suitName.slice(0, 4)}
                </span>
                <span className="text-[9px] font-bold text-center leading-tight">
                  {c.suitNumbers ? c.suitNumbers.join('·') : ''}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-[var(--muted)]">
            O verso revela o naipe e os números possíveis existentes nele. O valor exato fica oculto até ser jogado.
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

      {dialog && (
        <ConfirmDialog action={dialog} onClose={() => setDialog(null)} />
      )}
    </AppShell>
  );
}
