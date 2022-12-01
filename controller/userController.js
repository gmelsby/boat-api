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

router.post('/', function (req, res){
    res.set('Allow', 'GET');
    res.status(405).end();
});

router.put('/', function (req, res){
    res.set('Allow', 'GET');
    res.status(405).end();
});

router.patch('/', function (req, res){
    res.set('Allow', 'GET');
    res.status(405).end();
});

router.delete('/', function (req, res){
    res.set('Allow', 'GET');
    res.status(405).end();
});



export { router };