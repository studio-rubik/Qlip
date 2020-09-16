import { useLocation } from 'react-router-dom';

function useQueryParam() {
  return useLocation().search;
}

export default useQueryParam;
