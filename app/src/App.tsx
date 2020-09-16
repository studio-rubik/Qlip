import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import { Layout, Menu } from 'antd';
import 'antd/dist/antd.css';

import Main from './components/Main';
import SideNavigation from './components/SideNavigation';

const { Header, Content, Footer, Sider } = Layout;

function App() {
  return (
    <>
      <Helmet titleTemplate="%s - DomClipper" defaultTitle="DomClipper" />
      <Layout>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '0 10px',
            background: 'white',
          }}
        >
          <Logo>
            <StyledLink to="/">DomClipper</StyledLink>
          </Logo>
          <Menu theme="dark" mode="horizontal" defaultSelectedKeys={['2']}>
            <Menu.Item key="1">nav 1</Menu.Item>
            <Menu.Item key="2">nav 2</Menu.Item>
            <Menu.Item key="3">nav 3</Menu.Item>
          </Menu>
        </Header>
        <Layout>
          <SideNavigation />
          <Layout>
            <Content>
              <Container>
                <Main />
              </Container>
            </Content>
            <Footer style={{ textAlign: 'center' }}>
              © 2020 Studio Rubik, All Rights Reserved
            </Footer>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
}
const Container = styled.div`
  margin: 0 auto;
  padding: 12px 12px;
  min-height: 400px;
`;

const Logo = styled.div`
  width: 120px;
  height: 31px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px 28px 16px 0;
  float: left;
`;

const StyledLink = styled(Link)`
  display: inline-block;
  text-decoration: none;
  color: #34a0d1;

  &:focus,
  &:hover,
  &:visited,
  &:link,
  &:active {
    text-decoration: none;
  }
`;

const HeaderMenu = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 100%;
`;

const HeaderMenuItem = styled.div`
  padding: 0 8px;
`;

export default App;
