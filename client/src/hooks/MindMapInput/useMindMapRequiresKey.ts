import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import { getEndpointField } from '~/utils';
import useMindMapHelpers from '~/hooks/useMindMapHelpers';
import useMindMapUserKey from './useMindMapUserKey';

export default function useMindMapRequiresKey(
  id = 0,
  paramId: string | undefined = undefined,
  nodeId: string | undefined = undefined,
) {
  const { mindMapConversation } = useMindMapHelpers(id, paramId, nodeId);
  const { data: endpointsConfig } = useGetEndpointsQuery();
  const { endpoint } = mindMapConversation || {};
  const userProvidesKey: boolean | null | undefined = getEndpointField(
    endpointsConfig,
    endpoint,
    'userProvide',
  );
  const { getExpiry } = useMindMapUserKey(endpoint ?? '');
  const expiryTime = getExpiry();
  const requiresKey = !expiryTime && userProvidesKey;
  return { requiresKey };
}
