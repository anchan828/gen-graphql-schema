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
              `type Query { 
                tests( before: String, after: String, first: Int, last: Int): TestConnection
                tests2( before: String, after: String, first: Int, last: Int): TestConnection
               }`,
              `type Test implements Node { id: ID! }`,
              `interface Connection { totalCount: Int, pageInfo: PageInfo!, edges: [Edge] }`,
              `interface Node { id: ID! }`,
              `interface Edge { cursor: String }`,
              `type PageInfo { startCursor: String, endCursor: String, hasNextPage: Boolean, hasPreviousPage: Boolean }`,
              `type TestEdge implements Edge { node: Test, cursor: String}`,
              `type TestConnection implements Connection { totalCount: Int, edges: [TestEdge], pageInfo: PageInfo! }`,
            ].join(`\n`),
          ),
        ),
      ),
    );
  });
});
