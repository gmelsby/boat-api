import express from 'express';
import bodyParser from 'body-parser';
import * as model from '../model/loadModel.js';
import { loadBodyIsValid } from '../validation.js';
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

// handles case where loadId parameter is not a number
// to be used in all routes that use loadId path parameter
const loadIdIsNumber = (req, res, next) => {
  if (isNaN(req.params.loadId)) {
    return res.status(404).send({"Error": "Load does not exist"});
  }
  next();
};


router.post('/', acceptJson, (req, res) => {
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


router.get('/', acceptJson, (req, res) => {
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
        if (err.code === 3) {
          res.status(400).json({"Error": "Cursor in request params not recognized"});
        }
        console.log(err);
        res.status(500).send({"Error": "Something went wrong on our end"});
      }
    });
});

router.put('/', function (req, res){
    res.set('Allow', 'POST, GET');
    res.status(405).end();
});

router.patch('/', function (req, res){
    res.set('Allow', 'POST, GET');
    res.status(405).end();
});

router.delete('/', function (req, res){
    res.set('Allow', 'POST, GET');
    res.status(405).end();
});



router.get('/:loadId', acceptJson, loadIdIsNumber, (req, res) => {
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



router.put('/:loadId', acceptJson, loadIdIsNumber, (req, res) => {
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



router.patch('/:loadId', acceptJson, loadIdIsNumber, (req, res) => {
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



router.delete('/:loadId', loadIdIsNumber, (req, res) => {
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

router.post('/:loadId', function (req, res){
    res.set('Allow', 'GET, PATCH, PUT, DELETE');
    res.status(405).end();
});



export { router };

