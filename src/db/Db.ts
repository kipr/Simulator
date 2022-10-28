import Dict from '../Dict';
import Scene, { AsyncScene } from '../state/State/Scene';
import Error from './Error';
import Record from './Record';
import Selector from './Selector';

interface Request {
  url: string;
  method?: string;
  body?: string;
}

interface OutstandingPromise<T = unknown> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

interface PendingRequest {
  request: Request;
  outstandingPromise: OutstandingPromise;
}

class Db {
  private uri_: string;
  private token_: string;

  private pendingRequests_: PendingRequest[] = [];

  get token() { return this.token_; }
  set token(token: string) {
    const firePending = this.token_ === undefined && token !== undefined;
    this.token_ = token;
    if (firePending) this.firePending_();
  }

  private firePending_() {
    for (const pendingRequest of this.pendingRequests_) {
      this.request_(pendingRequest.request).then(res => {
        pendingRequest.outstandingPromise.resolve(res);
      }).catch(err => {
        pendingRequest.outstandingPromise.reject(err);
      });
    }
  }

  constructor(uri: string, token?: string) {
    this.uri_ = uri;
    this.token_ = token;
  }

  private headers_(): Headers {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (this.token_) headers.append('Authorization', `Bearer ${this.token_}`);
    return headers;
  }

  private static async parseError_(res: Response): Promise<Error> {
    const text = await res.text();
    let message: string;

    if (text && text.length > 0) {
      try {
        message = JSON.parse(text).message;
      } catch (e) {
        message = text;
      }
    } else {
      message = res.statusText;
    }

    return {
      type: 'db-error',
      code: res.status,
      message,
    };
  }

  private async request_(request: Request) {
    return await fetch(request.url, {
      headers: this.headers_(),
      method: request.method,
      body: request.body,
    });
  }

  private static outstandingPromise_<T = unknown>(): [Promise<T>, OutstandingPromise<T>] {
    let ret: OutstandingPromise<T> = {
      resolve: null,
      reject: null,
    };
    const promise = new Promise<T>((res, rej) => {
      ret.resolve = res;
      ret.reject = rej;
    });

    return [promise, ret];
  }

  async set<T>({ collection, id }: Selector, value: T): Promise<void> {
    const request: Request = {
      url: `${this.uri_}/${collection}/${id}`,
      method: 'POST',
      body: JSON.stringify(value),
    };

    let promise: Promise<Response>;
    if (!this.token_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(res => {
      if (res.status !== 204) throw Db.parseError_(res);
    });
  }

  async delete({ collection, id }: Selector): Promise<void> {
    const request: Request = {
      url: `${this.uri_}/${collection}/${id}`,
      method: 'DELETE'
    };

    let promise: Promise<Response>;

    if (!this.token_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }


    return promise.then(res => {
      if (res.status !== 204) throw Db.parseError_(res);
    });
  }

  async get<T>({ collection, id }: Selector): Promise<T> {
    const request: Request = {
      url: `${this.uri_}/${collection}/${id}`,
    };

    let promise: Promise<Response>;
    if (!this.token_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(async res => {
      if (res.status !== 200) throw Db.parseError_(res);
      return await res.json() as T;
    });
  }

  async list<T>(collection: string): Promise<Dict<T>> {
    const request: Request = {
      url: `${this.uri_}/${collection}`,
    };

    let promise: Promise<Response>;
    if (!this.token_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(async res => {
      if (res.status !== 200) throw Db.parseError_(res);
      return await res.json() as Dict<T>;
    });
  }
}


export default Db;