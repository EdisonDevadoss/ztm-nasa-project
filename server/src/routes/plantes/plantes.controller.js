const { getAllPlantes } = require('../../models/plantes.model');

async function httpGetAllPlantes(req, res) {
  return res.status(200).json(await getAllPlantes());
}

module.exports = { httpGetAllPlantes };
