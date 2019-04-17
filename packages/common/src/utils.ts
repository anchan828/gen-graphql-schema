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

export const getFieldDefinitionsByDirective = (
  documentNode: DocumentNode,
  directiveName: string,
): FieldDefinitionNode[] => {
  const results: FieldDefinitionNode[] = [];
  const definitions = getObjectTypeDefinitions(documentNode);
  for (const definition of definitions) {
    const fields = getFieldDefinitions(definition);

    for (const field of fields) {
      const directives = getDirectives(field);
      if (
        directives.find((d: DirectiveNode) => d.name.value === directiveName)
      ) {
        const { name, isList } = getFieldTypeName(field);
        if (!isList) {
          console.warn(
            `Found ${directiveName} directive, but type of ${
              field.name.value
            } was not ListType. So skip.`,
          );
        } else if (isBasicType(name)) {
          console.warn(
            `Found ${directiveName} directive, but type of ${
              field.name.value
            } was basic types. So skip.`,
          );
        } else {
          results.push(field);
        }
      }
    }
  }
  return results;
};

export const getObjectTypeDefinition = (
  documentNode: DocumentNode,
  field: FieldDefinitionNode,
): ObjectTypeDefinitionNode | undefined => {
  const { name } = getFieldTypeName(field);

  return getObjectTypeDefinitions(documentNode).find(
    definition => definition.name.value === name,
  );
};
