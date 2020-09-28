import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import '../styles/common.css';
import '../styles/popup.css';
import SignInButton from '../components/SignInButton';
import IconButton from '../components/IconButton';

let isMac = false;
if (navigator.appVersion.indexOf('Mac') != -1) {
  isMac = true;
}

const App: React.FC = () => {
  const [idToken, setIdToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'capture.toggle.complete') {
        window.close();
      }
    });
    chrome.runtime.sendMessage({ type: 'idToken' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id == null) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: 'capture.get' }, (resp) => {
        setEnabled(resp.data.value);
      });
    });
  }, []);

  const signIn = () => {
    setSending(true);
    chrome.runtime.sendMessage({ type: 'signIn' }, (resp) => {
      setIdToken(resp.data.idToken);
      setSending(false);
    });
  };

  const toggleCapture = () => {
    chrome.runtime.sendMessage({ type: 'capture.toggle.request' });
  };

  const keybinding = `[${isMac ? '\u2318' : 'Ctrl'} Shift S]`;

  return (
    <div className="container">
      {idToken === '' ? (
        <SignInButton loading={sending} onClick={signIn} />
      ) : null}
      {idToken !== '' ? (
        <>
          <div className="capture">
            <div>
              <IconButton src="/img/area.png" onClick={toggleCapture}>
                {enabled ? 'Stop' : 'Capture'}
              </IconButton>
            </div>
            <div>
              <span className="keybinding">{keybinding}</span>
            </div>
          </div>
          <div className="open-showcase">
            <a href="https://app.qlip.page" target="_blank" rel="noreferrer">
              Open showcase
            </a>
          </div>
        </>
      ) : null}
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
