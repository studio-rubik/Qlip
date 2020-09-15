import React, { useEffect } from 'react';
import { Switch, Route } from 'react-router-dom';

import useRepository from '../hooks/useRepository';

const Main = () => {
  const repo = useRepository();
  useEffect(() => {
    repo.test().then((resp) => {
      console.log(resp);
    });
  }, [repo]);

  return (
    <>
      <Switch>
        <Route path={`/`}>Hello</Route>
      </Switch>
    </>
  );
};

export default Main;
