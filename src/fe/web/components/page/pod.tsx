import type { NextPage } from "next"
import { useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import pp from "../../styles/popup.module.css"
import { queryFindPod, querygetReplyPodViaReplyToId } from "../../components/timeline/query/pod"
import { Timeline } from "../../@types/htl"
import {
  buildUI,
  OnSuccess,
  Context,
  Reason,
  buildTimeline
} from "../../components/timeline/control/initializer"
import { update } from "../../components/timeline/control/updater"
import { convert } from "../../components/timeline/control/converter"
import { BTLDpPod, BTLQpPod, ReplyPod } from "../../@types/pod"
import { onUpdateFav, onUpdateUnFav } from "../../components/timeline/ui/footer/fav"
import { onUpdateReply } from "../../components/timeline/ui/footer/reply"
import { BTL } from "../../@types/htl"

type Props = {
  id: string
}

const fetch = (id: string) => {
  return (async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: id }, queryFindPod)
    if (gql.err || !gql.res.findPod) return null
    else return gql.res.findPod as Timeline
  })()
}

const fetchReply = (reply_to_id: string) => {
  return (async () => {
    const gql = new GqlClient()
    await gql.fetch({ reply_to_id: reply_to_id }, querygetReplyPodViaReplyToId)
    if (gql.err || !gql.res.getReplyPodViaReplyToId) return null
    else return gql.res.getReplyPodViaReplyToId as ReplyPod[]
  })()
}

const onSuccess = (btl: BTL[], ctx: Context, r: Reason) => {
  return btl.map((e) => {
    if (!e.reply) {
      console.error("invalid reply object")
      return e
    }
    if (typeof ctx === "string") {
      if (e.reply.id === ctx) {
        switch (r) {
          case Reason.fav:
            onUpdateFav(e.reply)
            break
          case Reason.unfav:
            onUpdateUnFav(e.reply)
            break
          case Reason.reply:
            onUpdateReply(e.reply)
            break
        }
      }
    } else {
      switch (r) {
        case Reason.dp:
        case Reason.qp: {
          const c = ctx as BTLQpPod | BTLDpPod
          if (e.reply.id === c.reply?.id) e.reply.rp_count += 1
          break
        }
      }
    }
    return e
  })
}

const PodPage: NextPage<Props> = (props: Props) => {
  const [result, setResult] = useState<JSX.Element>(<></>)
  const [popup, setPopup] = useState<JSX.Element>(<></>)
  const [replies, setReplies] = useState<JSX.Element[]>([])

  const o = (e: JSX.Element) => {
    setPopup(
      <>
        <span
          className={pp.popup_clickable_area}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setPopup(<></>)
            }
          }}
        >
          <span className={pp.popup}>{e}</span>
        </span>
      </>
    )
  }

  const c = () => {
    setPopup(<></>)
  }

  useEffect(() => {
    fetchReply(props.id).then((res) => {
      if (!res) setReplies([<>error</>])
      else {
        const tl = []
        for (const r of res) tl.push({ reply: r })
        const btl = convert(tl)
        const ok: OnSuccess = (ctx: Context, r: Reason) => {
          const updated = onSuccess(btl, ctx, r)
          buildTimeline(updated, ok, setReplies, { open: o, close: c })
        }
        buildTimeline(btl, ok, setReplies, { open: o, close: c })
      }
    })

    fetch(props.id).then((res) => {
      if (!res) setResult(<>error</>)
      else {
        const btl = convert([res])
        const ok: OnSuccess = (ctx: Context, r: Reason) => {
          const updated = update(ctx, r, btl)
          const article = buildUI(updated.slice(-1)[0], ok, { open: o, close: c }, 0)
          setResult(article)
        }
        const article = buildUI(btl[0], ok, { open: o, close: c }, 0)
        setResult(article)
      }
    })
  }, [])

  return (
    <>
      {result}
      {replies}
      {popup}
    </>
  )
}

export default PodPage
