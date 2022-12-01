import express from 'express';
import bodyParser from 'body-parser';
import * as model from '../model/boatModel.js';
import checkJwt, { handleJwtErrors } from '../checkJwt.js';
import { boatBodyIsValid } from '../validation.js';
import acceptJson from '../acceptJson.js';



const router = express.Router();
router.use(bodyParser.json());

// citation for following middleware:
// https://github.com/expressjs/express/issues/4065
router.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
      console.error(err);
      return res.status(400).send({ Error: err.message }); // Bad request
  }
  next();
});


router.post('/', checkJwt, handleJwtErrors, (req, res) => {
  // check that boat body is valid
  const validation_results = boatBodyIsValid(req.body);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  // creates and sends new boat if Jwt valid
  const sub = req.auth.payload.sub;
  model.postBoat(req.body.name, req.body.type, req.body.length, sub)
    .then(createdBoat => {
      createdBoat.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + createdBoat.id;
      return res.status(201).send(createdBoat);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});


router.get('/:boatId', acceptJson, checkJwt, handleJwtErrors, (req, res) => {
  // return 401 if authentication error
  if (req.auth.error !== undefined) {
    return res.status(401).send({"Error": "Bad Credentials"});
  }

  // check that boatId is a number
  if (isNaN(req.params.boatId)) {
    return res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
  }
  

  // send boat
  const sub = req.auth.payload.sub;
  model.getBoat(req.params.boatId, sub)
    .then(boat => {
        if (boat === 403) {
          return res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
        }
        boat.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + boat.id;
        boat.loads = boat.loads.map(l =>({"id": l.id, "self": req.protocol + "://" + req.get("host") + '/loads/' + l.id}));
        return res.status(200).send(boat);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});


router.get('/', acceptJson, checkJwt, handleJwtErrors, (req, res) => {
  // return 401 if authentication error
  if (req.auth.error !== undefined) {
    return res.status(401).send({"Error": "Bad Credentials"});
  }
  // sends owner's boats if Jwt is valid
  else {
    const sub = req.auth.payload.sub;
    model.getOwnersBoats(sub, req)
      .then(reply => {
        reply.boats.forEach(boat => {
          boat.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + boat.id;
          boat.loads = boat.loads.map(l =>({"id": l.id, "self": req.protocol + "://" + req.get("host") + '/loads/' + l.id}));
        });
        return res.status(200).send(reply);
      })
      .catch(err => {
        if (err.code === 3) {
          res.status(400).json({"Error": "Cursor in request params not recognized"});
        }
        else {
          console.log(err);
          res.status(500).send({"Error": "Something went wrong on our end"});
        }
      });
  }
});

router.put('/:boatId', acceptJson, checkJwt, handleJwtErrors, (req, res) => {
  // we know boat doesn't exist if id isn't a number
  if (isNaN(req.params.boatId)) {
    return res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
  }

  // check that boat body is valid
  const validation_results = boatBodyIsValid(req.body);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  // patch the boat
  const sub = req.auth.payload.sub;
  model.putBoat(req.params.boatId, sub, req.body.name, req.body.type, req.body.length)
    .then(updatedBoat => {
      switch(updatedBoat) {
        case 403:
          res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
          break;
        default:
          updatedBoat.self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + updatedBoat.id;
          updatedBoat.loads = updatedBoat.loads.map(l =>({"id": l.id, "self": req.protocol + "://" + req.get("host") + '/loads/' + l.id}));
          res.status(200).json(updatedBoat);
      }
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});



router.patch('/:boatId', acceptJson, checkJwt, handleJwtErrors, (req, res) => {
  // we know boat doesn't exist if id isn't a number
  if (isNaN(req.params.boatId)) {
    return res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
  }

  // check that boat body is valid
  const validation_results = boatBodyIsValid(req.body, true);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  // patch the boat
  const sub = req.auth.payload.sub;
  model.patchBoat(req.params.boatId, sub, req.body)
    .then(updatedBoat => {
      switch(updatedBoat) {
        case 403:
          res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
          break;
        default:
          updatedBoat.self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + updatedBoat.id;
          updatedBoat.loads = updatedBoat.loads.map(l =>({"id": l.id, "self": req.protocol + "://" + req.get("host") + '/loads/' + l.id}));
          res.status(200).json(updatedBoat);
      }
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});



router.delete('/:boatId', checkJwt, handleJwtErrors, (req, res) => {
  // we know boat doesn't exist if id is not a number
  if (isNaN(req.params.boatId)) {
    return res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
  }

  const sub = req.auth.payload.sub;
  model.deleteBoat(req.params.boatId, sub)
    .then(deleteStatus => {
      switch(deleteStatus) {
        case 403:
          res.status(403).send({"Error": "Boat does not exist or is owned by someone else"});
          break;

        default:
          res.status(204).end();
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});


router.put('/:boatId/loads/:loadId', checkJwt, handleJwtErrors, (req, res) => {
  // we know boat doesn't exist if id is not a number
  if (isNaN(req.params.boatId)) {
    return res.status(403).send({'Error': 'The boat is owned by someone else or does not exist, or the load is already loaded on another boat'});
  }

  // we know load doesn't exist if id is not a number
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "The load does not exist"});
  }

  model.putLoadOnBoat(req.params.boatId, req.params.loadId, req.auth.payload.sub)
    .then(code => {
      switch(code) {
        case 404:
          res.status(code).send({'Error': 'The load does not exist'});
          break;
        case 403:
          res.status(code).send({'Error': 'The boat is owned by someone else or does not exist, or the load is already loaded on another boat'});
          break;
        default:
          res.status(204).end();
        } 
    })   
    .catch(e => {
        res.status(500).json({"Error": "Something went wrong on our end"});
    });
});


router.delete('/:boatId/loads/:loadId', checkJwt, handleJwtErrors, (req, res) => {
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "The load does not exist"});
  }

  if (isNaN(req.params.boatId)) {
    return res.status(403).send({'Error': 'The boat is owned by someone else or does not exist'});
  }

  model.removeLoadFromBoat(req.params.boatId, req.params.loadId, req.auth.payload.sub)
    .then(code => {
      switch(code) {
        case 204:
          res.status(204).end();
          break;
        case 404:
          res.status(code).send({'Error': 'The load does not exist or is not on this boat'});
          break;
        case 403:
          res.status(code).send({'Error': 'The boat is owned by someone else or does not exist'});
      }
    })
    .catch(e => {
      res.status(500).json({"Error": "Something went wrong on our end"});
    });
});



export { router };

