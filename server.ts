import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initDb, getDatabaseStatus } from './server/db.ts';
import authRouter from './server/routes/auth.ts';
import productsRouter from './server/routes/products.ts';
import cartRouter from './server/routes/cart.ts';
import ordersRouter from './server/routes/orders.ts';
import reviewsRouter from './server/routes/reviews.ts';
import adminRouter from './server/routes/admin.ts';
import contactRouter from './server/routes/contact.ts';

async function startServer() {
  // Initialize Database and seed data
  await initDb();

  const app = express();
  // Keep the API and Vite middleware on one origin in the default dev setup,
  // while still allowing hosting providers to supply their own port.
  const configuredPort = Number.parseInt(process.env.PORT || '', 10);
  const PORT = Number.isFinite(configuredPort) && configuredPort > 0 ? configuredPort : 3000;

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      brand: 'DEITY CAPS',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      database: getDatabaseStatus()
    });
  });

  // Safe Public Config endpoint (Exposing non-sensitive config like Google Client ID)
  app.get('/api/config', (req, res) => {
    const googleClientId = process.env.GOOGLE_CLIENT_ID || '1052374708506-q7as92m0pm73q6dml6vlmu8o0pul7s7l.apps.googleusercontent.com';
    res.json({
      googleClientId,
      database: getDatabaseStatus(),
      brand: 'DEITY CAPS'
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/cart', cartRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/contact', contactRouter);

  // Browsers and dev proxies can cancel an in-flight request during a route
  // change or reload. Express's JSON parser surfaces that as a noisy
  // `BadRequestError: request aborted`; it is not an application failure.
  app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (error?.type === 'request.aborted' || error?.code === 'ECONNABORTED') {
      if (!res.headersSent && !req.destroyed) {
        res.status(400).json({ success: false, message: 'Request was cancelled before it completed.' });
      }
      return;
    }
    next(error);
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DEITY CAPS] Server running on http://localhost:${PORT}`);
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`[DEITY CAPS] Port ${PORT} is already in use. Stop the existing server or set PORT to an available port.`);
      return;
    }
    console.error('[DEITY CAPS] Server error:', error);
  });
}

startServer().catch(err => {
  console.error('[DEITY CAPS] Fatal server startup error:', err);
  process.exit(1);
});
