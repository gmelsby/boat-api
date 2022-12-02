import { ds, fromDatastore } from '../datastore.js';

const LOAD = "Load";
/**
 * Return information about load with the id if exists
 * @param {string} loadId 
 * @returns promise resolving to object representing load
 */
async function getLoad(loadId) {
  const loadKey = ds.key([LOAD, parseInt(loadId, 10)]);
  const loadResult = await ds.get(loadKey);

  // check that load with id actually exists
  if (loadResult[0] === undefined || loadResult[0] === null) {
    return 404;
  }

  return loadResult.map(fromDatastore)[0];
}

/**
 * Returns a promise resolving to an array of all loads, paginated with 5 loads per page
 * @param {object} req the request object
 * @returns promise resolving to object containing list of all loads, 5 loads per page
 */
async function getLoads(req) {
  let countQuery = ds.createQuery(LOAD).select('__key__');
  const countResults = await ds.runQuery(countQuery);
  const count = countResults[0].length;

  let q = ds.createQuery(LOAD).limit(5);
  if (Object.keys(req.query).includes("cursor")) {
    q = q.start(req.query.cursor);
  }
  const results = await ds.runQuery(q);

  const reply = {};
  reply.loads = results[0].map(fromDatastore);
  if (results[1].moreResults !== ds.NO_MORE_RESULTS) {
    reply.next = req.protocol + "://" + req.get("host") + req.baseUrl + "?cursor=" + encodeURIComponent(results[1].endCursor);
  }
  reply.count = count;

  return reply;
}

/**
 * Creates and returns a new load with the passed-in attributes
 * @param {number} volume
 * @param {string} item 
 * @param {string} creation_date 
 * @returns promise resolving to object representing new load
 */
async function postLoad(volume, item, creation_date) {
  const key = ds.key(LOAD);
  const newLoad = { volume, item, creation_date };
  newLoad.carrier = null;
  await ds.save({ "key": key, "data": newLoad });
  newLoad.id = key.id;
  return newLoad;
}

/**
 * Edits the load with the passed-in id.
 * @param {string} loadId 
 * @param {updates} object optionally contains volume, item, and creation_date to be updated
 * @returns promise resolving to either updated object or integer indicating appropriate code.
 * 404 if load does not exist
 * new object if successful patch
 */
async function patchLoad(loadId, updates) {
  const loadKey = ds.key([LOAD, parseInt(loadId, 10)]);
  const existingLoad = await ds.get(loadKey);

  // check load with id actually exists
  if (existingLoad[0] === undefined || existingLoad[0] === null) {
    return 404;
  }

  // update load with all passed-in attributes that pertain to load
  for (const property of ["volume", "item", "creation_date"]) {
    if (updates[property] !== undefined && updates[property] !== null) {
      existingLoad[0][property] = updates[property];
    }
  }

  // save to datastore
  await ds.save({ "key": loadKey, "data": existingLoad[0] });
  // add id to load
  existingLoad[0].id = loadId;
  return existingLoad[0];
}

async function putLoad(loadId, volume, item, creation_date) {
  const loadKey = ds.key([LOAD, parseInt(loadId, 10)]);
  const existingLoad = await ds.get(loadKey);

  // check load actually exists
  if (existingLoad[0] === undefined || existingLoad[0] === null) {
    return 404;
  }

  // update load
  const newLoad = { volume, item, creation_date };
  newLoad.carrier = existingLoad[0].carrier;
  await ds.save({ "key": loadKey, "data": newLoad });
  // place id on new load
  newLoad.id = loadId;
  return newLoad;
}

/**
 * Deletes the load with the passed-in id.
 * @param {string} loadId 
 * @returns promise resolving to integer indicating appropriate code.
 * 404 if load does not exist
 * 204 if successful deletion
 */
async function deleteLoad(loadId) {
  const loadKey = ds.key([LOAD, parseInt(loadId, 10)]);
  const existingLoad = await ds.get(loadKey);

  // check that load with id actually exists
  if (existingLoad[0] === undefined || existingLoad[0] === null) {
    return 404;
  }

  await ds.delete(loadKey);
  return 204;
}

export { getLoad, getLoads, postLoad, patchLoad, putLoad, deleteLoad };