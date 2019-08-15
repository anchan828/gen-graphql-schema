# @anchan828/gen-graphql-merge-schema

## Description

Merge multiple schema. merge-graphql-schemas based.

Supported directives: [@orderBy](https://www.npmjs.com/package/@anchan828/gen-graphql-order-schema) [@where](https://www.npmjs.com/package/@anchan828/gen-graphql-where-schema) [@relay](https://www.npmjs.com/package/@anchan828/gen-graphql-relay-schema)

## Quick Start

```ts
import { mergeTypes } from "@anchan828/gen-graphql-merge-schema";

const types = [`type Test {id: ID}`, `type Test2 {tests: [Test] @orderBy @where @relay }`];

mergeTypes(types);
//=>  """A connection for relay"""
//    interface Connection {
//      """Identifies the total count of items in the connection."""
//      totalCount: Int
//
//      """Information to aid in pagination."""
//      pageInfo: PageInfo!
//
//      """A list of edges."""
//      edges: [Edge]
//    }
//
//    """An edge in a connection."""
//    interface Edge {
//      """A cursor for use in pagination."""
//      cursor: String
//    }
//
//    input IDWhereOperator {
//      type: IDWhereOperatorType!
//      value: [ID]!
//    }
//
//    enum IDWhereOperatorType {
//      EQ
//      NOT_EQ
//      IN
//      NOT_IN
//    }
//
//    """An object with an ID."""
//    interface Node {
//      """ID of the object."""
//      id: ID!
//    }
//
//    enum OrderDirection {
//      ASC
//      DESC
//    }
//
//    """Information about pagination in a connection."""
//    type PageInfo {
//      """When paginating backwards, the cursor to continue."""
//      startCursor: String
//
//      """When paginating forwards, the cursor to continue."""
//      endCursor: String
//
//      """When paginating forwards, are there more items?"""
//      hasNextPage: Boolean
//
//      """When paginating backwards, are there more items?"""
//      hasPreviousPage: Boolean
//    }
//
//    type Query
//
//    type Test implements Node {
//      id: ID
//    }
//
//    type Test2 {
//      tests(orderBy: [TestOrder], where: TestWhere, before: String, after: String, first: Int, last: Int): TestConnection
//    }
//
//    """The connection type for Test"""
//    type TestConnection implements Connection {
//      """Identifies the total count of Test items in the connection."""
//      totalCount: Int
//
//      """A list of TestEdge."""
//      edges: [TestEdge]
//
//      """Information to aid in pagination."""
//      pageInfo: PageInfo!
//    }
//
//    """An edge in a TestConnection."""
//    type TestEdge implements Edge {
//      """The item at the end of the edge."""
//      node: Test
//
//      """A cursor for use in pagination."""
//      cursor: String
//    }
//
//    input TestOrder {
//      sort: TestSort
//      direction: OrderDirection
//    }
//
//    enum TestSort {
//      ID
//    }
//
//    input TestWhere {
//      id: [IDWhereOperator]
//    }
```

## License

[MIT](LICENSE).
