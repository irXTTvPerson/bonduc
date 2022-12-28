import type { NextPage } from "next"
import PodElement from "./pod/pod"
import { BTLPod, ContentType } from "../../../@types/pod"
import FavElement from "./footer/fav"
import ReplyElement from "./footer/reply"
import RpElement from "./footer/rp"
import styles from "../../../styles/HTL.module.css"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"

type Props = {
  pod: BTLPod
  onSuccess: OnSuccess
  popup: Popup
}

export const renderPod = (
  pod: BTLPod,
  podType: ContentType,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <PodElement pod={pod} onSuccess={onSuccess} />
      {renderFooterButton(pod, podType, onSuccess, popup)}
    </>
  )
}

export const renderFooterButton = (
  pod: BTLPod,
  podType: ContentType,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <span className={styles.article_container_flex_box}>
        <ReplyElement />
        <RpElement pod={pod} podType={podType} onSuccess={onSuccess} popup={popup} />
        <FavElement pod={pod} podType={podType} onSuccess={onSuccess} />
      </span>
    </>
  )
}

const PodArticle: NextPage<Props> = (props: Props) => {
  return (
    <article className={styles.article}>
      {renderPod(props.pod, "pod", props.onSuccess, props.popup)}
    </article>
  )
}

export default PodArticle
