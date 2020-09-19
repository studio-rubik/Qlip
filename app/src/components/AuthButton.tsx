import React from 'react';
import { Button } from 'antd';

import { useStore } from '../store';
import GoogleIcon from './GoogleIcon';

const AuthButton: React.FC = () => {
  const signIn = useStore((store) => store.signIn);
  const signOut = useStore((store) => store.signOut);
  const token = useStore((store) => store.idToken);

  return token === '' ? (
    <Button size="large" onClick={signIn ?? undefined}>
      <GoogleIcon />
      <span style={{ color: '#777', fontSize: 15 }}>Sign in with Google</span>
    </Button>
  ) : (
    <button onClick={signOut ?? undefined}>Sign out</button>
  );
};

export default AuthButton;
