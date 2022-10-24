import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"

const queryHTL = `
{
	pods(to: ["https://www.w3.org/ns/activitystreams#Public"]) {
    created_at
    body
    cc
    to
    id
  }
}
`

const timelineTemplate = (pod: any) => (
  <article key={pod.id}>
    <section>{pod.created_at}</section>
    <section>{pod.id}</section>
    <section>{pod.body}</section>
  </article>
)

const renderHTL = (setResult: Dispatch<SetStateAction<never[]>>) =>
  (async () => {
    try {
      let ret: any = []
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/graphql`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          operationName: null,
          variables: {},
          query: queryHTL
        })
      })
      if (res.ok) {
        const data = (await res.json()).data
        for (const i of data?.pods) ret.push(timelineTemplate(i))
        setResult(ret)
      } else {
        console.log(res)
      }
    } catch (e) {
      console.error(e)
    }
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
