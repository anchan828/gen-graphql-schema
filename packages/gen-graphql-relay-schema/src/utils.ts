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
    if (
      definition.kind === 'ObjectTypeDefinition' ||
      definition.kind === 'EnumTypeDefinition'
    ) {
      if (definition.name.value === connectionName) {
        return definition;
      }
    }
  }
};

export const getFieldNameAndType = (
  definition: DefinitionNode,
): Array<{ name: string; type: string; isList: boolean }> => {
  if (
    !definition ||
    definition.kind !== 'ObjectTypeDefinition' ||
    !Array.isArray(definition.fields)
  ) {
    return [];
  }
  return definition.fields.map((field: FieldDefinitionNode) => {
    const { name, isList } = getTypeName(field);
    return {
      name: field.name.value,
      type: name,
      isList,
    };
  });
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
  return basicTypeNames.includes(typeName.name);
};
export const getTypeName = (
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

export const isEnumType = (
  documentNode: DocumentNode,
  typeName: string,
): boolean => {
  const enumDefinition = getDefinition(documentNode, typeName);
  if (!enumDefinition) {
    return false;
  }
  return enumDefinition.kind === 'EnumTypeDefinition';
};
