import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { characterClassApi, playerApi } from '@/db/api';
import { useGame } from '@/contexts/GameContext';
import type { CharacterClass } from '@/types/types';
import { Sword, Wand2, Target, Heart } from 'lucide-react';

const classIcons = {
  warrior: Sword,
  mage: Wand2,
  ranger: Target,
  cleric: Heart,
};

export default function CharacterCreation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setCurrentPlayer, characterClasses, setCharacterClasses } = useGame();
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classes = await characterClassApi.getAll();
      setCharacterClasses(classes);
      if (classes.length > 0) {
        setSelectedClass(classes[0]);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load character classes',
        variant: 'destructive',
      });
    }
  };

  const handleCreateCharacter = async () => {
    if (!characterName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a character name',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedClass) {
      toast({
        title: 'Error',
        description: 'Please select a character class',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const player = await playerApi.create({
        character_name: characterName,
        class_id: selectedClass.id,
      });
      setCurrentPlayer(player);
      toast({
        title: 'Success',
        description: `${characterName} has been created!`,
      });
      navigate('/menu');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create character',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 gradient-text">Create Your Hero</h1>
          <p className="text-muted-foreground text-lg">
            Choose your class and embark on an epic adventure
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          {characterClasses.map((charClass) => {
            const Icon = classIcons[charClass.id as keyof typeof classIcons];
            const isSelected = selectedClass?.id === charClass.id;
            return (
              <Card
                key={charClass.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary shadow-lg' : ''
                }`}
                onClick={() => setSelectedClass(charClass)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-8 h-8 text-primary" />}
                    <div>
                      <CardTitle>{charClass.name}</CardTitle>
                      <CardDescription>{charClass.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Health:</span>
                      <span className="font-semibold text-health">{charClass.base_health}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Mana:</span>
                      <span className="font-semibold text-mana">{charClass.base_mana}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Damage:</span>
                      <span className="font-semibold text-accent">{charClass.base_damage}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Defense:</span>
                      <span className="font-semibold text-info">{charClass.base_defense}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2 text-sm">Abilities:</h4>
                    <div className="space-y-1">
                      {charClass.abilities.slice(0, 2).map((ability) => (
                        <div key={ability.id} className="text-xs text-muted-foreground">
                          • {ability.name}: {ability.description}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Character Details</CardTitle>
            <CardDescription>Enter your character name to begin your journey</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="characterName">Character Name</Label>
              <Input
                id="characterName"
                placeholder="Enter your hero's name"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                maxLength={20}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleCreateCharacter}
                disabled={isLoading || !characterName.trim() || !selectedClass}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Character'}
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
