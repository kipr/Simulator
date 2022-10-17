import { Firestore, collection as firestoreCollection } from 'firebase/firestore';

class Db {
  private firestore_: Firestore;
  constructor(firestore: Firestore) {
    this.firestore_ = firestore;
  }

  collection(name: string) {
    firestoreCollection(this.firestore_, name);
  }
}

export default Db;