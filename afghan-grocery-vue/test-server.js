const jsonServer = require('json-server');
console.log('json-server loaded');
const server = jsonServer.create();
console.log('server created');
server.listen(3001, () => {
    console.log('Server running on port 3001');
});
