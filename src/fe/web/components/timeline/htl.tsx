import type { NextPage } from "next"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import { QpPod, DpPod, Pod, PodVisibility, Type } from "../../@types/pod"
import { Timeline } from "../../@types/htl"
import styles from "../../styles/HTL.module.css"
import { ResultObject } from "../../@types/result"
import Link from "next/link"
import Image from "next/image"
import PodEditor from "../pod/editor"
import { v4 } from "uuid"

const podContent = `
{
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
`

const qpPodContent = `
{
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
`

const queryHTL = `
{
  getHTL {
    type
    pod ${podContent}
    dpPod {
      id
      created_at
      type
      from {
        identifier_name
        screen_name
        icon_uri
        account_unique_uri
      }
      pod ${podContent}
      qp ${qpPodContent}
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
      type
      from {
        identifier_name
        screen_name
        icon_uri
        account_unique_uri
      }
      pod ${podContent}
      qp ${qpPodContent}
    }
  }
}
`

const queryFav = `
mutation ($id: String!, $type: String!) {
  postFavorite(rp_id: $id, type: $type) {
    value
  }
}
`

const queryUnFav = `
mutation ($id: String!, $type: String!) {
  undoFavorite(rp_id: $id, type: $type) {
    value
  }
}
`

const queryPostQP = `
mutation ($id: String!, $v: PodVisibility!, $type: String!) {
  createDpPod(rp_id: $id, visibility: $v, type: $type) {
    value
  }
}
`

