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
//=> type Test {
//   id: ID
// }
//
// type Query {
//   tests(where: TestWhere): [Test]
// }
//
// """Query of Test with using operators"""
// input TestWhere {
//   """Query with using id field"""
//   id: IDWhereOperator
//
//   """Query with using id field"""
//   OR: [TestWhere]
// }
//
// """Query type of ID with using operators"""
// type IDWhereOperator {
//   """Must match the given data exactly"""
//   eq: ID
//
//   """Must be different from the given data"""
//   not_eq: ID
//
//   """Must be an element of the array"""
//   in: [ID]
//
//   """Must not be an element of the array"""
//   not_in: [ID]
//
//   """Must be less than given value"""
//   lt: ID
//
//   """Must be less than or equal to given value"""
//   lte: ID
//
//   """Must be greater than given value"""
//   gt: ID
//
//   """Must be greater than or equal to given value"""
//   gte: ID
//
//   """Must be within the given range"""
//   between: [ID]
// }
```

## Options

TODO

## Supoprted Types

For now, supported types are **Basic Types** (String, Int, Float, Boolean, ID), and Enum

## License

[MIT](LICENSE).
