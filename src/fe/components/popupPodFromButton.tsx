import type { NextPage } from "next"
import { useState } from "react"
import Image from "next/image"
import PodForm from "./podForm"
import css from "@/styles/components/podForm.module.css"

type Props = {
  onSuccess: (json: any) => void
  onFail: (error: any) => void
}

const PopupPodFormButton: NextPage<Props> = (props: Props) => {
  const [form, setForm] = useState(<></>)
  const [clickableArea, setClickableArea] = useState(<></>)

  const closePopup = () => {
    setForm(<></>)
    setClickableArea(<></>)
  }

  const openPopup = () => {
    setForm(popupElement)
    setClickableArea(
      <div
        className={css.clickable_area}
        onClick={closePopup}
      />
    )
  }

  const popupElement = (
    <div className={css.container}>
      <PodForm
        onSuccess={(json) => {
          props.onSuccess(json)
          closePopup()
        }}
        onFail={(e) => {
          props.onFail(e)
        }}
      />
    </div>
  )

  return (
    <>
      {clickableArea}
      <Image
        className={css.cursor}
        src={"/icon/pod-button.png"}
        width={32}
        height={32}
        alt={"pod"}
        onClick={openPopup}
      />
      {form}
    </>
  )
}

export default PopupPodFormButton