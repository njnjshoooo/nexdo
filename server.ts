import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Vercel handlers
import welcomeHandler from './api/auth/welcome.ts';
import syncAdminHandler from './api/auth/sync-admin.ts';
import ecpayCreateHandler from './api/ecpay/create.ts';
import ecpayCallbackHandler from './api/ecpay/callback.ts';
import updateUserHandler from './api/admin/update-user.ts';
import createUserHandler from './api/admin/create-user.ts';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  
  // ECPay callback usually URL encoded! So support urlencoded
  app.use(express.urlencoded({ extended: true }));
  // JSON parser for other API routes
  app.use(express.json());

  // ====== Mount API Routes ======
  app.all('/api/auth/welcome', welcomeHandler);
  app.all('/api/auth/sync-admin', syncAdminHandler);
  app.all('/api/ecpay/create', ecpayCreateHandler);
  app.all('/api/ecpay/callback', ecpayCallbackHandler);
  app.all('/api/admin/update-user', updateUserHandler);
  app.all('/api/admin/create-user', createUserHandler);

  // ====== Vite Middleware for Web App ======
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
