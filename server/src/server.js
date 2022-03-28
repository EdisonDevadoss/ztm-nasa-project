const http = require('http');
require('dotenv').config();

const app = require('./app');

const { loadPlantesData } = require('./models/plantes.model');
const { monogConnect } = require('./services/mongo');
const { loadLaunchData } = require('./models/launches.model');

const PORT = process.env.PORT || 8000;

const server = http.createServer(app);

async function startServer() {
  await monogConnect();
  await loadPlantesData();
  await loadLaunchData();
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
}

startServer();
