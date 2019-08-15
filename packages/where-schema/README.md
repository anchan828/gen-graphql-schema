# @anchan828/gen-graphql-where-schema

## Description

Generate where schema by directive

## Quick Start

```ts
import { genWhereTypes } from "@anchan828/gen-graphql-where-schema";
import { buildASTSchema, printSchema } from "graphql";

const schema = `

type Test {
  id: ID
}

type Query {
  tests: [Test] @where
}

`;

printSchema(buildASTSchema(genWhereTypes(schema)));
//=>  type IDWhereOperator {
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
//    type Query {
//      tests(where: TestWhere): [Test]
//    }
//
//    type Test {
//      id: ID
//    }
//
//    type TestWhere {
//      id: [IDWhereOperator]
//    }
```

## Options

TODO

## Supoprted Types

For now, supported types are **Basic Types** (String, Int, Float, Boolean, ID), and Enum

## License

[MIT](LICENSE).
