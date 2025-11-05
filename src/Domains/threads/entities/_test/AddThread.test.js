const AddThread = require("../AddThread");

describe("an AddThread entity", () => {
  it("should create AddThread object correctly", () => {
    const payload = {
      title: "Ini Judul Thread",
      body: "Ini isi body thread.",
      owner: "user-123",
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });

  it("should throw error when payload did not contain needed property", () => {
    // Arrange
    const payload = {
      title: "abc",
      body: "Ini body",
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrow(
      "ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY",
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    // Arrange
    const payload = {
      title: 123,
      body: true,
      owner: 123,
    };

    // Action and Assert
    expect(() => new AddThread(payload)).toThrow(
      "ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION",
    );
  });
});
