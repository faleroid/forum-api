const AddComment = require('../AddComment');

describe('an AddComment entity', () => {
  it('should create AddComment object correctly', () => {
    // Arrange
    const payload = {
      content: 'Ini adalah komentar.',
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action
    const { content, owner, threadId } = new AddComment(payload);

    // Assert
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(threadId).toEqual(payload.threadId);
  });

  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'Ini komentar',
      owner: 'user-123',
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 12345,
      owner: 'user-123',
      threadId: 'thread-123',
    };

    // Action & Assert
    expect(() => new AddComment(payload)).toThrow('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });
});