import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

function quizSyncPlugin() {
  const dataFilePath = path.resolve(process.cwd(), '.quiz-session-store.json');

  const loadData = () => {
    try {
      if (fs.existsSync(dataFilePath)) {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return {
      lobby: [],
      status: { started: false, showLeaderboard: false, activeQuestion: 0 },
      leaderboard: []
    };
  };

  const saveData = (data) => {
    try {
      fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch {
      // fallback
    }
  };

  let state = loadData();

  const middleware = (req, res, next) => {
    state = loadData();
    const url = req.url?.split('?')[0];

    // Enable CORS for API requests
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    // 0. Cloud Config API (allows any phone/laptop connecting to dev server to sync with Supabase)
    if (url === '/api/quiz/config') {
      if (req.method === 'GET') {
        const envPath = path.resolve(process.cwd(), '.env');
        let envUrl = process.env.VITE_SUPABASE_URL || state.supabaseUrl || '';
        let envKey = process.env.VITE_SUPABASE_ANON_KEY || state.supabaseAnonKey || '';
        if ((!envUrl || !envKey) && fs.existsSync(envPath)) {
          const content = fs.readFileSync(envPath, 'utf-8');
          const urlMatch = content.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
          const keyMatch = content.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
          if (urlMatch) envUrl = urlMatch[1].trim();
          if (keyMatch) envKey = keyMatch[1].trim();
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ supabaseUrl: envUrl, supabaseAnonKey: envKey }));
        return;
      }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { supabaseUrl, supabaseAnonKey } = JSON.parse(body);
            state.supabaseUrl = (supabaseUrl || '').trim();
            state.supabaseAnonKey = (supabaseAnonKey || '').trim();
            saveData(state);

            const envPath = path.resolve(process.cwd(), '.env');
            const envContent = `VITE_SUPABASE_URL=${state.supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${state.supabaseAnonKey}\n`;
            fs.writeFileSync(envPath, envContent, 'utf-8');

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, supabaseUrl: state.supabaseUrl }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid config payload' }));
          }
        });
        return;
      }
    }

    // 1. Lobby participants API
    if (url === '/api/quiz/lobby') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(state.lobby || []));
        return;
      }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const user = JSON.parse(body);
            if (user && user.email) {
              const currentLobby = (state.lobby || []).filter(
                p => p.email?.toLowerCase() !== user.email?.toLowerCase()
              );
              state.lobby = [...currentLobby, { ...user, lastSeen: Date.now() }];
              saveData(state);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, lobby: state.lobby }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
      if (req.method === 'DELETE') {
        state.lobby = [];
        saveData(state);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, lobby: [] }));
        return;
      }
    }

    // 2. Quiz status API (started, showLeaderboard, activeQuestion)
    if (url === '/api/quiz/status') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(state.status || { started: false }));
        return;
      }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const newStatus = JSON.parse(body);
            state.status = { ...(state.status || {}), ...newStatus, updatedAt: Date.now() };
            saveData(state);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, status: state.status }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
    }

    // 3. Leaderboard API
    if (url === '/api/quiz/leaderboard') {
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(state.leaderboard || []));
        return;
      }
      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const entry = JSON.parse(body);
            if (entry && entry.email) {
              const filtered = (state.leaderboard || []).filter(
                item => item.email?.toLowerCase() !== entry.email?.toLowerCase()
              );
              state.leaderboard = [...filtered, entry].sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return (a.timeTaken || 0) - (b.timeTaken || 0);
              });
              saveData(state);
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, leaderboard: state.leaderboard }));
          } catch {
            res.statusCode = 400;
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
        return;
      }
      if (req.method === 'DELETE') {
        state.leaderboard = [];
        saveData(state);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, leaderboard: [] }));
        return;
      }
    }

    next();
  };

  return {
    name: 'quiz-sync-plugin',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    }
  };
}

export default defineConfig({
  plugins: [react(), quizSyncPlugin()],
  assetsInclude: ['**/*.glb', '**/*.gltf'],
  server: {
    host: true,
    port: 5173,
    allowedHosts: true
  }
})
