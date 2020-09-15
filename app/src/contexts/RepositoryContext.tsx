import React, { createContext, useEffect, useState } from 'react';
import ServerRepository from '../db';

import * as errors from '../common/errors';
import Repository from '../interface/repository';
import { useAuth0 } from '../auth0';

const serverRepository = new ServerRepository(
  process.env.REACT_APP_BACKEND_URL!,
);
serverRepository.client.afterResponse((resp) => {
  if (!resp.ok) {
    if (resp.status === 404) {
      throw new errors.RepositoryNotFound();
    }
    throw new errors.RepositoryError('http status is not 2xx');
  }
  return resp;
});

export const RepositoryContext = createContext<Repository>(serverRepository);

export const RepositoryCtxProvider: React.FC = ({ children }) => {
  const {
    isAuthenticated,
    getTokenSilently,
    loading: authLoading,
  } = useAuth0();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fn() {
      if (authLoading || !isAuthenticated) {
        setLoading(false);
        return;
      }
      try {
        const authToken = await getTokenSilently();
        serverRepository.setAuthToken(authToken || null);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }
    fn();
  }, [getTokenSilently, authLoading, isAuthenticated]);
  return (
    <RepositoryContext.Provider value={serverRepository}>
      {loading ? 'loading' : children}
    </RepositoryContext.Provider>
  );
};
