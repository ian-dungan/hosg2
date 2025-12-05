import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGame } from '@/contexts/GameContext';
import { inventoryApi, questProgressApi } from '@/db/api';
import type { InventoryItem, QuestProgress } from '@/types/types';
import { ArrowLeft, Sword, Shield, Heart, Zap, Coins, Star } from 'lucide-react';

export default function Character() {
  const navigate = useNavigate();
  const { currentPlayer } = useGame();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [quests, setQuests] = useState<QuestProgress[]>([]);

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/menu');
      return;
    }
    loadData();
  }, [currentPlayer, navigate]);

  const loadData = async () => {
    if (!currentPlayer) return;
    try {
      const [inventoryData, questData] = await Promise.all([
        inventoryApi.getByPlayerId(currentPlayer.id),
        questProgressApi.getByPlayerId(currentPlayer.id),
      ]);
      setInventory(inventoryData);
      setQuests(questData);
    } catch (error) {
      console.error('Failed to load character data:', error);
    }
  };

  if (!currentPlayer) return null;

  const xpForNextLevel = currentPlayer.level * 100;
  const xpPercent = (currentPlayer.experience / xpForNextLevel) * 100;

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">{currentPlayer.character_name}</h1>
            <p className="text-muted-foreground">Level {currentPlayer.level} Character</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-health" />
                  <span>Health</span>
                </div>
                <span className="font-bold">{currentPlayer.max_health}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-mana" />
                  <span>Mana</span>
                </div>
                <span className="font-bold">{currentPlayer.max_mana}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-accent" />
                  <span>Damage</span>
                </div>
                <span className="font-bold">{currentPlayer.damage}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-info" />
                  <span>Defense</span>
                </div>
                <span className="font-bold">{currentPlayer.defense}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Experience</span>
                  <span>
                    {currentPlayer.experience}/{xpForNextLevel}
                  </span>
                </div>
                <Progress value={xpPercent} className="h-2" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-experience" />
                  <span>Skill Points</span>
                </div>
                <span className="font-bold text-experience">{currentPlayer.skill_points}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-secondary" />
                  <span>Gold</span>
                </div>
                <span className="font-bold text-secondary">{currentPlayer.gold}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Class</p>
                <p className="font-semibold capitalize">{currentPlayer.class_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-semibold">
                  ({currentPlayer.position_x}, {currentPlayer.position_y})
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-semibold">
                  {new Date(currentPlayer.created_at).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="inventory" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
          </TabsList>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>Your items and equipment</CardDescription>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No items in inventory</p>
                ) : (
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    {inventory.map((invItem) => (
                      <Card key={invItem.id} className="hover:shadow-md transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-semibold rarity-${invItem.item?.rarity}`}>
                              {invItem.item?.name}
                            </span>
                            {invItem.quantity > 1 && (
                              <span className="text-xs text-muted-foreground">
                                x{invItem.quantity}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {invItem.item?.description}
                          </p>
                          {invItem.equipped && (
                            <span className="inline-block px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                              Equipped
                            </span>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quests">
            <Card>
              <CardHeader>
                <CardTitle>Quest Log</CardTitle>
                <CardDescription>Your active and completed quests</CardDescription>
              </CardHeader>
              <CardContent>
                {quests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No quests started</p>
                ) : (
                  <div className="space-y-4">
                    {quests.map((questProgress) => (
                      <Card key={questProgress.id}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{questProgress.quest?.title}</CardTitle>
                            <span
                              className={`px-2 py-1 rounded text-xs font-semibold ${
                                questProgress.status === 'completed'
                                  ? 'bg-success/20 text-success'
                                  : 'bg-warning/20 text-warning'
                              }`}
                            >
                              {questProgress.status}
                            </span>
                          </div>
                          <CardDescription>{questProgress.quest?.description}</CardDescription>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
