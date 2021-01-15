import { genObjectPaths, sortOperatorKey, whereResolver } from "./resolver";

describe("whereResolver", () => {
  it("should be defined", () => {
    expect(whereResolver).toBeDefined();
  });

  it("return items if where is undefined", () => {
    interface Item {
      name: string;
    }

    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(whereResolver(items, { name: {} })).toEqual(items);
  });

  it("return items if operator is undefined", () => {
    interface Item {
      name: string;
    }

    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(whereResolver(items, { age: undefined } as any)).toEqual(items);
  });

  it("return enmpty array if operator use undefined property", () => {
    interface Item {
      name: string;
    }

    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(whereResolver(items, { name: { Hoge: "A" } } as any)).toHaveLength(0);
  });

  it("return items if operator is not operator (where_eq_only)", () => {
    interface Item {
      age: number;
      name: string;
    }

    const items = [
      { age: 1, name: "A" },
      { age: 2, name: "A" },
      { age: 3, name: "C" },
    ] as Item[];
    expect(whereResolver(items, { age: 1, name: "A" })).toEqual([{ age: 1, name: "A" }]);
  });

  it("return items with operators", () => {
    interface Item {
      age: number;
      name: string;
    }

    const items = [
      { age: 1, name: "A" },
      { age: 2, name: "A" },
      { age: 3, name: "C" },
    ] as Item[];
    expect(whereResolver(items, { age: { eq: 1 }, name: { eq: "A" } })).toEqual([{ age: 1, name: "A" }]);
  });

  it("return items if operator is deep operators", () => {
    interface ItemPosition {
      column: number;
      line: number;
    }
    interface Item {
      position: ItemPosition;
      name: string;
    }

    const items = [
      { name: "A", position: { column: 1, line: 1 } },
      { name: "B", position: { column: 1, line: 2 } },
      { name: "C", position: { column: 2, line: 3 } },
    ] as Item[];
    expect(
      whereResolver(items, {
        position: {
          column: { eq: 1 },
        },
      }),
    ).toEqual([
      { name: "A", position: { column: 1, line: 1 } },
      { name: "B", position: { column: 1, line: 2 } },
    ]);
  });

  it("should where", () => {
    interface Item {
      name: string;
    }

    const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
    expect(whereResolver(items, { name: {} })).toEqual(items);
  });

  describe("STARTS_WITH", () => {
    it("should expect A and ABC", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "ABC" }, { age: 1, name: "DEF" }, { name: "GHI" }] as Item[];
      expect(whereResolver(items, { name: { starts_with: "A" } })).toEqual([{ name: "A" }, { name: "ABC" }]);
    });
  });

  describe("ENDS_WITH", () => {
    it("should expect GHI", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "ABC" }, { name: "DEF" }, { name: "GHI" }] as Item[];
      expect(whereResolver(items, { name: { ends_with: "I" } })).toEqual([{ name: "GHI" }]);
    });
  });
  describe("EQ", () => {
    it("should expect A", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
      expect(whereResolver(items, { name: { eq: "A" } })).toEqual([{ name: "A" }]);
    });

    it("should expect 1", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { eq: 1 } })).toEqual([{ age: 1 }]);
    });

    it("should expect true", () => {
      interface Item {
        enabled: boolean;
      }

      const items = [{ enabled: true }, { enabled: false }] as Item[];
      expect(whereResolver(items, { enabled: true })).toEqual([{ enabled: true }]);
      expect(whereResolver(items, { enabled: false })).toEqual([{ enabled: false }]);
    });

    it("should expect {name: 'A', age: 1}", () => {
      interface Item {
        name: string;
        age: number;
      }

      const items = [
        { name: "A" },
        { age: 1, name: "A" },
        { age: 2, name: "A" },
        { age: 3, name: "A" },
        { age: 1, name: "B" },
      ] as Item[];
      expect(
        whereResolver(items, {
          age: { eq: 1 },
          name: "A",
        }),
      ).toEqual([{ age: 1, name: "A" }]);
    });
  });

  describe("NOT_EQ", () => {
    it("should expect B and C", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
      expect(whereResolver(items, { name: { not_eq: "A" } })).toEqual([{ name: "B" }, { name: "C" }]);
    });

    it("should expect 2 and 3", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { not_eq: 1 } })).toEqual([{ age: 2 }, { age: 3 }]);
    });
  });

  describe("CONTAINS", () => {
    it("should expect A", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "B" }, { name: "C" }] as Item[];
      expect(whereResolver(items, { name: { contains: "A" } })).toEqual([{ name: "A" }]);
    });
    it("should expect ABC", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "ABC" }, { name: "BCD" }, { name: "CDE" }] as Item[];
      expect(whereResolver(items, { name: { contains: "AB" } })).toEqual([{ name: "ABC" }]);
    });
  });

  describe("IN", () => {
    it("should expect A", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "AB" }, { name: "AC" }] as Item[];
      expect(whereResolver(items, { name: { in: ["A"] } })).toEqual([{ name: "A" }]);
    });
    it("should expect ABC", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "ABC" }, { name: "BCD" }, { name: "CDE" }] as Item[];
      expect(whereResolver(items, { name: { in: ["ABC"] } })).toEqual([{ name: "ABC" }]);
    });
  });

  describe("NOT_IN", () => {
    it("should expect AB and AC", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "A" }, { name: "AB" }, { name: "AC" }] as Item[];
      expect(whereResolver(items, { name: { not_in: ["A"] } })).toEqual([{ name: "AB" }, { name: "AC" }]);
    });
    it("should expect ABC", () => {
      interface Item {
        name: string;
      }

      const items = [{ name: "ABC" }, { name: "BCD" }, { name: "CDE" }] as Item[];
      expect(whereResolver(items, { name: { not_in: ["BCD", "CDE"] } })).toEqual([{ name: "ABC" }]);
    });
  });

  describe("LT", () => {
    it("should expect 1 and 2", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { lt: 3 } })).toEqual([{ age: 1 }, { age: 2 }]);
    });
  });

  describe("LTE", () => {
    it("should expect 1 and 2", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { lte: 2 } })).toEqual([{ age: 1 }, { age: 2 }]);
    });
  });

  describe("GT", () => {
    it("should expect 2 and 3", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { gt: 1 } })).toEqual([{ age: 2 }, { age: 3 }]);
    });
  });

  describe("GTE", () => {
    it("should expect 2 and 3", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { gte: 2 } })).toEqual([{ age: 2 }, { age: 3 }]);
    });
  });

  describe("BETWEEN", () => {
    it("should expect 2 and 3", () => {
      interface Item {
        age: number;
      }

      const items = [{ age: 1 }, { age: 2 }, { age: 3 }] as Item[];
      expect(whereResolver(items, { age: { between: [2, 3] } })).toEqual([{ age: 2 }, { age: 3 }]);
    });
  });

  describe("OR", () => {
    it("should expect", () => {
      interface ItemPosition {
        column: number;
        line: number;
      }
      interface Item {
        position: ItemPosition;
        name: string;
        age: number;
      }

      const items = [
        { name: "A", age: 1, position: { column: 1, line: 1 } },
        { name: "B", age: 2, position: { column: 2, line: 1 } },
        { name: "C", age: 3, position: { column: 1, line: 1 } },
        { name: "A", age: 1, position: { column: 1, line: 2 } },
      ] as Item[];
      expect(whereResolver(items, { position: { line: { eq: 1 } }, OR: [{ age: { eq: 1 } }, { name: "B" }] })).toEqual([
        { name: "A", age: 1, position: { column: 1, line: 1 } },
        { name: "B", age: 2, position: { column: 2, line: 1 } },
      ]);
    });

    it("should expect", () => {
      interface ItemPosition {
        column: number;
        line: number;
      }
      interface Item {
        position: ItemPosition;
        name: string;
        age: number;
      }

      const items = [
        { name: "A", age: 1, position: { column: 1, line: 1 } },
        { name: "B", age: 1, position: { column: 2, line: 1 } },
        { name: "C", age: 3, position: { column: 1, line: 1 } },
        { name: "A", age: 1, position: { column: 1, line: 2 } },
      ] as Item[];
      expect(
        whereResolver(items, {
          position: { line: { eq: 1 } },
          OR: [{ age: { eq: 1 }, position: { column: 2 } }, { name: "B" }],
        }),
      ).toEqual([{ name: "B", age: 1, position: { column: 2, line: 1 } }]);
    });
  });

  describe("object path", () => {
    it("test", () => {
      const items = [{ subItem: { name: "ABC" } }, { subItem: { name: "BCD" } }, { subItem: { name: "CDE" } }] as any[];
      expect(whereResolver(items, { name: { in: ["ABC"] } }, { name: "subItem.name" })).toEqual([
        { subItem: { name: "ABC" } },
      ]);
    });
  });

  describe("PRESENT", () => {
    it(`should expect [{ name: "A" }, { age: 10 }, { age: 20 }]`, () => {
      interface Item {
        name?: string;
        age?: number;
        range?: string[];
      }

      const items = [{ name: "A" }, { age: 10 }, { age: 20 }] as Item[];

      expect(whereResolver(items, { PRESENT: true })).toEqual([{ name: "A" }, { age: 10 }, { age: 20 }]);
    });
    it(`should expect [{ name: "A" }]`, () => {
      interface Item {
        name?: string;
        age?: number;
        range?: string[];
      }

      interface Items {
        items?: Item[];
      }

      const items = [{ items: [{ name: "A" }] as Item[] }, { items: [] as Item[] }, {}] as Items[];

      expect(whereResolver(items, { items: { PRESENT: true } })).toEqual([{ items: [{ name: "A" }] }]);
    });

    it(`should expect { name: "A" }`, () => {
      interface Item {
        name?: string;
        age?: number;
        range?: string[];
      }

      const items = [{ name: "A" }, { age: 10 }, { age: 20 }, { name: "" }, { range: [] }] as Item[];

      expect(whereResolver(items, { name: { present: true } })).toEqual([{ name: "A" }]);
    });

    it(`should expect { age: 10 }, { age: 20 }, { name: "" }, { range: [] }`, () => {
      interface Item {
        name?: string;
        age?: number;
      }

      const items = [{ name: "A" }, { age: 10 }, { age: 20 }, { name: "" }, { range: [] }] as Item[];

      expect(whereResolver(items, { name: { present: false } })).toEqual([
        { age: 10 },
        { age: 20 },
        { name: "" },
        { range: [] },
      ]);
    });

    it(`should expect { name: "C", items1: [{ name: "CA" }] }`, () => {
      interface Root {
        name?: string;

        items1: Item1[];

        items2: Item2[];
      }

      interface Item1 {
        name?: string;
      }

      interface Item2 {
        name?: string;
      }

      const items = [
        { name: "A" },
        { name: "B", items1: [{ name: "BA" }] },
        { name: "C", items1: [{ name: "CA" }] },
      ] as Root[];

      expect(whereResolver(items, { items1: { PRESENT: true, name: { contains: "C" } } })).toEqual([
        { name: "C", items1: [{ name: "CA" }] },
      ]);
    });

    it(`should expect { name: "B", nested: [{ name: "C" }] }`, () => {
      interface Item {
        name?: string;
        age?: number;

        nested: Item[];
      }

      const items = [{ name: "A" }, { name: "B", nested: [{ name: "C" }] }, { name: "D", nested: [] }] as Item[];

      expect(whereResolver(items, { nested: { name: { in: ["C"] } } })).toEqual([
        { name: "B", nested: [{ name: "C" }] },
      ]);
    });

    it(`should expect { name: "B", nested: [{ name: "C", obj: { name: "D" } }] }`, () => {
      interface Item {
        name?: string;
        age?: number;

        nested: Item[];

        obj: Item;
      }

      const items = [
        { name: "A" },
        { name: "B", nested: [{ name: "C", obj: { name: "D" } }] },
        { name: "D", nested: [] },
      ] as Item[];

      expect(whereResolver(items, { nested: { obj: { name: { eq: "D" } } } })).toEqual([
        { name: "B", nested: [{ name: "C", obj: { name: "D" } }] },
      ]);
    });
  });
});

