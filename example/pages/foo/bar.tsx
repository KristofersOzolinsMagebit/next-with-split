import Head from 'next/head'
import Image from 'next/image'
import { FC } from 'react'
import styles from '../../styles/Home.module.css'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async ({
  req,
  preview
}) => {
  console.log(req.headers)
  console.log(preview)

  return {
    props: {}
  }
}

const Home: FC = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>FOO/BAR</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>FOO/BAR</h1>
        <button
          onClick={() => {
            document.cookie = `x-split-key-test1=; path=/; expires=${new Date(
              '1999-12-31T23:59:59Z'
            ).toUTCString()}`
          }}
        >
          Reset Split Sticky
        </button>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home
