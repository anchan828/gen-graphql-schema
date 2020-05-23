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
} from "@anchan828/gen-graphql-schema-common";
import * as deepmerge from "deepmerge";
import {
  DirectiveNode,
  DocumentNode,
  FieldDefinitionNode,
  InputObjectTypeDefinitionNode,
  InputValueDefinitionNode,
  ObjectTypeDefinitionNode,
  parse,
  TypeNode,
  UnionTypeDefinitionNode,
} from "graphql";
import { DEFAULT_OPTIONS, DESCRIPTIONS } from "./constants";
import { GenOrderTypesOptions, OrderByFieldNameAndType } from "./interfaces";
export class GenOrderTypesService {
  public genOrderTypes(): DocumentNode {
    if (!hasDirectiveInDocumentNode(this.documentNode, this.options.orderByDirective!.name!)) {
      return this.documentNode;
    }
    this.genOrderDirectionEnum();
    const fields = getFieldDefinitionsByDirective(this.documentNode, this.options.orderByDirective!.name!);
    for (const field of fields) {
      const orderByType = this.genOrderByTypeDefinitionByField(field);

      if (!orderByType) {
        continue;
      }

      this.appendOrderByArgumentToFieldNode(field, orderByType);
    }

    for (const operator of this.typeOperatorMap.values()) {
      appendDefinitionToDocumentNode(this.documentNode, operator);
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
          this.options.orderByDirective?.name,
          this.options.orderByIgnoreDirective?.name,
          this.options.orderByNestedObjectDirective?.name,
        ]);
      }
    }

    return this.documentNode;
  }

  private genOrderDirectionEnum(): void {
    appendDefinitionToDocumentNode(this.documentNode, {
      kind: "EnumTypeDefinition",
      name: {
        kind: "Name",
        value: this.options.orderDirection!.typeName!,
      },
      description: {
        kind: "StringValue",
        value: DESCRIPTIONS.OEDER_DIRECTION.TYPE,
      },
      values: [
        {
          kind: "EnumValueDefinition",
          name: {
            kind: "Name",
            value: this.options.orderDirection!.ascName!,
          },
          description: {
            kind: "StringValue",
            value: DESCRIPTIONS.OEDER_DIRECTION.ASC,
          },
        },
        {
          kind: "EnumValueDefinition",
          name: {
            kind: "Name",
            value: this.options.orderDirection!.descName!,
          },
          description: {
            kind: "StringValue",
            value: DESCRIPTIONS.OEDER_DIRECTION.DESC,
          },
        },
      ],
    });
  }

  private appendOrderByArgumentToFieldNode(
    field: FieldDefinitionNode,
    orderByTypeDefinition: InputObjectTypeDefinitionNode,
  ): void {
    Reflect.set(field, "arguments", [
      ...(field.arguments || []),
      {
        kind: "FieldDefinition",
        name: {
          kind: "Name",
          value: this.options.orderByArgument!.name!,
        },
        type: {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: orderByTypeDefinition.name.value,
          },
        },
        directives: [],
      },
    ]);
  }

  private genOrderByTypeDefinitionByField(field: FieldDefinitionNode): InputObjectTypeDefinitionNode | undefined {
    const fieldType = getObjectOrUnionTypeDefinition(this.documentNode, field);

    if (!fieldType) {
      return;
    }

    const fieldNameAndTypes = this.getOrderByFieldNameAndTypes(fieldType);
    const fields: InputValueDefinitionNode[] = [];
    for (const { name, type, isObject } of fieldNameAndTypes) {
      let fieldTypeNode: TypeNode | undefined;

      if (isObject) {
        fieldTypeNode = {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: `${this.options.orderType!.prefix}${type}${this.options.orderType!.suffix}`,
          },
        };
      } else {
        fieldTypeNode = {
          kind: "NamedType",
          name: {
            kind: "Name",
            value: this.options.orderDirection!.typeName!,
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
            value: DESCRIPTIONS.ORDER_TYPE.FIELDS(fieldType.name.value, name),
          },
          type: fieldTypeNode,
          directives: [],
        });
      }
    }

    const orderByTypeName = `${this.options.orderType?.prefix}${getFieldTypeName(field).name}${
      this.options.orderType?.suffix
    }`;
    let orderByType = getDefinitionByName(this.documentNode, orderByTypeName) as InputObjectTypeDefinitionNode;

    if (orderByType) {
      return orderByType;
    }
    orderByType = {
      kind: "InputObjectTypeDefinition",
      name: {
        kind: "Name",
        value: orderByTypeName,
      },
      description: {
        kind: "StringValue",
        value: DESCRIPTIONS.ORDER_TYPE.TYPE(getFieldTypeName(field).name),
      },
      directives: [],
      fields,
    } as InputObjectTypeDefinitionNode;

    if (!this.typeOperatorMap.has(orderByTypeName)) {
      this.typeOperatorMap.set(orderByTypeName, orderByType);
    }
    this.removeDirectives(field, [this.options.orderByNestedObjectDirective?.name]);
    return orderByType;
  }

  private getOrderByFieldNameAndTypes(
    definition?: ObjectTypeDefinitionNode | UnionTypeDefinitionNode,
  ): OrderByFieldNameAndType[] {
    if (!definition) {
      return [];
    }
    const fieldNames: OrderByFieldNameAndType[] = [];

    const fields: FieldDefinitionNode[] = [];

    if (isUnionType(definition)) {
      for (const def of getObjectTypeDefinitionsFromUnion(this.documentNode, definition)) {
        fields.push(...getFieldDefinitions(def));
      }
    } else {
      fields.push(...getFieldDefinitions(definition));
    }

    for (const field of fields) {
      const { name } = getFieldTypeName(field);
      if (fieldNames.findIndex((fn) => fn.name === field.name.value) !== -1) {
        continue;
      }

      if (this.hasDirective(field, this.options.orderByIgnoreDirective?.name)) {
        continue;
      }
      if (!this.options.supportOrderableTypes?.includes(name)) {
        if (!(isBasicType(name) || isEnumType(this.documentNode, name))) {
          if (this.hasDirective(field, this.options.orderByNestedObjectDirective?.name)) {
            if (name !== definition.name.value) {
              this.genOrderByTypeDefinitionByField(field);
            }

            fieldNames.push({
              name: field.name.value,
              type: name,
              isObject: true,
            });
          }
          continue;
        }
      }

      fieldNames.push({
        name: field.name.value,
        type: name,
        isObject: false,
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

  private removeFieldDirectives(field: FieldDefinitionNode): void {
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
        this.removeDirectives(f, [
          this.options.orderByIgnoreDirective?.name,
          this.options.orderByNestedObjectDirective?.name,
        ]);
      }
    }
  }

  private readonly documentNode: DocumentNode;

  private typeOperatorMap: Map<string, InputObjectTypeDefinitionNode> = new Map<
    string,
    InputObjectTypeDefinitionNode
  >();

  constructor(readonly types: string | DocumentNode, private readonly options: GenOrderTypesOptions = {}) {
    this.options = deepmerge(DEFAULT_OPTIONS, options);
    this.documentNode = typeof types === "string" ? parse(types) : types;
  }
}
