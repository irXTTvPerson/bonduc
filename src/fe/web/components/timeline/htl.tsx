import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { Pod } from "../../@types/pod"

const queryHTL = `
{
  pods(to: ["https://www.w3.org/ns/activitystreams#Public"]) {
    created_at
    body
    cc
    to
    id
    from {
      identifier_name
      screen_name
    }
  }
}
`

const timelineTemplate = (pod: Pod) => (
  <article key={pod.id}>
    <section>{pod.created_at}</section>
    <section>{pod.from.screen_name}</section>
    <section>{pod.id}</section>
    <section>{pod.body}</section>
  </article>
)

const renderHTL = (setResult: Dispatch<SetStateAction<never[]>>) =>
  (async () => {
    let ret: any = []

    const gql = new GqlClient()
    await gql.fetch({}, queryHTL)
    if (gql.err) {
      for (const i of gql.err) ret.push(<>{i.message}</>)
    } else {
      for (const i of gql.res?.pods as Pod[]) ret.push(timelineTemplate(i))
    }
    setResult(ret)
  })()

const HTL: NextPage = () => {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState([])

  useEffect(() => {
    renderHTL(setResult)
    setLoading(false)
  }, [])

  return <>{loading ? "loading" : result}</>
}

export default HTL
