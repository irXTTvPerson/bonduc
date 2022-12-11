import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { QpPod, DpPod, Pod, PodVisibility } from "../../@types/pod"
import { Timeline } from "../../@types/htl"
import styles from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"
import Link from "next/link"
import Image from "next/image"
import PodEditor from "../pod/editor"
import { v4 } from "uuid"

const popup_container_id = "popup_container"

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
    qpPod {
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
      quote {
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

export const toDateString = (date: string) => {
  const d = new Date(date)
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`
}

const hideElement = (id: string) => {
  const e = document.getElementById(id)
  if (e) e.style.display = ""
}

const showElement = (id: string) => {
  const e = document.getElementById(id)
  if (e) e.style.display = "block"
}

export const toIconFromVisibility = (v: PodVisibility) => {
  switch (v) {
    case "anyone":
      return <>⭕</>
    case "global":
      return <>🌐</>
    case "local":
      return <>🌏</>
    case "follower":
      return <>👨‍👩‍👧‍👦</>
    default:
      return <>㊙</>
  }
}

class Render {
  private result: JSX.Element[] = []
  private htl: Timeline[] = []

  private renderQp(qp: QpPod) {
    return (
      <>
        {this.renderPod(qp as Pod)}
        <div className={styles.rp_border}>
          {qp.quote ? (
            this.renderPod(qp.quote)
          ) : (
            <span className={styles.dp_disp}>*** the pod was deleted ***</span>
          )}
        </div>
      </>
    )
  }

  private renderDp(dp: DpPod) {
    return (
      <>
        <span className={styles.dp_disp}>
          <Link href={dp.from.account_unique_uri} target="_blank">
            {dp.from.screen_name} さんがDPしました ⇄
          </Link>
        </span>
        <div className={styles.rp_border}>
          {dp.body ? (
            this.renderPod(dp.body)
          ) : (
            <span className={styles.dp_disp}>*** the pod was deleted ***</span>
          )}
        </div>
      </>
    )
  }

  private renderPod(pod: Pod) {
    const clickable_area_id = `rp_selector_clickable_area_${v4()}`
    const selector_id = `rp_selector_${v4()}`
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
                  <span
                    className={`${styles.account_info_name} ${
                      pod.mypod ? styles.account_info_thisis_me : ""
                    }`}
                  >
                    <Link href={pod.from.account_unique_uri} target="_blank">
                      {pod.from.screen_name}@{pod.from.identifier_name}
                    </Link>
                  </span>
                  <span className={styles.account_info_timestamp}>
                    <span className={styles.visibility}>
                      {toIconFromVisibility(pod.visibility)}
                    </span>
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
                <span
                  id={clickable_area_id}
                  className={styles.rp_selector_clickable_area}
                  onClick={() => {
                    hideElement(clickable_area_id)
                    hideElement(selector_id)
                  }}
                />
                <span id={selector_id} className={styles.rp_selecter}>
                  <div
                    className={`${styles.cursor} ${styles.rp_hover}`}
                    onClick={() => {
                      this.postDP(pod)
                      hideElement(clickable_area_id)
                      hideElement(selector_id)
                    }}
                  >
                    DP (duplicate)
                  </div>
                  <div
                    className={`${styles.cursor} ${styles.rp_hover}`}
                    onClick={() => {
                      this.openPodEditorViaQp(pod)
                      hideElement(clickable_area_id)
                      hideElement(selector_id)
                    }}
                  >
                    QP (quote)
                  </div>
                </span>
                <span
                  className={`${styles.cursor}`}
                  onClick={() => {
                    showElement(clickable_area_id)
                    showElement(selector_id)
                  }}
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

  private timelineTemplate(t: Timeline, index: number) {
    let entry: JSX.Element;
    switch (t.type) {
      case "pod":
        entry = this.renderPod(t.pod as Pod);
        break;
      case "dp":
        entry = this.renderDp(t.dpPod as DpPod);
        break;
      case "qp":
        entry = this.renderQp(t.qpPod as QpPod);
        break;
      default:
        entry = <>err</>
        break;
    }
    return (
      <article className={styles.article} key={index}>
        {entry}
      </article>
    )
  }

  private openPodEditorViaQp(pod: Pod) {
    const onSuccess = () => {
      this.setPopupContent(<></>)
      hideElement(popup_container_id)
      this.init()
    }
    this.setPopupContent(<PodEditor pod={pod} type="qp" onPostSuccess={onSuccess} />)
    showElement(popup_container_id)
  }

  private Fav(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      console.log(pod)
      await gql.fetch({ id: pod.id }, queryFav)
      const res = gql.res.postFavorite as ResultObject
      if (res.value) {
        this.init()
      }
    })()
  }

  private unFav(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id }, queryUnFav)
      const res = gql.res.undoFavorite as ResultObject
      if (res.value) {
        this.init()
      }
    })()
  }

  private postDP(pod: Pod) {
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

  private render() {
    this.result = []
    this.htl.forEach((t, i) => {
      this.result.push(this.timelineTemplate(t, i))
    })
    this.setResult(this.result)
  }

  init() {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({}, queryHTL)
      if (gql.err) {
        for (const i of gql.err) this.result.push(<>{i.message}</>)
        this.setResult(this.result)
        return
      }
      this.htl = gql.res.getHTL as Timeline[]
      this.render()
    })()
  }

  constructor(
    private readonly setResult: Dispatch<SetStateAction<JSX.Element[]>>,
    private readonly setPopupContent: Dispatch<SetStateAction<JSX.Element>>
  ) {}
}

const HTL: NextPage = () => {
  const [result, setResult] = useState<JSX.Element[]>([])
  const [popupContent, setPopupContent] = useState<JSX.Element>(<></>)

  const render = new Render(setResult, setPopupContent)
  useEffect(() => {
    render.init()
  }, [])

  return (
    <>
      {result}
      <span
        id={popup_container_id}
        className={styles.popup_clickable_area}
        onClick={(e) => {
          if (e.currentTarget === e.target) {
            hideElement(popup_container_id)
            setPopupContent(<></>)
          }
        }}
      >
        <span className={styles.popup}>{popupContent}</span>
      </span>
    </>
  )
}

export default HTL
