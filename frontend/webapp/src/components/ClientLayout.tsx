"use client";
import React from "react";
import { Toaster } from "react-hot-toast";

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
    </>
  );
};

export default ClientLayout; 