import React, {type ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={`bg-white rounded-2xl shadow-md border border-gray-200 ${className}`}
    >
      {children}
    </div>
  );
};

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({
  children,
  className,
}) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
