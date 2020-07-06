import { Connection } from "graphql-relay";
import { relayResolver } from "./resolver";

describe("relayResolver", () => {
  it("should create connection", () => {
    expect(relayResolver([{ name: "A" }, { name: "B" }], {})).toEqual({
      edges: [
        { cursor: "YXJyYXljb25uZWN0aW9uOjA=", node: { name: "A" } },
        { cursor: "YXJyYXljb25uZWN0aW9uOjE=", node: { name: "B" } },
      ],
      pageInfo: {
        endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: "YXJyYXljb25uZWN0aW9uOjA=",
      },
      totalCount: 2,
    } as Connection<{ name: string }>);
  });
});
