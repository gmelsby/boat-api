import { ds, fromDatastore } from '../datastore.js';

const BOAT = "Boat";
/**
 * Return information about boat with the id if the owner is correct
 * @param {string} boatId 
 * @param {string} ownerId 
 * @returns promise resolving to object representing boat
 */
async function getBoat(boatId, ownerId) {
  const boatKey = ds.key([BOAT, parseInt(boatId, 10)]);
  const existingBoatResult = await ds.get(boatKey);

  // check that boat with id actually exists
  if (existingBoatResult[0] === undefined || existingBoatResult[0] === null) {
    return 403;
  }

  // check that ownership is correct for boat
  if (existingBoatResult[0].owner !== ownerId) {
    return 403;
  }

  existingBoatResult[0].id = boatId;
  return existingBoatResult[0];
 
}

/**
 * Returns a promise resolving to an array of all the owner's boats
 * @param {string} ownerId 
 */
async function getOwnersBoats(ownerId, req) {
  let countQuery = ds.createQuery(BOAT).filter("owner", "=", ownerId).select('__key__');
  const countResults = await ds.runQuery(countQuery);
  const count = countResults[0].length;

  let q = ds.createQuery(BOAT).filter("owner", "=", ownerId).limit(5);
  if (Object.keys(req.query).includes("cursor")) {
    q = q.start(req.query.cursor);
  }
  const results = await ds.runQuery(q);

  const reply = {};
  reply.boats = results[0].map(fromDatastore);
  if (results[1].moreResults !== ds.NO_MORE_RESULTS) {
    reply.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + encodeURIComponent(results[1].endCursor);
  }
  reply.count = count;

  return reply;
}

/**
 * Creates and returns a new boat with the passed-in attributes
 * @param {string} name 
 * @param {string} type 
 * @param {number} length 
 * @param {string} owner 
 * @returns promise resolving to object representing new boat
 */
async function postBoat(name, type, length, owner) {
  const key = ds.key(BOAT);
  const newBoat = { name, type, length, owner };
  await ds.save({ "key": key, "data": newBoat });
  console.log(`made new boat ${JSON.stringify(newBoat)}`)
  newBoat.id = key.id;
  return newBoat;
}

/**
 * Edits the boat with the passed-in id.
 * @param {string} boatId 
 * @param {string} ownerId
 * @param {updates} object optionally contains name, length, and type to be updated
 * @returns promise resolving to updated object or integer indicating appropriate code.
 * 403 if boat not found or belongs to another owner
 * updated object if update successful
 */
async function patchBoat(boatId, ownerId, updates) {
  const boatKey = ds.key([BOAT, parseInt(boatId, 10)]);
  const existingBoatResult = await ds.get(boatKey);

  // check boat with id actually exists
  if (existingBoatResult[0] === undefined || existingBoatResult[0] === null) {
    return 403;
  }

  // check boat owner is making request
  if (existingBoatResult[0].owner !== ownerId) {
    return 403;
  }

  // update boat with all passed-in attributes that pertain to boat
  for (const property of ["name", "type", "length"]) {
    if (updates[property] !== undefined && updates[property] !== null) {
      existingBoatResult[0][property] = updates[property];
    }
  }

  // save to datastore
  await ds.save({ "key": boatKey, "data": existingBoatResult[0] });
  // add id to boat
  existingBoatResult[0].id = boatId;
  return existingBoatResult[0];
}

async function putBoat(boatId, ownerId, name, type, length) {
  const boatKey = ds.key([BOAT, parseInt(boatId, 10)]);
  const existingBoatResult = await ds.get(boatKey);

  // check boat actually exists
  if (existingBoatResult[0] === undefined || existingBoatResult[0] === null) {
    return 403;
  }

  // check owner is making request
  if (existingBoatResult[0].owner !== ownerId) {
    return 403;
  }
  
  // update boat
  const newBoat = { name, type, length };
  newBoat.owner = ownerId;
  await ds.save({ "key": boatKey, "data": newBoat});
  // place id back on new boat
  newBoat.id = boatId;
  return newBoat;
}

/**
 * Deletes the boat with the passed-in id.
 * @param {string} boatId 
 * @param {string} ownerId
 * @returns promise resolving to integer indicating appropriate code.
 * 403 if boat not found or belongs to another owner
 * 204 if successful deletion
 */
async function deleteBoat(boatId, ownerId) {
  const boatKey = ds.key([BOAT, parseInt(boatId, 10)]);
  const existingBoatResult = await ds.get(boatKey);

  // check that boat with id actually exists
  if (existingBoatResult[0] === undefined || existingBoatResult[0] === null) {
    return 403;
  }

  // check that ownership is correct for boat
  if (existingBoatResult[0].owner !== ownerId) {
    return 403;
  }

  await ds.delete(boatKey);
  return 204;
}

export { postBoat, getOwnersBoats, getBoat, deleteBoat, patchBoat, putBoat };