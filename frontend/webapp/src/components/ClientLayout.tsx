"use client";
import React from "react";
import { Toaster } from "react-hot-toast";

const ClientLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#2f2f2f",
            color: "#ffffff",
            fontFamily: "inherit",
          },
        }}
      />
    </>
  );
};

export default ClientLayout; 