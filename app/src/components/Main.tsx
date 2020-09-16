import React, { useEffect, useState } from 'react';
import { Switch, Route } from 'react-router-dom';

import useRepository from '../hooks/useRepository';
import { useStore } from '../store/';

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