describe("genObjectPaths", () => {
  it("should gen path", () => {
    expect(genObjectPaths({ name: "A" }, "name")).toEqual(["name"]);
  });

  it("should gen path", () => {
    expect(genObjectPaths({ nested: { name: "A" } }, "nested.name")).toEqual(["nested.name"]);
  });

  it("should gen path", () => {
    expect(genObjectPaths({ nested: [{ name: "A" }, { name: "B" }] }, "nested.name")).toEqual([
      "nested.0.name",
      "nested.1.name",
    ]);
  });

  it("should gen path", () => {
    expect(
      genObjectPaths(
        {
          nested: [
            { name: "A", nested2: [{ name: "B" }, { name: "C" }] },
            { name: "D", nested2: [{ name: "E" }, { name: "F" }] },
          ],
        },
        "nested.nested2.name",
      ),
    ).toEqual([
      "nested.0.nested2.0.name",
      "nested.0.nested2.1.name",
      "nested.1.nested2.0.name",
      "nested.1.nested2.1.name",
    ]);
  });

  it("should gen path", () => {
    expect(
      genObjectPaths(
        {
          nested: [
            { name: "A", nested2: [{ name: "B", nested3: [{ name: "AA" }] }, { name: "C" }] },
            { name: "D", nested2: [{ name: "E", nested3: [{ name: "BB" }, { name: "CC" }] }, { name: "F" }] },
          ],
        },
        "nested.nested2.nested3.name",
      ),
    ).toEqual([
      "nested.0.nested2.0.nested3.0.name",
      "nested.0.nested2.1.nested3.name",
      "nested.1.nested2.0.nested3.0.name",
      "nested.1.nested2.0.nested3.1.name",
      "nested.1.nested2.1.nested3.name",
    ]);
  });
});

