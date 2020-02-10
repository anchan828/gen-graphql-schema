/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  appendDefinitionToDocumentNode,
  getDefinitionByName,
  getDirectives,
  getFieldDefinitions,
  getFieldDefinitionsByDirective,
  getFieldTypeName,
  getObjectOrUnionTypeDefinition,
  getObjectTypeDefinitionsFromUnion,
  hasDirectiveInDocumentNode,
  isBasicType,
  isEnumType,
  isUnionType,
  toConstanceCase,
} from "@anchan828/gen-graphql-schema-common";
import * as deepmerge from "deepmerge";
import {
  DirectiveNode,
  DocumentNode,
  EnumTypeDefinitionNode,
  EnumValueDefinitionNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeNode,
  UnionTypeDefinitionNode,
} from "graphql";
import { DEFAULT_OPTIONS, DESCRIPTIONS } from "./constants";
import { GenWhereTypesOptions, WhereFieldNameAndType } from "./interfaces";
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
      this.removeWhereDirective(field);
      this.removeWhereIgnoreDirective(field);
    }

    for (const operator of this.typeOperatorMap.values()) {
      appendDefinitionToDocumentNode(this.documentNode, operator.enumType, operator.inputObjectType);
    }

    return this.documentNode;
  }

  private genOperatorDefinitions(typeName: string): void {
    if (this.typeOperatorMap.has(typeName)) {
      return;
    }
    let operatorNames = Reflect.get(this.options.supportOperatorTypes!, typeName) as string[];

    if (!Array.isArray(operatorNames) && isEnumType(this.documentNode, typeName)) {
      operatorNames = this.options.enumTypeOperator!;
    }
    if (!Array.isArray(operatorNames)) {
      return;
    }

    this.typeOperatorMap.set(typeName, {
      enumType: {
        kind: "EnumTypeDefinition",
        name: {
          kind: "Name",
          value: `${this.options.whereOperatorType!.prefix}${typeName}${this.options.whereOperatorType!.suffix}`,
        },
        description: {
          kind: "StringValue",
          value: DESCRIPTIONS.WHERE_OPERATOR_TYPE.TYPE(typeName),
        },
        values: operatorNames.map(
          operatorName =>
            ({
              kind: "EnumValueDefinition",
              name: {
                kind: "Name",
                value: toConstanceCase(operatorName),
              },
              description: {
                kind: "StringValue",
                value: Reflect.get(DESCRIPTIONS.WHERE_OPERATOR_TYPE.OPERATORS, toConstanceCase(operatorName)),
              },
            } as EnumValueDefinitionNode),
        ),
      },
      inputObjectType: {
        kind: "InputObjectTypeDefinition",
        name: {
          kind: "Name",
          value: `${this.options.whereOperator!.prefix}${typeName}${this.options.whereOperator!.suffix}`,
        },
        description: {
          kind: "StringValue",
          value: DESCRIPTIONS.WHERE_OPERATOR.TYPE(typeName),
        },
        fields: [
          {
            kind: "InputValueDefinition",
            name: {
              kind: "Name",
              value: "type",
            },
            description: {
              kind: "StringValue",
              value: DESCRIPTIONS.WHERE_OPERATOR.FIELDS.TYPE(typeName),
            },
            type: {
              kind: "NonNullType",
              type: {
                kind: "NamedType",
                name: {
                  kind: "Name",
                  value: `${this.options.whereOperatorType!.prefix}${typeName}${
                    this.options.whereOperatorType!.suffix
                  }`,
                },
              },
            },
          },
          {
            kind: "InputValueDefinition",
            name: {
              kind: "Name",
              value: "value",
            },
            description: {
              kind: "StringValue",
              value: DESCRIPTIONS.WHERE_OPERATOR.FIELDS.VALUE(typeName),
            },
            type: {
              kind: "ListType",
              type: {
                kind: "NamedType",
                name: {
                  kind: "Name",
                  value: typeName,
                },
              },
            },
          },
        ],
      } as InputObjectTypeDefinitionNode,
    });
  }

  private appendWhereArgumentToFieldNode(
    field: FieldDefinitionNode,
    whereTypeDefinition: InputObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, "arguments", [
      ...(field.arguments || []),
      {
        kind: "FieldDefinition",
        name: {
          kind: "Name",
          value: this.options.whereArgment!.name!,
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: whereTypeDefinition.name.value,
          },
        },
        directives: [],
      },
    ]);
  }

  private genWhereTypeDefinition(field: FieldDefinitionNode): InputObjectTypeDefinitionNode | undefined {
    const fieldType = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!fieldType) {
      return;
    }

    const fieldNameAndTypes = this.getWhereFieldNameAndTypes(fieldType);
    const fields: InputValueDefinitionNode[] = [];
    for (const { name, type, isEqOnly, isObject } of fieldNameAndTypes) {
      let fieldTypeNode: TypeNode | undefined;

      if (type === "Boolean" || isEqOnly) {
        fieldTypeNode = {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: type,
          },
        };
      } else if (isObject) {
        this.genOperatorDefinitions(type);
        fieldTypeNode = {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: `${this.options.whereType!.prefix}${type}${this.options.whereType!.suffix}`,
          },
        };
      } else {
        this.genOperatorDefinitions(type);
        fieldTypeNode = {
          kind: "ListType",
          type: {
            kind: "NamedType",
            name: {
              kind: "Name",
              value: `${this.options.whereOperator!.prefix}${type}${this.options.whereOperator!.suffix}`,
            },
          },
        };
      }
      if (fieldTypeNode) {
        fields.push({
          kind: "InputValueDefinition",
          name: {
            kind: "Name",
            value: name,
          },
          description: {
            kind: "StringValue",
            value: DESCRIPTIONS.WHERE_TYPE.FIELDS(name),
          },
          type: fieldTypeNode,
          directives: [],
        });
      }
    }

    const whereTypeOptions = this.options.whereType!;
    const whereTypeName = `${whereTypeOptions.prefix}${getFieldTypeName(field).name}${whereTypeOptions.suffix}`;
    let whereType = getDefinitionByName(this.documentNode, whereTypeName) as InputObjectTypeDefinitionNode;
    if (whereType) {
      return whereType;
    }
    whereType = {
      kind: "InputObjectTypeDefinition",
      name: {
        kind: "Name",
        value: whereTypeName,
      },
      description: {
        kind: "StringValue",
        value: DESCRIPTIONS.WHERE_TYPE.TYPE(getFieldTypeName(field).name),
      },
      directives: [],
      fields,
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

      if (fieldNames.findIndex(fn => fn.name === field.name.value) !== -1) {
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
      getDirectives(field).filter(directive => !names.includes(directive.name.value)),
    );
  }

  private removeWhereDirective(field: FieldDefinitionNode): void {
    const directives = getDirectives(field);
    Reflect.set(
      field,
      "directives",
      directives.filter(directive => directive.name.value !== this.options.whereDirective!.name),
    );
  }

  private removeWhereIgnoreDirective(field: FieldDefinitionNode): void {
    const type = getObjectOrUnionTypeDefinition(this.documentNode, field);
    if (!type) {
      return;
    }
    const definitions: ObjectTypeDefinitionNode[] = [];

    if (isUnionType(type)) {
      definitions.push(...getObjectTypeDefinitionsFromUnion(this.documentNode, type));
    } else {
      definitions.push(type);
    }
    for (const definition of definitions) {
      for (const f of getFieldDefinitions(definition)) {
        this.removeDirectives(f, [this.options.whereIgnoreDirective?.name, this.options.whereEqOnlyDirective?.name]);
      }
    }
  }

  private readonly documentNode: DocumentNode;

  private typeOperatorMap: Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      inputObjectType: InputObjectTypeDefinitionNode;
    }
  > = new Map<
    string,
    {
      enumType: EnumTypeDefinitionNode;
      inputObjectType: InputObjectTypeDefinitionNode;
    }
  >();

  constructor(readonly types: string | DocumentNode, private readonly options: GenWhereTypesOptions = {}) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === "string" ? parse(types) : types;
  }
}
