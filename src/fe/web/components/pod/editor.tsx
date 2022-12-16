import type { NextPage } from "next"
import { useState } from "react"
import { useForm, SubmitHandler } from "react-hook-form"
import styles from "../../styles/PodEditor.module.css"
import { GqlClient } from "../../components/common/gql"
import { PodVisibility, Pod, Type } from "../../@types/pod"
import Image from "next/image"
import { toIconFromVisibility, toDateString } from "../timeline/htl"
import pod_style from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"

type Inputs = {
  body: string
  v: PodVisibility
}

export type Props = {
  isQp: boolean
  rp_type?: Type
  pod?: Pod
  onPostSuccess?: () => void
  onPostFail?: () => void
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

const queryQp = `
mutation ($id: String!, $body: String!, $v: PodVisibility!, $type: String!) {
  createQpPod(
    rp_id: $id
    type: $type
    body: $body
    visibility: $v
  ) {
    value
  }
}
`

const renderPod = (pod: Pod) => {
  return (
    <span className={pod_style.pod_container}>
      <Image src={pod.from.icon_uri} width={56} height={56} alt="icon" />
      <span className={pod_style.pod_right_container}>
        <span className={pod_style.pod_right_container_flex_box}>
          <span
            className={`${pod_style.account_info_name} ${
              pod.mypod ? pod_style.account_info_thisis_me : ""
            }`}
          >
            {pod.from.screen_name}@{pod.from.identifier_name}
          </span>
          <span className={pod_style.account_info_timestamp}>
            <span className={pod_style.visibility}>{toIconFromVisibility(pod.visibility)}</span>
            {toDateString(pod.created_at)}
          </span>
        </span>
        <span>{pod.body.length > 70 ? `${pod.body.slice(0, 70)} . . .` : pod.body}</span>
      </span>
    </span>
  )
}

const RenderForm = (
  isQp: boolean,
  rp_type?: Type,
  pod?: Pod,
  onSuccess?: () => void,
  onFail?: () => void
) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<Inputs>()

  const [result, setResult] = useState("")
  const onSubmit: SubmitHandler<Inputs> = async (data: Inputs): Promise<void> => {
    setResult("podding...")

    const gql = new GqlClient()
    if (isQp) {
      await gql.fetch(
        {
          id: pod?.id,
          body: data.body,
          v: data.v,
          type: rp_type
        },
        queryQp
      )
    } else {
      await gql.fetch(
        {
          body: data.body,
          v: data.v
        },
        query
      )
    }
    const res = isQp ? (gql.res.createQpPod as ResultObject) : (gql.res.createPod as ResultObject)
    if (res.value) {
      setResult("post success")
      if (onSuccess) onSuccess()
    } else {
      setResult("post failed")
      if (onFail) onFail()
    }
  }

  return (
    <>
      {pod && isQp ? (
        <>
          このpodをQPします :<span className={styles.disp_pod}>{renderPod(pod)}</span>
        </>
      ) : (
        <></>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div>
          <textarea
            className={styles.textarea}
            {...register("body", { required: true })}
          ></textarea>
        </div>
        公開範囲:
        <select {...register("v", { required: true })} defaultValue={"global"}>
          <option value={"anyone"}>誰でも</option>
          <option value={"login"}>ログインユーザー</option>
          <option value={"global"}>連合</option>
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

const PodEditor: NextPage<Props> = (props: Props) => {
  return (
    <div className={styles.container}>
      {RenderForm(props.isQp, props.rp_type, props.pod, props.onPostSuccess, props.onPostFail)}
    </div>
  )
}

export default PodEditor
