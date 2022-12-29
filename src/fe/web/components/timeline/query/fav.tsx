export const queryFav = `
mutation ($id: String!, $type: String!) {
  postFavorite(content_id: $id, content_type: $type) {
    value
  }
}
`

export const queryUnFav = `
mutation ($id: String!, $type: String!) {
  undoFavorite(content_id: $id, content_type: $type) {
    value
  }
}
`
