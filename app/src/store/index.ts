import create from 'zustand';
import produce from 'immer';

import { APIResponseEntity } from '../interface/repository';

export type State = {
  set: (fn: SetState) => void;
  initialize: () => void;
  idToken: string;
  authLoaded: boolean;
  created: boolean;
  signIn: (() => void) | null;
  signOut: (() => void) | null;
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
  created: false,
  signIn: null,
  signOut: null,
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
