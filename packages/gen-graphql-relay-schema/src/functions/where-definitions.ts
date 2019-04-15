import {
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
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
): InputObjectTypeDefinitionNode => {
  const fields: InputValueDefinitionNode[] = [];

  for (const fieldNameAndType of fieldNameAndTypes) {
    fields.push(...genFields(fieldNameAndType.name, fieldNameAndType.type));
  }

  return {
    kind: 'InputObjectTypeDefinition',
    name: {
      kind: 'Name',
      value: `${connectionName}NodeWhere`,
    },
    fields,
  } as InputObjectTypeDefinitionNode;
};

const genFields = (
  name: string,
  type: BasicTypeName,
): InputValueDefinitionNode[] => {
  let fieldNameAndTypes: Array<{
    name: string;
    type: string;
    isArray: boolean;
  }> = [];

  const operators = [
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
    default:
      // is Enum
      fieldNameAndTypes = getOperators(type, 'eq', 'not_eq', 'in', 'not_in');
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
      kind: 'InputValueDefinition',
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
