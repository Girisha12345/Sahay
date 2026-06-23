describe('Checkout Date Picker Validation', () => {
  it('enforces today or future dates on checkout page', () => {
    cy.visit('/login')

    // Fill in credentials
    cy.get('input[name="email"]').type('testcust@example.com')
    cy.get('input[name="password"]').type('Password123!')
    cy.get('button[type="submit"]').click()

    // Redirect to customer dashboard
    cy.url().should('include', '/customer/dashboard')

    // Go directly to checkout for service 120
    cy.visit('/checkout?serviceId=120')

    // Wait for address component to load
    cy.contains('Delivery Address').should('exist')

    // If no address exists, add one
    cy.get('body').then(($body) => {
      if ($body.text().includes('No addresses saved yet') || $body.find('button:contains("Add Your First Address")').length > 0) {
        cy.contains('Add Your First Address').click()
        cy.get('input[placeholder="Home"]').type('Home')
        cy.get('input[placeholder="John Doe"]').type('Girisha s s')
        cy.get('input[placeholder="9876543210"]').type('9000000000')
        cy.get('input[placeholder="560001"]').type('560001')
        cy.get('input[placeholder="123 Main Street, Apt 4B"]').type('123 Main Street')
        cy.get('input[placeholder="Bengaluru"]').type('Bengaluru')
        cy.contains('Save Address').click()
      }
    })

    // Now proceed to next step
    cy.contains('Next').click()

    // Now on Review Step (Step 2)
    cy.url().should('include', '/checkout')
    cy.contains('Schedule Service').should('exist')

    // Compute today's date in local YYYY-MM-DD
    const d = new Date()
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    // Verify min attribute on date picker
    cy.get('input[type="date"]').should('have.attr', 'min', todayStr)

    // Verify validation helper message
    cy.contains('Please select today or a future date.').should('exist')

    // Try typing an invalid past date (e.g. 2020-01-01) and blur, verify it resets to today
    cy.get('input[type="date"]')
      .clear()
      .type('2020-01-01')
      .blur()
    
    cy.get('input[type="date"]').should('have.value', todayStr)
  })
})
