import {
  ArgumentNode,
  DefinitionNode,
  DirectiveNode,
  DocumentNode,
  FieldDefinitionNode,
  TypeNode,
} from 'graphql';

export const isRelayDirective = (directive: DirectiveNode): boolean =>
  directive.kind === 'Directive' && directive.name.value === 'is_relay';

export const isRelayAndHasRelayArgmentDirective = (
  name: string,
  directive: DirectiveNode,
): boolean => {
  if (!isRelayDirective(directive)) {
    return false;
  }

  if (!Array.isArray(directive.arguments)) {
    return false;
  }
  return (
    directive.arguments.findIndex(
      (arg: ArgumentNode) =>
        arg.name.value === name &&
        arg.value.kind === 'BooleanValue' &&
        arg.value.value,
    ) !== -1
  );
};
export const getDefinition = (
  documentNode: DocumentNode,
  connectionName: string,
): DefinitionNode | undefined => {
  for (const definition of documentNode.definitions) {
    if (definition.kind === 'ObjectTypeDefinition') {
      if (definition.name.value === connectionName) {
        return definition;
      }
    }
  }
};

export const getFieldNameAndType = (
  definition: DefinitionNode,
): Array<{ name: string; type: string }> => {
  if (
    !definition ||
    definition.kind !== 'ObjectTypeDefinition' ||
    !Array.isArray(definition.fields)
  ) {
    return [];
  }
  return definition.fields
    .filter((field: FieldDefinitionNode) => field.type.kind !== 'ListType')
    .map((field: FieldDefinitionNode) => ({
      name: field.name.value,
      type: getTypeName(field),
    }))
    .filter(x => basicTypeNames.includes(x.type));
};
export const basicTypeNames = [
  'String',
  'Int',
  'Float',
  'Boolean',
  'ID',
  'Date', // not basic, but useful
];

export type BasicTypeName = typeof basicTypeNames[number];

export const isBasicType = (field: FieldDefinitionNode): boolean => {
  const typeName = getTypeName(field);
  return basicTypeNames.includes(typeName);
};
export const getTypeName = (field: FieldDefinitionNode): string => {
  if (field.type.kind === 'ListType') {
    return getListTypeName(field.type.type);
  }

  if (field.type.kind === 'NonNullType') {
    return getNonNullTypeName(field.type.type);
  }

  return field.type.name.value;
};

const getListTypeName = (listType: TypeNode): string => {
  if (listType.kind === 'ListType') {
    return getListTypeName(listType.type);
  }

  if (listType.kind === 'NonNullType') {
    return getNonNullTypeName(listType.type);
  }

  return listType.name.value;
};

const getNonNullTypeName = (nonNullType: TypeNode): string => {
  if (nonNullType.kind === 'ListType') {
    return getListTypeName(nonNullType.type);
  }
  if (nonNullType.kind === 'NonNullType') {
    return getNonNullTypeName(nonNullType.type);
  }

  return nonNullType.name.value;
};
