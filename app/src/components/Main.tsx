import React from 'react';
import { Switch, Route } from 'react-router-dom';

import Components from './Components';

const Main = () => {
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
