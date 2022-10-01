import type { NextPage } from "next"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import { Props } from "../../pages/register"

type Inputs = {
  email: string
  password: string
  address: string
  family: string
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
          <input type="text" {...register("email", { required: true })} />
          {errors.email && <div>This field is required</div>}
        </div>
        <div>
          <input type="password" {...register("password", { required: true })} />
          {errors.password && <div>This field is required</div>}
        </div>
        <input type="submit" />
      </form>
      <div>{message}</div>
    </>
  )
}

export default Input
