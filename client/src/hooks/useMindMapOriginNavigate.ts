import { useNavigate } from 'react-router-dom';

const useMindMapOriginNavigate = () => {
  const _navigate = useNavigate();

  const navigate = (url?: string | null, opts = {}) => {
    _navigate(`${url}`, opts);
  };

  return navigate;
};

export default useMindMapOriginNavigate;
