"use client";
import React from "react";

function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex flex-row h-full">{children}</div>;
}

export default AppShell;
