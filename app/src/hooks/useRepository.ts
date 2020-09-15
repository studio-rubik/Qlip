import { useContext } from 'react';
import { RepositoryContext } from '../contexts/RepositoryContext';

export default () => {
  return useContext(RepositoryContext);
};
