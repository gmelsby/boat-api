import express from 'express';
import { router as boatRoutes } from './controller/boatController.js';
import { router as loadRoutes } from './controller/loadController.js';
import { router as userRoutes } from './controller/userController.js';
import { createUserIfNew } from './model/userModel.js';
import pkg from 'express-openid-connect';
const { auth, requiresAuth } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// setup for auth0
const authConfig = {
  authRequired: false,
  auth0Logout: true,
  baseURL: process.env.BASE_URL,
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.ISSUER_BASE_URL,
  secret: process.env.LONG_RANDOM_STRING
}

const app = express();

// allow https on google app engine through proxy
app.set('trust proxy', true)

// allows rendering of pug templates
app.set('view engine', 'pug');

// set up routes
app.use('/boats', boatRoutes);
app.use('/loads', loadRoutes);
app.use('/users', userRoutes);
// use authentication for /login /logout and /callback
app.use(auth(authConfig));

// displays homepage if not authenticated, otherwise takes authenticated user to info page
app.get('/', (req,res) => {
  if (req.oidc.isAuthenticated()) {
    res.redirect('/userinfo');
  }
  else {
    res.render('homepage');
  }
});

// page to show user their jwt for API use
app.get('/userinfo', requiresAuth(), (req, res) => {
  console.log(JSON.stringify(req.oidc.user));

  createUserIfNew(req.oidc.user.sub, req.oidc.user.email)
    .then(() => {
      res.render('userinfo', {
        email: req.oidc.user.email,
        sub: req.oidc.user.sub,
        jwt: req.oidc.idToken
      });
    })
    .catch(e => {
      console.log(e);

    })

});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});
