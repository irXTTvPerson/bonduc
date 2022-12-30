import { podContent, qpPodContent } from "./home"

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

export const queryGetPod = `
query ($id: String!) {
  getPod(id:$id) {
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
