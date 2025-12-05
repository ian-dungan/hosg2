import { supabase } from './supabase';
import type {
  CharacterClass,
  Player,
  Item,
  InventoryItem,
  Quest,
  QuestProgress,
  GameSession,
  SessionPlayer,
} from '@/types/types';

export const characterClassApi = {
  getAll: async (): Promise<CharacterClass[]> => {
    const { data, error } = await supabase
      .from('character_classes')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<CharacterClass | null> => {
    const { data, error } = await supabase
      .from('character_classes')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const playerApi = {
  create: async (playerData: {
    character_name: string;
    class_id: string;
  }): Promise<Player> => {
    const characterClass = await characterClassApi.getById(playerData.class_id);
    if (!characterClass) throw new Error('Invalid character class');

    const { data, error } = await supabase
      .from('players')
      .insert({
        character_name: playerData.character_name,
        class_id: playerData.class_id,
        health: characterClass.base_health,
        max_health: characterClass.base_health,
        mana: characterClass.base_mana,
        max_mana: characterClass.base_mana,
        damage: characterClass.base_damage,
        defense: characterClass.base_defense,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getById: async (id: string): Promise<Player | null> => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getByName: async (name: string): Promise<Player | null> => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('character_name', name)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  update: async (id: string, updates: Partial<Player>): Promise<Player> => {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updatePosition: async (id: string, x: number, y: number): Promise<void> => {
    const { error } = await supabase
      .from('players')
      .update({ position_x: x, position_y: y })
      .eq('id', id);
    if (error) throw error;
  },

  gainExperience: async (id: string, xp: number): Promise<Player> => {
    const player = await playerApi.getById(id);
    if (!player) throw new Error('Player not found');

    const newXp = player.experience + xp;
    const xpForNextLevel = player.level * 100;
    let newLevel = player.level;
    let remainingXp = newXp;
    let skillPoints = player.skill_points;

    while (remainingXp >= xpForNextLevel) {
      remainingXp -= xpForNextLevel;
      newLevel++;
      skillPoints += 3;
    }

    const updates: Partial<Player> = {
      experience: remainingXp,
      level: newLevel,
      skill_points: skillPoints,
    };

    if (newLevel > player.level) {
      updates.max_health = player.max_health + (newLevel - player.level) * 10;
      updates.max_mana = player.max_mana + (newLevel - player.level) * 5;
      updates.damage = player.damage + (newLevel - player.level) * 2;
      updates.defense = player.defense + (newLevel - player.level) * 1;
      updates.health = updates.max_health;
      updates.mana = updates.max_mana;
    }

    return playerApi.update(id, updates);
  },
};

export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .order('rarity', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Item | null> => {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },
};

export const inventoryApi = {
  getByPlayerId: async (playerId: string): Promise<InventoryItem[]> => {
    const { data, error } = await supabase
      .from('inventory')
      .select('*, item:items(*)')
      .eq('player_id', playerId)
      .order('slot_index', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  addItem: async (
    playerId: string,
    itemId: string,
    quantity: number = 1
  ): Promise<InventoryItem> => {
    const item = await itemApi.getById(itemId);
    if (!item) throw new Error('Item not found');

    if (item.stackable) {
      const existing = await supabase
        .from('inventory')
        .select('*')
        .eq('player_id', playerId)
        .eq('item_id', itemId)
        .eq('equipped', false)
        .maybeSingle();

      if (existing.data) {
        const newQuantity = Math.min(
          existing.data.quantity + quantity,
          item.max_stack
        );
        const { data, error } = await supabase
          .from('inventory')
          .update({ quantity: newQuantity })
          .eq('id', existing.data.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        player_id: playerId,
        item_id: itemId,
        quantity,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  removeItem: async (inventoryId: string): Promise<void> => {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', inventoryId);
    if (error) throw error;
  },

  equipItem: async (
    inventoryId: string,
    equipmentSlot: string
  ): Promise<InventoryItem> => {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        equipped: true,
        equipment_slot: equipmentSlot,
      })
      .eq('id', inventoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  unequipItem: async (inventoryId: string): Promise<InventoryItem> => {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        equipped: false,
        equipment_slot: null,
      })
      .eq('id', inventoryId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const questApi = {
  getAll: async (): Promise<Quest[]> => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .order('required_level', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<Quest | null> => {
    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  getAvailableForPlayer: async (playerId: string): Promise<Quest[]> => {
    const player = await playerApi.getById(playerId);
    if (!player) return [];

    const { data: progress } = await supabase
      .from('quest_progress')
      .select('quest_id')
      .eq('player_id', playerId);

    const completedQuestIds = progress?.map((p) => p.quest_id) || [];

    const { data, error } = await supabase
      .from('quests')
      .select('*')
      .lte('required_level', player.level)
      .not('id', 'in', `(${completedQuestIds.join(',') || 'null'})`)
      .order('required_level', { ascending: true });

    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },
};

export const questProgressApi = {
  getByPlayerId: async (playerId: string): Promise<QuestProgress[]> => {
    const { data, error } = await supabase
      .from('quest_progress')
      .select('*, quest:quests(*)')
      .eq('player_id', playerId)
      .order('started_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  startQuest: async (
    playerId: string,
    questId: string
  ): Promise<QuestProgress> => {
    const { data, error } = await supabase
      .from('quest_progress')
      .insert({
        player_id: playerId,
        quest_id: questId,
        status: 'active',
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateProgress: async (
    id: string,
    progress: Record<string, number>
  ): Promise<QuestProgress> => {
    const { data, error } = await supabase
      .from('quest_progress')
      .update({ progress })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  completeQuest: async (id: string): Promise<QuestProgress> => {
    const { data, error } = await supabase
      .from('quest_progress')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
};

export const sessionApi = {
  create: async (
    name: string,
    hostPlayerId: string
  ): Promise<GameSession> => {
    const { data, error } = await supabase
      .from('game_sessions')
      .insert({
        name,
        host_player_id: hostPlayerId,
      })
      .select()
      .single();
    if (error) throw error;

    await sessionApi.addPlayer(data.id, hostPlayerId);
    return data;
  },

  getAll: async (): Promise<GameSession[]> => {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<GameSession | null> => {
    const { data, error } = await supabase
      .from('game_sessions')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  addPlayer: async (
    sessionId: string,
    playerId: string
  ): Promise<SessionPlayer> => {
    const { data, error } = await supabase
      .from('session_players')
      .insert({
        session_id: sessionId,
        player_id: playerId,
      })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  getPlayers: async (sessionId: string): Promise<SessionPlayer[]> => {
    const { data, error } = await supabase
      .from('session_players')
      .select('*, player:players(*)')
      .eq('session_id', sessionId)
      .order('joined_at', { ascending: true });
    if (error) throw error;
    return Array.isArray(data) ? data : [];
  },

  updateGameState: async (
    sessionId: string,
    gameState: Record<string, any>
  ): Promise<void> => {
    const { error } = await supabase
      .from('game_sessions')
      .update({ game_state: gameState })
      .eq('id', sessionId);
    if (error) throw error;
  },

  startSession: async (sessionId: string): Promise<void> => {
    const { error } = await supabase
      .from('game_sessions')
      .update({ status: 'active' })
      .eq('id', sessionId);
    if (error) throw error;
  },
};
