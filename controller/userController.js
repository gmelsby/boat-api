import express from 'express';
import { getUsers } from '../model/userModel.js';

const router = express.Router();

router.get('/', (req, res) => {
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