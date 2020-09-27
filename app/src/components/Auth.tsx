import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'antd';

import SignInImg from './SignInImg';
import AuthButton from './AuthButton';

const Auth: React.FC = () => {
  return (
    <Container>
      <Row justify="center" style={{ marginBottom: 20, color: '#444' }}>
        <Col>Please open the door...</Col>
      </Row>
      <Row justify="center">
        <Col span={6}>
          <SignInImg />
        </Col>
      </Row>
      <Row justify="center" style={{ marginTop: 20, marginBottom: 150 }}>
        <Col>
          <AuthButton />
        </Col>
      </Row>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100%;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

export default Auth;
