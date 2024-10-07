# RESTful API with OAuth 2.0 Authorization

API to manage the relationship between Boats, Loads (pieces of cargo that go on Boats), and Users (people who own Boats).

Data is persisted using Google Cloud Datastore.

Request authorization uses a JWT retrievable with an Auth0 login, and request authentication uses the JWT's `sub` property.

## API  Documentation
Documentation for API endpoints is [here](documentation.md)

## Postman Tests
A suite of Postman tests with a corresponding environment is included in the Postman folder of this repo. \
After obtaining two JWTs from the Auth0 login-enabled site, place them in the Postman environment as `jwt1` and `jwt2`.
