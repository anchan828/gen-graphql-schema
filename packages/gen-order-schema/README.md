# @anchan828/gen-order-schema

## Description

Generate order enum schema by directive

## Quick Start

```ts
import { genOrderTypes } from "@anchan828/gen-order-schema"

const schema = `

type Test {
  id: ID
}

type Query {
  tests: [Test] @orderBy
}

`;

genOrderTypes(schema);
//=> type Query {
//     tests(orderBy: [TestOrder]): [Test]
//   }
//  
//   type Test {
//     id: ID
//   }
//  
//   enum TestOrder {
//     id_ASC
//     id_DESC
//   }

```

## Options

| name                       | type     | defailt        | description |
| :------------------------- | :------- | :------------- | :---------- |
| orderByDirectiveName       | string   | orderBy        | TODO        |
| orderByIgnoreDirectiveName | string   | orderBy_ignore | TODO        |
| orderByArgumentName        | string   | orderBy        | TODO        |
| orderByArgumentTypeIsList  | boolean  | true           | TODO        |
| orderEnumTypeSuffix        | string   | Order          | TODO        |
| supportOrderableTypes      | string[] | []             | TODO        |

## Supoprted Types

For now, supported types are **Basic Types** (String, Int, Float, Boolean, ID), and Enum

## License

[MIT](LICENSE).