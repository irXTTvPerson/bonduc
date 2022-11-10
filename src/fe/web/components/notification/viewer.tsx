import type { NextPage } from "next"
import { useEffect, useState, Dispatch, SetStateAction } from "react"
import { GqlClient } from "../../components/common/gql"
import { Notification as Noti } from "../../@types/notification"

const query = `
{
  getNotificationToMe {
    id
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
query($id: String!) {
  openNotification(id: $id) {
    id
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

  notificationTemplate(i: number, n: Noti) {
    return (
      <article key={i} onClick={() => this.updateOpendedFlag(i, n.id)}>
        <section>{n.type}</section>
        <section>{n.created_at}</section>
        <section>{n.from.screen_name}</section>
        <section>{n.from.identifier_name}</section>
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
      this.notiResult = gql.res.getNotificationToMe as Noti[]
      if (!this.notiResult || gql.err) {
        this.setResult([<p>error</p>])
      } else {
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
