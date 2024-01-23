import { memo } from 'react';
import { BaseEdge, EdgeProps, getSimpleBezierPath } from 'reactflow';

function MindMapEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY } = props;

  const [edgePath] = getSimpleBezierPath({
    sourceX,
    sourceY: sourceY + 18,
    targetX,
    targetY,
  });

  return <BaseEdge path={edgePath} {...props} />;
}

export default memo(MindMapEdge);
