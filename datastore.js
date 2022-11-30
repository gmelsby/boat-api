import { Datastore } from '@google-cloud/datastore';

const ds = new Datastore();

const fromDatastore = item => {
  item.id = item[Datastore.KEY].id;
  return item;
}

const nameFromDatastore = item => {
  item.id = item[Datastore.KEY].name;
  return item;
}

export { ds, Datastore, fromDatastore, nameFromDatastore };