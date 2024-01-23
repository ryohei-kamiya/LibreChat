import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import type { DropTargetMonitor } from 'react-dnd';
import useMindMapFileHandling from './useMindMapFileHandling';

export default function useMindMapDragHelpers(
  id = 0,
  paramId: string | undefined = undefined,
  nodeId: string | undefined = undefined,
) {
  const { files, handleFiles } = useMindMapFileHandling(id, paramId, nodeId);
  const [{ canDrop, isOver }, drop] = useDrop(
    () => ({
      accept: [NativeTypes.FILE],
      drop(item: { files: File[] }) {
        console.log('drop', item.files);
        handleFiles(item.files);
      },
      canDrop() {
        // console.log('canDrop', item.files, item.items);
        return true;
      },
      // hover() {
      //   // console.log('hover', item.files, item.items);
      // },
      collect: (monitor: DropTargetMonitor) => {
        // const item = monitor.getItem() as File[];
        // if (item) {
        //   console.log('collect', item.files, item.items);
        // }

        return {
          isOver: monitor.isOver(),
          canDrop: monitor.canDrop(),
        };
      },
    }),
    [files],
  );

  return {
    canDrop,
    isOver,
    drop,
  };
}
