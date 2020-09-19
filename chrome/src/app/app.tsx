import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Modal from 'react-modal';

import '../styles/app.css';
import { API_URL } from './globals';

type Props = {
  imgURL: string;
  originalSize: { height: number; width: number };
};

const App: React.FC<Props> = ({ imgURL, originalSize }) => {
  useEffect(() => {
    console.log('api', API_URL);
    Modal.setAppElement('#dc-root');
  }, []);

  useEffect(() => {
    return () => {
      const root = document.getElementById('dc-root');
      if (root == null) return;
      root.style.display = 'none';
      document.body.classList.remove('locked');
    };
  }, []);

  const handleClose = () => {
    const root = document.getElementById('dc-root');
    if (root != null) {
      ReactDOM.unmountComponentAtNode(root);
    }
  };

  const handleSaveClick = async () => {
    chrome.runtime.sendMessage({
      type: 'api.component.add',
      dataURL: imgURL,
      domain: window.location.hostname,
    });
  };

  return (
    <Modal
      style={{
        overlay: { backgroundColor: '#0008', zIndex: 99999999 },
      }}
      isOpen={true}
      onRequestClose={handleClose}
      shouldCloseOnOverlayClick={true}
    >
      <div>
        <Img
          src={imgURL}
          style={{
            width: originalSize.width,
            height: originalSize.height,
          }}
        />
      </div>
      <div>
        <button onClick={handleSaveClick}>Save</button>
      </div>
    </Modal>
  );
};

const Dim = styled.div`
  height: 500px;
  width: 100%;
`;

const Img = styled.img`
  border-radius: 6px;
  box-shadow: 0px 0px 7px 0 #0005;
`;

export default App;
