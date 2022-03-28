const express = require('express');

const { httpGetAllPlantes } = require('./plantes.controller');

const plantesRouter = express.Router();

plantesRouter.get('/', httpGetAllPlantes);

module.exports = plantesRouter;
