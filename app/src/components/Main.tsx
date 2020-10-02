import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import { useStore } from '../store';
import useRepository from '../hooks/useRepository';
import Auth from './Auth';
import Components from './Components';

const Main = () => {
  const set = useStore((store) => store.set);
  const token = useStore((store) => store.idToken);
  const repo = useRepository();

  useEffect(() => {
    async function fn() {
      try {
        const resp = await repo.login();
        if (resp.data.created) {
          set((store) => {
            store.created = true;
          });
        }
      } catch (e) {
        console.debug(e);
      }
    }
    fn();
  }, [set, repo, token]);

  return (
    <>
      <Switch>
        <Route path={`/`}>{token ? <Components /> : <Auth />}</Route>
      </Switch>
    </>
  );
};

export default Main;
