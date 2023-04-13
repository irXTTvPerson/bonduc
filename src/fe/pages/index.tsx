import { NextPage } from "next"
import PopupPodFormButton from "@/components/popupPodFromButton"

const Home: NextPage = () => {
  return (
    <>
      <PopupPodFormButton onSuccess={() => { }} onFail={() => { }} />
    </>
  )
}

export default Home