describe('Provider Dashboard Flow', () => {
  it('allows logging in as provider and accessing the dashboard', () => {
    cy.visit('/login')

    // Fill in credentials
    cy.get('input[name="email"]').type('testprov@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()

    // Wait for the route transition (either onboarding or dashboard)
    cy.url().should('satisfy', (url) => {
      return url.includes('/provider/dashboard') || url.includes('/provider/onboarding')
    })

    // Force visit dashboard to test all stats cards and elements
    cy.visit('/provider/dashboard')

    // Confirm that the dashboard elements exist
    cy.url().should('include', '/provider/dashboard')
    cy.contains('Total Bookings').should('exist')
    cy.contains('Pending Requests').should('exist')
    cy.contains('Completed Jobs').should('exist')
    cy.contains('Total Earnings').should('exist')
    cy.contains('Average Rating').should('exist')

    // Check sidebar / layout links
    cy.contains('Dashboard').should('exist')
    cy.contains('Bookings').should('exist')
    cy.contains('Earnings').should('exist')
    cy.contains('Availability').should('exist')
    cy.contains('Reviews').should('exist')
    cy.contains('Profile').should('exist')
  })
})
