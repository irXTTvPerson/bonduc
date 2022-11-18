import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { Pod } from "../../@types/pod"
import styles from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"

const queryHTL = `
{
  pods(to: ["https://www.w3.org/ns/activitystreams#Public"]) {
    created_at
    body
    cc
    to
    id
    favorited
    favorite_count
    from {
      identifier_name
      screen_name
    }
  }
}
`

const queryFav = `
mutation ($id: String!) {
  createFavorite(target_pod_id: $id) {
    value
  }
}
`

const queryUnFav = `
mutation ($id: String!) {
  removeFavorite(target_pod_id: $id) {
    value
  }
}
`

class Render {
  setResult: Dispatch<SetStateAction<JSX.Element[]>>
  result: JSX.Element[] = []
  pods: Pod[] = []

  Fav(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id }, queryFav)
      const res = gql.res.createFavorite as ResultObject
      if (res.value) {
        pod.favorited = true
        pod.favorite_count += 1
      }
      this.render()
    })()
  }

  unFav(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id }, queryUnFav)
      const res = gql.res.removeFavorite as ResultObject
      if (res.value) {
        pod.favorited = false
        pod.favorite_count -= 1
      }
      this.render()
    })()
  }

  timelineTemplate(pod: Pod) {
    return (
      <article key={pod.id}>
        <section>{pod.created_at}</section>
        <section>{pod.from.screen_name}</section>
        <section>{pod.body}</section>
        {pod.favorited ? (
          <section className={styles.fav} onClick={() => this.unFav(pod)}>
            ★
          </section>
        ) : (
          <section className={styles.fav} onClick={() => this.Fav(pod)}>
            ☆
          </section>
        )}
      </article>
    )
  }

  constructor(setResult: Dispatch<SetStateAction<JSX.Element[]>>) {
    this.setResult = setResult
  }

  render() {
    this.result = []
    for (const i of this.pods) this.result.push(this.timelineTemplate(i))
    this.setResult(this.result)
  }

  init() {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({}, queryHTL)
      if (gql.err) {
        for (const i of gql.err) this.result.push(<>{i.message}</>)
      } else {
        this.pods = gql.res?.pods
        for (const i of gql.res?.pods as Pod[]) this.result.push(this.timelineTemplate(i))
      }
      this.render()
    })()
  }
}

const HTL: NextPage = () => {
  const [result, setResult] = useState<JSX.Element[]>([])
  const render = new Render(setResult)
  useEffect(() => {
    render.init()
  }, [])

  return <>{result}</>
}

export default HTL
