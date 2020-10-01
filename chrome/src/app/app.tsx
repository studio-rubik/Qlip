import React, { CSSProperties, useEffect, useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';

import '../styles/common.css';
import '../styles/app.css';
import * as utils from '../common/utils';
import IconButton from '../components/IconButton';

type Props = {
  preview: HTMLElement | string;
  originalSize?: { width: number; height: number };
  margin?: number;
};

const App: React.FC<Props> = ({ preview, originalSize, margin }) => {
  const clonedWrapperRef = useRef<HTMLDivElement | null>(null);
  const clonedRef = useRef<HTMLElement | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const [initialized, initialize] = useState(false);

  useEffect(() => {
    Modal.setAppElement('#dc-root');
  }, []);

  useEffect(() => {
    if (preview instanceof HTMLElement) {
      // Force call this effect once again to ensure target.current is not null.
      if (!initialized) {
        initialize(true);
      }
      const elm = utils.clone(preview) as HTMLElement;
      if (['absolute', 'fixed'].includes(elm.style.position)) {
        elm.style.position = 'static';
      }
      // Prevent overflow but respect `width` if smaller than container's width.
      elm.style.maxWidth = '100%';
      clonedRef.current = elm;
      clonedWrapperRef.current?.appendChild(elm);
    }
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
    let dataURL = '';
    let origSize = { width: 0, height: 0 };
    if (preview instanceof HTMLElement) {
      if (clonedRef.current == null) return;
      const resp = await utils.captureDOM(clonedRef.current, { margin });
      dataURL = resp.dataURL;
      origSize = resp.originalSize;
    } else {
      dataURL = preview;
      if (originalSize) {
        origSize = originalSize;
      }
    }
    chrome.runtime.sendMessage(
      {
        type: 'api.component.add',
        dataURL: dataURL,
        domain: window.location.hostname,
        originalSize: {
          width: origSize.width,
          height: origSize.height,
        },
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
            {preview instanceof HTMLElement ? (
              <>
                <div style={imgStyle} ref={clonedWrapperRef} />
                <div style={imgOverlayStyle} />
              </>
            ) : (
              <img
                src={preview}
                style={{
                  ...imgStyle,
                  width: originalSize?.width,
                  height: originalSize?.height,
                }}
              />
            )}
          </div>
          <div style={buttonRowStyle}>
            <IconButton
              src={chrome.runtime.getURL('/img/cancel.png')}
              danger
              onClick={close}
              style={{ marginRight: 50 }}
            >
              Cancel
            </IconButton>
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
  zIndex: 9999999,
};

const imgWrapperStyle: CSSProperties = {
  padding: '30px 0',
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
};

const buttonRowStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: 30,
};

const errorStyle: CSSProperties = {
  marginTop: 25,
  color: '#e85367',
};

export default App;
