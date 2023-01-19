import type { NextPage, GetServerSideProps } from "next"
import styles from "../../styles/Home.module.css"
import PodPage from "../../components/page/pod"

type Props = {
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      id: ctx.query.id as string
    }
  }
}

const SinglePodPage: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <PodPage id={props.id} />
      </main>
    </div>
  )
}

export default SinglePodPage
