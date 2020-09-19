import { useGoogleLogin, useGoogleLogout } from 'react-google-login';

import { useStore } from '../store';

const clientId =
  '45191155617-8uphjoe3igi9g8p1ocak6ocka28sqs4b.apps.googleusercontent.com';

export default () => {
  const set = useStore((store) => store.set);
  const handleSuccess = (resp: any) => {
    set((store) => {
      store.idToken = resp.getAuthResponse().id_token;
    });
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
    console.log('logout');
    set((store) => {
      store.idToken = '';
    });
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
  return { signIn, signOut };
};