const queryGetDecryptedPodBody = `
query ($id: String!, $password: String!) {
  getDecryptedPodBody(id:$id, password: $password) {
    value
    message
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
    case "password":
      return <>🔐</>
    default:
      return <>㊙</>
  }
}

class Render {
  private result: JSX.Element[] = []
  private htl: Timeline[] = []

  private renderFavButtonImpl(pod: Pod, type: Type) {
    return (
      <span className={styles.article_container_footer_button}>
        <span className={styles.cursor}>
          {pod.favorited ? (
            <span onClick={() => this.unFav(pod, type)}>✨</span>
          ) : (
            <span onClick={() => this.Fav(pod, type)}>☆</span>
          )}
        </span>
        <span className={styles.counter}>{pod.favorite_count > 0 ? pod.favorite_count : ""}</span>
      </span>
    )
  }

  private renderFavButtonForPod(pod: Pod) {
    return this.renderFavButtonImpl(pod, "pod")
  }

  private renderFavButtonForQp(pod: Pod) {
    return this.renderFavButtonImpl(pod, "qp")
  }

  private renderReplyButton() {
    return <span className={`${styles.article_container_footer_button}`}>◀</span>
  }

  private renderRpSelector(pod: Pod, type: Type, clickable_area_id: string, selector_id: string) {
    return (
      <span id={selector_id} className={styles.rp_selecter}>
        <div
          className={`${styles.cursor} ${styles.rp_hover}`}
          onClick={() => {
            this.postDP(pod, type)
            hideElement(clickable_area_id)
            hideElement(selector_id)
          }}
        >
          DP (duplicate)
        </div>
        <div
          className={`${styles.cursor} ${styles.rp_hover}`}
          onClick={() => {
            this.openPodEditorViaQp(pod, type)
            hideElement(clickable_area_id)
            hideElement(selector_id)
          }}
        >
          QP (quote)
        </div>
      </span>
    )
  }

  private renderRpButtonImpl(pod: Pod, type: Type) {
    const clickable_area_id = `rp_selector_clickable_area_${v4()}`
    const selector_id = `rp_selector_${v4()}`
    return (
      <span className={`${styles.article_container_footer_button} ${styles.rp_container}`}>
        <span
          id={clickable_area_id}
          className={styles.rp_selector_clickable_area}
          onClick={() => {
            hideElement(clickable_area_id)
            hideElement(selector_id)
          }}
        />
        {this.renderRpSelector(pod, type, clickable_area_id, selector_id)}
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
    )
  }

  private renderRpButtonForPod(pod: Pod) {
    return this.renderRpButtonImpl(pod, "pod")
  }

  private renderRpButtonForQp(pod: Pod) {
    return this.renderRpButtonImpl(pod, "qp")
  }

  private renderIcon(pod: Pod) {
    return (
      <Link href={pod.from.icon_uri} target="_blank">
        <Image src={pod.from.icon_uri} width={56} height={56} alt="icon" />
      </Link>
    )
  }

  private renderAccountName(pod: Pod) {
    return (
      <span
        className={`${styles.account_info_name} ${pod.mypod ? styles.account_info_thisis_me : ""}`}
      >
        <Link href={pod.from.account_unique_uri} target="_blank">
          {pod.from.screen_name}@{pod.from.identifier_name}
        </Link>
      </span>
    )
  }

  private renderTimestamp(pod: Pod) {
    return (
      <span className={styles.account_info_timestamp}>
        <span className={styles.visibility}>{toIconFromVisibility(pod.visibility)}</span>
        {toDateString(pod.created_at)}
      </span>
    )
  }

  private renderBody(pod: Pod) {
    const hide_form = pod.decrypted === true
    if (pod.visibility === "password" && hide_form === false) {
      return (
        <span className={styles.dp_disp}>
          <div>* パスワード制限がついています *</div>
          <div>
            <input type="password" onChange={(e) => (pod.password = e.target.value)} />
            <button onClick={() => this.decryptPod(pod)}>🔑</button>
          </div>
        </span>
      )
    } else {
      return <span>{pod.body}</span>
    }
  }

  private renderBodyAndAccount(pod: Pod) {
    return (
      <span className={styles.pod_right_container}>
        <span className={styles.pod_right_container_flex_box}>
          {this.renderAccountName(pod)}
          {this.renderTimestamp(pod)}
        </span>
        {this.renderBody(pod)}
      </span>
    )
  }

  private renderQpContent(qp: Pod, quote: JSX.Element) {
    return (
      <>
        <span className={styles.dp_disp}>
          <Link href={qp.from.account_unique_uri} target="_blank">
            {qp.from.screen_name} さんがQPしました ↰
          </Link>
        </span>
        <span className={styles.article_container_flex_box}>
          {this.renderIcon(qp)}
          {this.renderBodyAndAccount(qp)}
        </span>
        <div className={styles.rp_border}>{quote}</div>
        <span className={styles.article_container_flex_box}>
          {this.renderReplyButton()}
          {this.renderRpButtonForQp(qp)}
          {this.renderFavButtonForQp(qp)}
        </span>
      </>
    )
  }

  private renderQp(qp: QpPod) {
    const qp_pod = qp as Pod
    const content = qp.pod ?? qp.qp

    let quote: JSX.Element
    if (content) {
      quote = (
        <>
          <span className={styles.article_container_flex_box}>
            {this.renderIcon(content)}
            {this.renderBodyAndAccount(content)}
          </span>
        </>
      )
    } else {
      quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
    }

    return this.renderQpContent(qp_pod, quote)
  }

  private renderDp(dp: DpPod) {
    const content = dp.pod ?? dp.qp
    let quote: JSX.Element
    if (content) {
      if (dp.pod) {
        quote = this.renderPod(content)
      } else {
        const link = (
          <Link className={styles.dp_disp} href={`/pod/${dp.qp?.id}`} target="_blank">
            QP from ...
          </Link>
        )
        quote = this.renderQpContent(dp.qp as Pod, link)
      }
    } else {
      quote = <span className={styles.dp_disp}>*** the pod was deleted ***</span>
    }

    return (
      <>
        <span className={styles.dp_disp}>
          <Link href={dp.from.account_unique_uri} target="_blank">
            {dp.from.screen_name} さんがDPしました ⇄
          </Link>
        </span>
        <div className={styles.rp_border}>{quote}</div>
      </>
    )
  }

  private renderPod(pod: Pod) {
    return (
      <>
        <span className={styles.article_container_flex_box}>
          {this.renderIcon(pod)}
          {this.renderBodyAndAccount(pod)}
        </span>
        <span className={styles.article_container_flex_box}>
          {this.renderReplyButton()}
          {this.renderRpButtonForPod(pod)}
          {this.renderFavButtonForPod(pod)}
        </span>
      </>
    )
  }

  private timelineTemplate(t: Timeline, index: number) {
    let entry: JSX.Element
    switch (t.type) {
      case "pod":
        entry = this.renderPod(t.pod as Pod)
        break
      case "dp":
        entry = this.renderDp(t.dpPod as DpPod)
        break
      case "qp":
        entry = this.renderQp(t.qpPod as QpPod)
        break
      default:
        entry = <>err</>
        break
    }
    return (
      <article className={styles.article} key={index}>
        {entry}
      </article>
    )
  }

  private render() {
    this.result = []
    this.htl.forEach((t, i) => {
      this.result.push(this.timelineTemplate(t, i))
    })
    this.setResult(this.result)
  }

  private openPodEditorViaQp(pod: Pod, type: Type) {
    const onSuccess = () => {
      this.setPopupContent(<></>)
      hideElement(this.popupContainerId)
      this.init()
    }
    this.setPopupContent(
      <PodEditor pod={pod} isQp={true} rp_type={type} onPostSuccess={onSuccess} />
    )
    showElement(this.popupContainerId)
  }

  private Fav(pod: Pod, type: Type) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id, type: type }, queryFav)
      const res = gql.res.postFavorite as ResultObject
      if (res.value) {
        this.init()
      }
    })()
  }

  private unFav(pod: Pod, type: Type) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id, type: type }, queryUnFav)
      const res = gql.res.undoFavorite as ResultObject
      if (res.value) {
        this.init()
      }
    })()
  }

  private postDP(pod: Pod, type: Type) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id, v: pod.visibility, type: type }, queryPostQP)
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

  private decryptPod(pod: Pod) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: pod.id, password: pod.password }, queryGetDecryptedPodBody)
      const res = gql.res.getDecryptedPodBody as ResultObject
      if (!res || gql.err) {
        console.error("failed to getDecryptedPodBody")
      } else {
        if (res.value) {
          for (const e of this.htl) {
            const p = e.qpPod?.pod ?? e.dpPod?.pod ?? e.pod
            if (p?.id === pod.id) {
              pod.decrypted = p.decrypted = true
              pod.body = p.body = res.message as string
            }
          }
          this.render()
        }
      }
    })()
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
      if (!gql.res.getHTL) {
        this.result.push(<>error🤔</>)
        this.setResult(this.result)
      } else {
        this.htl = gql.res.getHTL as Timeline[]
        this.render()
      }
    })()
  }

  constructor(
    private readonly setResult: Dispatch<SetStateAction<JSX.Element[]>>,
    private readonly setPopupContent: Dispatch<SetStateAction<JSX.Element>>,
    private readonly popupContainerId: string
  ) {}
}

const HTL: NextPage = () => {
  const [result, setResult] = useState<JSX.Element[]>([])
  const [popupContent, setPopupContent] = useState<JSX.Element>(<></>)
  const popup_container_id = "popup_container_2036eb66-279e-4cc5-8ce1-44c76d2e41ab"
  const render = new Render(setResult, setPopupContent, popup_container_id)
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
