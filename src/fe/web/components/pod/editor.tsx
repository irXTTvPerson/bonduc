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
    value
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
        公開範囲: 
        <select {...register("v", { required: true })}>
          <option value={"anyone"}>誰でも</option>
          <option value={"login"}>ログインユーザー</option>
          <option value={"global"} selected>連合</option>
          <option value={"local"}>ローカル</option>
          <option value={"following"}>フォローしてる人</option>
          <option value={"follower"}>フォロワー</option>
          <option value={"mutual"}>相互</option>
          <option value={"mention"}>メンションした人</option>
          <option value={"list"}>リストに入ってる人</option>
          <option value={"password"}>パスワード公開</option>
          <option value={"myself"}>自分のみ</option>
        </select>
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
