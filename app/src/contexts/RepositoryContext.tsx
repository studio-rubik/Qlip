import React, { useEffect, createContext } from 'react';

import ServerRepository from '../db';
import * as errors from '../common/errors';
import Repository from '../interface/repository';
import { useStore } from '../store';

const serverRepository = new ServerRepository(
  process.env.REACT_APP_BACKEND_URL!,
);
serverRepository.client.afterResponse((resp) => {
  if (!resp.ok) {
    switch (resp.status) {
      case 401:
        throw new errors.RepositoryUnauthorized();
      case 404:
        throw new errors.RepositoryNotFound();
    }
    throw new errors.RepositoryError('http status is not 2xx');
  }
  return resp;
});

export const RepositoryContext = createContext<Repository>(serverRepository);

export const RepositoryCtxProvider: React.FC = ({ children }) => {
  const token = useStore((store) => store.idToken);

  useEffect(() => {
    serverRepository.client.token = token;
  }, [token]);

  return (
    <RepositoryContext.Provider value={serverRepository}>
      {children}
    </RepositoryContext.Provider>
  );
};
