import { useEffect, useCallback } from 'react';
import { message } from 'antd';

import { useStore } from '../store';

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

if (clientId == null) {
  throw new Error('REACT_APP_GOOGLE_APP_ID is undefined');
}

export default () => {
  const set = useStore((store) => store.set);

  const handleSignIn = useCallback(
    (user: gapi.auth2.GoogleUser) => {
      console.log(user.getAuthResponse().id_token);
      set((store) => {
        store.idToken = user.getAuthResponse().id_token;
      });
      set((store) => {
        store.authLoaded = true;
      });
      message.success(`Hi, ${user.getBasicProfile().getName()}`);
    },
    [set],
  );

  const handleSignOut = useCallback(() => {
    set((store) => {
      store.idToken = '';
    });
    set((store) => {
      store.authLoaded = true;
    });
  }, [set]);

  const handleError = (resp: any) => {
    console.debug(resp);
  };

  useEffect(() => {
    window.gapi.load('client:auth2', () => {
      window.gapi.client
        .init({
          clientId,
          scope: 'email',
        })
        .then(() => {
          const auth = window.gapi.auth2.getAuthInstance();
          if (auth.isSignedIn.get()) {
            handleSignIn(auth.currentUser.get());
          } else {
            handleSignOut();
          }
          auth.currentUser.listen((user) => {
            if (user.isSignedIn()) {
              handleSignIn(user);
            } else {
              handleSignOut();
            }
          });
          set((store) => {
            store.signIn = auth.signIn;
            store.signOut = auth.signOut;
          });
        })
        .catch((e) => {
          handleError(e);
        });
    });
  }, [handleSignIn, handleSignOut, set]);
};
