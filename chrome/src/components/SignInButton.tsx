import React, { CSSProperties, MouseEventHandler } from 'react';

import Button from './Button';
import Spinner from './Spinner';
import GoogleIcon from './GoogleIcon';

type Props = {
  loading: boolean;
  onClick: MouseEventHandler;
};

const SignInButton: React.FC<Props> = ({ loading, onClick }) => {
  return (
    <Button onClick={onClick}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <span style={spanStyle}>
            <GoogleIcon />
          </span>
          Sign in with Google
        </>
      )}
    </Button>
  );
};

const spanStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'middle',
  marginRight: 6,
};

export default SignInButton;
