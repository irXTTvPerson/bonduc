import type { NextPage, GetServerSideProps } from "next"
import HTL from "../components/timeline/htl"
import styles from "../styles/Home.module.css"
import { queryHome } from "../components/timeline/query/home"

type Props = {
  session: string | null
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      session: ctx.req.cookies["session"] || null
    }
  }
}

const Home: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {props.session ? <HTL query={queryHome} /> : "need login"}
      </main>
    </div>
  )
}

export default Home
