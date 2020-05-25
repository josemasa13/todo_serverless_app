// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'eiup5x84xi'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-e1qdhqqb.auth0.com',            // Auth0 domain
  clientId: 'y9kRORDPCMlo4UoSMGMIVrdbJjJc65Pa',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
