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
  // sends error message if JWT not valid
  if (err.status === 401) {
    return res.status(401).send({"Error": "Bad Credentials"});
  }
  next();
}

export default checkJwt;
export { handleJwtErrors }