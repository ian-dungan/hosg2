import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IsometricEngine } from '@/game/IsometricEngine';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { playerApi } from '@/db/api';
import type { PlayerState, Enemy, Projectile } from '@/types/types';
import { ArrowLeft, Sword, Shield, Heart, Zap } from 'lucide-react';

export default function Game() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setCurrentPlayer } = useGame();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<IsometricEngine | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [gameState, setGameState] = useState<{
    players: Map<string, PlayerState>;
    enemies: Enemy[];
    projectiles: Projectile[];
  }>({
    players: new Map(),
    enemies: [],
    projectiles: [],
  });

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/menu');
      return;
    }

    if (!canvasRef.current) return;

    const engine = new IsometricEngine(canvasRef.current);
    engineRef.current = engine;

    const playerState: PlayerState = {
      id: currentPlayer.id,
      character_name: currentPlayer.character_name,
      class_id: currentPlayer.class_id,
      x: currentPlayer.position_x,
      y: currentPlayer.position_y,
      health: currentPlayer.health,
      max_health: currentPlayer.max_health,
      mana: currentPlayer.mana,
      max_mana: currentPlayer.max_mana,
      level: currentPlayer.level,
      isMoving: false,
      direction: 0,
      animation: 'idle',
    };

    const players = new Map<string, PlayerState>();
    players.set(currentPlayer.id, playerState);

    const enemies: Enemy[] = [
      {
        id: 'goblin1',
        type: 'goblin',
        name: 'Goblin',
        x: 15,
        y: 15,
        health: 50,
        max_health: 50,
        damage: 10,
        experience: 25,
        gold: 10,
        isAlive: true,
      },
      {
        id: 'goblin2',
        type: 'goblin',
        name: 'Goblin',
        x: 20,
        y: 18,
        health: 50,
        max_health: 50,
        damage: 10,
        experience: 25,
        gold: 10,
        isAlive: true,
      },
      {
        id: 'orc1',
        type: 'orc',
        name: 'Orc Warrior',
        x: 25,
        y: 25,
        health: 100,
        max_health: 100,
        damage: 20,
        experience: 50,
        gold: 25,
        isAlive: true,
      },
    ];

    setGameState({ players, enemies, projectiles: [] });

    engine.setCamera(playerState.x, playerState.y);

    const handleResize = () => engine.resizeCanvas();
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      const player = players.get(currentPlayer.id);
      if (!player) return;

      let moved = false;
      const speed = 0.5;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          player.y -= speed;
          moved = true;
          break;
        case 'ArrowDown':
        case 's':
          player.y += speed;
          moved = true;
          break;
        case 'ArrowLeft':
        case 'a':
          player.x -= speed;
          moved = true;
          break;
        case 'ArrowRight':
        case 'd':
          player.x += speed;
          moved = true;
          break;
        case ' ':
          handleAttack();
          break;
      }

      if (moved) {
        player.x = Math.max(0, Math.min(49, player.x));
        player.y = Math.max(0, Math.min(49, player.y));
        engine.setCamera(player.x, player.y);
        setGameState((prev) => ({ ...prev, players: new Map(prev.players) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    const gameLoop = () => {
      if (engineRef.current) {
        engineRef.current.render(
          gameState.players,
          gameState.enemies,
          gameState.projectiles,
          currentPlayer.id
        );
      }
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentPlayer, navigate]);

  useEffect(() => {
    if (engineRef.current && currentPlayer) {
      engineRef.current.render(
        gameState.players,
        gameState.enemies,
        gameState.projectiles,
        currentPlayer.id
      );
    }
  }, [gameState, currentPlayer]);

  const handleAttack = () => {
    if (!currentPlayer) return;

    const player = gameState.players.get(currentPlayer.id);
    if (!player) return;

    const nearestEnemy = gameState.enemies
      .filter((e) => e.isAlive)
      .reduce((nearest, enemy) => {
        const dist = Math.sqrt(
          Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        if (!nearest || dist < nearest.dist) {
          return { enemy, dist };
        }
        return nearest;
      }, null as { enemy: Enemy; dist: number } | null);

    if (nearestEnemy && nearestEnemy.dist < 10) {
      const projectile: Projectile = {
        id: `proj_${Date.now()}`,
        x: player.x,
        y: player.y,
        targetX: nearestEnemy.enemy.x,
        targetY: nearestEnemy.enemy.y,
        damage: currentPlayer.damage,
        speed: 0.5,
        ownerId: currentPlayer.id,
      };

      setGameState((prev) => ({
        ...prev,
        projectiles: [...prev.projectiles, projectile],
      }));

      setTimeout(() => {
        setGameState((prev) => {
          const updatedEnemies = prev.enemies.map((e) => {
            if (e.id === nearestEnemy.enemy.id) {
              const newHealth = e.health - currentPlayer.damage;
              if (newHealth <= 0) {
                handleEnemyDefeated(e);
                return { ...e, health: 0, isAlive: false };
              }
              return { ...e, health: newHealth };
            }
            return e;
          });

          return {
            ...prev,
            enemies: updatedEnemies,
            projectiles: prev.projectiles.filter((p) => p.id !== projectile.id),
          };
        });
      }, 500);
    }
  };

  const handleEnemyDefeated = async (enemy: Enemy) => {
    if (!currentPlayer) return;

    try {
      const updatedPlayer = await playerApi.gainExperience(currentPlayer.id, enemy.experience);
      const goldUpdate = await playerApi.update(currentPlayer.id, {
        gold: currentPlayer.gold + enemy.gold,
      });

      setCurrentPlayer(goldUpdate);

      toast({
        title: 'Enemy Defeated!',
        description: `Gained ${enemy.experience} XP and ${enemy.gold} gold${
          updatedPlayer.level > currentPlayer.level
            ? `. Level up! Now level ${updatedPlayer.level}`
            : ''
        }`,
      });
    } catch (error) {
      console.error('Failed to update player:', error);
    }
  };

  if (!currentPlayer) return null;

  const player = gameState.players.get(currentPlayer.id);
  const healthPercent = player ? (player.health / player.max_health) * 100 : 0;
  const manaPercent = player ? (player.mana / player.max_mana) * 100 : 0;
  const xpForNextLevel = currentPlayer.level * 100;
  const xpPercent = (currentPlayer.experience / xpForNextLevel) * 100;

  return (
    <div className="relative w-full h-screen overflow-hidden bg-background">
      <canvas ref={canvasRef} className="game-canvas" />

      <div className="absolute top-4 left-4 z-10">
        <Button variant="outline" onClick={() => navigate('/menu')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Menu
        </Button>
      </div>

      <div className="absolute top-4 right-4 z-10 w-80">
        <Card className="bg-card/90 backdrop-blur">
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">{currentPlayer.character_name}</h3>
              <span className="text-sm text-muted-foreground">Lv. {currentPlayer.level}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-health" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Health</span>
                    <span>
                      {player?.health}/{player?.max_health}
                    </span>
                  </div>
                  <Progress value={healthPercent} className="h-2 bg-muted" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-mana" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Mana</span>
                    <span>
                      {player?.mana}/{player?.max_mana}
                    </span>
                  </div>
                  <Progress value={manaPercent} className="h-2 bg-muted" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-4 h-4 flex items-center justify-center text-experience">⭐</div>
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Experience</span>
                    <span>
                      {currentPlayer.experience}/{xpForNextLevel}
                    </span>
                  </div>
                  <Progress value={xpPercent} className="h-2 bg-muted" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Sword className="w-4 h-4 text-accent" />
                <span className="text-sm">{currentPlayer.damage}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-info" />
                <span className="text-sm">{currentPlayer.defense}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Card className="bg-card/90 backdrop-blur px-6 py-3">
          <p className="text-sm text-muted-foreground text-center">
            Use <kbd className="px-2 py-1 bg-muted rounded text-xs">WASD</kbd> or{' '}
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Arrow Keys</kbd> to move •{' '}
            <kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> to attack
          </p>
        </Card>
      </div>
    </div>
  );
}
