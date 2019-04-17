# @anchan828/gen-graphql-order-schema

## Description

Generate order schema by directive

## Quick Start

```ts
import { genOrderTypes } from "@anchan828/gen-graphql-order-schema"
import { buildASTSchema, printSchema } from 'graphql';

const schema = `

type Test {
  id: ID
}

type Query {
  tests: [Test] @orderBy
}

`;

printSchema(buildASTSchema(genOrderTypes(schema)));
//=>  enum OrderDirection {
//      ASC
//      DESC
//    }
//    
//    type Query {
//      tests(orderBy: [TestOrder]): [Test]
//    }
//    
//    type Test {
//      id: ID
//    }
//    
//    type TestOrder {
//      sort: TestSort
//      direction: OrderDirection
//    }
//    
//    enum TestSort {
//      ID
//    }
```

## Options

TODO

## Supoprted Types

For now, supported types are **Basic Types** (String, Int, Float, Boolean, ID), and Enum

## License

[MIT](LICENSE).