import { ds, fromDatastore } from '../datastore.js'

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
    console.log("user already exists");
    return;
  }
 
  await ds.save({ "key": key, "data": { email } });
}

export { createUserIfNew };