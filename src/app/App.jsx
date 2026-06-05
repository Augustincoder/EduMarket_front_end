// src/app/App.jsx
import { AppRouter } from './router';
import { Providers } from './providers';
import { WorkspaceOverlay } from '../components/ui/WorkspaceOverlay';

export default function App() {
  return (
    <Providers>
      <AppRouter />
      <WorkspaceOverlay />
    </Providers>
  );
}
