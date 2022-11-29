import { Datastore } from '@google-cloud/datastore';

const ds = new Datastore();

const fromDatastore = item => {
  item.id = item[Datastore.KEY].id;
  return item;
}

export { ds, Datastore, fromDatastore };