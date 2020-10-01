import React, { CSSProperties, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import '../styles/common.css';
import '../styles/app.css';
import IconButton from '../components/IconButton';

type Props = {
  target: HTMLElement;
};

const MARGIN = 0;

const App: React.FC<Props> = ({ target }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [initialized, initialize] = useState(false);

  useEffect(() => {
    Modal.setAppElement('#dc-root');
  }, []);

  useEffect(() => {
    // Force call this effect once again to ensure target.current is not null.
    if (!initialized) {
      initialize(true);
    }

    if (['absolute', 'fixed'].includes(target.style.position)) {
      target.style.position = 'static';
    }
    // Prevent overflow but respect `width` if smaller than container's width.
    target.style.maxWidth = '100%';
    ref.current?.appendChild(target);
  }, [initialized]);

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
    const clientRect = target.getBoundingClientRect();
    const rect = {
      x: clientRect.x - MARGIN,
      y: clientRect.y - MARGIN,
      width: clientRect.width + MARGIN * 2,
      height: clientRect.height + MARGIN * 2,
    };
    const dpr = window.devicePixelRatio;
    chrome.runtime.sendMessage(
      {
        type: 'capture.execute',
        area: { x: rect.x, y: rect.y, w: rect.width, h: rect.height },
        dpr,
      },
      (resp) => {
        chrome.runtime.sendMessage(
          {
            type: 'api.component.add',
            dataURL: resp.data,
            domain: window.location.hostname,
            originalSize: { width: rect.width, height: rect.height },
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
      },
    );
  };

  return (
    <>
      <Modal
        style={{
          // padding: 20px is added only when content overflows.
          // Override it to always padding: 20px by containerStyle.
          content: {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: 'none',
            width: '100%',
            height: '100vh',
            padding: 0,
            borderRadius: 0,
          },
          overlay: { backgroundColor: '#0008', zIndex: 99999999 },
        }}
        isOpen={true}
        onRequestClose={close}
        shouldCloseOnOverlayClick={true}
      >
        <div style={containerStyle}>
          <div style={imgWrapperStyle}>
            <div style={imgStyle} ref={ref} />
            <div style={imgOverlayStyle} />
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
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '30px 10px',
  zIndex: 9999999,
};

const imgWrapperStyle: CSSProperties = {
  position: 'relative',
  flex: 1,
};

const imgOverlayStyle: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  height: '100%',
  width: '100%',
  zIndex: 99999999,
};

const imgStyle: CSSProperties = {
  maxWidth: '100%',
  marginBottom: 50,
};

const errorStyle: CSSProperties = {
  marginTop: 25,
  color: '#e85367',
};

export default App;
