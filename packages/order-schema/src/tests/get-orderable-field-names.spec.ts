import { ObjectTypeDefinitionNode, parse } from "graphql";
import { GenOrderTypesService } from "../service";
describe("getOrderableFieldNames", () => {
  it("should return name of basic type", () => {
    const types = parse(`type Test { id: ID, name: String!, age: Int, array: [Int]! }`);
    const definition = types.definitions[0] as ObjectTypeDefinitionNode;
    expect(new GenOrderTypesService(types)["getOrderableFieldNames"](definition)).toEqual([
      "id",
      "name",
      "age",
      "array",
    ]);
  });

  it("should return name of enum type", () => {
    const types = parse(
      `enum TestEnum { A }\n
       type Test { test: TestEnum }`,
    );
    const definition = types.definitions[1] as ObjectTypeDefinitionNode;
    expect(new GenOrderTypesService(types)["getOrderableFieldNames"](definition)).toEqual(["test"]);
  });
});
