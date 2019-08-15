# @anchan828/gen-graphql-relay-schema

## Description

Auto generation for relay type

## Quick Start

```ts
import { genRelayTypes } from "@anchan828/gen-graphql-relay-schema";
import { buildASTSchema, printSchema } from "graphql";

const schema = `

type Project {
    id: ID
}

type Query {
    projects: [Project] @relay
}

`;

printSchema(buildASTSchema(genRelayTypes(schema)));
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
//    """An object with an ID."""
//    interface Node {
//      """ID of the object."""
//      id: ID!
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
//    type Project implements Node {
//      id: ID
//    }
//
//    """The connection type for Project"""
//    type ProjectConnection implements Connection {
//      """Identifies the total count of Project items in the connection."""
//      totalCount: Int
//
//      """A list of ProjectEdge."""
//      edges: [ProjectEdge]
//
//      """Information to aid in pagination."""
//      pageInfo: PageInfo!
//    }
//
//    """An edge in a ProjectConnection."""
//    type ProjectEdge implements Edge {
//      """The item at the end of the edge."""
//      node: Project
//
//      """A cursor for use in pagination."""
//      cursor: String
//    }
//
//    type Query {
//      projects(before: String, after: String, first: Int, last: Int): ProjectConnection
//    }
```

## License

[MIT](LICENSE).
