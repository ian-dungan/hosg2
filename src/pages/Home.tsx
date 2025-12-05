import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useGame } from '@/contexts/GameContext';
import { Sword, Users, Zap, Shield } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();

  useEffect(() => {
    if (currentPlayer) {
      navigate('/menu');
    }
  }, [currentPlayer, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted to-background">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-7xl font-bold mb-6 gradient-text">Realm of Legends</h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Embark on an epic isometric RPG adventure. Choose your class, team up with friends, and
            conquer legendary quests in a browser-based multiplayer experience.
          </p>
          <div className="flex flex-col xl:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/character-creation')} className="text-lg px-8">
              <Sword className="w-5 h-5 mr-2" />
              Start Your Journey
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/menu')} className="text-lg px-8">
              Continue Adventure
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Multiplayer Co-op</h3>
              <p className="text-muted-foreground">
                Team up with up to 4 players for real-time cooperative gameplay
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Class System</h3>
              <p className="text-muted-foreground">
                Choose from 4 unique classes with distinct abilities and playstyles
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-2">Epic Quests</h3>
              <p className="text-muted-foreground">
                Embark on main storyline quests and discover rewarding side missions
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card/50 backdrop-blur">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Game Features</h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Isometric Perspective</h4>
                    <p className="text-sm text-muted-foreground">
                      Classic 45-degree angled view with depth and dimension
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Character Progression</h4>
                    <p className="text-sm text-muted-foreground">
                      Level up, gain experience, and unlock powerful abilities
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Inventory System</h4>
                    <p className="text-sm text-muted-foreground">
                      Collect and equip items with varying rarity tiers
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Real-time Combat</h4>
                    <p className="text-sm text-muted-foreground">
                      Engage in dynamic battles with enemies and bosses
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Quest System</h4>
                    <p className="text-sm text-muted-foreground">
                      Complete main and side quests for rewards and progression
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <h4 className="font-semibold">Browser-Based</h4>
                    <p className="text-sm text-muted-foreground">
                      No download required - play instantly in your web browser
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
