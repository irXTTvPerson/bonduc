import type { NextPage, GetServerSideProps } from "next"
import styles from "../../styles/Auth.module.css"

type Props = {
  message: "invalid token" | "failed fetching" | "got fetch exception" | "success"
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = ctx.req.cookies["session"] || null
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    }
  }

  const { token } = ctx.query
  if (!token) {
    return {
      props: {
        message: "invalid token"
      }
    }
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BE_WEB_URL_ON_SSR}/auth/register?token=${token}`,
      {
        method: "GET",
        mode: "cors"
      }
    )
    if (!res.ok) {
      return {
        props: {
          message: "failed fetching"
        }
      }
    }
  } catch (e) {
    return {
      props: {
        message: "got fetch exception"
      }
    }
  }

  return {
    props: {
      message: "success"
    }
  }
}

const Register: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>{props.message}</main>
    </div>
  )
}

export default Register
