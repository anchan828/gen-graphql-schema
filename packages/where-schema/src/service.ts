/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectOrUnionTypeDefinition,
  getObjectOrUnionTypeDefinitions,
  getObjectTypeDefinitionsFromUnion,
  hasDirectiveInDocumentNode,
  isBasicType,
  isEnumType,
  isObjectType,
  isUnionType,
  toConstanceCase,
} from "@anchan828/gen-graphql-schema-common";
import * as deepmerge from "deepmerge";
import {
  DirectiveNode,
  DocumentNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  Kind,
  ObjectTypeDefinitionNode,
  parse,
  TypeNode,
  UnionTypeDefinitionNode,
} from "graphql";
import { DEFAULT_OPTIONS, DESCRIPTIONS } from "./constants";
import { GenWhereTypesOptions, OperatorType, WhereFieldNameAndType } from "./interfaces";
export class GenWhereTypesService {
  public genWhereTypes(): DocumentNode {
    if (!hasDirectiveInDocumentNode(this.documentNode, this.options.whereDirective!.name!)) {
      return this.documentNode;
    }
    const fields = getFieldDefinitionsByDirective(this.documentNode, this.options.whereDirective!.name!);
    for (const field of fields) {
      const whereType = this.genWhereTypeDefinition(field);

      if (!whereType) {
        continue;
      }
      this.appendWhereArgumentToFieldNode(field, whereType);
    }

    for (const operator of this.typeOperatorMap.values()) {
      appendDefinitionToDocumentNode(this.documentNode, operator.whereOperatorType);
    }

    const definitions: ObjectTypeDefinitionNode[] = [];
    for (const definition of getObjectOrUnionTypeDefinitions(this.documentNode)) {
      if (isUnionType(definition)) {
        definitions.push(...getObjectTypeDefinitionsFromUnion(this.documentNode, definition));
      } else if (isObjectType(definition)) {
        definitions.push(definition);
      }
    }

    for (const definition of definitions) {
      for (const field of getFieldDefinitions(definition)) {
        this.removeDirectives(field, [
          this.options.whereDirective?.name,
          this.options.whereIgnoreDirective?.name,
          this.options.whereNestedObjectDirective?.name,
          this.options.whereEqOnlyDirective?.name,
        ]);
      }
    }
    return this.documentNode;
  }

