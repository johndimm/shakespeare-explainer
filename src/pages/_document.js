import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="manifest" href="/app-manifest.json" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="description" content="AI-powered Shakespeare text analysis and explanation tool" />
        <link rel="apple-touch-icon" href="/android-chrome-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Shakespeare" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
