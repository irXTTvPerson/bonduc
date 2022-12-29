import { podContent, qpPodContent } from "./home"

export const queryDp = `
{
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
`

export const queryPostDp = `
mutation ($id: String!, $v: PodVisibility!, $type: String!, $timeline_type: TimelineType!) {
  createDpPod(content_id: $id, visibility: $v, content_type: $type, timeline_type: $timeline_type) ${queryDp}
}
`
