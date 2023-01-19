export const replyPod = `
id
created_at
from {
  identifier_name
  screen_name
  icon_uri
  account_unique_uri
}
body
favorite_count
rp_count
favorited
visibility
mypod
timeline_type
reply_count
reply_to_id
`

export const podContent = `
{
  id
  created_at
  body
  favorited
  favorite_count
  rp_count
  visibility
  timeline_type
  mypod
  encrypted
  reply_count
  from {
    identifier_name
    screen_name
    icon_uri
    account_unique_uri
  }
}
`

export const qpPodContent = `
{
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
}
`

export const queryHome = `
{
  getHTL {
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
  }
}
`
