import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

import '../styles/popup.css';

const App: React.FC = () => {
  const [data, setData] = useState(0);

  useEffect(() => {
    console.log(data);
    chrome.runtime.sendMessage({ type: 'some', data: 'thing' });
    // chrome.runtime.onMessage.addListener(function (request) {
    //   if (request.msg === 'something_completed') {
    //     //  To do something
    //     setData(request.data.subject);
    //   }
    // });
  }, []);
  return (
    <div className="popup-padded">
      <h1>Hello React</h1>
      <p>{data}</p>
    </div>
  );
};

// --------------

ReactDOM.render(<App />, document.getElementById('root'));
