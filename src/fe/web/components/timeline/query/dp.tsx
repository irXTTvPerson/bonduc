import { podContent, qpPodContent } from "./home"

export const queryDp = `
{
  id
  created_at
  from {
    identifier_name
    screen_name
    icon_uri
    account_unique_uri
  }
  pod ${podContent}
  qp ${qpPodContent}
}
`

export const queryPostDp = `
mutation ($id: String!, $v: PodVisibility!, $type: String!) {
  createDpPod(rp_id: $id, visibility: $v, type: $type) ${queryDp}
}
`
