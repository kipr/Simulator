import Dict from '../Dict';
import Error from './Error';
import Selector from './Selector';
import TokenManager from './TokenManager';

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
  private tokenManager_: TokenManager;

  private pendingRequests_: PendingRequest[] = [];

  get tokenManager() { return this.tokenManager_; }
  set tokenManager(tokenManager: TokenManager) {
    const firePending = this.tokenManager_ === undefined && tokenManager !== undefined;
    this.tokenManager_ = tokenManager;
    if (firePending) this.firePending_();
  }

  private firePending_() {
    for (const pendingRequest of this.pendingRequests_) {
      this.request_(pendingRequest.request)
        .then(res => {
          pendingRequest.outstandingPromise.resolve(res);
        })
        .catch(err => {
          pendingRequest.outstandingPromise.reject(err);
        });
    }
  }

  constructor(uri: string, tokenManager?: TokenManager) {
    this.uri_ = uri;
    this.tokenManager_ = tokenManager;
  }

  private async headers_() {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    if (this.tokenManager_) headers.append('Authorization', `Bearer ${await this.tokenManager_.token()}`);
    return headers;
  }

  private static async parseError_(res: Response): Promise<Error> {
    const text = await res.text();
    let message: string;

    if (text && text.length > 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
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
      headers: await this.headers_(),
      method: request.method,
      body: request.body,
    });
  }

  private static outstandingPromise_<T = unknown>(): [Promise<T>, OutstandingPromise<T>] {
    const ret: OutstandingPromise<T> = {
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
    if (!this.tokenManager_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(async res => {
      if (res.status !== 204) throw await Db.parseError_(res);
    });
  }

  async delete({ collection, id }: Selector): Promise<void> {
    const request: Request = {
      url: `${this.uri_}/${collection}/${id}`,
      method: 'DELETE'
    };

    let promise: Promise<Response>;

    if (!this.tokenManager_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }


    return promise.then(async res => {
      if (res.status !== 204) throw await Db.parseError_(res);
    });
  }

  async get<T>({ collection, id }: Selector): Promise<T> {
    const request: Request = {
      url: `${this.uri_}/${collection}/${id}`,
    };

    let promise: Promise<Response>;
    if (!this.tokenManager_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(async res => {
      if (res.status !== 200) throw await Db.parseError_(res);
      return await res.json() as T;
    });
  }

  async list<T>(collection: string): Promise<Dict<T>> {
    const request: Request = {
      url: `${this.uri_}/${collection}`,
    };

    let promise: Promise<Response>;
    if (!this.tokenManager_) {
      const [outPromise, outstandingPromise] = Db.outstandingPromise_<Response>();
      this.pendingRequests_.push({ request, outstandingPromise });
      promise = outPromise;
    } else {
      promise = this.request_(request);
    }

    return promise.then(async res => {
      if (res.status !== 200) throw await Db.parseError_(res);
      return await res.json() as Dict<T>;
    });
  }
}


export default Db;