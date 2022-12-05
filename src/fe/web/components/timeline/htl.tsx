import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { DpPod, Pod } from "../../@types/pod"
import { Timeline } from "../../@types/htl"
import styles from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"
import Link from "next/link"
import Image from "next/image"

const queryHTL = `
{
  getHTL {
    type
    pod {
      id
      created_at
      body
      favorited
      favorite_count
      dp_count
      visibility
      mypod
      from {
        identifier_name
        screen_name
        icon_uri
        account_unique_uri
      }
    }
    dpPod {
      created_at
      from {
        identifier_name
        screen_name
        icon_uri
        account_unique_uri
      }
      body {
        id
        created_at
        body
        favorited
        favorite_count
        dp_count
        visibility
        mypod
        from {
          identifier_name
          screen_name
          icon_uri
          account_unique_uri
        }
      }
    }
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
  htl: Timeline[] = []

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

  renderDP(dp: DpPod) {
    return (
      <>
        {dp.from.screen_name}さんがDPしました
        {this.renderPod(dp.body)}
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
                <span className={styles.separator}>
                  {`${pod.from.screen_name}@${pod.from.identifier_name}`}
                </span>
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

  timelineTemplate(t: Timeline, index: number) {
    return (
      <article className={styles.article} key={index}>
        {t.type === "pod" ? this.renderPod(t.pod as Pod) : this.renderDP(t.dpPod as DpPod)}
      </article>
    )
  }

  constructor(setResult: Dispatch<SetStateAction<JSX.Element[]>>) {
    this.setResult = setResult
  }

  render() {
    this.result = []
    this.htl.forEach((pod, i) => {
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
        this.htl = gql.res?.getHTL as Timeline[]
        this.htl.forEach((t, i) => {
          this.result.push(this.timelineTemplate(t, i))
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
