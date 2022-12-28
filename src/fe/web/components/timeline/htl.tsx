import type { NextPage } from "next"
import { useState } from "react"
import Initializer from "./control/initializer"
import styles from "../../styles/popup.module.css"

type Props = {
  query: string
}

export type Popup = {
  open: (e: JSX.Element) => void
  close: () => void
}

const HTL: NextPage<Props> = (props: Props) => {
  const [popup, setPopup] = useState<JSX.Element>(<></>)

  const o = (e: JSX.Element) => {
    setPopup(
      <>
        <span
          className={styles.popup_clickable_area}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setPopup(<></>)
            }
          }}
        >
          <span className={styles.popup}>{e}</span>
        </span>
      </>
    )
  }

  const c = () => {
    setPopup(<></>)
  }

  return (
    <>
      <Initializer query={props.query} popup={{ open: o, close: c }} />
      {popup}
    </>
  )
}

export default HTL
