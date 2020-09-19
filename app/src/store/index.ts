import create from 'zustand';
import produce from 'immer';

import * as domain from '../common/domain';
import { APIResponseEntity } from '../interface/repository';

export type State = {
  set: (fn: SetState) => void;
  initialize: () => void;
  idToken: string;
  authLoaded: boolean;
  components: APIResponseEntity<any>;
  tags: APIResponseEntity<any>;
  componentFiles: APIResponseEntity<any>;
  websites: APIResponseEntity<any>;
};

type SetState = (state: State) => void;

const emptyEntity = { byId: {}, allIds: [] };

const initialState = {
  idToken: '',
  authLoaded: false,
  components: emptyEntity,
  tags: emptyEntity,
  componentFiles: emptyEntity,
  websites: emptyEntity,
};

export const useStore = create<State>((setState, getState) => ({
  set: (fn) => setState(produce(fn)),
  initialize: () => setState(initialState),
  ...initialState,
}));
