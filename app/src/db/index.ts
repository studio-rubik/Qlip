import * as Domain from '../common/Domain';
import Http from './http';
import Repository, { RepositoryFilter } from '../interface/repository';

export default class ServerRepository implements Repository {
  client: Http;

  constructor(host: string, port?: number) {
    this.client = new Http(host, port);
  }

  setAuthToken(token: string | null) {
    this.client.token = token;
  }

  verifyEmailResend() {
    return this.client.post({
      path: 'account/verification-email',
    });
  }

  test() {
    return this.client.get({ path: '' });
  }
}
