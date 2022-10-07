import type { NextPage } from "next"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Props } from "../../pages/auth/register/draft"

type Inputs = {
  email: string
  password: string
  address: string
  family: string
  screen_name: string
  identifier_name: string
}

const Input: NextPage<Props> = (props: Props) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>()

  const [message, updateMessage] = useState("")

  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs): Promise<void> => {
    data.address = props.address.address
    data.family = props.address.family

    updateMessage("sending request...")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/auth/register/draft`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(data),
        mode: "cors"
      })

      if (res.ok) {
        updateMessage("sent register request. check email and verification.")
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
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <div>email:</div>
          <input type="text" {...register("email", { required: true })} />
        </div>
        <div>
          <div>password:</div>
          <input type="password" {...register("password", { required: true })} />
        </div>
        <div>
          <div>screen_name:</div>
          <input type="text" {...register("screen_name", { required: true })} />
        </div>
        <div>
          <div>identifer_name:</div>
          <input type="text" {...register("identifier_name", { required: true })} />
        </div>
        <input type="submit" />
        {(errors.email || errors.password || errors.screen_name || errors.identifier_name) && (
          <div>all fields are required</div>
        )}
      </form>
      <div>{message}</div>
    </>
  )
}

export default Input
