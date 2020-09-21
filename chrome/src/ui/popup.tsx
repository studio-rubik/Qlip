import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import '../styles/popup.css';
import GoogleIcon from './GoogleIcon';

let isMac = false;
if (navigator.appVersion.indexOf('Mac') != -1) {
  isMac = true;
}

const App: React.FC = () => {
  const [idToken, setIdToken] = useState('');
  const [enabled, setEnabled] = useState(false);

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
    chrome.runtime.sendMessage({ type: 'signIn' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
  };

  const toggleCapture = () => {
    chrome.runtime.sendMessage({ type: 'capture.toggle.request' });
  };

  const keybinding = `[${isMac ? '\u2318' : 'Ctrl'} Shift S]`;

  return (
    <div className="container">
      {idToken === '' ? (
        <button className="sign-in" onClick={signIn}>
          <span className="icon">
            <GoogleIcon />
          </span>
          Sign in with Google
        </button>
      ) : null}
      {idToken !== '' ? (
        <div>
          <button onClick={toggleCapture}>
            <img src="/img/area.png" className="icon" />
            {enabled ? 'Stop' : 'Capture'}
          </button>
          <span className="keybinding">{keybinding}</span>
        </div>
      ) : null}
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
