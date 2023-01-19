import PodEditor, { PodEditorType } from "../../components/pod/editor"
import type { NextPage, GetServerSideProps } from "next"

type Props = {
  session: string | null
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      session: ctx.req.cookies["session"] || null
    }
  }
}

const PostPod: NextPage<Props> = (props: Props) => {
  return <>{props.session ? <PodEditor podType={PodEditorType.pod} /> : "need login"}</>
}

export default PostPod
