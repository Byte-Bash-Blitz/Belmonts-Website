import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

function quizSyncPlugin() {
  const dataFilePath = path.resolve(process.cwd(), '.quiz-session-store.json');
  const envFilePath = path.resolve(process.cwd(), '.env');

  const getEnvConfig = () => {
    let url = process.env.VITE_SUPABASE_URL || '';
    let anonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    let secretKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (fs.existsSync(envFilePath)) {
      const content = fs.readFileSync(envFilePath, 'utf-8');
      const uMatch = content.match(/VITE_SUPABASE_URL\s*=\s*(.*)/);
      const aMatch = content.match(/VITE_SUPABASE_ANON_KEY\s*=\s*(.*)/);
      const sMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(.*)/);
      if (uMatch) url = uMatch[1].trim();
      if (aMatch) anonKey = aMatch[1].trim();
      if (sMatch) secretKey = sMatch[1].trim();
    }
    return { url, anonKey, secretKey };
  };

  const getSupabaseAdmin = () => {
    const { url, secretKey, anonKey } = getEnvConfig();
    const keyToUse = secretKey || anonKey;
    if (url && keyToUse && url.startsWith('http')) {
      try {
        return createClient(url, keyToUse);
      } catch {}
    }
    return null;
  };

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

    // 0. Cloud Config API
    if (url === '/api/quiz/config') {
      if (req.method === 'GET') {
        const envConfig = getEnvConfig();
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          supabaseUrl: envConfig.url || state.supabaseUrl || '', 
          supabaseAnonKey: envConfig.anonKey || state.supabaseAnonKey || '' 
        }));
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

              // Auto-sync to Supabase via admin client
              const sb = getSupabaseAdmin();
              if (sb) {
                sb.from('quiz_participants').upsert({
                  id: user.id || `user_${Date.now()}`,
                  name: user.name,
                  email: user.email,
                  role: user.role,
                  status: user.status || 'Ready',
                  avatar: user.avatar,
                  is_host: Boolean(user.isHost || user.is_host)
                }, { onConflict: 'email' }).then(() => {}).catch(() => {});
              }
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
        const sb = getSupabaseAdmin();
        if (sb) {
          sb.from('quiz_participants').delete().neq('email', 'vigneshvelappan73051@gmail.com').then(() => {}).catch(() => {});
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, lobby: [] }));
        return;
      }
    }

    // 2. Quiz status API
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

            const sb = getSupabaseAdmin();
            if (sb) {
              sb.from('quiz_session_state').upsert({
                session_id: 'current_session',
                started: Boolean(state.status.started),
                show_leaderboard: Boolean(state.status.showLeaderboard),
                active_question: state.status.activeQuestion || 0
              }, { onConflict: 'session_id' }).then(() => {}).catch(() => {});
            }

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

              const sb = getSupabaseAdmin();
              if (sb) {
                sb.from('quiz_submissions').upsert({
                  id: entry.id || `sub_${Date.now()}`,
                  name: entry.name,
                  email: entry.email,
                  score: entry.score,
                  max_points: entry.maxPoints,
                  correct_count: entry.correctCount,
                  wrong_count: entry.wrongCount,
                  unattempted_count: entry.unattemptedCount,
                  total_questions: entry.totalQuestions,
                  accuracy: entry.percentage,
                  time_taken: entry.timeTaken,
                  answers: entry.answers,
                  completed_at: new Date().toISOString()
                }, { onConflict: 'email' }).then(() => {}).catch(() => {});
              }
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
        const sb = getSupabaseAdmin();
        if (sb) {
          sb.from('quiz_submissions').delete().neq('id', 'preserve_none').then(() => {}).catch(() => {});
        }
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
