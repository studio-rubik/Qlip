import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import '../styles/popup.css';

const App: React.FC = () => {
  const [idToken, setIdToken] = useState('');
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
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
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id == null) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: 'capture.toggle' }, () => {
        window.close();
      });
    });
  };

  return (
    <div>
      {idToken === '' ? <button onClick={signIn}>Sign in</button> : null}
      {idToken !== '' ? (
        <button onClick={toggleCapture}>{enabled ? 'Stop' : 'Capture'}</button>
      ) : null}
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
