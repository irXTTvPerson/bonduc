
export class GqlClient {

  errors: any = null;
  responseJson: any = null;

  async fetch<T>(variables: T, query: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BE_WEB_URL}/graphql`, {
        headers: {
          "Content-Type": "application/json"
        },
        method: "POST",
        mode: "cors",
        credentials: "include",
        body: JSON.stringify({
          operationName: null,
          variables: variables,
          query: query
        })
      })

      if (res.ok) {
        const ret = await res.json()
        if (ret?.errors) {
          this.errors = ret.errors
        } else {
          if (ret.data) {
            this.responseJson = ret.data
          } else {
            this.responseJson = null
          }
        }
      } else {
        this.errors = "fetch failed"
        console.log(res.statusText)
      }
    } catch (e) {
      this.errors = `${e}`
      console.error(e)
    }
  }

  get res() {
    return this.responseJson
  }

  get err() {
    return this.errors
  }
}