import { podContent } from "./home"

export const queryPod = `
mutation ($body: String!, $v: PodVisibility!, $p: String) {
  createPod(
    body: $body
    visibility: $v
    password: $p
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
