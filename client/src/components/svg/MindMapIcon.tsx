export default function MindMapIcon({ className = '' }) {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      enableBackground="new 0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g fill="#FFFFFF" stroke="currentColor" strokeWidth="2">
        <line x1="24" y1="8" x2="24" y2="24" />
        <line x1="39" y1="21" x2="24" y2="24" />
        <line x1="7" y1="13" x2="24" y2="24" />
        <line x1="11" y1="41" x2="24" y2="24" />
        <line x1="34" y1="39" x2="24" y2="24" />
      </g>
      <circle fill="currentColor" stroke="currentColor" strokeWidth="2" cx="24" cy="24" r="6" />
      <g fill="#FFFFFF" stroke="currentColor" strokeWidth="2">
        <circle cx="24" cy="8" r="4" />
        <circle cx="39" cy="21" r="4" />
        <circle cx="7" cy="13" r="4" />
        <circle cx="11" cy="41" r="4" />
        <circle cx="34" cy="39" r="4" />
      </g>
    </svg>
  );
}
