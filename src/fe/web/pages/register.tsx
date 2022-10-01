import type { NextPage, GetServerSideProps } from "next"
import styles from "../styles/Register.module.css"
import Input from "../components/register/input"
import { AddressInfo } from "net"

export type Props = {
  address: AddressInfo
  hasDraftAccount: boolean
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  let res: Response | null
  const info = ctx.req.socket.address() as AddressInfo

  try {
    res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_WEB_URL}/auth/register/draft?address=${encodeURI(
        info.address
      )}&family=${encodeURI(info.family)}`,
      {
        method: "GET",
        mode: "cors"
      }
    )
    console.log(
      `[log][fe/web] ${process.env.NEXT_PUBLIC_BE_WEB_URL}/auth/register/draft <response status: ${res.status}>`
    )
  } catch (e) {
    console.error(e)
    res = null
  }

  return {
    props: {
      address: info,
      hasDraftAccount: res === null ? false : res.ok === true
    }
  }
}

const Register: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {!props.hasDraftAccount ? <Input {...props} /> : "already draft account registered."}
      </main>
    </div>
  )
}

export default Register
