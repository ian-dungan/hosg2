import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { sessionApi } from '@/db/api';
import { useGame } from '@/contexts/GameContext';
import type { GameSession } from '@/types/types';
import { Users, Plus, ArrowLeft, Play } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Multiplayer() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentPlayer, setSessionId } = useGame();
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [sessionName, setSessionName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentPlayer) {
      navigate('/menu');
      return;
    }
    loadSessions();
  }, [currentPlayer, navigate]);

  const loadSessions = async () => {
    try {
      const data = await sessionApi.getAll();
      setSessions(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load sessions',
        variant: 'destructive',
      });
    }
  };

  const handleCreateSession = async () => {
    if (!currentPlayer) return;

    if (!sessionName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a session name',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const session = await sessionApi.create(sessionName, currentPlayer.id);
      setSessionId(session.id);
      toast({
        title: 'Success',
        description: 'Session created successfully',
      });
      setIsDialogOpen(false);
      navigate('/lobby');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSession = async (sessionId: string) => {
    if (!currentPlayer) return;

    setIsLoading(true);
    try {
      await sessionApi.addPlayer(sessionId, currentPlayer.id);
      setSessionId(sessionId);
      toast({
        title: 'Success',
        description: 'Joined session successfully',
      });
      navigate('/lobby');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to join session',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-background to-muted">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Multiplayer Lobby</h1>
            <p className="text-muted-foreground">Join or create a game session</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/menu')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-6">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full xl:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Create New Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Game Session</DialogTitle>
                <DialogDescription>
                  Create a new multiplayer session for up to 4 players
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionName">Session Name</Label>
                  <Input
                    id="sessionName"
                    placeholder="Enter session name"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <Button onClick={handleCreateSession} disabled={isLoading} className="w-full">
                  {isLoading ? 'Creating...' : 'Create Session'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {sessions.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="w-16 h-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  No active sessions found. Create one to get started!
                </p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card key={session.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{session.name}</CardTitle>
                      <CardDescription>
                        Created {new Date(session.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {session.status === 'waiting' ? '1' : '?'}/{session.max_players}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                          session.status === 'waiting'
                            ? 'bg-success/20 text-success'
                            : 'bg-warning/20 text-warning'
                        }`}
                      >
                        {session.status === 'waiting' ? 'Waiting' : 'In Progress'}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleJoinSession(session.id)}
                      disabled={isLoading || session.status !== 'waiting'}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
