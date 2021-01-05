import { whereResolver } from "./resolver";

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
  });
});
