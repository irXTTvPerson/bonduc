import { BTLDpPod, BTLPod, BTLQpPod, BTLReplyPod } from "../../../@types/pod"
import { BTL } from "../../../@types/htl"
import { onUpdateFav, onUpdateUnFav } from "../ui/footer/fav"
import { onUpdateRp } from "../ui/footer/rp"
import { Reason, Context } from "./initializer"
import { onUpdateReply } from "../ui/footer/reply"

const updateTimeline = (r: Reason, pod: BTLPod | BTLQpPod | BTLReplyPod) => {
  switch (r) {
    case Reason.fav:
      onUpdateFav(pod)
      break
    case Reason.unfav:
      onUpdateUnFav(pod)
      break
    case Reason.qp:
    case Reason.dp:
      onUpdateRp(pod)
      break
    case Reason.reply:
      onUpdateReply(pod)
      break
    default:
      break
  }
}

const updateDecryptedPod = (ctx: Context, content: BTLPod, inner_content: BTLPod) => {
  const { id, body } = ctx as { id: string; body: string }
  if (content?.id === id) {
    content.body = body
    content.context.decrypted = true
  }
  if (inner_content?.id === id) {
    inner_content.body = body
    inner_content.context.decrypted = true
  }
}

const updateContent = (ctx: Context, r: Reason, tl: BTL[]) => {
  return tl.map((e) => {
    const content = e.pod ?? e.qp ?? e.reply
    const inner_content = e.qp?.pod ?? e.qp?.qp ?? e.dp?.pod ?? e.dp?.qp ?? e.dp?.reply
    if (r === Reason.decryptPod) {
      updateDecryptedPod(ctx, content as BTLPod, inner_content as BTLPod)
    } else {
      const id: string = ctx as string
      if (content?.id === id) {
        updateTimeline(r, content)
      }
      if (inner_content?.id === id) {
        updateTimeline(r, inner_content)
      }
    }
    return e
  })
}

const rewriteContent = (ctx: Context, r: Reason, tl: BTL[]) => {
  switch (r) {
    case Reason.dp: {
      const p = ctx as BTLDpPod
      tl.unshift({ dp: p })
      const id = (p.pod?.id ?? p.qp?.id ?? p.reply?.id) as string
      updateContent(id, r, tl)
      break
    }
    case Reason.qp: {
      const p = ctx as BTLQpPod
      tl.unshift({ qp: p })
      const id = (p.pod?.id ?? p.qp?.id ?? p.reply?.id) as string
      updateContent(id, r, tl)
      break
    }
    case Reason.pod:
      tl.unshift({ pod: ctx as BTLPod })
      break
    default:
      break
  }
  return tl.slice(0, 20)
}

export const update = (ctx: Context, r: Reason, tl: BTL[]) => {
  switch (r) {
    case Reason.dp:
    case Reason.qp:
    case Reason.pod:
      return rewriteContent(ctx, r, tl)
    default:
      return updateContent(ctx, r, tl)
  }
}
