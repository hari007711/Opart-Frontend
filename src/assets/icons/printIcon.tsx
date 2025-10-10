import React from "react";

interface PrintIconProps {
  width?: number;
  height?: number;
  className?: string;
}

const PrintIcon: React.FC<PrintIconProps> = ({
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
        d="M1.8999 0H5.6999V3.8H9.4999V7.6H5.6999V34.2H32.2999V7.6H28.4999V3.8H32.2999V0H36.0999V38H1.8999V0ZM24.6999 3.8V0H28.4999V3.8H24.6999ZM20.8999 3.8H24.6999V7.6H20.8999V3.8ZM17.0999 3.8V0H20.8999V3.8H17.0999ZM13.2999 3.8H17.0999V7.6H13.2999V3.8ZM13.2999 3.8V0H9.4999V3.8H13.2999ZM28.4999 11.4H9.4999V15.2H28.4999V11.4ZM9.4999 19H28.4999V22.8H9.4999V19ZM28.4999 30.4V26.6H20.8999V30.4H28.4999Z"
        fill="#62687E"
      />
    </svg>
  );
};

export default PrintIcon;
