import { Account } from "./account"
import { Pod, DpPod } from "./pod"

export type Type = "pod" | "dp" | "err"

export type Timeline = {
  type: Type
  pod?: Pod
  dpPod?: DpPod
}
