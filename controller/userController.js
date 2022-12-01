import express from 'express';
import { getUsers } from '../model/userModel.js';
import acceptJson from '../acceptJson.js';

const router = express.Router();

router.get('/', acceptJson, (req, res) => {
  getUsers()
    .then(users => {
      res.send(users);
    })
    .catch(e => {
      console.log(e);
      res.status(500).send({"Error": "Something went wrong on our end"});
    });
});

export { router };