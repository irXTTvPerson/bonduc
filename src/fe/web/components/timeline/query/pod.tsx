import { podContent, qpPodContent, replyPod } from "./home"

export const queryPod = `
mutation ($body: String!, $v: PodVisibility!, $timeline_type: TimelineType!, $p: String) {
  createPod(
    body: $body
    visibility: $v
    password: $p
    timeline_type: $timeline_type
  ) ${podContent}
}
`

export const queryGetDecryptedPodBody = `
query ($id: String!, $password: String!) {
  getDecryptedPodBody(id:$id, password: $password) {
    value
    message
  }
}
`

export const queryFindPod = `
query ($id: String!) {
  findPod(id:$id) {
    pod ${podContent}
    dp {
      id
      created_at
      timeline_type
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
    qp {
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
    reply {${replyPod}}
  }
}
`

export const queryReplyPod = `
mutation ($body: String!, $v: PodVisibility!, $timeline_type: TimelineType!, $reply_to_id: String!, $reply_to_type: ReplyToType!) {
  createReplyPod(
    body: $body
    visibility: $v
    timeline_type: $timeline_type
    reply_to_id: $reply_to_id
    reply_to_type: $reply_to_type
  ) {
    ${replyPod}
  }
}
`

export const querygetReplyPodViaReplyToId = `
query ($reply_to_id: String!) {
  getReplyPodViaReplyToId(
    reply_to_id: $reply_to_id
  ) {
    ${replyPod}
  }
}
`
