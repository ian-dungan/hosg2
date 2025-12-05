import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Player, CharacterClass } from '@/types/types';

interface GameContextType {
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;
  characterClasses: CharacterClass[];
  setCharacterClasses: (classes: CharacterClass[]) => void;
  isInGame: boolean;
  setIsInGame: (inGame: boolean) => void;
  sessionId: string | null;
  setSessionId: (id: string | null) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [characterClasses, setCharacterClasses] = useState<CharacterClass[]>([]);
  const [isInGame, setIsInGame] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const savedPlayer = localStorage.getItem('currentPlayer');
    if (savedPlayer) {
      try {
        setCurrentPlayer(JSON.parse(savedPlayer));
      } catch (error) {
        console.error('Failed to parse saved player:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (currentPlayer) {
      localStorage.setItem('currentPlayer', JSON.stringify(currentPlayer));
    } else {
      localStorage.removeItem('currentPlayer');
    }
  }, [currentPlayer]);

  return (
    <GameContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        characterClasses,
        setCharacterClasses,
        isInGame,
        setIsInGame,
        sessionId,
        setSessionId,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
