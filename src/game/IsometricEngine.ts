import type { PlayerState, Enemy, Projectile } from '@/types/types';

export class IsometricEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileWidth = 64;
  private tileHeight = 32;
  private cameraX = 0;
  private cameraY = 0;
  private mapWidth = 50;
  private mapHeight = 50;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get canvas context');
    this.ctx = context;
    this.resizeCanvas();
  }

  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  cartesianToIsometric(x: number, y: number): { isoX: number; isoY: number } {
    const isoX = (x - y) * (this.tileWidth / 2);
    const isoY = (x + y) * (this.tileHeight / 2);
    return { isoX, isoY };
  }

  isometricToCartesian(isoX: number, isoY: number): { x: number; y: number } {
    const x = (isoX / (this.tileWidth / 2) + isoY / (this.tileHeight / 2)) / 2;
    const y = (isoY / (this.tileHeight / 2) - isoX / (this.tileWidth / 2)) / 2;
    return { x, y };
  }

  screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
    const worldIsoX = screenX - this.canvas.width / 2 + this.cameraX;
    const worldIsoY = screenY - this.canvas.height / 2 + this.cameraY;
    return this.isometricToCartesian(worldIsoX, worldIsoY);
  }

  setCamera(x: number, y: number) {
    const { isoX, isoY } = this.cartesianToIsometric(x, y);
    this.cameraX = isoX;
    this.cameraY = isoY;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawTile(x: number, y: number, color: string) {
    const { isoX, isoY } = this.cartesianToIsometric(x, y);
    const screenX = isoX - this.cameraX + this.canvas.width / 2;
    const screenY = isoY - this.cameraY + this.canvas.height / 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.moveTo(screenX, screenY);
    this.ctx.lineTo(screenX + this.tileWidth / 2, screenY + this.tileHeight / 2);
    this.ctx.lineTo(screenX, screenY + this.tileHeight);
    this.ctx.lineTo(screenX - this.tileWidth / 2, screenY + this.tileHeight / 2);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    this.ctx.stroke();
  }

  drawMap() {
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const isPath = (x + y) % 3 === 0;
        const color = isPath ? '#8b7355' : '#6b8e23';
        this.drawTile(x, y, color);
      }
    }
  }

  drawPlayer(player: PlayerState, color: string) {
    const { isoX, isoY } = this.cartesianToIsometric(player.x, player.y);
    const screenX = isoX - this.cameraX + this.canvas.width / 2;
    const screenY = isoY - this.cameraY + this.canvas.height / 2;

    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY - 20, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 12px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(player.character_name, screenX, screenY - 40);

    this.drawHealthBar(screenX, screenY - 50, player.health, player.max_health);
  }

  drawEnemy(enemy: Enemy) {
    if (!enemy.isAlive) return;

    const { isoX, isoY } = this.cartesianToIsometric(enemy.x, enemy.y);
    const screenX = isoX - this.cameraX + this.canvas.width / 2;
    const screenY = isoY - this.cameraY + this.canvas.height / 2;

    this.ctx.fillStyle = '#8b0000';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY - 20, 12, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '10px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(enemy.name, screenX, screenY - 35);

    this.drawHealthBar(screenX, screenY - 45, enemy.health, enemy.max_health);
  }

  drawProjectile(projectile: Projectile) {
    const { isoX, isoY } = this.cartesianToIsometric(projectile.x, projectile.y);
    const screenX = isoX - this.cameraX + this.canvas.width / 2;
    const screenY = isoY - this.cameraY + this.canvas.height / 2;

    this.ctx.fillStyle = '#ffff00';
    this.ctx.beginPath();
    this.ctx.arc(screenX, screenY - 15, 5, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.shadowColor = '#ffff00';
    this.ctx.shadowBlur = 10;
    this.ctx.fill();
    this.ctx.shadowBlur = 0;
  }

  drawHealthBar(x: number, y: number, current: number, max: number) {
    const barWidth = 40;
    const barHeight = 4;
    const percentage = Math.max(0, Math.min(1, current / max));

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    this.ctx.fillStyle = percentage > 0.5 ? '#00ff00' : percentage > 0.25 ? '#ffff00' : '#ff0000';
    this.ctx.fillRect(x - barWidth / 2, y, barWidth * percentage, barHeight);
  }

  render(
    players: Map<string, PlayerState>,
    enemies: Enemy[],
    projectiles: Projectile[],
    currentPlayerId: string
  ) {
    this.clear();
    this.drawMap();

    enemies.forEach((enemy) => this.drawEnemy(enemy));
    projectiles.forEach((projectile) => this.drawProjectile(projectile));

    players.forEach((player, id) => {
      const color = id === currentPlayerId ? '#9333ea' : '#3b82f6';
      this.drawPlayer(player, color);
    });
  }
}
