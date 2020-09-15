import React, { useState } from 'react';
import Helmet from 'react-helmet';

import { useAuth0 } from './auth0';
import Auth from './components/Auth';
import Main from './components/Main';

function App() {
  const { isAuthenticated, logout, user } = useAuth0();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <Helmet titleTemplate="%s - DomClipper" defaultTitle="DomClipper" />
      {isAuthenticated ? <Main /> : <Auth />}
    </>
  );
}

export default App;
