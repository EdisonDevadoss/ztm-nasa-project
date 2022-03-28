const { parse } = require('csv-parse');
const path = require('path');
const fs = require('fs');

const plantes = require('./plantes.mongo');

function isHabitablePlantes(planet) {
  return (
    planet['koi_disposition'] === 'CONFIRMED' &&
    planet['koi_insol'] > 0.36 &&
    planet['koi_insol'] < 1.11 &&
    planet['koi_prad'] < 1.6
  );
}

function loadPlantesData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(
      path.join(__dirname, '..', '..', 'data', 'kepler_data.csv')
    )
      .pipe(
        parse({
          comment: '#',
          columns: true
        })
      )
      .on('data', async (data) => {
        if (isHabitablePlantes(data)) {
          // habitablePlantes.push(data);
          await savePlanent(data);
        }
      })
      .on('error', (err) => {
        console.log('err', err);
        reject(err);
      })
      .on('end', async () => {
        const countPlantesFound = (await getAllPlantes()).length;
        console.log(`${countPlantesFound} habitable plantes`);
        resolve();
      });
  });
}

async function getAllPlantes() {
  return await plantes.find({});
}

async function savePlanent(data) {
  try {
    await plantes.updateOne(
      { keplerName: data.kepler_name },
      { keplerName: data.kepler_name },
      { upsert: true }
    );
  } catch (error) {
    console.log(`Could not save: ${error}`);
  }
}

module.exports = { loadPlantesData, getAllPlantes };
