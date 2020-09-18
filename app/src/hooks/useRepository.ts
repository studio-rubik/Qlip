import { useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { RepositoryContext } from '../contexts/RepositoryContext';
import { useStore } from '../store';

const useRepository = () => {
  return useContext(RepositoryContext);
};

export default useRepository;

export const useFetchComponents = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  const location = useLocation();

  return useCallback(() => {
    const queries = new URLSearchParams(location.search);
    const qs: { [k: string]: string } = {};
    const tag = queries.get('tag');
    const site = queries.get('website');
    if (tag != null) {
      qs['tag'] = tag;
    }
    if (site != null) {
      qs['website'] = site;
    }
    repo.componentsFilter(qs).then((resp) => {
      set((store) => {
        store.components = resp.data.components;
        store.componentFiles = resp.data.componentFiles;
      });
    });
  }, [repo, set, location]);
};

export const useFetchTags = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  return useCallback(
    () =>
      repo.tagsAll().then((resp) => {
        set((store) => {
          store.tags = resp.data.tags;
        });
      }),
    [repo, set],
  );
};

export const useFetchWebsites = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  return useCallback(
    () =>
      repo.websitesAll().then((resp) => {
        set((store) => {
          store.websites = resp.data.websites;
        });
      }),
    [repo, set],
  );
};
