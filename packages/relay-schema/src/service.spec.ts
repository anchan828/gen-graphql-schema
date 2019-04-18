import { buildASTSchema, parse, printSchema } from 'graphql';
import { GenRelayTypesService } from './service';
describe('GenRelayTypesService', () => {
  it('should return same schema when no where directive', () => {
    const types = `type Test { id: ID }`;
    expect(
      printSchema(
        buildASTSchema(new GenRelayTypesService(types).genRelayTypes()),
      ),
    ).toEqual(printSchema(buildASTSchema(parse(types))));
  });

  it('should return added Where types when has where directive', () => {
    expect(
      printSchema(
        buildASTSchema(
          new GenRelayTypesService(
            [
              `type Test { id: ID! }`,
              `type Query { tests: [Test] @relay, tests2: [Test] @relay}`,
            ].join(`\n`),
          ).genRelayTypes(),
        ),
      ),
    ).toEqual(
      printSchema(
        buildASTSchema(
          parse(
            [
              `"""A connection for relay"""`,
              `interface Connection {`,
              `  """Identifies the total count of items in the connection."""`,
              `  totalCount: Int`,
              ``,
              `  """Information to aid in pagination."""`,
              `  pageInfo: PageInfo!`,
              ``,
              `  """A list of edges."""`,
              `  edges: [Edge]`,
              `}`,
              ``,
              `"""An edge in a connection."""`,
              `interface Edge {`,
              `  """A cursor for use in pagination."""`,
              `  cursor: String`,
              `}`,
              ``,
              `"""An object with an ID."""`,
              `interface Node {`,
              `  """ID of the object."""`,
              `  id: ID!`,
              `}`,
              ``,
              `"""Information about pagination in a connection."""`,
              `type PageInfo {`,
              `  """When paginating backwards, the cursor to continue."""`,
              `  startCursor: String`,
              ``,
              `  """When paginating forwards, the cursor to continue."""`,
              `  endCursor: String`,
              ``,
              `  """When paginating forwards, are there more items?"""`,
              `  hasNextPage: Boolean`,
              ``,
              `  """When paginating backwards, are there more items?"""`,
              `  hasPreviousPage: Boolean`,
              `}`,
              ``,
              `type Query {`,
              `  tests(before: String, after: String, first: Int, last: Int): TestConnection`,
              `  tests2(before: String, after: String, first: Int, last: Int): TestConnection`,
              `}`,
              ``,
              `type Test implements Node {`,
              `  id: ID!`,
              `}`,
              ``,
              `"""The connection type for Test"""`,
              `type TestConnection implements Connection {`,
              `  """Identifies the total count of Test items in the connection."""`,
              `  totalCount: Int`,
              ``,
              `  """A list of TestEdge."""`,
              `  edges: [TestEdge]`,
              ``,
              `  """Information to aid in pagination."""`,
              `  pageInfo: PageInfo!`,
              `}`,
              ``,
              `"""An edge in a TestConnection."""`,
              `type TestEdge implements Edge {`,
              `  """The item at the end of the edge."""`,
              `  node: Test`,
              `  """A cursor for use in pagination."""`,
              `  cursor: String`,
              `}`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
