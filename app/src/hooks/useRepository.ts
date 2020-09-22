import { useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

import { ComponentsFilterQueries } from '../interface/repository';
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

  return useCallback(
    async (page: { limit: number; offset: number }, reset = true) => {
      const queries = new URLSearchParams(location.search);
      const qs: ComponentsFilterQueries = {};
      qs.tag = queries.get('tag');
      qs.website = queries.get('website');
      qs.limit = page.limit;
      qs.offset = page.offset;
      const resp = await repo.componentsFilter(qs);
      set((store) => {
        if (reset) {
          store.components = resp.data.components;
          store.componentFiles = resp.data.componentFiles;
        } else {
          store.components.byId = {
            ...store.components.byId,
            ...resp.data.components.byId,
          };
          store.components.allIds = [
            ...store.components.allIds,
            ...resp.data.components.allIds,
          ];
          store.componentFiles.byId = {
            ...store.componentFiles.byId,
            ...resp.data.componentFiles.byId,
          };
          store.componentFiles.allIds = [
            ...store.componentFiles.allIds,
            ...resp.data.componentFiles.allIds,
          ];
        }
      });
      return resp.hasMore;
    },
    [repo, set, location],
  );
};

export const useFetchTags = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  return useCallback(async () => {
    const resp = await repo.tagsAll();
    set((store) => {
      store.tags = resp.data.tags;
    });
  }, [repo, set]);
};

export const useFetchWebsites = () => {
  const repo = useRepository();
  const set = useStore((store) => store.set);
  return useCallback(async () => {
    const resp = await repo.websitesAll();
    set((store) => {
      store.websites = resp.data.websites;
    });
  }, [repo, set]);
};
