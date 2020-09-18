import Http from './http';
import Repository, { ComponentsFilterQueries } from '../interface/repository';

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

  componentsFilter(queries: ComponentsFilterQueries) {
    return this.client.get({
      path: 'components',
      queries: queries as { [k: string]: string },
    });
  }

  tagsAll() {
    return this.client.get({ path: 'tags' });
  }

  tagPost(name: string) {
    return this.client.post({ path: 'tags' }, { name });
  }

  tagDelete(id: string) {
    return this.client.delete({ path: 'tags/:id', params: [id] });
  }

  websitesAll() {
    return this.client.get({ path: 'websites' });
  }

  componentTagsPost(component: string, tags: string[]) {
    return this.client.post({
      path: `components/${component}/tags/${tags.join(',')}`,
    });
  }
}
