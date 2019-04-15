# @anchan828/gen-graphql-relay-schema

**WARNING:** THIS PACKAGE IS WORK IN PROGRESS. Dirty source code and the API may be changed without notice.

## Description

Auto generation for relay type

## Quick Start

```ts
import { genRelaySchema } from "@anchan828/gen-graphql-relay-schema"

const schema = `

type Project {
    id: ID
}

type Query {
    projects: [Project] @is_relay
}

`;

genRelaySchema(schema);
//    schema {
//      query: Query
//    }
//    
//    type Query {
//      projects(before: String, after: String, first: Int, last: Int): ProjectConnection
//    }
//    
//    type Project implements Node {
//      id: ID
//    }
//    
//    interface Connection {
//      totalCount: Int
//      pageInfo: PageInfo!
//      edges: [Edge]
//    }
//    
//    interface Node {
//      id: ID!
//    }
//    
//    interface Edge {
//      cursor: String
//    }
//    
//    type PageInfo {
//      startCursor: String
//      endCursor: String
//      hasNextPage: Boolean
//      hasPreviousPage: Boolean
//    }
//    
//    type ProjectEdge implements Edge {
//      node: Project
//      cursor: String
//    }
//    
//    type ProjectConnection implements Connection {
//      totalCount: Int
//      edges: [ProjectEdge]
//      pageInfo: PageInfo!
//    }

```

### Add orderBy field

```ts
const schema = `

type Project {
    id: ID
}

type Query {
    projects: [Project] @is_relay(order: true)
}
```

Then, generated order type and added orderBy field

```graphql
type Query {
    projects(before: String, after: String, first: Int, last: Int, orderBy: [ProjectNodeOrder]): ProjectConnection
}

enum ProjectNodeOrder {
    id_ASC
    id_DESC
}
```

### Add where field

```ts
const schema = `

type Project {
    id: ID
}

type Query {
    projects: [Project] @is_relay(where: true)
}
```

Then, generated where type and added where field

```graphql
type Query {
    projects(before: String, after: String, first: Int, last: Int, where: ProjectNodeWhere): ProjectConnection
}

type ProjectNodeWhere {
    id_eq: ID
    id_not_eq: ID
    id_in: [ID]
    id_not_in: [ID]
    id_lt: ID
    id_lte: ID
    id_gt: ID
    id_gte: ID
}
```

## merge schemas

Based `merge-graphql-schemas` package.

```ts
import { mergeTypes } from "@anchan828/gen-graphql-relay-schema"

const schemaA = `

type Project {
    id: ID
}

`;

const schemaB = `

type Query {
    projects: [Project] @is_relay
}

`;

mergeTypes([schemaA, schemaB]);
```

## Supoprted Types

For now, supported types are **Basic Types** (String, Int, Float, Boolean, ID), Enum and Date (but undefined scalar. please define yourself)

## License

[MIT](LICENSE).
