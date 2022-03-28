const mongoose = require('mongoose');
require('dotenv').config()

const MONGO_URL = process.env.MONGO_URL;

mongoose.connection.once('open', () => {
  console.log('mogodb connected');
});

mongoose.connection.on('error', (err) => {
  console.error(err);
});

async function monogConnect() {
  await mongoose.connect(MONGO_URL);
}

async function mongoDisconnect() {
  await mongoose.disconnect();
}

module.exports = { monogConnect, mongoDisconnect };
