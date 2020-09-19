import React from 'react';
import { Spin, Button } from 'antd';

import { useStore } from '../store';
import useAuth from '../hooks/useAuth';
import GoogleIcon from './GoogleIcon';

const AuthButton: React.FC = () => {
  const { signIn, signOut } = useAuth();
  const token = useStore((store) => store.idToken);
  const loaded = useStore((store) => store.authLoaded);
  console.log(loaded, token);
  if (!loaded) return <Spin spinning />;

  return token === '' ? (
    <Button size="large" onClick={signIn}>
      <GoogleIcon />
      <span style={{ color: '#777' }}>Sign in with Google</span>
    </Button>
  ) : (
    <button onClick={signOut}>Sign out</button>
  );
};

export default AuthButton;
