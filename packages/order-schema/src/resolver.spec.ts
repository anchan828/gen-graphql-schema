import { orderResolver } from "./resolver";
describe("orderResolver", () => {
  it("should be defined", () => {
    expect(orderResolver).toBeDefined();
  });

  it("should return same items if orderBy is undefined", () => {
    interface Item {
      name: string;
    }
    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(orderResolver(items, undefined)).toEqual(items);
  });

  it("should return same items if field is undefined", () => {
    interface Item {
      name: string;
    }
    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(
      orderResolver(items, {
        hoge: "ASC",
      }),
    ).toEqual(items);
  });

  it("should order items by name", () => {
    interface Item {
      name: string;
    }

    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(orderResolver(items, { name: "ASC" })).toEqual(items);
    expect(orderResolver(items, { name: "DESC" })).toEqual(items.reverse());
  });

  it("should order items by age", () => {
    interface Item {
      name: string;
      age: number;
    }

    const items = [
      { age: 30, name: "A" },
      { age: 20, name: "B" },
      { age: 40, name: "C" },
    ] as Item[];
    expect(orderResolver(items, { age: "ASC" })).toEqual([
      { age: 20, name: "B" },
      { age: 30, name: "A" },
      { age: 40, name: "C" },
    ]);
    expect(orderResolver(items, { age: "DESC" })).toEqual([
      { age: 40, name: "C" },
      { age: 30, name: "A" },
      { age: 20, name: "B" },
    ]);
  });

  it("should order items by age", () => {
    interface Item {
      name: string;
      age?: number;
    }
    expect(
      orderResolver([{ age: 2, name: "A" }, { name: "B" }, { name: "C" }, { age: 1, name: "D" }], {
        age: "DESC",
      }),
    ).toEqual([{ name: "B" }, { name: "C" }, { age: 2, name: "A" }, { age: 1, name: "D" }]);
    expect(
      orderResolver([{ age: 2, name: "A" }, { name: "B" }, { name: "C" }, { age: 1, name: "D" }], {
        age: "ASC",
      }),
    ).toEqual([{ age: 1, name: "D" }, { age: 2, name: "A" }, { name: "B" }, { name: "C" }]);
  });

  it("should order items by name and age", () => {
    interface Item {
      name: string;
      age: number;
    }
    expect(
      orderResolver(
        [
          { age: 20, name: "A" },
          { age: 20, name: "B" },
          { age: 40, name: "C" },
          { age: 20, name: "C" },
        ] as Item[],
        { age: "ASC", name: "DESC" },
      ),
    ).toEqual([
      { age: 20, name: "C" },
      { age: 20, name: "B" },
      { age: 20, name: "A" },
      { age: 40, name: "C" },
    ]);

    expect(
      orderResolver(
        [
          { age: 20, name: "A" },
          { age: 20, name: "B" },
          { age: 40, name: "C" },
          { age: 20, name: "C" },
        ] as Item[],
        { age: "DESC", name: "ASC" },
      ),
    ).toEqual([
      { age: 40, name: "C" },
      { age: 20, name: "A" },
      { age: 20, name: "B" },
      { age: 20, name: "C" },
    ]);

    expect(
      orderResolver(
        [
          { age: 20, name: "A" },
          { age: 20, name: "B" },
          { age: 40, name: "C" },
          { age: 20, name: "C" },
        ] as Item[],
        // eslint-disable-next-line prettier/prettier
        { age: "ASC", name: "ASC" },
      ),
    ).toEqual([
      { age: 20, name: "A" },
      { age: 20, name: "B" },
      { age: 20, name: "C" },
      { age: 40, name: "C" },
    ]);
  });

  it("should order items by name and age", () => {
    interface Item {
      firstName: string;
      lastName: string;
      age: number;
    }

    expect(
      orderResolver(
        [
          { age: 20, firstName: "A", lastName: "D" },
          { age: 20, firstName: "B", lastName: "C" },
          { age: 40, firstName: "C", lastName: "B" },
          { age: 20, firstName: "C", lastName: "A" },
        ] as Item[],
        { firstName: "ASC", lastName: "DESC", age: "ASC" },
      ),
    ).toEqual([
      { age: 20, firstName: "A", lastName: "D" },
      { age: 20, firstName: "B", lastName: "C" },
      { age: 40, firstName: "C", lastName: "B" },
      { age: 20, firstName: "C", lastName: "A" },
    ]);
  });

  it("should order items by nested property", () => {
    interface SubPosition {
      column: number;
    }
    interface ItemPosition {
      line: number;
      sub: SubPosition;
    }
    interface Item {
      name: string;
      position: ItemPosition;
    }

    expect(
      orderResolver(
        [
          { name: "A", position: { line: 1, sub: { column: 1 } } },
          { name: "B", position: { line: 4, sub: { column: 1 } } },
          { name: "C", position: { line: 1, sub: { column: 2 } } },
          { name: "D", position: { line: 3, sub: { column: 1 } } },
        ] as Item[],
        { position: { line: "DESC", sub: { column: "DESC" } } },
      ),
    ).toEqual([
      { name: "B", position: { line: 4, sub: { column: 1 } } },
      { name: "D", position: { line: 3, sub: { column: 1 } } },
      { name: "C", position: { line: 1, sub: { column: 2 } } },
      { name: "A", position: { line: 1, sub: { column: 1 } } },
    ]);
  });
});
