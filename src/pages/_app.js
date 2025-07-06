import Head from 'next/head';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=900, initial-scale=0.8, maximum-scale=1.0, user-scalable=yes" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
