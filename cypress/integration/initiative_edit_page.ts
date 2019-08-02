import { randomString, randomEmail } from '../support/commands';

describe('Initiative form page', () => {
  const firstName = randomString();
  const lastName = randomString();
  const email = randomEmail();
  const password = randomString();
  const initiativeTitle = randomString(40);
  const initiativeContent = randomString(60);
  const newInitiativeTitle = randomString(40);
  const newInitiativeContent = randomString(60);
  let jwt: string;
  let initiativeId: string;
  let initiativeSlug: string;

  before(() => {
    cy.apiSignup(firstName, lastName, email, password);
    cy.apiLogin(email, password).then((user) => {
      jwt = user.body.jwt;
      return cy.apiCreateInitiative(initiativeTitle, initiativeContent, undefined, undefined, jwt);
    }).then((initiative) => {
      initiativeId = initiative.body.data.id;
      initiativeSlug = initiative.body.data.attributes.slug;
    });
  });

  beforeEach(() => {
    cy.login(email, password);
    cy.visit(`/initiatives/edit/${initiativeId}`);
    cy.acceptCookies();
    cy.get('.e2e-initiative-edit-page');
  });

  it('has a working initiative edit form', () => {
    cy.get('#initiative-form');
    cy.get('#e2e-initiative-title-input-en-GB').as('titleInput');
    cy.get('#body .ql-editor').as('descriptionInput');

    // check initial values
    cy.get('@titleInput').should('have.value', initiativeTitle);
    cy.get('@descriptionInput').contains(initiativeContent);

    // edit title and description
    cy.get('@titleInput').clear().type(newInitiativeTitle);
    cy.get('@descriptionInput').clear().type(newInitiativeContent);

    // verify the new values
    cy.get('@titleInput').should('have.value', newInitiativeTitle);
    cy.get('@descriptionInput').contains(newInitiativeContent);

    // add a topic
    cy.get('.e2e-topics-picker').find('button').eq(3).click();

    // verify that the topic has been selected
    cy.get('.e2e-topics-picker').find('button.selected').should('have.length', 1);

    // add a location
    cy.get('.e2e-initiative-location-input input').type('antwerp{enter}');
    cy.get('.e2e-initiative-location-input #PlacesAutocomplete__autocomplete-container div').first().click();

    // verify location
    cy.get('.e2e-initiative-location-input input').its('val').should('not.equal', 'antwerp');
    cy.get('.e2e-initiative-location-input input').its('val').should('not.be.empty');

    // verify that image and file upload components are present
    cy.get('#e2e-initiative-file-upload');

    // add an image
    cy.get('#iniatiative-banner-dropzone');
    cy.fixture('cy.png', 'base64').then(fileContent => {
      cy.get('#iniatiative-img-dropzone').upload(
        { fileContent, fileName: 'cy.png', mimeType: 'image/png' },
        { subjectType: 'drag-n-drop' },
      );
      cy.get('#iniatiative-img-dropzone input').should('have.length', 0);
    });

    // save the form
    cy.get('.e2e-initiative-publish-button').click();
    cy.wait(3000);

    // TODO
    // verify updated initiative page
    // cy.location('pathname').should('eq', `/en-GB/initiatives/${initiativeSlug}`);

    // verify modal with edit changelog
    // cy.get('#e2e-initiative-show').find('.e2e-initiative-last-modified-button').click();
    // cy.wait(1000);
    // cy.get('.e2e-activities-changelog').find('.e2e-activities-changelog-entry').should('have.length', 2);
  });

  after(() => {
    cy.apiRemoveInitiative(initiativeId);
  });

});
