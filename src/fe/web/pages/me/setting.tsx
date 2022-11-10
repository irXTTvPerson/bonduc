import type { NextPage, GetServerSideProps } from "next"
import NotificationViewer from "../../components/notification/viewer"

type Props = {
  login: boolean
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const session = ctx.req.cookies["session"] || null
  return {
    props: {
      login: session !== null
    }
  }
}

const SettingPage: NextPage<Props> = (props: Props) => {
  if (!props.login) {
    return <>need login</>
  }
  return (
    <>
      <NotificationViewer />
    </>
  )
}

export default SettingPage
