import type { NextPage, GetServerSideProps } from "next"
import { useEffect, useState } from "react"
import { GqlClient } from "../../components/common/gql"
import styles from "../../styles/Home.module.css"
import pp from "../../styles/popup.module.css"
import { queryGetPod } from "../../components/timeline/query/pod"
import { Timeline } from "../../@types/htl"
import {
  convert,
  buildUI,
  OnSuccess,
  Context,
  Reason
} from "../../components/timeline/control/initializer"
import { update } from "../../components/timeline/control/updater"

type Props = {
  id: string
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  return {
    props: {
      id: ctx.query.id as string
    }
  }
}

const fetch = (id: string) => {
  return (async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: id }, queryGetPod)
    if (gql.err || !gql.res.getPod) return null
    else return gql.res.getPod as Timeline
  })()
}

const PodPage: NextPage<Props> = (props: Props) => {
  const [result, setResult] = useState<JSX.Element>(<></>)
  const [popup, setPopup] = useState<JSX.Element>(<></>)

  const o = (e: JSX.Element) => {
    setPopup(
      <>
        <span
          className={pp.popup_clickable_area}
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setPopup(<></>)
            }
          }}
        >
          <span className={pp.popup}>{e}</span>
        </span>
      </>
    )
  }

  const c = () => {
    setPopup(<></>)
  }

  useEffect(() => {
    fetch(props.id).then((res) => {
      if (!res) setResult(<>error</>)
      else {
        const ok: OnSuccess = (ctx: Context, r: Reason) => {
          const updated = update(ctx, r, btl)
          // updatedは先頭に要素が追加されてる（かもしれない）ので末尾の要素を取り出す
          const article = buildUI(updated.slice(-1)[0], ok, { open: o, close: c }, 0)
          setResult(article)
        }
        const btl = convert([res])
        const article = buildUI(btl[0], ok, { open: o, close: c }, 0)
        setResult(article)
      }
    })
  }, [])

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        {result}
        {popup}
      </main>
    </div>
  )
}

export default PodPage
