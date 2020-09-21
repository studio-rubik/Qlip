import React, { useState, CSSProperties, MouseEventHandler } from 'react';

type Props = {
  onClick: MouseEventHandler;
};

const Button: React.FC<Props> = ({ children, onClick }) => {
  const [hover, setHover] = useState(false);

  const handleMouseOver = () => {
    setHover(true);
  };

  const handleMouseLeave = () => {
    setHover(false);
  };

  return (
    <button
      style={{ ...buttonStyle, color: hover ? '#111' : '#666' }}
      onClick={onClick}
      onMouseOver={handleMouseOver}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
};

const buttonStyle: CSSProperties = {
  fontFamily: 'Arial,"Helvetica Neue",Helvetica,sans-serif',
  height: 30,
  boxSizing: 'border-box',
  background: 'white',
  border: 'solid 1px #888',
  borderRadius: 4,
  padding: 6,
  fontSize: 14,
  verticalAlign: 'middle',
  cursor: 'pointer',
  transition: 'color 500ms',

  // Protect from website's css.
  lineHeight: '14px',
  textTransform: 'none',
};

export default Button;
