import { alternateName } from 'librechat-data-provider';
import { Content, Portal, Root } from '@radix-ui/react-popover';
import { useGetEndpointsQuery } from 'librechat-data-provider/react-query';
import EndpointItems from './Endpoints/MenuItems';
import { useMindMapHelpers } from '~/hooks';
import TitleButton from './UI/TitleButton';
import { mapEndpoints } from '~/utils';

export default function EndpointsMenu({
  id = 0,
  paramId = undefined,
  nodeId = undefined,
}: {
  id: number;
  paramId: string | undefined;
  nodeId: string | undefined;
}) {
  const { data: endpoints = [] } = useGetEndpointsQuery({
    select: mapEndpoints,
  });

  const { mindMapConversation } = useMindMapHelpers(id, paramId, nodeId);
  const selected = mindMapConversation?.endpoint ?? '';

  if (!selected) {
    console.warn('No endpoint selected');
    return null;
  }
  return (
    <Root>
      <TitleButton primaryText={(alternateName[selected] ?? selected ?? '') + ' '} />
      <Portal>
        <div
          style={{
            position: 'fixed',
            left: '0px',
            top: '0px',
            transform: 'translate3d(268px, 50px, 0px)',
            minWidth: 'max-content',
            zIndex: 'auto',
          }}
        >
          <Content
            side="bottom"
            align="start"
            className="mt-2 max-h-[65vh] min-w-[340px] overflow-y-auto rounded-lg border border-gray-100 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:text-white lg:max-h-[75vh]"
          >
            <EndpointItems endpoints={endpoints} selected={selected} />
          </Content>
        </div>
      </Portal>
    </Root>
  );
}
