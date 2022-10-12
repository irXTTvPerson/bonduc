import type { NextPage, GetServerSideProps } from "next"
import styles from "../../styles/Auth.module.css"

type Result = {
  success: boolean
}

type Error = {
  error: boolean
  what: any
}

type Props = Result | Error

const isInvalid = (props: Props): props is Error => "error" in props

export const getServerSideProps: GetServerSideProps<Props> = async (
  ctx
): Promise<{ props: Props }> => {
  const { token } = ctx.query
  if (!token) {
    return {
      props: {
        error: true,
        what: "query is invalid"
      }
    }
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/auth/register?token=${token}`, {
      method: "GET",
      mode: "cors"
    })
    if (!res.ok) {
      return {
        props: {
          error: true,
          what: `server returned ${res.status}`
        }
      }
    }
  } catch (e) {
    return {
      props: {
        error: true,
        what: e
      }
    }
  }

  return {
    props: {
      success: true
    }
  }
}

const Register: NextPage<Props> = (props: Props) => {
  if (isInvalid(props)) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>🤔❓{props.what}</main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>👑registered✨</main>
    </div>
  )
}

export default Register
