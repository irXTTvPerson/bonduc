import type { NextPage } from "next"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import styles from "../../styles/PodEditor.module.css"
import { GqlClient } from "../../components/common/gql"
import { PodVisibility } from "../../@types/pod"

type Inputs = {
  body: string
  v: PodVisibility
}

const query = `
mutation ($body: String!, $v: PodVisibility!) {
  createPod(
    body: $body
    visibility: $v
  ) {
    id
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
        v: data.v
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
          <input type="radio" id="public" {...register("v", { required: true })} value={"global"} />
          public
        </label>
        <label>
          <input type="radio" id="local" {...register("v", { required: true })} value={"local"} />
          local
        </label>
        <div>
          <input type="submit" />
        </div>
      </form>
      {errors.body || errors.v ? "all fields are required" : result}
    </>
  )
}

const PodEditor: NextPage = () => {
  return <div className={styles.container}>{RenderForm()}</div>
}

export default PodEditor
