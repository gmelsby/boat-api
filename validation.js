/**
 * Validates whether a boat name or type is valid or not
 * A boat name or type must be a string between 1 and 25 characters (inclusive)
 * There must not be whitespace at the beginning or end of the name or type
 * @param {boat_string} string
 * @returns: boolean indicating whether boat string is valid or not
 */
const boatStringIsValid = (boat_string) => {
  // makes sure type of boat_string is string
  if (typeof boat_string !== 'string') {
    return false;
  }

  // length test
  if (boat_string.length <= 0 || boat_string.length > 30) {
    return false;
  }

  for (const char of '<>{}[]') {
    if (boat_string.includes(char)) {
      return false;
    }
  }

  // whitespace test
  if (boat_string.trim() !== boat_string) {
    return false;
  }

  return true;
} 

const lengthIsValid = (boat_length) => {
  // checks length is a number
  if (typeof boat_length !== 'number') {
    return false;
  }

  // checks length is non-negative
  if (boat_length <= 0) {
    return false;
  }

  if (!Number.isInteger(boat_length)) {
    return false;
  }

  return true;
}


/**
 * Ensures that the boat about to be added has valid properties and all properties are present
 * @param {requestBody} object body of the request to be processed
 * @param {isPatch} boolean if true, don't check that all properties are present
 * @returns object indicating the specific error if exists. If no error exists, empty object
 */
const boatBodyIsValid = (requestBody, isPatch) => {
  // check all included properties are valid
  for (const property of Object.keys(requestBody)) {
    if (!['name', 'type', 'length'].includes(property)) {
      return { "Error": "One or more properties in the request are not valid"};
    }
  }

  // check all required attributes are present if we're not patching
  if (!isPatch) {
    for (const attribute of [requestBody['name'], requestBody['type'], requestBody['length']]) {
      if (attribute === undefined || attribute === null) {
        return { "Error": "Request is missing one or more required properties" };
      }
    }
  }

  // check that name, if exists, is valid
  if (Object.keys(requestBody).includes('name') && !boatStringIsValid(requestBody['name'])) {
    return { "Error": "name value in request is not valid"};
  }

  // check that type, if exists, is valid
  if (Object.keys(requestBody).includes('type') && !boatStringIsValid(requestBody['type'])) {
    return { "Error": "type value in request is not valid"};
  }

  // check that length, if exists, is valid
  if (Object.keys(requestBody).includes('length') && !lengthIsValid(requestBody['length'])) {
    return { "Error": "length value in request is not valid"};
  }

  return {};
}

/**
 * 
 */
const creationDateIsValid = (date) => {
  // makes sure type of date is string
  if (typeof date !== 'string') {
    return false;
  }

  // length test
  if (date.length !== 10) {
    return false;
  }

  // whitespace test
  if (date.trim() !== date) {
    return false;
  }

  // split into parts based on '/'
  const dateParts = date.split("/");
  if (dateParts.length !== 3) {
    return false;
  }

  if (dateParts[0].length !== 2 || isNaN(parseInt(dateParts[0]))) {
    return false;
  }

  if (dateParts[1].length !== 2 || isNaN(parseInt(dateParts[1]))) {
    return false;
  }

  if (dateParts[2].length !== 4 || isNaN(parseInt(dateParts[2]))) {
    return false;
  }

  return true;
}

/**
 * Ensures that the load about to be added has valid properties and all properties are present
 * @param {requestBody} object body of the request to be processed
 * @param {isPatch} boolean if true, don't check that all properties are present
 * @returns object indicating the specific error if exists. If no error exists, empty object
 */
const loadBodyIsValid = (requestBody, isPatch) => {
  // check all included properties are valid
  for (const property of Object.keys(requestBody)) {
    if (!['volume', 'item', 'creation_date'].includes(property)) {
      return { "Error": "One or more properties in the request are not valid"};
    }
  }

  // check all required attributes are present if we're not patching
  if (!isPatch) {
    for (const attribute of [requestBody['volume'], requestBody['item'], requestBody['creation_date']]) {
      if (attribute === undefined || attribute === null) {
        return { "Error": "Request is missing one or more required properties" };
      }
    }
  }

  // check that volume, if exists, is valid
  if (Object.keys(requestBody).includes('volume') && !lengthIsValid(requestBody['volume'])) {
    return { "Error": "volume value in request is not valid" };
  }

  // check that item, if exists, is valid
  if (Object.keys(requestBody).includes('item') && !boatStringIsValid(requestBody['item'])) {
    return { "Error": "item value in request is not valid" };
  }

  // check that creation_date, if exists, is valid
  if (Object.keys(requestBody).includes('creation_date') && !creationDateIsValid(requestBody['creation_date'])) {
    return { "Error": "creation_date value in request is not valid" };
  }

  return {};
}

export { boatBodyIsValid, loadBodyIsValid };