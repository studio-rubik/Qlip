import { useEffect } from 'react';
import { message } from 'antd';
import { useGoogleLogin, useGoogleLogout } from 'react-google-login';

import { useStore } from '../store';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (clientId == null) {
  throw new Error('REACT_APP_GOOGLE_APP_ID is undefined');
}

export default () => {
  const set = useStore((store) => store.set);

  const handleSuccess = (resp: any) => {
    set((store) => {
      store.idToken = resp.getAuthResponse().id_token;
    });
    message.success('You are signed in!');
  };

  const handleFailure = (resp: any) => {
    console.log('onFailure');
  };

  const handleAutoLoadFinished = (_: boolean) => {
    set((store) => {
      store.authLoaded = true;
    });
  };

  const handleLogoutSuccess = () => {
    set((store) => {
      store.idToken = '';
    });
    message.success('You are signed out');
  };

  const { signIn } = useGoogleLogin({
    clientId,
    cookiePolicy: 'single_host_origin',
    redirectUri: 'http://localhost:3000',
    isSignedIn: true,
    responseType: 'id_token',
    onSuccess: handleSuccess,
    onFailure: handleFailure,
    onAutoLoadFinished: handleAutoLoadFinished,
  });

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess: handleLogoutSuccess,
  });

  useEffect(() => {
    set((store) => {
      store.signIn = signIn;
      store.signOut = signOut;
    });
  }, [set, signIn, signOut]);
};
