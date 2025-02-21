"use client";

import React from "react";
import { OverlayScrollbarsComponent } from "overlayscrollbars-react";
import "./styles/overlayscrollbars.css";
import { cn } from "@/lib/utils";

export interface CustomScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CustomScrollArea: React.FC<CustomScrollAreaProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <OverlayScrollbarsComponent
      options={{
        scrollbars: {
          autoHide: "leave",
          clickScroll: true,
        },
      }}
      className={cn("h-full w-full", className)}
      {...props}
    >
      {children}
    </OverlayScrollbarsComponent>
  );
};

export default CustomScrollArea; 