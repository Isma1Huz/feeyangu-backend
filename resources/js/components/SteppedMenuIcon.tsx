import React from 'react';

interface Props {
  className?: string;
}

const SteppedMenuIcon: React.FC<Props> = ({ className = '' }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    className={className}
  >
    <line x1="4" y1="5" x2="12" y2="5" />
    <line x1="4" y1="10" x2="15" y2="10" />
    <line x1="4" y1="15" x2="18" y2="15" />
  </svg>
);

export default SteppedMenuIcon;