describe("sortOperatorKey", () => {
  it("should be sorted", () => {
    expect(sortOperatorKey(["A", "B", "present", "C", "PRESENT"])).toEqual(["A", "B", "C", "present", "PRESENT"]);
  });
});

describe("Complicated tests", () => {
  it(`test`, () => {
    interface Segment {
      source?: string;

      translations?: Tranlation[];

      comments?: Comment[];
    }

    interface Tranlation {
      target?: string;

      approved: boolean;
    }

    interface Comment {
      body?: string;
    }

    const segments: Segment[] = [
      { source: "A" },
      { source: "B", translations: [{ target: "BA", approved: false }] },
      { source: "C", comments: [{ body: "BB" }] },
      { source: "D", translations: [], comments: [{ body: "BB" }] },
      { source: "123", translations: [{ target: "BA1", approved: false }], comments: [{ body: "BB" }] },
      { source: "456", translations: [{ target: "BA2", approved: true }], comments: [{ body: "BB" }] },
      { source: "789", translations: [{ target: "BA3", approved: true }], comments: [] },
      { source: "345", translations: [{ target: "CA", approved: false }], comments: [] },
      { source: "345", translations: [{ target: "DA", approved: false }], comments: [{ body: "DB" }] },
    ];

    // no filter
    expect(whereResolver(segments, {})).toEqual(segments);

    // has translations
    expect(whereResolver(segments, { translations: { PRESENT: true } })).toEqual([
      { source: "B", translations: [{ target: "BA", approved: false }] },
      { source: "123", translations: [{ target: "BA1", approved: false }], comments: [{ body: "BB" }] },
      { source: "456", translations: [{ target: "BA2", approved: true }], comments: [{ body: "BB" }] },
      { source: "789", translations: [{ target: "BA3", approved: true }], comments: [] },
      { source: "345", translations: [{ target: "CA", approved: false }], comments: [] },
      { source: "345", translations: [{ target: "DA", approved: false }], comments: [{ body: "DB" }] },
    ]);

    // no translations
    expect(whereResolver(segments, { translations: { PRESENT: false } })).toEqual([
      { source: "A" },
      { source: "C", comments: [{ body: "BB" }] },
      { source: "D", translations: [], comments: [{ body: "BB" }] },
    ]);

    // no approved translations
    expect(whereResolver(segments, { translations: { PRESENT: true, approved: false } })).toEqual([
      { source: "B", translations: [{ target: "BA", approved: false }] },
      { source: "123", translations: [{ target: "BA1", approved: false }], comments: [{ body: "BB" }] },
      { source: "345", translations: [{ target: "CA", approved: false }], comments: [] },
      { source: "345", translations: [{ target: "DA", approved: false }], comments: [{ body: "DB" }] },
    ]);

    // approved translations
    expect(whereResolver(segments, { translations: { PRESENT: true, approved: true } })).toEqual([
      { source: "456", translations: [{ target: "BA2", approved: true }], comments: [{ body: "BB" }] },
      { source: "789", translations: [{ target: "BA3", approved: true }], comments: [] },
    ]);

    // approved translations with comments
    expect(
      whereResolver(segments, { translations: { PRESENT: true, approved: true }, comments: { PRESENT: true } }),
    ).toEqual([{ source: "456", translations: [{ target: "BA2", approved: true }], comments: [{ body: "BB" }] }]);

    // approved translations without comments
    expect(
      whereResolver(segments, { translations: { PRESENT: true, approved: true }, comments: { PRESENT: false } }),
    ).toEqual([{ source: "789", translations: [{ target: "BA3", approved: true }], comments: [] }]);

    // no approved translations and search text
    expect(
      whereResolver(segments, {
        translations: { PRESENT: true, approved: false },
        OR: [{ source: { contains: "A" } }, { translations: { target: { contains: "A" } } }],
      }),
    ).toEqual([
      { source: "B", translations: [{ target: "BA", approved: false }] },
      { source: "123", translations: [{ target: "BA1", approved: false }], comments: [{ body: "BB" }] },
      { source: "345", translations: [{ target: "CA", approved: false }], comments: [] },
      { source: "345", translations: [{ target: "DA", approved: false }], comments: [{ body: "DB" }] },
    ]);
  });
});
