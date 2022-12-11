import { Account } from "./account"
import { Pod, DpPod, QpPod } from "./pod"

export type Type = "pod" | "dp" | "qp" | "err"

export type Timeline = {
  type: Type
  pod?: Pod
  dpPod?: DpPod
  qpPod?: QpPod
}
