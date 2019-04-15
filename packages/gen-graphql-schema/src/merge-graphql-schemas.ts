import { DocumentNode, parse } from 'graphql';
import { mergeTypes as MergeTypes } from 'merge-graphql-schemas';
import { addNodeInterfaceToConnectionNode } from './functions/add-node-interface-to-connection-node';
import { genOrderField } from './functions/gen-order-field';
import { genRelayConnection } from './functions/gen-relay-connection';
import { genWhereField } from './functions/gen-where-field';
import { removeRelayDirective } from './functions/remove-relay-directive';
export const mergeTypes = (
  types: Array<string | DocumentNode>,
  options?: { all: boolean },
): string => {
  const connectionNameSet = new Set<string>();
  let genTypes = types.map(type => {
    const [node, connectionNames] = genRelayConnection(
      typeof type === 'string' ? parse(type) : type,
    );
    if (Array.isArray(connectionNames)) {
      connectionNames.forEach(connectionName =>
        connectionNameSet.add(connectionName),
      );
    }

    return node;
  });
  const connectionNames = [...connectionNameSet.keys()];
  genTypes = genTypes.map(type =>
    addNodeInterfaceToConnectionNode(type, connectionNames),
  );

  let mergedType = parse(
    MergeTypes(genTypes, Object.assign({ all: true }, options || {})),
  );

  mergedType = genOrderField(mergedType);
  mergedType = genWhereField(mergedType);
  mergedType = removeRelayDirective(mergedType);
  return MergeTypes([mergedType]);
};

export const genRelaySchema = (type: string | DocumentNode) => {
  return mergeTypes([type]);
};
