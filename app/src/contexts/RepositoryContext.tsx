import React, { createContext, useEffect, useState } from 'react';
import ServerRepository from '../db';

import * as errors from '../common/errors';
import Repository from '../interface/repository';

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
  return (
    <RepositoryContext.Provider value={serverRepository}>
      {children}
    </RepositoryContext.Provider>
  );
};
