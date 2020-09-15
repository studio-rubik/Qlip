import React, { useState } from 'react';
import { Link, Switch, Route, Redirect } from 'react-router-dom';
import Helmet from 'react-helmet';

import { useAuth0 } from './auth0';
import Auth from './components/Auth';
import Main from './components/Main';

function App() {
  const { isAuthenticated, logout, user } = useAuth0();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Helmet titleTemplate="%s - WouldYouPlay" defaultTitle="WouldYouPlay" />
      {isAuthenticated ? <Main /> : <Auth />}
    </>
  );
}

const RedirectExt: React.FC<{ to: string }> = ({ to }) => {
  window.location.replace(to);
  return <></>;
};

export default App;
