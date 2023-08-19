import Head from 'next/head'
import Header from './Header'
import Footer from './Footer'

const Layout = ({ children }) => {
  return (
    <>
        <Head>
            <title>Time zone convertor</title>
            <meta name="description" content="see relative time of different time zones around the world" />
            <link rel="icon" href="/favicon.jpeg" />
        </Head>

        <Header />

        { children }

        <Footer />
    </>
  )
}

export default Layout