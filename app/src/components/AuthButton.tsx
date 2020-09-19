import React from 'react';
import { Button, Dropdown, Menu } from 'antd';
import { MenuOutlined, LogoutOutlined } from '@ant-design/icons';

import { useStore } from '../store';
import GoogleIcon from './GoogleIcon';

const AuthButton: React.FC = () => {
  const signIn = useStore((store) => store.signIn);
  const signOut = useStore((store) => store.signOut);
  const token = useStore((store) => store.idToken);

  const menu = (
    <Menu>
      <Menu.Item key="logout" icon={<LogoutOutlined />}>
        <span onClick={signOut ?? undefined}>Sign out</span>
      </Menu.Item>
    </Menu>
  );
  return token === '' ? (
    <Button size="large" onClick={signIn ?? undefined}>
      <GoogleIcon />
      <span style={{ color: '#777', fontSize: 15 }}>Sign in with Google</span>
    </Button>
  ) : (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button size="large" type="text" icon={<MenuOutlined />} />
    </Dropdown>
  );
};

export default AuthButton;
