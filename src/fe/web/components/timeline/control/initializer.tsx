import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../../components/common/gql"
import { BTLPod, BTLQpPod, BTLDpPod, BTLReplyPod } from "../../../@types/pod"
import { Timeline, BTL } from "../../../@types/htl"
import PodArticle from "../ui/podArticle"
import DpArticle from "../ui/dpArticle"
import QpArticle from "../ui/qpArticle"
import ReplyArticle from "../ui/replyArticle"
import styles from "../../../styles/HTL.module.css"
import { update } from "./updater"
import { Popup } from "../htl"
import { convert } from "./converter"

type Props = {
  query: string
  popup: Popup
}

export enum Reason {
  fav,
  unfav,
  dp,
  qp,
  pod,
  decryptPod,
  reply
}

export type Context = string | BTLPod | BTLQpPod | BTLDpPod | { id: string; body: string }
export type OnSuccess = (ctx: Context, r: Reason) => void

const fetch = async (query: string, onError: () => void) => {
  const gql = new GqlClient()
  await gql.fetch({}, query)
  if (gql.err || !gql.res.getHTL) {
    onError()
  } else return gql.res.getHTL as Timeline[]
}

export const buildUI = (e: BTL, onSuccess: OnSuccess, popup: Popup, index: number) => {
  if (e.pod)
    return <PodArticle pod={e.pod as BTLPod} onSuccess={onSuccess} popup={popup} key={index} />
  else if (e.dp)
    return <DpArticle dp={e.dp as BTLDpPod} onSuccess={onSuccess} popup={popup} key={index} />
  else if (e.qp)
    return <QpArticle qp={e.qp as BTLQpPod} onSuccess={onSuccess} popup={popup} key={index} />
  else if (e.reply)
    return (
      <ReplyArticle
        reply={e.reply as BTLReplyPod}
        onSuccess={onSuccess}
        popup={popup}
        key={index}
      />
    )
  else
    return (
      <article className={styles.article} key={index}>
        err
      </article>
    )
}

export const buildTimeline = (
  t: BTL[],
  onSuccess: OnSuccess,
  setContent: Dispatch<SetStateAction<JSX.Element[]>>,
  popup: Popup
) => {
  const result: JSX.Element[] = []
  let count = 0
  t.forEach((e) => {
    const ui = buildUI(e, onSuccess, popup, count++)
    result.push(ui)
  })
  setContent(result)
}

const Initializer: NextPage<Props> = (props: Props) => {
  const [content, setContent] = useState<JSX.Element[]>([])
  const onError = () => setContent([<>failed to get timeline🤔</>])

  useEffect(() => {
    fetch(props.query, onError).then((res) => {
      const t: Timeline[] = res as Timeline[]
      const btl = convert(t)

      const ok: OnSuccess = (ctx: Context, r: Reason) => {
        const updated = update(ctx, r, btl)
        buildTimeline(updated, ok, setContent, props.popup)
      }

      buildTimeline(btl, ok, setContent, props.popup)
    })
  }, [])

  return <>{content}</>
}

export default Initializer
