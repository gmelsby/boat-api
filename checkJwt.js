import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv';
dotenv.config();

// middleware to check that the token passed with the request is valid
const checkJwt = auth({
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  audience: process.env.CLIENT_ID,
  tokenSigningAlg: process.env.TOKEN_SIGNING_ALG
});

const handleJwtErrors = (err, req, res, next) => {
  console.log('jwt error middleware activated');
  if (err.status === 401) {
    req.auth = {"error": "Bad Credentials"};
    next();
  }
  else {
    res.status(500).send({"Error": "Something went wrong on our end"});
  }
}

export default checkJwt;
export { handleJwtErrors }