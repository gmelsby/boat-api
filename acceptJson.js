// middleware to respond with a 406 status code if requester does not accept JSON
const acceptJson = (req, res, next) => {
  if (!req.accepts('application/json')) {
    return res.status(406).send({'Error': 'Endpoint only can respond with application/json data'});
  }
  next();
}

export default acceptJson;