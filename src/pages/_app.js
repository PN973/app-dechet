import "@/styles/globals.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { MyContextProvider } from "@/context/Mycontext";


export default function App({ Component, pageProps }) {
  return (
    <MyContextProvider>
      <Component {...pageProps} />
    </MyContextProvider>
  );
}

