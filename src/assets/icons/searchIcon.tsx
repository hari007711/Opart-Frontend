import React from "react";

interface SearchIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const SearchIcon: React.FC<SearchIconProps> = ({
  width = 38,
  height = 38,
  className = "",
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M29.9881 27.343L38 35.3531L35.3531 38L27.343 29.9881C24.3626 32.3773 20.6555 33.6768 16.8357 33.6714C7.54239 33.6714 0 26.129 0 16.8357C0 7.54239 7.54239 0 16.8357 0C26.129 0 33.6714 7.54239 33.6714 16.8357C33.6768 20.6555 32.3773 24.3626 29.9881 27.343ZM26.2356 25.955C28.6091 23.5133 29.9349 20.2409 29.9301 16.8357C29.9301 9.60195 24.0694 3.74126 16.8357 3.74126C9.60195 3.74126 3.74126 9.60195 3.74126 16.8357C3.74126 24.0694 9.60195 29.9301 16.8357 29.9301C20.2409 29.9349 23.5133 28.6091 25.955 26.2356L26.2356 25.955Z"
        fill="#62687E"
      />
    </svg>
  );
};

export default SearchIcon;
