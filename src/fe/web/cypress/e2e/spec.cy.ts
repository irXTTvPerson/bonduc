
describe('account registration', () => {
  const target = Cypress.env('test_target_url') 

  if (Cypress.env("do_test_draft_account_registration")) {
    it('register draft account', () => {
      cy.visit(`${target}/auth/register/draft`)

      cy.get('[name="email"]').type("a@b.c")
      cy.get('[name="password"]').type("password")
      cy.get('[name="screen_name"]').type("screen")
      cy.get('[name="identifier_name"]').type("identifier")

      cy.get("form").submit()
      cy.contains("sent register request", { timeout: 3000 })

      cy.get("form").submit()
      cy.contains("request failed", { timeout: 3000 })
    })
  }

  if (Cypress.env("do_test_account_registration")) {
    it('register account', () => {
      cy.visit(`${target}/auth/register?token=${Cypress.env("do_test_account_registration_token") }`)
      cy.contains("registered", { timeout: 3000 })
    })
  }

  it('login account', () => {
    cy.visit(`${target}/auth/login`)

    cy.get('[name="email"]').type("a@b.c")
    cy.get('[name="password"]').type("password")
    cy.get("form").submit()
    cy.contains("login success", { timeout: 3000 })
    cy.getCookie("session").should('exist')
  })
})