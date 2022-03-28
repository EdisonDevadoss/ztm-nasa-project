const axios = require('axios');

const launchesDatabase = require('./launches.mongo');
const plantes = require('./plantes.mongo');

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches() {
  console.log('Downloading lauch data');
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: 'rocket',
          select: {
            name: 1
          }
        },
        {
          path: 'payloads',
          select: {
            customers: 1
          }
        }
      ]
    }
  });

  if (response.status !== 200) {
    console.log('Problem downloading launch data!');
    throw new Error('Launch downalod failed');
  }

  const launchData = response.data.docs;
  for (const launchDoc of launchData) {
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });
    const launch = {
      flightNumber: launchDoc.flight_number,
      mission: launchDoc.name,
      rocket: launchDoc.rocket.name,
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc.upcoming,
      success: launchDoc.success,
      customers
    };
    console.log(`${launch.flightNumber}, ${launch.mission}`);
    await saveLanuch(launch);
    // populate collection
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat'
  });
  if (firstLaunch) {
    console.log('Launch data already loaded...');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existLaunchWithId(launchId) {
  return await findLaunch({ flightNumber: launchId });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort('-flightNumber');
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLanuch(launch) {
  await launchesDatabase.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true
    }
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await plantes.findOne({
    keplerName: launch.target
  });

  if (!planet) {
    throw new Error('No matching is found');
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    success: true,
    upcoming: true,
    customers: ['Zero to Mastery', 'NasA'],
    flightNumber: newFlightNumber
  });
  await saveLanuch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    {
      upcoming: false,
      success: false
    }
  );
  return aborted.modifiedCount == 1;

  // const aborted = launches.get(launchId);
  // aborted.upcoming = false;
  // aborted.success = false;
  // return aborted;
}

module.exports = {
  loadLaunchData,
  existLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById
};
