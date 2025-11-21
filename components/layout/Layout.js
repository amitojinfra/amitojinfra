import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, title = 'AmitojInfra - Next.js App', description = 'A Next.js application deployed on GitHub Pages' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <main className="main">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Layout;