import React from 'react';
import { Switch, Route } from 'react-router-dom';

import { useStore } from '../store';
import Auth from './Auth';
import Components from './Components';

const Main = () => {
  const token = useStore((store) => store.idToken);
  return (
    <>
      <Switch>
        <Route path={`/`}>{token ? <Components /> : <Auth />}</Route>
      </Switch>
    </>
  );
};

export default Main;
