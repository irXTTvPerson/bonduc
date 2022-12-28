import type { NextPage } from "next"
import { GqlClient } from "../../../common/gql"
import { ContentType, BTLPod, BTLQpPod } from "../../../../@types/pod"
import styles from "../../../../styles/HTL.module.css"
import { ResultObject } from "../../../../@types/result"
import { queryFav, queryUnFav } from "../../query/fav"
import { OnSuccess, Reason } from "../../control/initializer"

type Props = {
  pod: BTLPod
  podType: ContentType
  onSuccess: OnSuccess
}

export const onUpdateFav = (pod: BTLPod | BTLQpPod) => {
  pod.favorited = true
  pod.favorite_count += 1
}

export const onUpdateUnFav = (pod: BTLPod | BTLQpPod) => {
  pod.favorited = false
  pod.favorite_count -= 1
}

const fav = (pod: BTLPod, type: ContentType, onSuccess: OnSuccess) => {
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: pod.id, type: type }, queryFav)
    const res = gql.res.postFavorite as ResultObject
    if (res.value) {
      onSuccess(pod.id, Reason.fav)
    }
  })()
}

const unFav = (pod: BTLPod, type: ContentType, onSuccess: OnSuccess) => {
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: pod.id, type: type }, queryUnFav)
    const res = gql.res.undoFavorite as ResultObject
    if (res.value) {
      onSuccess(pod.id, Reason.unfav)
    }
  })()
}

const FavElement: NextPage<Props> = (props: Props) => {
  return (
    <span className={styles.article_container_footer_button}>
      <span className={styles.cursor}>
        {props.pod.favorited ? (
          <span onClick={() => unFav(props.pod, props.podType, props.onSuccess)}>✨</span>
        ) : (
          <span onClick={() => fav(props.pod, props.podType, props.onSuccess)}>☆</span>
        )}
      </span>
      <span className={styles.counter}>
        {props.pod.favorite_count > 0 ? props.pod.favorite_count : ""}
      </span>
    </span>
  )
}

export default FavElement
