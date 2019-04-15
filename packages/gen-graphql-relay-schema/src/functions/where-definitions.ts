import {
  FieldDefinitionNode,
  ObjectTypeDefinitionNode,
  TypeNode,
} from 'graphql';
import { BasicTypeName } from '../utils';

// eq
// not_eq
// in
// not_in
// lt
// lte
// gt
// gte

export const getwhereDefinitions = (
  connectionName: string,
  fieldNameAndTypes: Array<{ name: string; type: string }>,
): ObjectTypeDefinitionNode => {
  const fields: FieldDefinitionNode[] = [];

  for (const fieldNameAndType of fieldNameAndTypes) {
    fields.push(...genFields(fieldNameAndType.name, fieldNameAndType.type));
  }

  return {
    kind: 'ObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: `${connectionName}NodeWhere`,
    },
    fields,
    // [
    //   {
    //     kind: 'FieldDefinition',
    //     name: {
    //       kind: 'Name',
    //       value: 'node',
    //     },
    //     arguments: [],
    //     type: {
    //       kind: 'NamedType',
    //       name: {
    //         kind: 'Name',
    //         value: 'aa',
    //       },
    //     },
    //     directives: [],
    //   },
    // ],
  } as ObjectTypeDefinitionNode;
};

const genFields = (
  name: string,
  type: BasicTypeName,
): FieldDefinitionNode[] => {
  let fieldNameAndTypes: Array<{
    name: string;
    type: string;
    isArray: boolean;
  }> = [];

  const operators = [
    // starts_with
    { operator: 'starts_with', isArray: false },
    { operator: 'ends_with', isArray: false },
    { operator: 'eq', isArray: false },
    { operator: 'not_eq', isArray: false },
    { operator: 'in', isArray: true },
    { operator: 'not_in', isArray: true },
    { operator: 'lt', isArray: false },
    { operator: 'lte', isArray: false },
    { operator: 'gt', isArray: false },
    { operator: 'gte', isArray: false },
  ];

  const getOperators = (
    basicTypeName: BasicTypeName,
    ...names: string[]
  ): Array<{
    name: string;
    type: string;
    isArray: boolean;
  }> => {
    return operators
      .filter(o => names.includes(o.operator))
      .map((x: { operator: string; isArray: boolean }) => ({
        name: `${name}_${x.operator}`,
        type: basicTypeName,
        isArray: x.isArray,
      }));
  };
  // 'String',
  // 'Int',
  // 'Float',
  // 'Boolean',
  // 'ID',
  // 'Date'
  switch (type) {
    case 'String':
      fieldNameAndTypes = getOperators(
        type,
        'eq',
        'not_eq',
        'in',
        'not_in',
        'starts_with',
        'ends_with',
      );
      break;
    case 'Int':
      fieldNameAndTypes = getOperators(
        type,
        'eq',
        'not_eq',
        'in',
        'not_in',
        'lt',
        'lte',
        'gt',
        'gte',
      );
      break;
    case 'Float':
      fieldNameAndTypes = getOperators(
        type,
        'eq',
        'not_eq',
        'in',
        'not_in',
        'lt',
        'lte',
        'gt',
        'gte',
      );
      break;
    case 'Boolean':
      fieldNameAndTypes.push({ name, type, isArray: false });
      break;
    case 'ID':
      fieldNameAndTypes = getOperators(
        type,
        'eq',
        'not_eq',
        'in',
        'not_in',
        'lt',
        'lte',
        'gt',
        'gte',
      );
      break;
    case 'Date':
      fieldNameAndTypes = getOperators(
        type,
        'eq',
        'not_eq',
        'in',
        'not_in',
        'lt',
        'lte',
        'gt',
        'gte',
      );
      break;
  }

  return fieldNameAndTypes.map(fieldNameAndType => {
    let fieldType: TypeNode = {
      kind: 'NamedType',
      name: {
        kind: 'Name',
        value: fieldNameAndType.type,
      },
    };

    if (fieldNameAndType.isArray) {
      fieldType = {
        kind: 'ListType',
        type: fieldType,
      };
    }

    return {
      kind: 'FieldDefinition',
      name: {
        kind: 'Name',
        value: fieldNameAndType.name,
      },
      arguments: [],
      type: fieldType,
      directives: [],
    };
  });
};
