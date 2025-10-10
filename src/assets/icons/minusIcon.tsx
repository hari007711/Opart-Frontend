import React from "react";

interface MinusIconProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const MinusIcon: React.FC<MinusIconProps> = ({
  width = 38,
  height = 38,
  className = "",
  color = "#62687E",
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
        d="M34.6471 15.6471C36.4988 15.6471 38 17.1483 38 19C38 20.8518 36.4988 22.353 34.6471 22.353H3.35294C1.50116 22.353 0 20.8518 0 19C0 17.1483 1.50116 15.6471 3.35294 15.6471H34.6471Z"
        fill={color}
      />
    </svg>
  );
};

export default MinusIcon;
