import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Switch from 'rc-switch';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import 'rc-switch/assets/index.css';
import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

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
  const [margin, setMargin] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg.type === 'capture.toggle.complete') {
        window.close();
      } else if (msg.type === 'mode.toggle.complete') {
        setMode(msg.data.value);
      } else if (msg.type === 'margin.set.complete') {
        setMargin(msg.data.value);
      }
    });
    chrome.runtime.sendMessage({ type: 'idToken' }, (resp) => {
      setIdToken(resp.data.idToken);
    });
    chrome.runtime.sendMessage({ type: 'mode.get' }, (resp) => {
      setMode(resp.data.value);
    });
    chrome.runtime.sendMessage({ type: 'margin.get' }, (resp) => {
      setMargin(resp.data.value);
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

  const handleModeChange = () => {
    chrome.runtime.sendMessage({ type: 'mode.toggle.request' }, (resp) => {
      setMode(resp.data.value);
    });
  };

  const handleMarginChange = (value: number) => {
    setMargin(value);
  };

  const handleMarginChangeCommit = () => {
    chrome.runtime.sendMessage(
      { type: 'margin.set.request', data: { value: margin } },
      (resp) => {
        setMargin(resp.data.value);
      },
    );
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
              <span className="description">Include background</span>
              <Switch onClick={handleModeChange} checked={mode === 'direct'} />
            </div>
            <div className="row">
              <span className="description">Margin</span>
              <div className="input">
                <Slider
                  min={0}
                  max={50}
                  onChange={handleMarginChange}
                  onAfterChange={handleMarginChangeCommit}
                  value={margin}
                  handle={handle}
                />
              </div>
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

const handle = (props: any) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Slider.Handle value={value} {...restProps} />
    </Tooltip>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
