import {
  QpPod,
  DpPod,
  Pod,
  BTLPod,
  BTLQpPod,
  QpPodInternal,
  BTLDpPod,
  ReplyPod,
  BTLReplyPod
} from "../../../@types/pod"
import { Timeline, BTL } from "../../../@types/htl"

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
      reply: undefined,
      context: {}
    }
    delete ret.qp
    delete ret.reply
    return ret
  } else {
    const ret: BTLQpPod = {
      ...p,
      pod: undefined,
      qp: { ...(p.qp as QpPodInternal), context: {} },
      reply: undefined,
      context: {}
    }
    delete ret.pod
    delete ret.reply
    if (!p.qp) delete ret.qp
    return ret
  }
}

export const convertDpPodToBTLDpPod = (dp: DpPod): BTLDpPod => {
  return {
    ...dp,
    pod: convertPodToBTLPod(dp.pod),
    qp: convertQpPodToBTLQpPod(dp.qp),
    reply: convertReplyPodToBTLReplyPod(dp.reply),
    context: {}
  }
}

const convertDpPodToBTL = (dp: DpPod) => {
  const ret: BTL = {
    dp: {
      ...dp,
      pod: convertPodToBTLPod(dp.pod),
      qp: convertQpPodToBTLQpPod(dp.qp),
      reply: convertReplyPodToBTLReplyPod(dp.reply),
      context: {}
    }
  }
  if (!ret.dp?.pod) delete ret.dp?.pod
  if (!ret.dp?.qp) delete ret.dp?.qp
  if (!ret.dp?.reply) delete ret.dp?.reply
  return ret
}

const convertQpPodToBTL = (qp: QpPod) => {
  const ret: BTL = {
    qp: {
      ...(convertQpPodToBTLQpPod(qp) as BTLQpPod),
      pod: convertPodToBTLPod(qp.pod),
      qp: convertQpPodToBTLQpPod(qp.qp),
      reply: convertReplyPodToBTLReplyPod(qp.reply),
      context: {}
    }
  }
  if (!ret.qp?.pod) delete ret.qp?.pod
  if (!ret.qp?.qp) delete ret.qp?.qp
  if (!ret.qp?.reply) delete ret.qp?.reply
  return ret
}

export const convertReplyPodToBTLReplyPod = (p: ReplyPod | undefined): BTLReplyPod | undefined => {
  if (!p) return undefined
  return {
    ...p,
    context: {}
  }
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
    } else if (e.reply) {
      const ret: BTL = {
        reply: convertReplyPodToBTLReplyPod(e.reply)
      }
      return ret
    }
  }) as BTL[]
}
