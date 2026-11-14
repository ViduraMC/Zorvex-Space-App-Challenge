import './styles/tokens.css';
import './styles/app.css';
import './styles/player.css';
import './styles/journey.css';
import './styles/anatomy.css';
import { startRouter } from './engine/router';
import { shelfPage } from './features/shelf';
import { aboutPage } from './pages/about';
import { anatomyPage } from './pages/anatomy';
import { journeyPage } from './pages/journey';
import { playerPage } from './pages/player';
import { storyPage } from './pages/story';

startRouter(document.getElementById('app')!, {
  home: journeyPage,
  ep: playerPage,
  story: storyPage,
  shelf: shelfPage,
  about: aboutPage,
  parts: anatomyPage,
});
