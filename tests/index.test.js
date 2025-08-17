// Mock Discord.js message
function createMockMessage(content) {
  return {
    content,
    react: jest.fn().mockResolvedValue(true),
  };
}

// Mock emojis cache
const mockEmojisCache = {
  find: jest.fn(() => "🛠"), // dummy emoji for serverEmoji
};

describe("Reaction bot", () => {
  test("reacts to multiple regex matches", async () => {
    const reactionsConfig = [
      { regex: { content: "hello", global: true, multiline: false, caseInsensitive: true }, unicodeEmoji: "👋" },
      { regex: { content: "world", global: true, multiline: false, caseInsensitive: true }, unicodeEmoji: "🌎" },
      { regex: { content: "server", global: true, multiline: false, caseInsensitive: true }, serverEmoji: "ServerEmoji" }
    ];

    const msg = createMockMessage("hello world server");

    // Apply reactions
    for (const i of reactionsConfig) {
      const flags = `${i.regex.global ? "g" : ""}${i.regex.multiline ? "m" : ""}${i.regex.caseInsensitive ? "i" : ""}`;
      const regex = new RegExp(i.regex.content, flags);

      if (regex.test(msg.content)) {
        const emoji = i.serverEmoji ? mockEmojisCache.find() : i.unicodeEmoji;
        await msg.react(emoji);
      }
    }

    // Assertions
    expect(msg.react).toHaveBeenCalledTimes(3);
    expect(msg.react).toHaveBeenCalledWith("👋");
    expect(msg.react).toHaveBeenCalledWith("🌎");
    expect(msg.react).toHaveBeenCalledWith("🛠");
  });
});
