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

export type ComponentsFilterQueries = {
  tag?: string | null;
  website?: string | null;
};

type ComponentsFilterResp = APIResponse<{
  components: APIResponseEntity<any>;
  componentFiles: APIResponseEntity<any>;
  websites: APIResponseEntity<any>;
}>;

type TagsAllResp = APIResponse<{ tags: APIResponseEntity<any> }>;
type TagPostResp = APIResponse<{ tag: any }>;
type WebsitesAllResp = APIResponse<{ websites: APIResponseEntity<any> }>;

export default interface Repository {
  test(): Promise<string>;
  componentsFilter(
    params: ComponentsFilterQueries,
  ): Promise<ComponentsFilterResp>;
  tagsAll(): Promise<TagsAllResp>;
  tagPost(name: string): Promise<TagPostResp>;
  websitesAll(): Promise<WebsitesAllResp>;
  componentTagsPost(component: string, tags: string[]): Promise<void>;
}
