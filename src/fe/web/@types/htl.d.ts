import { Account } from "./account"
import { Pod, DpPod, QpPod, BTLPod, BTLDpPod, BTLQpPod } from "./pod"

// beとのインターフェース
export type Timeline = {
  pod?: Pod
  dp?: DpPod
  qp?: QpPod
}

// feで使うTimeline
export type BTL = {
  pod?: BTLPod
  dp?: BTLDpPod
  qp?: BTLQpPod
}
