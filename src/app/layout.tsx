import type { Metadata } from "next";

import { FC, ReactElement, ReactNode } from "react";

import { Inter } from "next/font/google";

import { ReactQueryProvider } from "@/libs";

import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  description: "Gede Dewo Wahyu Mustika Wiwaha",
  title: "Editable Table",
};

type T = {
  children: ReactNode;
};

const RootLayout: FC<T> = ({ children }): ReactElement => {
  console.log("© 2023 Editable Table. All rights reserved.");
  console.log("Created by Gede Dewo Wahyu M.W with 🖤");
  return (
    <ReactQueryProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ReactQueryProvider>
  );
};

export default RootLayout;
