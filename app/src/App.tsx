import React from 'react';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import ReactGA from 'react-ga';
import { Layout, Spin } from 'antd';
import 'antd/dist/antd.css';
import './antd.override.css';

import Main from './components/Main';
import SideNavigation from './components/SideNavigation';
import useAuth from './hooks/useAuth';
import { useStore } from './store';

const { Content } = Layout;

if (process.env.REACT_APP_GOOGLE_ANALYTICS_ID) {
  ReactGA.initialize(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
}

function App() {
  useAuth();
  const authLoaded = useStore((store) => store.authLoaded);

  return (
    <>
      <Helmet titleTemplate="%s - Qlip" defaultTitle="Qlip Scrapbook" />
      {authLoaded ? (
        <Layout>
          <SideNavigation />
          <Layout style={{ marginLeft: 200 }}>
            <Content>
              <Container>
                <Main />
              </Container>
            </Content>
          </Layout>
        </Layout>
      ) : (
        <SpinWrapper>
          <Spin />
        </SpinWrapper>
      )}
    </>
  );
}

const Container = styled.div`
  margin: 0 auto;
  min-height: 100vh;
`;

const SpinWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export default App;
