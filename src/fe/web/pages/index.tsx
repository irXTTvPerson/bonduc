import type { NextPage, GetServerSideProps } from "next"
import HTL from "../components/timeline/htl"
import styles from "../styles/Home.module.css"

type Props = {
  session: string | undefined
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      session: ctx.req.cookies["session"]
    }
  }
}

const Home: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>{props.session ? <HTL /> : "need login"}</main>
    </div>
  )
}

export default Home
