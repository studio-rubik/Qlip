import * as Domain from '../common/Domain';

export type RepositoryFilter = {
  [column: string]: string | number | string[] | number[];
};

export type APIResponse<T> = {
  data: T;
  hasMore: boolean;
};

export default interface Repository {
  setAuthToken(token: string | null): void;
  verifyEmailResend(): Promise<void>;
  test(): Promise<string>;
}
