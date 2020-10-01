import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from 'react-switch';

import '../styles/common.css';
import '../styles/popup.css';
import * as types from '../common/types';
import SignInButton from '../components/SignInButton';
import IconButton from '../components/IconButton';

let isMac = false;
if (navigator.appVersion.indexOf('Mac') != -1) {
  isMac = true;
}

const App: React.FC = () => {
  const [idToken, setIdToken] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<types.CaptureMode>('clone');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'capture.toggle.complete') {
        window.close();
      } else if (msg.type === 'mode.toggle.complete') {
        setMode(msg.data.value);
      }
    });
    chrome.runtime.sendMessage({ type: 'idToken' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
    chrome.runtime.sendMessage({ type: 'mode.get' }, (resp) => {
      setMode(resp.data.value);
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

  const openShowcase = () => {
    window.open('https://app.qlip.page', '_blank')?.focus();
  };

  const handleModeChange = (checked: boolean) => {
    chrome.runtime.sendMessage({ type: 'mode.toggle.request' }, (resp) => {
      setMode(resp.data.value);
    });
  };

  const keybinding = `[${isMac ? '\u2318' : 'Ctrl'} Shift S]`;

  return (
    <div className="container">
      {idToken === '' ? (
        <SignInButton loading={sending} onClick={signIn} />
      ) : null}
      {idToken !== '' ? (
        <>
          <div className="actions">
            <div className="title">Actions</div>
            <div className="row">
              <div>
                <span className="keybinding">{keybinding}</span>
              </div>
              <div>
                <IconButton src="/img/area.png" onClick={toggleCapture}>
                  {enabled ? 'Stop' : 'Capture'}
                </IconButton>
              </div>
            </div>
          </div>
          <div className="divider" />
          <div className="options">
            <div className="title">Options</div>
            <div className="row">
              <span>Include background</span>
              <Switch
                onChange={handleModeChange}
                checked={mode === 'direct'}
                onColor="#86d3ff"
                onHandleColor="#2693e6"
                handleDiameter={25}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                activeBoxShadow="0px 0px 1px 5px rgba(0, 0, 0, 0.2)"
                height={20}
                width={42}
              />
            </div>
          </div>
          <div className="open-showcase">
            <IconButton src="/img/new-tab.png" onClick={openShowcase}>
              Open showcase
            </IconButton>
          </div>
        </>
      ) : null}
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
