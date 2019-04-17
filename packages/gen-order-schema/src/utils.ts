import {
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';

export const getObjectTypeDefinitions = (
  documentNode: DocumentNode,
): ObjectTypeDefinitionNode[] => {
  return documentNode.definitions.filter(
    definition => definition.kind === 'ObjectTypeDefinition',
  ) as ObjectTypeDefinitionNode[];
};

export const getEnumTypeDefinitions = (
  documentNode: DocumentNode,
): EnumTypeDefinitionNode[] => {
  return documentNode.definitions.filter(
    definition => definition.kind === 'EnumTypeDefinition',
  ) as EnumTypeDefinitionNode[];
};

export const getFieldDefinitions = (
  definition: ObjectTypeDefinitionNode,
): FieldDefinitionNode[] => {
  return definition.fields as FieldDefinitionNode[];
};

export const getDirectives = (field: FieldDefinitionNode): DirectiveNode[] => {
  if (!Array.isArray(field.directives)) {
    return [];
  }
  return field.directives;
};

export const isBasicType = (typeName: string): boolean => {
  return ['String', 'Int', 'Float', 'Boolean', 'ID'].includes(typeName);
};

export const isEnumType = (types: DocumentNode, typeName: string): boolean => {
  const enumTypes = getEnumTypeDefinitions(types);
  return (
    enumTypes.findIndex(enumType => enumType.name.value === typeName) !== -1
  );
};

export const getFieldTypeName = (
  field: FieldDefinitionNode,
): { name: string; isList: boolean } => {
  if (field.type.kind === 'ListType') {
    return getListTypeName(field.type.type, true);
  }

  if (field.type.kind === 'NonNullType') {
    return getNonNullTypeName(field.type.type, false);
  }

  return { name: field.type.name.value, isList: false };
};

const getListTypeName = (
  listType: TypeNode,
  isList: boolean,
): { name: string; isList: boolean } => {
  if (listType.kind === 'ListType') {
    return getListTypeName(listType.type, isList);
  }

  if (listType.kind === 'NonNullType') {
    return getNonNullTypeName(listType.type, isList);
  }

  return { name: listType.name.value, isList };
};

const getNonNullTypeName = (
  nonNullType: TypeNode,
  isList: boolean,
): { name: string; isList: boolean } => {
  if (nonNullType.kind === 'ListType') {
    return getListTypeName(nonNullType.type, true);
  }
  if (nonNullType.kind === 'NonNullType') {
    return getNonNullTypeName(nonNullType.type, isList);
  }

  return { name: nonNullType.name.value, isList };
};
