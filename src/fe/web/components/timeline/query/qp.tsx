import { podContent, qpPodContent } from "./home"

export const queryQp = `
mutation ($id: String!, $body: String!, $v: PodVisibility!, $type: String!) {
  createQpPod(
    rp_id: $id
    type: $type
    body: $body
    visibility: $v
  ) {

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
    pod ${podContent}
    qp ${qpPodContent}
  }
}
`
