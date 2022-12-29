import { podContent } from "./home"

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
