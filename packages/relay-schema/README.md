# @anchan828/gen-graphql-relay-schema

## Description

Auto generation for relay type

## Quick Start

```ts
import { genRelayTypes } from "@anchan828/gen-graphql-relay-schema"
import { buildASTSchema, printSchema } from 'graphql';

const schema = `

type Project {
    id: ID
}

type Query {
    projects: [Project] @is_relay
}

`;

printSchema(buildASTSchema(genRelayTypes(schema)));
//=>  interface Connection {
//      totalCount: Int
//      pageInfo: PageInfo!
//      edges: [Edge]
//    }
//    
//    interface Edge {
//      cursor: String
//    }
//    
//    interface Node {
//      id: ID!
//    }
//    
//    type PageInfo {
//      startCursor: String
//      endCursor: String
//      hasNextPage: Boolean
//      hasPreviousPage: Boolean
//    }
//    
//    type Project implements Node {
//      id: ID
//    }
//    
//    type ProjectConnection implements Connection {
//      totalCount: Int
//      edges: [ProjectEdge]
//      pageInfo: PageInfo!
//    }
//    
//    type ProjectEdge implements Edge {
//      node: Project
//      cursor: String
//    }
//    
//    type Query {
//      projects(before: String, after: String, first: Int, last: Int): ProjectConnection
//    }

```

## License

[MIT](LICENSE).
