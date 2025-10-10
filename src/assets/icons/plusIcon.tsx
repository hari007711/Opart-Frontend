import React from "react";

interface PlusIconProps {
  width?: number;
  height?: number;
  className?: string;
  color?: string;
}

const PlusIcon: React.FC<PlusIconProps> = ({
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
        d="M16 35C16 35.7957 16.3161 36.5587 16.8787 37.1213C17.4413 37.6839 18.2044 38 19 38C19.7956 38 20.5587 37.6839 21.1213 37.1213C21.6839 36.5587 22 35.7957 22 35V22H35C35.7957 22 36.5587 21.6839 37.1213 21.1213C37.6839 20.5587 38 19.7956 38 19C38 18.2044 37.6839 17.4413 37.1213 16.8787C36.5587 16.3161 35.7957 16 35 16H22V3C22 2.20435 21.6839 1.44129 21.1213 0.87868C20.5587 0.316071 19.7956 0 19 0C18.2044 0 17.4413 0.316071 16.8787 0.87868C16.3161 1.44129 16 2.20435 16 3V16H3C2.20435 16 1.44129 16.3161 0.87868 16.8787C0.316071 17.4413 0 18.2044 0 19C0 19.7956 0.316071 20.5587 0.87868 21.1213C1.44129 21.6839 2.20435 22 3 22H16V35Z"
        fill={color}
      />
    </svg>
  );
};

export default PlusIcon;
