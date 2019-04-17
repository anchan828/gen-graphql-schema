export type OperatorType =
  | 'starts_with'
  | 'ends_with'
  | 'eq'
  | 'not_eq'
  | 'in'
  | 'not_in'
  | 'lt'
  | 'lte'
  | 'gt'
  | 'gte';
export interface GenWhereTypesOptions {
  whereDirective?: { name?: string };
  whereIgnoreDirective?: { name?: string };
  whereType?: { prefix?: string; suffix?: string };
  whereArgment?: { name?: string };
  whereOperatorType?: { prefix?: string; suffix?: string };
  whereOperator?: { prefix?: string; suffix?: string };
  enumTypeOperator?: OperatorType[];
  supportOperatorTypes?: {
    String?: OperatorType[];
    Int?: OperatorType[];
    Float?: OperatorType[];
    ID?: OperatorType[];
    [key: string]: OperatorType[] | undefined;
  };
}
