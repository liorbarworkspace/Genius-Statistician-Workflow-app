import React from 'react';

const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      viewBox="0 0 64 64" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      role="img"
    >
      <title>Genius Sports Logo</title>
      <circle cx="32" cy="32" r="30" fill="#0D47A1" />
      <path d="M44.9984 46.9995C40.9984 49.3328 36.665 50.9995 32.0016 50.9995C22.0605 50.9995 14.0016 42.9406 14.0016 32.9995C14.0016 23.0584 22.0605 14.9995 32.0016 14.9995C36.4183 14.9995 40.4183 16.4995 43.6683 18.9995" stroke="white" strokeWidth="5" strokeLinecap="round"/>
      <path d="M29.0016 32.9995H49.0016V22.9995" stroke="white" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

export default Logo;
