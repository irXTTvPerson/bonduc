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
      rp_count
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
      id
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
        rp_count
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
  postFavorite(rp_id: $id) {
    value
  }
}
`

const queryUnFav = `
mutation ($id: String!) {
  undoFavorite(rp_id: $id) {
    value
  }
}
`

const queryPostQP = `
mutation ($id: String!, $v: PodVisibility!) {
  createDpPod(rp_id: $id, visibility: $v) {
    value
  }
}
`

const toDateString = (date: string) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

const toggleRpSelector = (id: string) => {
  const e = document.getElementById(id)
  console.log(id, e)
  if (e?.style.display == "block") {
    e.style.display = ""
  } else if (e?.style.display == "" || e?.style.display == "none") {
    e.style.display = "block"
  }
}

class Render {
  setResult: Dispatch<SetStateAction<JSX.Element[]>>
  result: JSX.Element[] = []
  htl: Timeline[] = []

  renderDP(dp: DpPod, index: number) {
    return (
      <>
        <span className={styles.dp_disp}>
          <Link href={dp.from.account_unique_uri} target="_blank">
            {dp.from.screen_name} さんがDPしました ⇄
          </Link>
        </span>
        <div className={styles.rp_border}>
          {dp.body ? (
            this.renderPod(dp.body, index)
          ) : (
            <span className={styles.dp_disp}>*** the pod was deleted ***</span>
          )}
        </div>
      </>
    )
  }

  renderPod(pod: Pod, index: number) {
    return (
      <>
        <span className={styles.article_container}>
          <span className={styles.article_container_flex_box}>
            <span className={styles.pod_container}>
              <Link href={pod.from.icon_uri} target="_blank">
                <Image src={pod.from.icon_uri} width={56} height={56} alt="icon" />
              </Link>
              <span className={styles.pod_right_container}>
                <span className={styles.pod_right_container_flex_box}>
                  <span className={styles.account_info_name}>
                    <Link href={pod.from.account_unique_uri} target="_blank">
                      {pod.from.screen_name}@{pod.from.identifier_name}
                    </Link>
                  </span>
                  <span className={styles.account_info_timestamp}>
                    {toDateString(pod.created_at)}
                  </span>
                </span>
                <span>{pod.body}</span>
              </span>
            </span>
          </span>
          <span className={styles.article_container_footer}>
            <span className={styles.article_container_flex_box}>
              <span className={`${styles.article_container_footer_button}`}>◀</span>
              <span className={`${styles.article_container_footer_button} ${styles.rp_container}`}>
                <span id={`pod_${index}`} className={styles.rp_selecter}>
                  <div
                    className={`${styles.cursor} ${styles.rp_hover}`}
                    onClick={() => {
                      this.postDP(pod)
                      toggleRpSelector(`pod_${index}`)
                    }}
                  >
                    DP (duplicate)
                  </div>
                  <div>QP (quote)</div>
                </span>
                <span
                  className={`${styles.cursor}`}
                  onClick={() => toggleRpSelector(`pod_${index}`)}
                >
                  📣
                </span>
                <span className={styles.counter}>{pod.rp_count > 0 ? pod.rp_count : ""}</span>
              </span>
              <span className={styles.article_container_footer_button}>
                <span className={styles.cursor}>
                  {pod.favorited ? (
                    <span onClick={() => this.unFav(pod)}>✨</span>
                  ) : (
                    <span onClick={() => this.Fav(pod)}>☆</span>
                  )}
                </span>
                <span className={styles.counter}>
                  {pod.favorite_count > 0 ? pod.favorite_count : ""}
                </span>
              </span>
            </span>
          </span>
        </span>
      </>
    )
  }

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

  timelineTemplate(t: Timeline, index: number) {
    return (
      <article className={styles.article} key={index}>
        {t.type === "pod"
          ? this.renderPod(t.pod as Pod, index)
          : this.renderDP(t.dpPod as DpPod, index)}
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
        this.htl = gql.res.getHTL as Timeline[]
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
