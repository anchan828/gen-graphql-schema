import * as changeCase from "change-case";
import {
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  NamedTypeNode,
  ObjectTypeDefinitionNode,
  TypeNode,
  UnionTypeDefinitionNode,
} from "graphql";
export const getObjectOrUnionTypeDefinitions = (
  documentNode: DocumentNode,
): Array<ObjectTypeDefinitionNode | UnionTypeDefinitionNode> => {
  return documentNode.definitions.filter(
    definition => definition.kind === "ObjectTypeDefinition" || definition.kind === "UnionTypeDefinition",
  ) as ObjectTypeDefinitionNode[];
};

export const getEnumTypeDefinitions = (documentNode: DocumentNode): EnumTypeDefinitionNode[] => {
  return documentNode.definitions.filter(
    definition => definition.kind === "EnumTypeDefinition",
  ) as EnumTypeDefinitionNode[];
};

export const getFieldDefinitions = (definition: ObjectTypeDefinitionNode): FieldDefinitionNode[] => {
  return definition.fields as FieldDefinitionNode[];
};

export const getDirectives = (field: FieldDefinitionNode): DirectiveNode[] => {
  if (!Array.isArray(field.directives)) {
    return [];
  }
  return field.directives;
};

export const isBasicType = (typeName: string): boolean => {
  return ["String", "Int", "Float", "Boolean", "ID"].includes(typeName);
};

export const isEnumType = (types: DocumentNode, typeName: string): boolean => {
  const enumTypes = getEnumTypeDefinitions(types);
  return enumTypes.findIndex(enumType => enumType.name.value === typeName) !== -1;
};

export const isUnionType = (definition: DefinitionNode): definition is UnionTypeDefinitionNode => {
  return definition && definition.kind === "UnionTypeDefinition";
};
const getListTypeName = (listType: TypeNode, isList: boolean): { name: string; isList: boolean } => {
  if (listType.kind === "ListType") {
    return getListTypeName(listType.type, isList);
  }

  if (listType.kind === "NonNullType") {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    return getNonNullTypeName(listType.type, isList);
  }

  return { name: listType.name.value, isList };
};
const getNonNullTypeName = (nonNullType: TypeNode, isList: boolean): { name: string; isList: boolean } => {
  if (nonNullType.kind === "ListType") {
    return getListTypeName(nonNullType.type, true);
  }
  if (nonNullType.kind === "NonNullType") {
    return getNonNullTypeName(nonNullType.type, isList);
  }

  return { name: nonNullType.name.value, isList };
};

export const getFieldTypeName = (field: FieldDefinitionNode): { name: string; isList: boolean } => {
  if (field.type.kind === "ListType") {
    return getListTypeName(field.type.type, true);
  }

  if (field.type.kind === "NonNullType") {
    return getNonNullTypeName(field.type.type, false);
  }

  return { name: field.type.name.value, isList: false };
};

export const getDefinitionByName = (documentNode: DocumentNode, name: string): DefinitionNode | undefined => {
  for (const definition of documentNode.definitions) {
    if (
      definition.kind === "ObjectTypeDefinition" ||
      definition.kind === "InputObjectTypeDefinition" ||
      definition.kind === "EnumTypeDefinition" ||
      definition.kind === "InterfaceTypeDefinition" ||
      definition.kind === "UnionTypeDefinition"
    ) {
      if (definition.name.value === name) {
        return definition;
      }
    }
  }
};

export const getObjectTypeDefinitionsFromUnion = (
  documentNode: DocumentNode,
  unionDefinition: UnionTypeDefinitionNode,
): ObjectTypeDefinitionNode[] => {
  if (!Array.isArray(unionDefinition.types)) {
    return [];
  }
  const definitions: ObjectTypeDefinitionNode[] = [];
  for (const type of unionDefinition.types as NamedTypeNode[]) {
    const definition = getDefinitionByName(documentNode, type.name.value) as ObjectTypeDefinitionNode;
    if (definition) {
      definitions.push(definition);
    }
  }
  return definitions;
};

export const getFieldDefinitionsByDirective = (
  documentNode: DocumentNode,
  directiveName: string,
): FieldDefinitionNode[] => {
  const results: FieldDefinitionNode[] = [];
  const definitions = getObjectOrUnionTypeDefinitions(documentNode);
  for (const definition of definitions) {
    const fields: FieldDefinitionNode[] = [];

    if (isUnionType(definition)) {
      const definitionsInUnion = getObjectTypeDefinitionsFromUnion(documentNode, definition);
      for (const definitionInUnion of definitionsInUnion) {
        fields.push(...getFieldDefinitions(definitionInUnion));
      }
    } else {
      fields.push(...getFieldDefinitions(definition));
    }

    for (const field of fields) {
      const directives = getDirectives(field);
      if (directives.find((d: DirectiveNode) => d.name.value === directiveName)) {
        const { name, isList } = getFieldTypeName(field);
        if (!isList) {
          console.warn(`Found ${directiveName} directive, but type of ${field.name.value} was not ListType. So skip.`);
        } else if (isBasicType(name)) {
          console.warn(`Found ${directiveName} directive, but type of ${field.name.value} was basic types. So skip.`);
        } else {
          results.push(field);
        }
      }
    }
  }
  return results;
};

export const getObjectOrUnionTypeDefinition = (
  documentNode: DocumentNode,
  field: FieldDefinitionNode,
): ObjectTypeDefinitionNode | UnionTypeDefinitionNode | undefined => {
  const { name } = getFieldTypeName(field);

  return getObjectOrUnionTypeDefinitions(documentNode).find(definition => definition.name.value === name);
};

export const appendDefinitionToDocumentNode = (documentNode: DocumentNode, ...definitions: DefinitionNode[]): void => {
  Reflect.set(documentNode, "definitions", [...documentNode.definitions, ...definitions]);
};
export const hasDirectiveInDocumentNode = (documentNode: DocumentNode, directiveName: string): boolean => {
  const definitions = getObjectOrUnionTypeDefinitions(documentNode);
  for (const definition of definitions) {
    const fields: FieldDefinitionNode[] = [];

    if (isUnionType(definition)) {
      const definitionsInUnion = getObjectTypeDefinitionsFromUnion(documentNode, definition);
      for (const definitionInUnion of definitionsInUnion) {
        fields.push(...getFieldDefinitions(definitionInUnion));
      }
    } else {
      fields.push(...getFieldDefinitions(definition));
    }
    for (const field of fields) {
      const directives = getDirectives(field);
      if (directives.find((d: DirectiveNode) => d.name.value === directiveName)) {
        return true;
      }
    }
  }
  return false;
};

export const removeDefinitionByName = (documentNode: DocumentNode, name: string): void => {
  Reflect.set(
    documentNode,
    "definitions",
    documentNode.definitions.filter(definition => {
      if (
        !(
          definition.kind === "ObjectTypeDefinition" ||
          definition.kind === "EnumTypeDefinition" ||
          definition.kind === "InterfaceTypeDefinition" ||
          definition.kind === "InputObjectTypeDefinition"
        )
      ) {
        return true;
      }

      return definition.name.value !== name;
    }),
  );
};

export const toConstanceCase = (str: string): string => changeCase.constantCase(str);
