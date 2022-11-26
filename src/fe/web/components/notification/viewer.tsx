import type { NextPage } from "next"
import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { GqlClient } from "../../components/common/gql"
import { Notification } from "../../@types/notification"
import { ResultObject } from "../../@types/result"

const query = `
{
  getNotification {
    type
    created_at
    opened
    from {
      identifier_name
      screen_name
    }
  }
}
`

const queryOpen = `
mutation($identifier_name: String!, $type: String!) {
  openNotification(identifier_name: $identifier_name, type: $type) {
    value
  }
}
`

const queryAcceptFolloRequest = `
mutation($identifier_name: String!) {
  acceptFollowRequest(identifier_name: $identifier_name) {
    value
  }
}
`

const queryRejectFolloRequest = `
mutation($identifier_name: String!) {
  rejectFollowRequest(identifier_name: $identifier_name) {
    value
  }
}
`

type SetState = Dispatch<SetStateAction<JSX.Element[] | undefined>>

class Render {
  setResult: SetState
  notiResult: Notification[] = []

  updateOpendedFlag(i: number, n: Notification) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ identifier_name: n.from.identifier_name, type: n.type }, queryOpen)
      // 開封通知は失敗してもエラーハンドルしない
    })()

    this.notiResult[i].opened = true
    this.render()
  }

  acceptOrReject(i: number, n: Notification, accept: boolean) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch(
        { identifier_name: n.from.identifier_name },
        accept ? queryAcceptFolloRequest : queryRejectFolloRequest
      )
      let ret: ResultObject
      if (accept) {
        ret = gql.res.acceptFollowRequest as ResultObject
      } else {
        ret = gql.res.rejectFollowRequest as ResultObject
      }
      if (ret.value) {
        this.updateOpendedFlag(i, n)
      } else {
        console.error(`failed accept or reject`)
      }
    })()
  }

  renderFollowAcceptOrReject(i: number, n: Notification) {
    return (
      <>
        <button onClick={() => this.acceptOrReject(i, n, true)}>accept</button>
        <button onClick={() => this.acceptOrReject(i, n, false)}>reject</button>
      </>
    )
  }

  notificationTemplate(i: number, n: Notification) {
    return (
      <article
        key={i}
        onClick={() =>
          !n.opened && n.type !== "FollowRequest" ? this.updateOpendedFlag(i, n) : {}
        }
      >
        <section>{n.type}</section>
        <section>{n.created_at}</section>
        <section>{n.from.screen_name}</section>
        <section>{n.from.identifier_name}</section>
        {!n.opened && n.type === "FollowRequest" ? this.renderFollowAcceptOrReject(i, n) : ""}
        <section>{n.opened ? "opened" : "not opened"}</section>
      </article>
    )
  }

  constructor(setResult: SetState) {
    this.setResult = setResult
  }

  render() {
    let arr: JSX.Element[] = []
    this.notiResult.forEach((n: Notification, i: number) => {
      arr.push(this.notificationTemplate(i, n))
    })
    this.setResult(arr)
  }

  init() {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({}, query)
      if (!gql.res || gql.err) {
        this.setResult([<p key={"err"}>error</p>])
      } else {
        this.notiResult = gql.res.getNotification as Notification[]
        this.render()
      }
    })()
  }
}

const NotificationViewer: NextPage = () => {
  const [result, setResult] = useState<JSX.Element[]>()
  const render = new Render(setResult)
  useEffect(() => render.init(), [])

  return <>{result}</>
}

export default NotificationViewer
