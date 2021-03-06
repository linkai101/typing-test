import Head from 'next/head';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Typing Test (beta)</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="A speed typing practice site. Keyboard recommended!"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
