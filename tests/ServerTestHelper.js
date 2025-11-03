/* istanbul ignore file */
const container = require('../src/Infrastructures/container');
const UsersTableTestHelper = require('./UsersTableTestHelper');


const ServerTestHelper = {
  async getAccessTokenAndUserId({
    server,
    id = 'user-default-123',
    username = 'dicodingtest',
  }) {
  
    const userPayload = {
      id,
      username,
      password: 'secret_password',
      fullname: 'Dicoding Test',
    };

    await UsersTableTestHelper.addUser(userPayload);

    const loginPayload = {
      username: userPayload.username,
      password: userPayload.password,
    };

    const response = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: loginPayload,
    });

    const { data: { accessToken } } = JSON.parse(response.payload);

    const containerInstance = container;
    const tokenManager = containerInstance.getInstance('AuthenticationTokenManager');
    const { id: userId } = await tokenManager.decodePayload(accessToken);

    return { accessToken, userId };
  },
};

module.exports = ServerTestHelper;