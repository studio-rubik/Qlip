import React, { CSSProperties, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import '../styles/common.css';
import '../styles/app.css';
import IconButton from '../components/IconButton';

type Props = {
  imgURL: string;
  originalSize: { height: number; width: number };
};

const App: React.FC<Props> = ({ imgURL, originalSize }) => {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    Modal.setAppElement('#dc-root');
  }, []);

  useEffect(() => {
    return () => {
      const root = document.getElementById('dc-root');
      if (root == null) return;
      root.style.display = 'none';
    };
  }, []);

  const close = () => {
    const root = document.getElementById('dc-root');
    if (root != null) {
      ReactDOM.unmountComponentAtNode(root);
    }
  };

  const handleUploadClick = async () => {
    setSending(true);
    chrome.runtime.sendMessage(
      {
        type: 'api.component.add',
        dataURL: imgURL,
        domain: window.location.hostname,
        originalSize,
      },
      (resp) => {
        setSending(false);
        if (resp.data.value === true) {
          close();
        } else {
          setError(true);
        }
      },
    );
  };

  return (
    <>
      <Modal
        style={{
          // padding: 20px is added only when content overflows.
          // Override it to always padding: 20px by containerStyle.
          content: { width: '90vw', padding: 0 },
          overlay: { backgroundColor: '#0008', zIndex: 99999999 },
        }}
        isOpen={true}
        onRequestClose={close}
        shouldCloseOnOverlayClick={true}
      >
        <div style={containerStyle}>
          <div>
            <img
              src={imgURL}
              style={{
                ...imgStyle,
                width: originalSize.width,
                height: originalSize.height,
              }}
            />
          </div>
          <div>
            <IconButton
              loading={sending}
              src={chrome.runtime.getURL('/img/upload.png')}
              onClick={handleUploadClick}
            >
              Upload
            </IconButton>
          </div>
          <div style={errorStyle}>
            {error ? 'Sorry, something went wrong.' : null}
          </div>
        </div>
      </Modal>
    </>
  );
};

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 20,
};

const imgStyle: CSSProperties = {
  maxWidth: '100%',
  maxHeight: '70vh',
  marginBottom: 50,
};

const errorStyle: CSSProperties = {
  marginTop: 25,
  color: '#e85367',
};

export default App;
