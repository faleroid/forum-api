const AddReply = require("../AddReply");

describe("an AddReply entity", () => {
  it("should create AddReply object correctly", () => {
    const payload = {
      content: "Ini adalah balasan.",
      owner: "user-123",
      commentId: "comment-123",
    };

    const { content, owner, commentId } = new AddReply(payload);

    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
    expect(commentId).toEqual(payload.commentId);
  });

  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      content: "Ini balasan",
      owner: "user-123",
    };

    expect(() => new AddReply(payload)).toThrow(
      "ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      content: 12345,
      owner: "user-123",
      commentId: "comment-123",
    };

    expect(() => new AddReply(payload)).toThrow(
      "ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
});
