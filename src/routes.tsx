import Home from './pages/Home';
import CharacterCreation from './pages/CharacterCreation';
import MainMenu from './pages/MainMenu';
import Game from './pages/Game';
import Multiplayer from './pages/Multiplayer';
import Character from './pages/Character';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Home',
    path: '/',
    element: <Home />,
  },
  {
    name: 'Character Creation',
    path: '/character-creation',
    element: <CharacterCreation />,
  },
  {
    name: 'Main Menu',
    path: '/menu',
    element: <MainMenu />,
  },
  {
    name: 'Game',
    path: '/game',
    element: <Game />,
  },
  {
    name: 'Multiplayer',
    path: '/multiplayer',
    element: <Multiplayer />,
  },
  {
    name: 'Character',
    path: '/character',
    element: <Character />,
  },
];

export default routes;
