import { podContent, qpPodContent, replyPod } from "./home"

export const queryQp = `
mutation ($id: String!, $body: String!, $v: PodVisibility!, $type: String!, $timeline_type: TimelineType!) {
  createQpPod(
    content_id: $id
    content_type: $type
    body: $body
    visibility: $v
    timeline_type: $timeline_type
  ) {
    id
    created_at
    body
    favorited
    favorite_count
    rp_count
    visibility
    mypod
    timeline_type
    reply_count
    from {
      identifier_name
      screen_name
      icon_uri
      account_unique_uri
    }
    pod ${podContent}
    qp ${qpPodContent}
    reply {${replyPod}}
  }
}
`
