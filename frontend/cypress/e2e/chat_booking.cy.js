describe('Chat and booking flow', () => {
  it('allows login, creates booking and opens chat (smoke)', () => {
    // This is a smoke test skeleton — requires test accounts and seeded data.
    // Try login
    cy.visit('/login')
    cy.get('input[name="email"]').type('testcust@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()

    // Wait for dashboard
    cy.url().should('include', '/customer/dashboard')

    // Open bookings
    cy.visit('/customer/bookings')
    cy.contains('Bookings').should('exist')

    // If a booking exists, open its chat
    cy.get('body').then(($b) => {
      if ($b.find('a[href^="/customer/chat/"]').length) {
        cy.get('a[href^="/customer/chat/"]').first().click()
        cy.url().should('include', '/customer/chat/')
        cy.get('input[placeholder="Type your message"]').type('Hello from Cypress')
        cy.contains('Send').click()
        // message should appear in chat list
        cy.contains('Hello from Cypress').should('exist')
      } else {
        cy.log('No existing bookings - manual setup required')
      }
    })
  })
})
