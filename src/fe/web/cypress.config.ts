import { defineConfig } from "cypress"

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    }
  },
  env: {
    test_target_url: "http://localhost:8080",

    do_test_draft_account_registration: false,
    do_test_account_registration: false, // create DraftAccount before enable this
    do_test_account_registration_token: "", // set DraftAccount token
    do_test_login: false
  }
})
