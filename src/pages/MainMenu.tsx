import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Users, Play, User, LogOut } from 'lucide-react';

export default function MainMenu() {
  const navigate = useNavigate();
  const { currentPlayer, setCurrentPlayer } = useGame();

  if (!currentPlayer) {
    navigate('/character-creation');
    return null;
  }

  const handleLogout = () => {
    setCurrentPlayer(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-4 gradient-text">Realm of Legends</h1>
          <p className="text-muted-foreground text-xl">
            Welcome back, {currentPlayer.character_name}!
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/game')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Play className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Solo Adventure</CardTitle>
                  <CardDescription>Embark on a solo quest</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Start your adventure alone and explore the realm at your own pace.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all cursor-pointer" onClick={() => navigate('/multiplayer')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <CardTitle>Multiplayer</CardTitle>
                  <CardDescription>Join or create a party</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Team up with up to 3 other players for cooperative gameplay.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Character Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">Level</p>
                <p className="text-2xl font-bold text-experience">{currentPlayer.level}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Health</p>
                <p className="text-2xl font-bold text-health">{currentPlayer.max_health}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mana</p>
                <p className="text-2xl font-bold text-mana">{currentPlayer.max_mana}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gold</p>
                <p className="text-2xl font-bold text-secondary">{currentPlayer.gold}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/character')}>
                <User className="w-4 h-4 mr-2" />
                View Character
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
