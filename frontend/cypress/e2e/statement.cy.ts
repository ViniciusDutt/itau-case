describe('Statement E2E - Search and Filter', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/ativos');
    cy.wait(1500);
  });

  it('should load statement page with transactions', () => {
    cy.get('table').should('exist');
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('should search transactions by name', () => {
    cy.get('app-input').first().find('input').type('Fundo', { delay: 100 });

    cy.contains('button', /filtrar/i).click();

    cy.get('tbody tr').should('exist');
  });

  it('should clear all filters', () => {
    cy.get('app-input').first().find('input').type('Test', { delay: 100 });
    cy.contains('button', /filtrar/i).click();

    cy.contains('button', /limpar/i).click();

    cy.get('app-input').first().find('input').should('have.value', '');
  });
});

describe('Statement E2E - Create Transaction', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/ativos');
    cy.wait(1500);
  });

  it('should open new transaction dialog', () => {
    cy.contains('button', /novo/i).click();
    cy.get('app-new-transaction-dialog', { timeout: 5000 }).should('exist');
  });

  it('should create transaction with valid data', () => {
    const timestamp = Date.now();

    cy.contains('button', /novo/i).click();
    cy.get('app-new-transaction-dialog', { timeout: 5000 }).should('exist');

    cy.get('app-new-transaction-dialog app-input').eq(0).find('input').type(`TX${timestamp}`, { delay: 50 });
    cy.get('app-new-transaction-dialog app-input').eq(1).find('input').type(`Fund ${timestamp}`, { delay: 50 });
    cy.get('app-new-transaction-dialog app-input').eq(2).find('input').type('12345678000190', { delay: 50 });

    cy.get('app-new-transaction-dialog app-select select').select('RF');

    cy.get('app-new-transaction-dialog app-input').eq(3).find('input').type('5000', { delay: 50 });

    cy.get('app-new-transaction-dialog').contains('button', /adicionar|confirmar/i).click();

    cy.get('table').should('exist');
  });

  it('should validate required fields', () => {
    cy.contains('button', /novo/i).click();
    cy.get('app-new-transaction-dialog', { timeout: 5000 }).should('exist');

    cy.get('app-new-transaction-dialog').contains('button', /adicionar|confirmar/i).should('be.disabled');
  });
});

describe('Statement E2E - Edit and Delete', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/ativos');
    cy.wait(1500);
  });

  it('should delete transaction with confirmation', () => {
    cy.get('tbody tr').then(($rows) => {
      const initialCount = $rows.length;

      cy.get('app-dropdown-menu').first().find('button').click();

      cy.contains('span', /remover/i).click();

      cy.get('app-remove-confirmation-dialog', { timeout: 5000 }).should('exist');

      cy.get('app-remove-confirmation-dialog').contains('button', /remover/i).click();

      cy.get('tbody tr').should('have.length', initialCount - 1);
    });
  });

  it('should edit transaction name', () => {
    cy.get('app-dropdown-menu').first().find('button').click();

    cy.contains('span', /editar/i).click();

    cy.get('app-input').eq(1).find('input').clear().type('Updated Fund', { delay: 50 });

    cy.contains('button', /confirmar/i).click();

    cy.get('table').should('exist');
  });
});
