// icon taken from grommet https://icons.grommet.io

function MindMapDragIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="1"
        d="M15 5h2V3h-2v2zM7 5h2V3H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2zm8 8h2v-2h-2v2zm-8 0h2v-2H7v2z"
      />
    </svg>
  );
}

export default MindMapDragIcon;
