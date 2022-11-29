import express from 'express';
import bodyParser from 'body-parser';
import * as model from '../model/loadModel.js';
import { loadBodyIsValid } from '../validation.js';

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


router.post('/', (req, res) => {
  // sends error message if Jwt not valid
  // check that load body is valid
  const validation_results = loadBodyIsValid(req.body);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  model.postLoad(req.body.volume, req.body.item, req.body.creation_date)
    .then(createdLoad => {
      createdLoad.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + createdLoad.id;
      return res.status(201).send(createdLoad);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});


router.get('/:loadId', (req, res) => {
  // make sure id is a numerical
  if (isNaN(req.params.loadId)) {
      return res.status(404).send({"Error": "The boat does not exist"});
  }

  model.getLoad(req.params.loadId)
    .then(load => {
        if (load === 404) {
          return res.status(404).send({"Error": "Load does not exist"});
        }
        load.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + load.id;
        // fill out carrier info if not null
        if (load.carrier !== null && load.carrier !== undefined) {
            load.carrier = {"id": load.carrier, "self": req.protocol + "://" + req.get("host") + '/boats/' + load.carrier};
        }

        return res.status(200).send(load);
    })
    .catch(err => {
      console.log(err);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});


router.get('/', (req, res) => {
  model.getLoads(req)
    .then(reply => {
      reply.loads.forEach(load => {
        load.self = req.protocol + "://" + req.get("host") + req.baseUrl + '/' + load.id;
        if (load.carrier !== null && load.carrier !== undefined) {
            load.carrier = {"id": load.carrier, "self": req.protocol + "://" + req.get("host") + '/boats/' + load.carrier};
        }
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
});


router.put('/:loadId', (req, res) => {
  // we know load doesn't exist if id isn't a number
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "Load does not exist"});
  }

  // check that load body is valid
  const validation_results = loadBodyIsValid(req.body);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  model.putLoad(req.params.loadId, req.body.volume, req.body.item, req.body.creation_date)
    .then(updatedLoad => {
      switch(updatedLoad) {
        case 404:
          res.status(404).send({"Error": "Load does not exist"});
          break;
        default:
          updatedLoad.self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + updatedLoad.id;
          if (updatedLoad.carrier !== null && updatedLoad.carrier !== undefined) {
              updatedLoad.carrier = {"id": updatedLoad.carrier, "self": req.protocol + "://" + req.get("host") + '/boats/' + updatedLoad.carrier};
          }
          res.status(200).json(updatedLoad);
      }
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});



router.patch('/:loadId', (req, res) => {
  // we know load doesn't exist if id isn't a number
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "Load does not exist"});
  }

  // check that load body is valid
  const validation_results = loadBodyIsValid(req.body, true);
  if (validation_results.Error !== undefined) {
    return res.status(400).send(validation_results);
  }

  // patch the load
  model.patchLoad(req.params.loadId, req.body)
    .then(updatedLoad => {
      switch(updatedLoad) {
        case 404:
          res.status(404).send({"Error": "Load does not exist"});
          break;
        default:
          updatedLoad.self = req.protocol + "://" + req.get("host") + req.baseUrl + "/" + updatedLoad.id;
          if (updatedLoad.carrier !== null && updatedLoad.carrier !== undefined) {
              updatedLoad.carrier = {"id": updatedLoad.carrier, "self": req.protocol + "://" + req.get("host") + '/boats/' + updatedLoad.carrier};
          }
          res.status(200).json(updatedLoad);
      }
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});



router.delete('/:loadId', (req, res) => {
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "Load does not exist"});
  }

  model.deleteLoad(req.params.loadId)
    .then(deleteStatus => {
      switch(deleteStatus) {
        case 404:
          res.status(404).send({"Error": "Load does not exist"});
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

export { router };

