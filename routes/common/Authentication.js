const { AuthenticationClient } = require('forge-server-utils');
const config = require('../../config');

// Used to access Forge Authentication APIs
const Authentication = new AuthenticationClient(
    config.credentials.client_id, 
    config.credentials.client_secret
);

/**
 * Get Authentication client
 */
function getClient() {
    return Authentication;
}

/**
 * Get access token from Autodesk
 */
async function getToken(scopes) {
    const auth = await Authentication.authenticate(scopes);
    return auth;
}

/**
 * Get access token with internal (write) scopes
 */
async function getInternalToken() {
    return getToken(config.scopes.internal);
}

module.exports = {
    getInternalToken,
    getClient
}