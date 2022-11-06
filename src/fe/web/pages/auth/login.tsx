import type { NextPage, GetServerSideProps } from "next"
import { useRouter } from "next/router"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import styles from "../../styles/Auth.module.css"

type Inputs = {
  email: string
  password: string
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const session = ctx.req.cookies["session"] || null
  if (session) {
    return {
      redirect: {
        permanent: false,
        destination: "/"
      }
    }
  }
  return { props: {} }
}

const Login: NextPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>()

  const router = useRouter()

  const [message, updateMessage] = useState("")

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs): Promise<void> => {
    updateMessage("sending request...")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/auth/login`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data),
        mode: "cors",
        credentials: "include"
      })

      if (res.ok) {
        router.replace("/")
      } else {
        console.log(res.statusText)
        updateMessage("request failed.")
      }
    } catch (e) {
      console.error(e)
      updateMessage("something wrong ...")
    }
  }

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <div>email:</div>
            <input type="text" {...register("email", { required: true })} />
          </div>
          <div>
            <div>password:</div>
            <input type="password" {...register("password", { required: true })} />
          </div>
          <input type="submit" />
          {(errors.email || errors.password) && <div>all fields are required</div>}
        </form>
        <div>{message}</div>
      </main>
    </div>
  )
}

export default Login
