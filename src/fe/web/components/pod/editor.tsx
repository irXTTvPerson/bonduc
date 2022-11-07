import type { NextPage } from "next"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import styles from "../../styles/PodEditor.module.css"
import { GqlClient } from "../../components/common/gql"

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

    const gql = new GqlClient()
    await gql.fetch(
      {
        body: data.body,
        to: data.to
      },
      query
    )
    if (gql.err) {
      setResult("post failed")
    } else {
      setResult("post success")
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
