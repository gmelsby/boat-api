# RESTful API with OAuth 2.0 Authorization

API to manage the relationship between Boats, Loads (pieces of cargo that go on Boats), and Users (people who own Boats).

Request authorization uses a JWT retrievable with an Auth0 login at [https://melsbyg-cloud-final.uw.r.appspot.com/](https://melsbyg-cloud-final.uw.r.appspot.com/), and request authentication uses the JWT's `sub` property.

Application deployed at: [https://melsbyg-cloud-final.uw.r.appspot.com](https://melsbyg-cloud-final.uw.r.appspot.com)


## API  Documentation
Documentation for API endpoints is [here](documentation.md)

## Postman Tests
A suite of Postman tests with a corresponding environment is included in the Postman folder of this repo. \
After obtaining two JWTs from the Auth0 login-enabled site, place them in the Postman environment as `jwt1` and `jwt2`.