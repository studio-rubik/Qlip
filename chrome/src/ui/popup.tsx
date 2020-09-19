import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import '../styles/popup.css';

const App: React.FC = () => {
  const [idToken, setIdToken] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'idToken' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
  }, []);

  const signIn = () => {
    chrome.runtime.sendMessage({ type: 'signIn' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
  };

  const enableCapture = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id == null) return;
      chrome.tabs.sendMessage(tabs[0].id, { type: 'toggle' });
    });
  };

  return (
    <div>
      {idToken === '' ? <button onClick={signIn}>Sign in</button> : null}
      {idToken !== '' ? <button onClick={enableCapture}>Capture</button> : null}
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
