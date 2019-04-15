import { DirectiveNode } from 'graphql';
import { isRelayDirective } from '../utils';

export const hasRelayDirective = (
  directives: DirectiveNode[] | undefined,
): boolean => {
  if (!Array.isArray(directives)) {
    return false;
  }
  return directives.findIndex(isRelayDirective) !== -1;
};
