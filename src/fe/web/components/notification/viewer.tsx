import type { NextPage } from "next"
import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { GqlClient } from "../../components/common/gql"
import { Notification as Noti } from "../../@types/notification"

const query = `
{
  getNotification {
    id
    type
    created_at
    deactivated
    opened
    from {
      identifier_name
      screen_name
    }
  }
}
`

const queryOpen = `
mutation($id: String!) {
  openNotification(id: $id) {
    id
  }
}
`

const queryAcceptFolloRequest = `
mutation($identifier_name: String!) {
  acceptFollowRequest(identifier_name: $identifier_name) {
    status
  }
}
`

const queryRejectFolloRequest = `
mutation($identifier_name: String!) {
  rejectFollowRequest(identifier_name: $identifier_name) {
    status
  }
}
`

type SetState = Dispatch<SetStateAction<JSX.Element[] | undefined>>

class Notification {
  setResult: SetState
  notiResult: Noti[] = []

  updateOpendedFlag(i: number, id: string) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch({ id: id }, queryOpen)
      // 開封通知は失敗してもエラーハンドルしない
    })()

    this.notiResult[i].opened = true
    this.render()
  }

  acceptOrReject(identifier_name: string, accept: boolean, i: number) {
    ;(async () => {
      const gql = new GqlClient()
      await gql.fetch(
        { identifier_name: identifier_name },
        accept ? queryAcceptFolloRequest : queryRejectFolloRequest
      )
      this.notiResult[i].deactivated = true
      this.render()
    })()
  }

  renderFollowAcceptOrReject(identifier_name: string, i: number) {
    return (
      <>
        <button onClick={() => this.acceptOrReject(identifier_name, true, i)}>accept</button>
        <button onClick={() => this.acceptOrReject(identifier_name, false, i)}>reject</button>
      </>
    )
  }

  notificationTemplate(i: number, n: Noti) {
    return (
      <article key={i} onClick={() => (!n.opened ? this.updateOpendedFlag(i, n.id) : {})}>
        <section>{n.type}</section>
        <section>{n.created_at}</section>
        <section>{n.from.screen_name}</section>
        <section>{n.from.identifier_name}</section>
        {n.type === "follow_requested" && !n.deactivated
          ? this.renderFollowAcceptOrReject(n.from.identifier_name, i)
          : ""}
        <section>{n.opened ? "opened" : "not opened"}</section>
      </article>
    )
  }

  constructor(setResult: SetState) {
    this.setResult = setResult
  }

  render() {
    let arr: JSX.Element[] = []
    this.notiResult.forEach((n: Noti, i: number) => {
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
        this.notiResult = gql.res.getNotification as Noti[]
        this.render()
      }
    })()
  }
}

const NotificationViewer: NextPage = () => {
  const [result, setResult] = useState<JSX.Element[]>()
  const notification = new Notification(setResult)
  useEffect(() => notification.init(), [])

  return <>{result}</>
}

export default NotificationViewer
