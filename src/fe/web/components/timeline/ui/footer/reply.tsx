import type { NextPage } from "next"
import styles from "../../../../styles/HTL.module.css"
import { NormalPod } from "../../../../@types/pod"
import { OnSuccess, Reason } from "../../control/initializer"
import { Popup } from "../../htl"
import PodEditor, { PodEditorType } from "../../../pod/editor"

type Props = {
  pod: NormalPod
  onSuccess: OnSuccess
  popup: Popup
}

export const onUpdateReply = (pod: NormalPod) => {
  pod.reply_count += 1
}

const ReplyElement: NextPage<Props> = (props: Props) => {
  return (
    <>
      <span
        className={`${styles.article_container_footer_button} ${styles.cursor}`}
        onClick={() => {
          props.popup.open(
            <PodEditor
              podType={PodEditorType.reply}
              pod={props.pod}
              onPostSuccess={(p) => {
                props.onSuccess(props.pod.id, Reason.reply)
                props.popup.close()
              }}
            />
          )
        }}
      >
        ◀
        <span className={styles.counter}>
          {props.pod.reply_count > 0 ? props.pod.reply_count : ""}
        </span>
      </span>
    </>
  )
}

export default ReplyElement
