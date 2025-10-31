/* istanbul ignore file */
const container = require('../src/Infrastructures/container');

const ServerTestHelper = {
  async getAccessTokenAndUserId({ server }) {
    // Buat user baru
    const userPayload = {
      username: 'dicodingtest',
      password: 'secret_password',
      fullname: 'Dicoding Test',
    };

    await server.inject({
      method: 'POST',
      url: '/users',
      payload: userPayload,
    });

    // Login untuk dapat token
    const loginPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };

    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginPayload,
    });

    // Ambil token dari respons login
    const { data: { accessToken } } = JSON.parse(response.payload);
    
    // Ambil user ID dari token (agak rumit, tapi ini cara paling akurat)
    const containerInstance = container;
    const tokenManager = containerInstance.getInstance('AuthenticationTokenManager');
    const { id: userId } = await tokenManager.decodePayload(accessToken);
    
    return { accessToken, userId };
  },
};

module.exports = ServerTestHelper;