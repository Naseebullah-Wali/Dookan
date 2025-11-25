const jsonServer = require('json-server');
const auth = require('./auth.cjs');
const path = require('path');

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Serve static files from public directory
server.use('/images', jsonServer.defaults.static(path.join(__dirname, '../public/images')));

// Use default middlewares (logger, static, cors and no-cache)
server.use(middlewares);

// Add JSON body parser (required for auth middleware)
server.use(jsonServer.bodyParser);

// Use custom auth middleware
server.use(auth);

// Use router
server.use(router);

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`JSON Server is running on http://localhost:${PORT}`);
    console.log(`Serving static images from public/images`);
    console.log(`Custom authentication enabled (plain text passwords)`);
});
