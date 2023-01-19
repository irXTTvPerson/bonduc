import type { NextPage } from "next"
import { GqlClient } from "../../../common/gql"
import { DpPod, NormalPod } from "../../../../@types/pod"
import styles from "../../../../styles/HTL.module.css"
import { queryPostDp } from "../../query/dp"
import { Dispatch, SetStateAction, useState } from "react"
import { OnSuccess, Reason } from "../../control/initializer"
import { convertDpPodToBTLDpPod } from "../../control/converter"
import { Popup } from "../../htl"
import PodEditor, { PodEditorType } from "../../../pod/editor"
import { getPodType } from "../../../common/type/check"

type Props = {
  pod: NormalPod
  onSuccess: OnSuccess
  popup: Popup
}

enum State {
  show,
  hide
}

export const onUpdateRp = (pod: NormalPod) => {
  pod.rp_count += 1
}

const postDp = (props: Props) => {
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch(
      {
        id: props.pod.id,
        v: props.pod.visibility,
        type: getPodType(props.pod),
        timeline_type: props.pod.timeline_type
      },
      queryPostDp
    )
    const res = gql.res.createDpPod as DpPod | null
    if (!res || gql.err) {
      console.error("failed to post DP")
    } else {
      if (res) {
        const dp = convertDpPodToBTLDpPod(res)
        props.onSuccess(dp, Reason.dp)
      }
    }
  })()
}

const showEditor = (props: Props) => {
  props.popup.open(
    <PodEditor
      pod={props.pod}
      podType={PodEditorType.qp}
      onPostSuccess={(p) => {
        props.onSuccess(p, Reason.qp)
        props.popup.close()
      }}
    />
  )
}

const renderSelector = (
  setSelector: Dispatch<SetStateAction<JSX.Element>>,
  setState: Dispatch<SetStateAction<State>>,
  props: Props
) => {
  const hide = () => {
    setSelector(<></>)
    setState(State.hide)
  }
  return (
    <>
      <span className={styles.rp_selector_clickable_area} onClick={hide} />
      <span className={styles.rp_selecter}>
        <div
          className={`${styles.cursor} ${styles.rp_hover}`}
          onClick={() => {
            hide()
            postDp(props)
          }}
        >
          DP (duplicate)
        </div>
        <div
          className={`${styles.cursor} ${styles.rp_hover}`}
          onClick={() => {
            hide()
            showEditor(props)
          }}
        >
          QP (quote)
        </div>
      </span>
    </>
  )
}

const toggle = (
  state: State,
  setSelector: Dispatch<SetStateAction<JSX.Element>>,
  setState: Dispatch<SetStateAction<State>>,
  props: Props
) => {
  if (state === State.hide) {
    setSelector(renderSelector(setSelector, setState, props))
    setState(State.show)
  } else {
    setSelector(<></>)
    setState(State.hide)
  }
}

const RpElement: NextPage<Props> = (props: Props) => {
  const [selector, setSelector] = useState(<></>)
  const [state, setState] = useState(State.hide)
  return (
    <span className={`${styles.article_container_footer_button} ${styles.rp_container}`}>
      {selector}
      <span
        className={`${styles.cursor}`}
        onClick={() => toggle(state, setSelector, setState, props)}
      >
        📣
      </span>
      <span className={styles.counter}>{props.pod.rp_count > 0 ? props.pod.rp_count : ""}</span>
    </span>
  )
}

export default RpElement
