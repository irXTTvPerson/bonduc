import type { NextPage } from "next"
import { GqlClient } from "../../../common/gql"
import { NormalPod } from "../../../../@types/pod"
import styles from "../../../../styles/HTL.module.css"
import { ResultObject } from "../../../../@types/result"
import { queryFav, queryUnFav } from "../../query/fav"
import { OnSuccess, Reason } from "../../control/initializer"
import { getPodType } from "../../../common/type/check"

type Props = {
  pod: NormalPod
  onSuccess: OnSuccess
}

export const onUpdateFav = (pod: NormalPod) => {
  pod.favorited = true
  pod.favorite_count += 1
}

export const onUpdateUnFav = (pod: NormalPod) => {
  pod.favorited = false
  pod.favorite_count -= 1
}

const fav = (pod: NormalPod, onSuccess: OnSuccess) => {
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: pod.id, type: getPodType(pod) }, queryFav)
    const res = gql.res.postFavorite as ResultObject
    if (res.value) {
      onSuccess(pod.id, Reason.fav)
    }
  })()
}

const unFav = (pod: NormalPod, onSuccess: OnSuccess) => {
  ;(async () => {
    const gql = new GqlClient()
    await gql.fetch({ id: pod.id, type: getPodType(pod) }, queryUnFav)
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
          <span onClick={() => unFav(props.pod, props.onSuccess)}>✨</span>
        ) : (
          <span onClick={() => fav(props.pod, props.onSuccess)}>☆</span>
        )}
      </span>
      <span className={styles.counter}>
        {props.pod.favorite_count > 0 ? props.pod.favorite_count : ""}
      </span>
    </span>
  )
}

export default FavElement
