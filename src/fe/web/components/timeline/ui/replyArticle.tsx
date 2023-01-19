import type { NextPage } from "next"
import { BTLReplyPod } from "../../../@types/pod"
import styles from "../../../styles/HTL.module.css"
import { OnSuccess } from "../control/initializer"
import { Popup } from "../htl"
import { renderPod } from "./podArticle"

type Props = {
  reply: BTLReplyPod
  onSuccess: OnSuccess
  popup: Popup
}

const ReplyArticle: NextPage<Props> = (props: Props) => {
  return (
    <article className={styles.article}>
      {renderPod(props.reply, props.onSuccess, props.popup)}
    </article>
  )
}

export default ReplyArticle
