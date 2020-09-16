import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from 'react-router-dom';
import { RepositoryCtxProvider } from './contexts/RepositoryContext';

if (process.env.REACT_APP_BACKEND_URL === undefined) {
  throw Error('Some environment variable(s) is(are) missing');
}

ReactDOM.render(
  <RepositoryCtxProvider>
    <Router>
      <App />
    </Router>
  </RepositoryCtxProvider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
