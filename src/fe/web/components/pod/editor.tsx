import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import styles from "../../styles/PodEditor.module.css"

type Inputs = {
  body: string
  to: string[]
}

const query = `
mutation ($body: String!, $to: [String!]!) {
	createPod(
    body: $body
    to: $to
  ) {
    id
    body
    created_at
    from {
      screen_name
      identifier_name
    }
  }
}
`

const RenderForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>()

  const [result, setResult] = useState("")
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs): Promise<void> => {
    setResult("podding...")
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/graphql`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          operationName: null,
          variables: {
            body: data.body,
            to: data.to
          },
          query: query
        })
      })

      if (res.ok) {
        const ret = await res.json()
        if (ret?.errors) {
          setResult(`error: ${ret.errors[0].message}`)
        } else {
          setResult("post success")
        }
      } else {
        console.log(res.statusText)
        setResult("post failed")
      }
    } catch (e) {
      console.error(e)
      setResult("post error")
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <textarea
            className={styles.textarea}
            {...register("body", { required: true })}
          ></textarea>
        </div>
        <label>
          <input
            type="radio"
            id="public"
            {...register("to", { required: true })}
            value={["https://www.w3.org/ns/activitystreams#Public"]}
          />
          public
        </label>
        <label>
          <input
            type="radio"
            id="local"
            {...register("to", { required: true })}
            value={["https://www.w3.org/ns/activitystreams#Local"]}
          />
          local
        </label>
        <div>
          <input type="submit" />
        </div>
      </form>
      {errors.body || errors.to ? "all fields are required" : result}
    </>
  )
}

const PodEditor: NextPage = () => {
  return <div className={styles.container}>{RenderForm()}</div>
}

export default PodEditor
