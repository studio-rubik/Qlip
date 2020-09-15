import React, { useEffect } from 'react';
import { useAuth0 } from '../auth0';

const Auth: React.FC = () => {
  const { loading, isAuthenticated, loginWithRedirect } = useAuth0();
  useEffect(() => {
    if (loading || isAuthenticated) {
      return;
    }
    const fn = async () => {
      await loginWithRedirect({
        appState: { targetUrl: window.location.pathname },
      });
    };
    fn();
  }, [loading, isAuthenticated, loginWithRedirect]);

  return <></>;
};
export default Auth;