  private genOperatorDefinitions(typeName: string): void {
    if (this.typeOperatorMap.has(typeName)) {
      return;
    }
    let operatorNames = Reflect.get(this.options.supportOperatorTypes!, typeName) as OperatorType[];

    if (!Array.isArray(operatorNames) && isEnumType(this.documentNode, typeName)) {
      operatorNames = this.options.enumTypeOperator!;
    }
    if (!Array.isArray(operatorNames)) {
      return;
    }

    this.typeOperatorMap.set(typeName, {
      whereOperatorType: {
        kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: `${this.options.whereOperator!.prefix}${typeName}${this.options.whereOperator!.suffix}`,
        },
        description: {
          kind: Kind.STRING,
          value: DESCRIPTIONS.WHERE_OPERATOR_TYPE.TYPE(typeName),
        },
        fields: operatorNames.map((operatorName: OperatorType) => {
          const isArrayOperator = this.options.arrayOperators!.includes(operatorName);

          const nameNode = {
            kind: Kind.NAME,
            value: operatorName,
          };

          const descriptionNode = {
            kind: Kind.STRING,
            value: Reflect.get(DESCRIPTIONS.WHERE_OPERATOR_TYPE.OPERATORS, toConstanceCase(operatorName)),
          };

          const typeNode = {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: operatorName === "present" ? "Boolean" : typeName,
            },
          };

          return {
            kind: Kind.INPUT_VALUE_DEFINITION,
            type: isArrayOperator && operatorName !== "present" ? { kind: Kind.LIST_TYPE, type: typeNode } : typeNode,
            name: nameNode,
            description: descriptionNode,
          } as InputValueDefinitionNode;
        }),
      },
    });
  }

  private appendWhereArgumentToFieldNode(
    field: FieldDefinitionNode,
    whereTypeDefinition: InputObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, "arguments", [
      ...(field.arguments || []),
      {
        kind: Kind.FIELD_DEFINITION,
        name: {
          kind: Kind.NAME,
          value: this.options.whereArgument!.name!,
        },
        type: {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: whereTypeDefinition.name.value,
          },
        },
        directives: [],
      },
    ]);
  }

  private genWhereTypeDefinition(field: FieldDefinitionNode): InputObjectTypeDefinitionNode | undefined {
    const whereTypeOptions = this.options.whereType!;
    const whereTypeName = `${whereTypeOptions.prefix}${getFieldTypeName(field).name}${whereTypeOptions.suffix}`;
    let whereType = getDefinitionByName(this.documentNode, whereTypeName) as InputObjectTypeDefinitionNode;
    if (whereType) {
      return whereType;
    }

    const fieldType = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!fieldType) {
      return;
    }

    const fieldNameAndTypes = this.getWhereFieldNameAndTypes(fieldType);
    const fields: Record<string, InputValueDefinitionNode> = {};
    for (const { name, type, isEqOnly, isObject } of fieldNameAndTypes) {
      let fieldTypeNode: TypeNode | undefined;

      if (type === "Boolean" || isEqOnly) {
        fieldTypeNode = {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: type,
          },
        };
      } else if (isObject) {
        this.genOperatorDefinitions(type);
        fieldTypeNode = {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${this.options.whereType!.prefix}${type}${this.options.whereType!.suffix}`,
          },
        };
      } else {
        this.genOperatorDefinitions(type);
        fieldTypeNode = {
          kind: Kind.NAMED_TYPE,
          name: {
            kind: Kind.NAME,
            value: `${this.options.whereOperator!.prefix}${type}${this.options.whereOperator!.suffix}`,
          },
        };
      }

      if (fieldTypeNode) {
        fields[name] = {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: name,
          },
          description: {
            kind: Kind.STRING,
            value: DESCRIPTIONS.WHERE_TYPE.FIELDS(name),
          },
          type: fieldTypeNode,
          directives: [],
        };

        fields["OR"] = {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: "OR",
          },
          description: {
            kind: Kind.STRING,
            value: DESCRIPTIONS.WHERE_TYPE.FIELDS(name),
          },
          type: {
            kind: Kind.LIST_TYPE,
            type: {
              kind: Kind.NAMED_TYPE,
              name: {
                kind: Kind.NAME,
                value: whereTypeName,
              },
            },
          },
          directives: [],
        };

        fields["PRESENT"] = {
          kind: Kind.INPUT_VALUE_DEFINITION,
          name: {
            kind: Kind.NAME,
            value: "PRESENT",
          },
          description: {
            kind: Kind.STRING,
            value: DESCRIPTIONS.WHERE_OPERATOR_TYPE.OPERATORS.PRESENT,
          },
          type: {
            kind: Kind.NAMED_TYPE,
            name: {
              kind: Kind.NAME,
              value: "Boolean",
            },
          },
          directives: [],
        };
      }
    }

    whereType = {
      kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
      name: {
        kind: Kind.NAME,
        value: whereTypeName,
      },
      description: {
        kind: Kind.STRING,
        value: DESCRIPTIONS.WHERE_TYPE.TYPE(getFieldTypeName(field).name),
      },
      directives: [],
      fields: Object.values(fields),
    } as InputObjectTypeDefinitionNode;

    appendDefinitionToDocumentNode(this.documentNode, whereType);
    return whereType;
  }

  // TODO: ここを改善
  private getWhereFieldNameAndTypes(
    definition: ObjectTypeDefinitionNode | UnionTypeDefinitionNode,
  ): WhereFieldNameAndType[] {
    const fieldNames: WhereFieldNameAndType[] = [];

    const fields: FieldDefinitionNode[] = [];

    if (isUnionType(definition)) {
      for (const def of getObjectTypeDefinitionsFromUnion(this.documentNode, definition)) {
        fields.push(...getFieldDefinitions(def));
      }
    } else {
      fields.push(...getFieldDefinitions(definition));
    }

    for (const field of fields) {
      const { name, isList } = getFieldTypeName(field);

      if (fieldNames.findIndex((fn) => fn.name === field.name.value) !== -1) {
        continue;
      }

      if (this.hasDirective(field, this.options.whereIgnoreDirective?.name)) {
        continue;
      }

      if (
        !(
          isBasicType(name) ||
          isEnumType(this.documentNode, name) ||
          Reflect.get(this.options.supportOperatorTypes!, name)
        )
      ) {
        if (this.hasDirective(field, this.options.whereNestedObjectDirective?.name)) {
          if (name !== definition.name.value) {
            this.genWhereTypeDefinition(field);
          }
          fieldNames.push({
            name: field.name.value,
            type: name,
            isList,
            isObject: true,
            isEqOnly: this.hasDirective(field, this.options.whereEqOnlyDirective?.name),
          });
        }
        continue;
      }

      fieldNames.push({
        name: field.name.value,
        type: name,
        isList,
        isObject: false,
        isEqOnly: this.hasDirective(field, this.options.whereEqOnlyDirective?.name),
      });
    }

    return fieldNames;
  }

  private hasDirective(field: FieldDefinitionNode, directiveName?: string): boolean {
    if (!directiveName) {
      return false;
    }

    const directives = getDirectives(field);
    if (directives.find((d: DirectiveNode) => d.name.value === directiveName)) {
      return true;
    }

    return false;
  }

  private removeDirectives(field: FieldDefinitionNode, directiveNames: (string | undefined)[]): void {
    const names: string[] = directiveNames.filter(
      (directiveName: string | undefined): directiveName is string => directiveName !== undefined,
    );
    Reflect.set(
      field,
      "directives",
      getDirectives(field).filter((directive) => !names.includes(directive.name.value)),
    );
  }

  private readonly documentNode: DocumentNode;

  private typeOperatorMap: Map<
    string,
    {
      whereOperatorType: InputObjectTypeDefinitionNode;
      // inputObjectType: InputObjectTypeDefinitionNode;
    }
  > = new Map<
    string,
    {
      whereOperatorType: InputObjectTypeDefinitionNode;
      // inputObjectType: InputObjectTypeDefinitionNode;
    }
  >();

  constructor(readonly types: string | DocumentNode, private readonly options: GenWhereTypesOptions = {}) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === "string" ? parse(types) : types;
  }
}
