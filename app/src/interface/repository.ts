import * as domain from '../common/domain';

export type RepositoryFilter = {
  [column: string]: string | number | string[] | number[];
};

export type APIResponse<T> = {
  data: T;
  hasMore: boolean;
};

export type APIResponseEntity<T> = {
  byId: { [id: string]: T };
  allIds: string[];
};

type ComponentsFilterResp = APIResponse<{
  components: APIResponseEntity<any>;
  componentFiles: APIResponseEntity<any>;
  websites: APIResponseEntity<any>;
}>;

export default interface Repository {
  test(): Promise<string>;
  componentsFilter(): Promise<ComponentsFilterResp>;
}
