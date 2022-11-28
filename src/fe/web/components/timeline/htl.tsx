import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { Pod } from "../../@types/pod"
import styles from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"
import Link from "next/link"
import Image from "next/image"

const commonPodResult = `
    created_at
    body
    id
    favorited
    favorite_count
    visibility
    from {
      identifier_name
      screen_name
      icon_uri
      account_unique_uri
    }
`

const queryHTL = `
{
  pods(to: ["https://www.w3.org/ns/activitystreams#Public"]) {
    ${commonPodResult}
  }
}
`

const queryFav = `
mutation ($id: String!) {
  postFavorite(pod_id: $id) {
    value
  }
}
`

const queryUnFav = `
mutation ($id: String!) {
  undoFavorite(pod_id: $id) {
    value
  }
}
`

const queryPostQP = `
mutation ($id: String!, $v: PodVisibility!) {
  createDpPod(pod_id: $id, visibility: $v) {
    value
  }
}
`

const toDateString = (date: string) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

class Render {
  setResult: Dispatch<SetStateAction<JSX.Element[]>>
  result: JSX.Element[] = []
  pods: Pod[] = []

  Fav(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      console.log(pod)
      await gql.fetch({ id: pod.id }, queryFav)
      const res = gql.res.postFavorite as ResultObject
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
      const res = gql.res.undoFavorite as ResultObject
      if (res.value) {
        pod.favorited = false
        pod.favorite_count -= 1
      }
      this.render()
    })()
  }

  postDP(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id, v: pod.visibility }, queryPostQP)
      const res = gql.res.createDpPod as ResultObject
      if (!res || gql.err) {
        console.error("failed to post DP")
      } else {
        if (res.value) {
          this.init()
        }
      }
    })()
  }

  renderDP(pod: Pod) {
    return (
      <>
        {pod.from.screen_name}さんがDPしました
        {this.renderPod(pod)}
      </>
    )
  }

  renderPod(pod: Pod) {
    return (
      <>
        <span className={styles.podContainer /* header */}>
          <div className={styles.expander}>
            <span className={styles.icon /* icon */}>
              <Link href={pod.from.icon_uri}>
                <Image src={pod.from.icon_uri} width={48} height={48} alt="icon" />
              </Link>
            </span>
            <span className={styles.name /* name */}>
              <Link href={pod.from.account_unique_uri}>
                <span className={styles.separator}>{pod.from.screen_name}</span>
                <span>@{pod.from.identifier_name}</span>
              </Link>
            </span>
            <span className={styles.timestamp /* timestamp */}>
              <Link href="">{toDateString(pod.created_at)}</Link>
            </span>
          </div>
        </span>

        <span className={styles.podContainer /* main */}>
          <span className={styles.icon /* spacer */} />
          <span className={styles.message /* body */}>{pod.body}</span>
        </span>

        <span className={styles.podContainer /* foot */}>
          <span className={styles.icon /* spacer */} />
          <span className={styles.message /* buttons */}>
            <span className={`${styles.cursor} ${styles.icon_margin}`}>◀</span>
            <span
              className={`${styles.cursor} ${styles.icon_margin}`}
              onClick={() => this.postDP(pod)}
            >
              📣
            </span>
            {pod.favorited ? (
              <span
                className={`${styles.cursor} ${styles.icon_margin}`}
                onClick={() => this.unFav(pod)}
              >
                ✨
              </span>
            ) : (
              <span
                className={`${styles.cursor} ${styles.icon_margin}`}
                onClick={() => this.Fav(pod)}
              >
                ☆
              </span>
            )}
          </span>
        </span>
      </>
    )
  }

  timelineTemplate(pod: Pod, index: number) {
    return (
      <article className={styles.article} key={index}>
        {this.renderPod(pod)}
      </article>
    )
  }

  constructor(setResult: Dispatch<SetStateAction<JSX.Element[]>>) {
    this.setResult = setResult
  }

  render() {
    this.result = []
    this.pods.forEach((pod, i) => {
      this.result.push(this.timelineTemplate(pod, i))
    })
    this.setResult(this.result)
  }

  init() {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({}, queryHTL)
      if (gql.err) {
        for (const i of gql.err) this.result.push(<>{i.message}</>)
      } else {
        this.pods = gql.res?.pods as Pod[]
        this.pods.forEach((pod, i) => {
          this.result.push(this.timelineTemplate(pod, i))
        })
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
