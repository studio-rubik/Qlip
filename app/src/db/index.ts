import Http from './http';
import Repository from '../interface/repository';

export default class ServerRepository implements Repository {
  client: Http;

  constructor(host: string, port?: number) {
    this.client = new Http(host, port);
    this.client.beforeRequest((req) => {
      req.headers.set('DomClipper-User-ID', '109417151843597377124');
      return req;
    });
  }

  test() {
    return this.client.get({ path: '' });
  }

  componentsFilter() {
    return this.client.get({ path: 'components' });
  }
}
