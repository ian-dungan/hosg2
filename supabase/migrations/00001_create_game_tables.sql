/*
# Realm of Legends - Game Database Schema

## 1. Overview
This migration creates the core database structure for the Realm of Legends isometric RPG game,
including player characters, items, inventory, quests, and multiplayer session management.

## 2. New Tables

### 2.1 character_classes
- `id` (text, primary key) - Class identifier (warrior, mage, ranger, cleric)
- `name` (text, not null) - Display name
- `description` (text) - Class description
- `base_health` (integer, not null) - Starting health
- `base_mana` (integer, not null) - Starting mana
- `base_damage` (integer, not null) - Starting damage
- `base_defense` (integer, not null) - Starting defense
- `abilities` (jsonb) - Class-specific abilities

### 2.2 players
- `id` (uuid, primary key) - Player identifier
- `character_name` (text, unique, not null) - Character name
- `class_id` (text, references character_classes) - Character class
- `level` (integer, default 1) - Current level
- `experience` (integer, default 0) - Current XP
- `health` (integer, not null) - Current health
- `max_health` (integer, not null) - Maximum health
- `mana` (integer, not null) - Current mana
- `max_mana` (integer, not null) - Maximum mana
- `damage` (integer, not null) - Damage stat
- `defense` (integer, not null) - Defense stat
- `gold` (integer, default 0) - Currency
- `position_x` (integer, default 0) - World X position
- `position_y` (integer, default 0) - World Y position
- `skill_points` (integer, default 0) - Unspent skill points
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### 2.3 items
- `id` (uuid, primary key) - Item identifier
- `name` (text, not null) - Item name
- `description` (text) - Item description
- `type` (text, not null) - Item type (weapon, armor, accessory, consumable)
- `rarity` (text, not null) - Rarity tier (common, uncommon, rare, epic, legendary)
- `stats` (jsonb) - Item stats (damage, defense, health, etc.)
- `stackable` (boolean, default false) - Can stack in inventory
- `max_stack` (integer, default 1) - Maximum stack size
- `icon` (text) - Icon identifier
- `created_at` (timestamptz, default now())

### 2.4 inventory
- `id` (uuid, primary key) - Inventory slot identifier
- `player_id` (uuid, references players, not null) - Owner
- `item_id` (uuid, references items, not null) - Item
- `quantity` (integer, default 1) - Stack quantity
- `slot_index` (integer) - Inventory slot position
- `equipped` (boolean, default false) - Is equipped
- `equipment_slot` (text) - Equipment slot (weapon, armor, accessory)
- `created_at` (timestamptz, default now())

### 2.5 quests
- `id` (uuid, primary key) - Quest identifier
- `title` (text, not null) - Quest title
- `description` (text, not null) - Quest description
- `type` (text, not null) - Quest type (main, side)
- `objectives` (jsonb, not null) - Quest objectives
- `rewards` (jsonb, not null) - Quest rewards (xp, gold, items)
- `required_level` (integer, default 1) - Minimum level
- `prerequisite_quest_id` (uuid, references quests) - Required previous quest
- `created_at` (timestamptz, default now())

### 2.6 quest_progress
- `id` (uuid, primary key) - Progress identifier
- `player_id` (uuid, references players, not null) - Player
- `quest_id` (uuid, references quests, not null) - Quest
- `status` (text, default 'active') - Status (active, completed, failed)
- `progress` (jsonb, default '{}') - Objective progress
- `started_at` (timestamptz, default now())
- `completed_at` (timestamptz) - Completion timestamp

### 2.7 game_sessions
- `id` (uuid, primary key) - Session identifier
- `name` (text, not null) - Session name
- `host_player_id` (uuid, references players, not null) - Host player
- `max_players` (integer, default 4) - Maximum players
- `status` (text, default 'waiting') - Status (waiting, active, completed)
- `game_state` (jsonb, default '{}') - Shared game state
- `created_at` (timestamptz, default now())
- `updated_at` (timestamptz, default now())

### 2.8 session_players
- `id` (uuid, primary key) - Record identifier
- `session_id` (uuid, references game_sessions, not null) - Session
- `player_id` (uuid, references players, not null) - Player
- `joined_at` (timestamptz, default now())
- `is_ready` (boolean, default false) - Ready status

## 3. Security
- No RLS enabled - public game data accessible to all players
- All players can read and modify game data for cooperative gameplay

## 4. Indexes
- Index on player character_name for quick lookups
- Index on inventory player_id for fast inventory queries
- Index on quest_progress (player_id, quest_id) for quest tracking
- Index on session_players (session_id, player_id) for multiplayer

## 5. Functions
- update_player_timestamp: Automatically update updated_at on player changes
- update_session_timestamp: Automatically update updated_at on session changes
