import React from 'react';
import styled from 'styled-components';
import Helmet from 'react-helmet';
import { Layout } from 'antd';
import 'antd/dist/antd.css';

import Main from './components/Main';
import SideNavigation from './components/SideNavigation';

const { Content } = Layout;

function App() {
  return (
    <>
      <Helmet titleTemplate="%s - DomClipper" defaultTitle="DomClipper" />
      <Layout>
        <SideNavigation />
        <Layout style={{ marginLeft: 200 }}>
          {/* <Header style={{ padding: 0 }} /> */}
          <Content>
            <Container>
              <Main />
            </Container>
          </Content>
        </Layout>
      </Layout>
    </>
  );
}
const Container = styled.div`
  margin: 0 auto;
  padding: 12px 12px;
  min-height: 100vh;
`;

export default App;
