import type { NextPage } from "next"
import { SetStateAction, useState, Dispatch } from "react"
import styles from "../../styles/PodEditor.module.css"
import { GqlClient } from "../../components/common/gql"
import {
  PodVisibility,
  Pod,
  BTLPod,
  BTLQpPod,
  QpPod,
  TimelineType,
  BTLReplyPod,
  ReplyPod,
  NormalPod
} from "../../@types/pod"
import PodElement from "../timeline/ui/pod/pod"
import { queryQp } from "../timeline/query/qp"
import { queryPod, queryReplyPod } from "../timeline/query/pod"
import {
  convertPodToBTLPod,
  convertQpPodToBTLQpPod,
  convertReplyPodToBTLReplyPod
} from "../timeline/control/converter"
import { getPodType } from "../common/type/check"

type Context = {
  props: Props
  setPasswordForm: Dispatch<SetStateAction<JSX.Element>>
  setPassword: Dispatch<SetStateAction<string>>
  setMessage: Dispatch<SetStateAction<string>>
  setVisibility: Dispatch<SetStateAction<PodVisibility>>
  setTimelineType: Dispatch<SetStateAction<TimelineType>>
  setBody: Dispatch<SetStateAction<string>>

  formData: {
    body: string
    visibility: PodVisibility
    password: string
    timelineType: TimelineType
  }
}

type OnSuccess = (p: BTLQpPod | BTLPod | BTLReplyPod) => void
export enum PodEditorType {
  pod,
  qp,
  reply
}

export type Props = {
  podType: PodEditorType
  pod?: NormalPod
  onPostSuccess?: OnSuccess
  onPostFail?: () => void
}

const postPodViaQp = async (context: Context) => {
  const gql = new GqlClient()
  await gql.fetch(
    {
      id: context.props.pod?.id,
      body: context.formData.body,
      v: context.formData.visibility,
      type: getPodType(context.props.pod as NormalPod),
      timeline_type: context.formData.timelineType
    },
    queryQp
  )

  const res = gql.res.createQpPod as QpPod | null
  if (res) {
    context.setMessage("post success")
    const qp = convertQpPodToBTLQpPod(res) as BTLQpPod
    if (context.props.onPostSuccess) context.props.onPostSuccess(qp)
  } else {
    context.setMessage("post failed")
    if (context.props.onPostFail) context.props.onPostFail()
  }
}

const postPodViaPod = async (context: Context) => {
  const gql = new GqlClient()
  await gql.fetch(
    {
      body: context.formData.body,
      v: context.formData.visibility,
      timeline_type: context.formData.timelineType,
      p: context.formData.password
    },
    queryPod
  )

  const res = gql.res.createPod as Pod | null
  if (res) {
    context.setMessage("post success")
    const pod = convertPodToBTLPod(res) as BTLPod
    if (context.props.onPostSuccess) context.props.onPostSuccess(pod)
  } else {
    context.setMessage("post failed")
    if (context.props.onPostFail) context.props.onPostFail()
  }
}

const postReplyPod = async (context: Context) => {
  const gql = new GqlClient()
  await gql.fetch(
    {
      body: context.formData.body,
      v: context.formData.visibility,
      timeline_type: context.formData.timelineType,
      reply_to_id: context.props.pod?.id,
      reply_to_type: getPodType(context.props.pod as NormalPod)
    },
    queryReplyPod
  )

  const res = gql.res.createReplyPod as ReplyPod | null
  if (res) {
    context.setMessage("post success")
    const pod = convertReplyPodToBTLReplyPod(res) as BTLReplyPod
    if (context.props.onPostSuccess) context.props.onPostSuccess(pod)
  } else {
    context.setMessage("post failed")
    if (context.props.onPostFail) context.props.onPostFail()
  }
}

const postPod = (context: Context) => {
  ;(async () => {
    context.setMessage("podding...")
    switch (context.props.podType) {
      case PodEditorType.qp:
        await postPodViaQp(context)
        break
      case PodEditorType.pod:
        await postPodViaPod(context)
        break
      case PodEditorType.reply:
        await postReplyPod(context)
        break
      default:
        context.setMessage("error: pod editor type unknown")
        break
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
  const [visibility, setVisibility] = useState<PodVisibility>("login")
  const [timelineType, setTimelineType] = useState<TimelineType>("global")
  const [passwordForm, setPasswordForm] = useState<JSX.Element>(<></>)

  const context: Context = {
    props: props,
    setPasswordForm: setPasswordForm,
    setPassword: setPassword,
    setMessage: setMessage,
    setVisibility: setVisibility,
    setTimelineType: setTimelineType,
    setBody: setBody,
    formData: {
      body: body,
      visibility: visibility,
      password: password,
      timelineType: timelineType
    }
  }

  const refer =
    props.pod && props.podType === PodEditorType.qp ? (
      <>
        このpodをQPします :
        <span className={styles.disp_pod}>
          <PodElement pod={props.pod} onSuccess={() => {}} />
        </span>
      </>
    ) : props.pod && props.podType === PodEditorType.reply ? (
      <>
        このpodにreplyします :
        <span className={styles.disp_pod}>
          <PodElement pod={props.pod} onSuccess={() => {}} />
        </span>
      </>
    ) : (
      <></>
    )

  return (
    <div className={styles.container}>
      {refer}
      <div>
        <textarea className={styles.textarea} onChange={(e) => context.setBody(e.target.value)} />
      </div>
      公開範囲:
      <select
        defaultValue={"login"}
        onChange={(e) => context.setVisibility(e.target.value as PodVisibility)}
      >
        <option value={"anyone"}>誰でも</option>
        <option value={"login"}>ログインユーザー</option>
        {/* <option value={"following"}>フォローしてる人</option> */}
        <option value={"follower"}>フォロワー</option>
        {/* <option value={"mutual"}>相互</option> */}
        {/* <option value={"mention"}>メンションした人</option> */}
        {/* <option value={"list"}>リストに入ってる人</option> */}
        {/* <option value={"myself"}>自分のみ</option> */}
      </select>
      投稿先:
      <select
        defaultValue={"global"}
        onChange={(e) => context.setTimelineType(e.target.value as TimelineType)}
      >
        <option value={"home"}>ホーム</option>
        <option value={"local"}>ローカル</option>
        <option value={"global"}>グローバル</option>
      </select>
      {props.podType === PodEditorType.pod ? (
        <>
          🔐
          <input
            type={"checkbox"}
            onChange={(e) => renderPasswordForm(context, e.target.checked)}
          />
        </>
      ) : (
        <></>
      )}
      {passwordForm}
      <div>
        <button onClick={() => postPod(context)}>pod</button>
      </div>
      {message}
    </div>
  )
}

export default PodEditor
