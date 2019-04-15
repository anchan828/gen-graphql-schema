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

export const getWhereDefinitions = (
  connectionName: string,
  fieldNameAndTypes: Array<{ name: string; type: string; isList: boolean }>,
): InputObjectTypeDefinitionNode => {
  const fields: InputValueDefinitionNode[] = [];

  for (const fieldNameAndType of fieldNameAndTypes) {
    fields.push(
      ...genFields(
        fieldNameAndType.name,
        fieldNameAndType.type,
        fieldNameAndType.isList,
      ),
    );
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
  isList: boolean,
): InputValueDefinitionNode[] => {
  let fieldNameAndTypes: Array<{
    name: string;
    type: string;
    isList: boolean;
  }> = [];

  const operators = [
    { operator: 'starts_with', isList: false },
    { operator: 'ends_with', isList: false },
    { operator: 'eq', isList: false },
    { operator: 'not_eq', isList: false },
    { operator: 'in', isList: true },
    { operator: 'not_in', isList: true },
    { operator: 'lt', isList: false },
    { operator: 'lte', isList: false },
    { operator: 'gt', isList: false },
    { operator: 'gte', isList: false },
  ];

  const getOperators = (
    basicTypeName: BasicTypeName,
    ...names: string[]
  ): Array<{
    name: string;
    type: string;
    isList: boolean;
  }> => {
    return operators
      .filter(o => names.includes(o.operator))
      .map((x: { operator: string; isList: boolean }) => ({
        name: `${name}_${x.operator}`,
        type: basicTypeName,
        isList: x.isList,
      }));
  };

  switch (type) {
    case 'String':
      fieldNameAndTypes = getOperators(
        type,
        ...(isList ? [] : ['eq', 'not_eq', 'starts_with', 'ends_with']),
        'in',
        'not_in',
      );
      break;
    case 'Int':
      fieldNameAndTypes = getOperators(
        type,
        ...(isList ? [] : ['eq', 'not_eq']),
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
        ...(isList ? [] : ['eq', 'not_eq']),
        'in',
        'not_in',
        'lt',
        'lte',
        'gt',
        'gte',
      );
      break;
    case 'Boolean':
      fieldNameAndTypes.push({ name, type, isList: false });
      break;
    case 'ID':
      fieldNameAndTypes = getOperators(
        type,
        ...(isList ? [] : ['eq', 'not_eq']),
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
        ...(isList ? [] : ['eq', 'not_eq']),
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
      fieldNameAndTypes = getOperators(
        type,
        ...(isList ? [] : ['eq', 'not_eq']),
        'in',
        'not_in',
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

    if (fieldNameAndType.isList) {
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
