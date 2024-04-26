import type { Metadata } from "next";

import { FC, ReactElement, ReactNode } from "react";

import { Inter } from "next/font/google";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  description: "Generated by create next app",
  title: "Create Next App",
};

type T = {
  children: ReactNode;
};

const RootLayout: FC<T> = ({ children }): ReactElement => {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
};

export default RootLayout;
