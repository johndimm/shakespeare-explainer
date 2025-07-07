import Head from 'next/head';
import "@/styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* Removed viewport meta tag for scroll debugging */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}
