import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { Auth0Provider } from './auth0';
import { BrowserRouter as Router } from 'react-router-dom';
import history from './common/history';
import { RepositoryCtxProvider } from './contexts/RepositoryContext';

if (
  process.env.REACT_APP_BACKEND_URL === undefined ||
  process.env.REACT_APP_AUTH0_DOMAIN === undefined ||
  process.env.REACT_APP_AUTH0_CLIENT_ID === undefined ||
  process.env.REACT_APP_AUTH0_AUDIENCE === undefined ||
  process.env.REACT_APP_OIDC_NAMESPACE === undefined
) {
  throw Error('Some environment variable(s) is(are) missing');
}

const onRedirectCallback = (appState: any) => {
  history.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : window.location.pathname,
  );
};

ReactDOM.render(
  <Auth0Provider
    domain={process.env.REACT_APP_AUTH0_DOMAIN}
    client_id={process.env.REACT_APP_AUTH0_CLIENT_ID}
    audience={process.env.REACT_APP_AUTH0_AUDIENCE}
    redirect_uri={window.location.origin}
    onRedirectCallback={onRedirectCallback}
  >
    <RepositoryCtxProvider>
      <Router>
        <App />
      </Router>
    </RepositoryCtxProvider>
  </Auth0Provider>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
