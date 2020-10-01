import React, { CSSProperties, MouseEventHandler } from 'react';

import Button from './Button';
import Spinner from './Spinner';

const iconStyle: CSSProperties = {
  display: 'inline-block',
  verticalAlign: 'text-bottom',
  marginRight: 6,
  width: 16,
  height: 16,
};

type Props = {
  loading?: boolean;
  onClick: MouseEventHandler;
  src: string;
  danger?: boolean;
  style?: CSSProperties;
};

const IconButton: React.FC<Props> = ({
  loading = false,
  onClick,
  src,
  danger,
  style,
  children,
}) => {
  return (
    <Button onClick={onClick} danger={danger} style={style}>
      {loading ? (
        <Spinner />
      ) : (
        <>
          <img src={src} style={iconStyle} />
          {children}
        </>
      )}
    </Button>
  );
};

export default IconButton;
