import type { AppProps } from "next/app";
import Head from "next/head";
import "react-color-palette/lib/css/styles.css";
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no"
        />
        <title>ColorDeltaE00</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
