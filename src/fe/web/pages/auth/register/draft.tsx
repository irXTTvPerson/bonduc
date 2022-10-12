import type { NextPage, GetServerSideProps } from "next"
import styles from "../../../styles/Auth.module.css"
import Input from "../../../components/auth/input"
import { AddressInfo } from "net"

export type Props = {
  address: AddressInfo
}

export const getServerSideProps: GetServerSideProps<Props> = async (
  ctx
): Promise<{ props: Props }> => {
  const info = ctx.req.socket.address() as AddressInfo
  return {
    props: {
      address: info
    }
  }
}

const Draft: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Input {...props} />
      </main>
    </div>
  )
}

export default Draft
