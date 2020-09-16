import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';

import Components from './Components';

const Main = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);

  useEffect(() => {
    repo.componentsFilter().then((resp) => {
      set((store) => {
        store.components = resp.data.components;
        store.componentFiles = resp.data.componentFiles;
        store.websites = resp.data.websites;
      });
    });
  }, [repo, set]);

  return (
    <>
      <Switch>
        <Route path={`/`}>
          <Components />
        </Route>
      </Switch>
    </>
  );
};

export default Main;
