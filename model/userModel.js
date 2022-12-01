import { ds, nameFromDatastore } from '../datastore.js'

const USER = 'User';

/**
 * Adds new user information to datastore if user is not already in datastore.
 * @param {string} sub identifying id of the user
 * @param {string} email email of the user
 */
async function createUserIfNew(sub, email) {
  const key = ds.key([USER, sub]);
  const existingUserResult = await ds.get(key);
  if (existingUserResult[0] !== undefined && existingUserResult[0] !== null) {
    return;
  }
 
  await ds.save({ "key": key, "data": { email } });
}

/**
 * Gets a list of all users
 * @returns promise resolving to non-paginated list of all users
 */
async function getUsers() {
  let q = ds.createQuery(USER);
  const results = await ds.runQuery(q);
  results[0] = results[0].map(nameFromDatastore);
  return results[0];
}

export { createUserIfNew, getUsers };