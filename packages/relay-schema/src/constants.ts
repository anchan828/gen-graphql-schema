import { GenRelayTypesOptions } from './options';

export const DEFAULT_OPTIONS: GenRelayTypesOptions = {
  relayDirective: { name: 'relay' },
  relayCnnectionInterface: { name: 'Connection', totalCountType: 'Int' },
  relayEdgeInterface: { name: 'Edge' },
  relayNodeInterface: { name: 'Node', idFieldName: 'id' },
  relayCnnectionType: { prefix: '', suffix: 'Connection' },
  relayEdgeType: { prefix: '', suffix: 'Edge' },
  relayPageInfoType: { name: 'PageInfo' },
};
