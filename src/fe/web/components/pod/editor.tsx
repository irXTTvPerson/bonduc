import type { NextPage } from "next"
import { SetStateAction, useState, Dispatch } from "react"
import styles from "../../styles/PodEditor.module.css"
import { GqlClient } from "../../components/common/gql"
import { PodVisibility, Pod, Type } from "../../@types/pod"
import Image from "next/image"
import { toIconFromVisibility, toDateString } from "../timeline/htl"
import pod_style from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"

type Context = {
  props: Props
  setPasswordForm: Dispatch<SetStateAction<JSX.Element>>
  setPassword: Dispatch<SetStateAction<string>>
  setMessage: Dispatch<SetStateAction<string>>
  setVisibility: Dispatch<SetStateAction<PodVisibility>>
  setBody: Dispatch<SetStateAction<string>>

  formData: {
    body: string
    visibility: PodVisibility
    password: string
  }
}

export type Props = {
  isQp: boolean
  rp_type?: Type
  pod?: Pod
  onPostSuccess?: () => void
  onPostFail?: () => void
}

const query = `
mutation ($body: String!, $v: PodVisibility!, $p: String) {
  createPod(
    body: $body
    visibility: $v
    password: $p
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
  let body: JSX.Element
  if (pod.visibility === "password") {
    body = <span className={styles.dp_disp}>* パスワード制限がついています *</span>
  } else if (pod.body.length > 70) {
    body = <span>{`${pod.body.slice(0, 70)} . . .`}</span>
  } else {
    body = <span>{pod.body}</span>
  }

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
        {body}
      </span>
    </span>
  )
}

const postPod = (context: Context) => {
  ;(async () => {
    context.setMessage("podding...")
    const gql = new GqlClient()
    if (context.props.isQp) {
      await gql.fetch(
        {
          id: context.props.pod?.id,
          body: context.formData.body,
          v: context.formData.visibility,
          type: context.props.rp_type
        },
        queryQp
      )
    } else {
      await gql.fetch(
        {
          body: context.formData.body,
          v: context.formData.visibility,
          p: context.formData.password
        },
        query
      )
    }
    const res = context.props.isQp
      ? (gql.res.createQpPod as ResultObject)
      : (gql.res.createPod as ResultObject)
    if (res.value) {
      context.setMessage("post success")
      if (context.props.onPostSuccess) context.props.onPostSuccess()
    } else {
      context.setMessage("post failed")
      if (context.props.onPostFail) context.props.onPostFail()
    }
  })()
}

const renderPasswordForm = (context: Context, showForm: boolean) => {
  if (showForm) {
    context.setPasswordForm(
      <>
        パスワード:
        <input type="password" onChange={(e) => context.setPassword(e.target.value)} />
      </>
    )
  } else {
    context.setPasswordForm(<></>)
  }
}

const PodEditor: NextPage<Props> = (props: Props) => {
  const [message, setMessage] = useState("")
  const [password, setPassword] = useState("")
  const [body, setBody] = useState("")
  const [visibility, setVisibility] = useState<PodVisibility>("global")
  const [passwordForm, setPasswordForm] = useState<JSX.Element>(<></>)

  const context: Context = {
    props: props,
    setPasswordForm: setPasswordForm,
    setPassword: setPassword,
    setMessage: setMessage,
    setVisibility: setVisibility,
    setBody: setBody,
    formData: {
      body: body,
      visibility: visibility,
      password: password
    }
  }

  return (
    <div className={styles.container}>
      {props.pod && props.isQp ? (
        <>
          このpodをQPします :<span className={styles.disp_pod}>{renderPod(props.pod)}</span>
        </>
      ) : (
        <></>
      )}
      <div>
        <textarea
          className={styles.textarea}
          onChange={(e) => context.setBody(e.target.value)}
        ></textarea>
      </div>
      公開範囲:
      <select
        defaultValue={"global"}
        onChange={(e) => {
          context.setVisibility(e.target.value as PodVisibility)
          renderPasswordForm(context, e.target.value === "password")
        }}
      >
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
      {passwordForm}
      <div>
        <button onClick={() => postPod(context)}>pod</button>
      </div>
      {message}
    </div>
  )
}

export default PodEditor
