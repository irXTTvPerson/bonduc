import { BTLPod, NormalPod, BTLQpPod, BTLReplyPod, PodType } from "../../../@types/pod"

export const isPod = (pod: NormalPod): pod is BTLPod => "decrypted" in pod.context
export const isQpPod = (pod: NormalPod): pod is BTLQpPod =>
  "pod" in pod || "qp" in pod || "reply" in pod
export const isReplyPod = (pod: NormalPod): pod is BTLReplyPod => "reply_to_id" in pod
export const getPodType = (pod: NormalPod): PodType =>
  isPod(pod) ? "pod" : isQpPod(pod) ? "qp" : isReplyPod(pod) ? "reply" : "dp"
