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
  contentType: ContentType,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <PodElement pod={pod} onSuccess={onSuccess} />
      {renderFooterButton(pod, contentType, onSuccess, popup)}
    </>
  )
}

export const renderFooterButton = (
  pod: BTLPod,
  contentType: ContentType,
  onSuccess: OnSuccess,
  popup: Popup
) => {
  return (
    <>
      <span className={styles.article_container_flex_box}>
        <ReplyElement />
        <RpElement pod={pod} contentType={contentType} onSuccess={onSuccess} popup={popup} />
        <FavElement pod={pod} contentType={contentType} onSuccess={onSuccess} />
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
