import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../../components/common/gql"
import { QpPod, DpPod, Pod, BTLPod, BTLQpPod, QpPodInternal, BTLDpPod } from "../../../@types/pod"
import { Timeline, BTL } from "../../../@types/htl"
import PodArticle from "../ui/podArticle"
import DpArticle from "../ui/dpArticle"
import QpArticle from "../ui/qpArticle"
import styles from "../../../styles/HTL.module.css"
import { update } from "./updater"
import { Popup } from "../htl"

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
  decryptPod
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
  else return <article className={styles.article}>err</article>
}

const buildTimeline = (
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

export const convertPodToBTLPod = (p: Pod | undefined): BTLPod | undefined => {
  if (!p) return undefined
  return {
    ...p,
    context: {
      decrypted: false
    }
  }
}

export const convertQpPodToBTLQpPod = (p: QpPod | undefined): BTLQpPod | undefined => {
  if (!p) return undefined
  if (p.pod) {
    const ret: BTLQpPod = {
      ...p,
      pod: convertPodToBTLPod(p.pod),
      qp: undefined,
      context: {}
    }
    delete ret.qp
    return ret
  } else {
    const ret: BTLQpPod = {
      ...p,
      pod: undefined,
      qp: { ...(p.qp as QpPodInternal), context: {} },
      context: {}
    }
    delete ret.pod
    if (!p.qp) delete ret.qp
    return ret
  }
}

export const convertDpPodToBTLDpPod = (dp: DpPod): BTLDpPod => {
  return {
    ...dp,
    pod: convertPodToBTLPod(dp.pod),
    qp: convertQpPodToBTLQpPod(dp.qp),
    context: {}
  }
}

const convertDpPodToBTL = (dp: DpPod) => {
  const ret: BTL = {
    dp: {
      ...dp,
      pod: convertPodToBTLPod(dp.pod),
      qp: convertQpPodToBTLQpPod(dp.qp),
      context: {}
    }
  }
  if (!ret.dp?.pod) delete ret.dp?.pod
  if (!ret.dp?.qp) delete ret.dp?.qp
  return ret
}

const convertQpPodToBTL = (qp: QpPod) => {
  const ret: BTL = {
    qp: {
      ...(convertQpPodToBTLQpPod(qp) as BTLQpPod),
      pod: convertPodToBTLPod(qp.pod),
      qp: convertQpPodToBTLQpPod(qp.qp),
      context: {}
    }
  }
  if (!ret.qp?.pod) delete ret.qp?.pod
  if (!ret.qp?.qp) delete ret.qp?.qp
  return ret
}

export const convert = (t: Timeline[]): BTL[] => {
  return t.map((e) => {
    if (e.pod) {
      const ret: BTL = {
        pod: convertPodToBTLPod(e.pod)
      }
      return ret
    } else if (e.dp) {
      return convertDpPodToBTL(e.dp)
    } else if (e.qp) {
      return convertQpPodToBTL(e.qp)
    }
  }) as BTL[]
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
