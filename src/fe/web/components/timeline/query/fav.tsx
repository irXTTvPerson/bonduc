export const queryFav = `
mutation ($id: String!, $type: String!) {
  postFavorite(rp_id: $id, type: $type) {
    value
  }
}
`

export const queryUnFav = `
mutation ($id: String!, $type: String!) {
  undoFavorite(rp_id: $id, type: $type) {
    value
  }
}
`
