import { mergeTypes } from './merge-graphql-schemas';
const print = (types: string) => {
  return mergeTypes([types]);
};
describe('single file', () => {
  describe('without @is_relay directive', () => {
    it('pass', () => {
      expect(
        mergeTypes([
          `
          type Project {
              id: String
          }
          `,
        ]),
      ).toEqual(
        print(`
          schema {
            query: Query
          }
    
          type Project {
            id: String
          }`),
      );
    });

    it('pass', () => {
      expect(
        mergeTypes([
          `
          type Project {
              id: String
          }
          type Test {
              projects: [Project]
          }
          `,
        ]),
      ).toEqual(
        print(`
          schema {
            query: Query
          }
    
          type Project {
            id: String
          }
    
          type Test {
            projects: [Project]
          }
          `),
      );
    });
  });

  describe('has @is_relay directive', () => {
    it('pass', () => {
      expect(
        mergeTypes([
          `
          type Project {
              id: String
          }
          type Query {
              projects: [Project] @is_relay
          }
          `,
        ]),
      ).toEqual(
        print(`
        schema {
            query: Query
          }

          type Query {
            projects(before: String,after: String,first: Int,last: Int): ProjectConnection
          }

          type Project implements Node {
            id: String
          }

          interface Connection {
            totalCount: Int
            pageInfo: PageInfo!
            edges: [Edge]
          }

          interface Node {
            id: ID!
          }

          interface Edge {
            cursor: String
          }

          type PageInfo {
            startCursor: String
            endCursor: String
            hasNextPage: Boolean
            hasPreviousPage: Boolean
          }

          type ProjectEdge implements Edge {
            node: Project
            cursor: String
          }

          type ProjectConnection implements Connection {
            totalCount: Int
            edges: [ProjectEdge]
            pageInfo: PageInfo!
          }`),
      );
    });

    it('pass', () => {
      expect(
        mergeTypes([
          `
            type Project {
                id: String
            }

            type Project2 {
                id: String
            }
            
            type Query {
                projects: [Project] @is_relay
                projects2: [Project2] @is_relay
            }
            `,
        ]),
      ).toEqual(
        print(`
          schema {
              query: Query
            }

            type Query {
              projects(before: String,after: String,first: Int,last: Int): ProjectConnection
              projects2(before: String, after: String, first: Int, last: Int): Project2Connection
            }

            type Project implements Node {
              id: String
            }

            type Project2 implements Node {
                id: String
            }

            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }

            interface Node {
              id: ID!
            }

            interface Edge {
              cursor: String
            }

            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }

            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }

            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }

            type Project2Edge implements Edge {
                node: Project2
                cursor: String
              }

              type Project2Connection implements Connection {
                totalCount: Int
                edges: [Project2Edge]
                pageInfo: PageInfo!
              }
            `),
      );
    });
  });
});

describe('multiple files', () => {
  describe('without @is_relay directive', () => {
    it('pass', () => {
      expect(
        mergeTypes([
          `
            type Project {
                id: String
            }
            `,
          `
            type Project {
                name: String
            }
            
            type User {
                id: String
            }
            `,
        ]),
      ).toEqual(
        print(`
            schema {
              query: Query
            }

            type Project {
              id: String
              name: String
            }
            
            type User {
                id: String
            }
            `),
      );
    });

    it('pass', () => {
      expect(
        mergeTypes([
          `
            type Project {
                id: String
            }
            `,
          `
            type Test {
                projects: [Project]
            }`,
        ]),
      ).toEqual(
        print(`
            schema {
              query: Query
            }
      
            type Project {
              id: String
            }
      
            type Test {
              projects: [Project]
            }
            `),
      );
    });
  });

  describe('has @is_relay directive', () => {
    it('pass', () => {
      expect(
        mergeTypes([
          `
            type Project {
                id: String
            }
            `,
          `
            type Query {
                projects: [Project] @is_relay
            }
            `,
        ]),
      ).toEqual(
        print(`
          schema {
              query: Query
            }
  
            type Query {
              projects(before: String,after: String,first: Int,last: Int): ProjectConnection
            }
  
            type Project implements Node {
              id: String
            }
  
            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }
  
            interface Node {
              id: ID!
            }
  
            interface Edge {
              cursor: String
            }
  
            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }
  
            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }
  
            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }`),
      );
    });
    it('pass', () => {
      expect(
        mergeTypes([
          `
              type Project {
                  id: String
              }
              `,
          `
              type Query {
                  projects: [Project] @is_relay
              }
              `,
          `
              type Project {
                name: String
            }
            `,
        ]),
      ).toEqual(
        print(`
            schema {
                query: Query
              }
    
              type Query {
                projects(before: String,after: String,first: Int,last: Int): ProjectConnection
              }
    
              type Project implements Node {
                id: String
                name: String
              }
    
              interface Connection {
                totalCount: Int
                pageInfo: PageInfo!
                edges: [Edge]
              }
    
              interface Node {
                id: ID!
              }
    
              interface Edge {
                cursor: String
              }
    
              type PageInfo {
                startCursor: String
                endCursor: String
                hasNextPage: Boolean
                hasPreviousPage: Boolean
              }
    
              type ProjectEdge implements Edge {
                node: Project
                cursor: String
              }
    
              type ProjectConnection implements Connection {
                totalCount: Int
                edges: [ProjectEdge]
                pageInfo: PageInfo!
              }`),
      );
    });
    it('pass', () => {
      expect(
        mergeTypes([
          `
              type Project {
                  id: String
              }
  
              type Project2 {
                  id: String
              }
              
              type Query {
                  projects: [Project] @is_relay
                  projects2: [Project2] @is_relay
              }
              `,
        ]),
      ).toEqual(
        print(`
            schema {
                query: Query
              }
  
              type Query {
                projects(before: String,after: String,first: Int,last: Int): ProjectConnection
                projects2(before: String, after: String, first: Int, last: Int): Project2Connection
              }
  
              type Project implements Node {
                id: String
              }
  
              type Project2 implements Node {
                  id: String
              }
  
              interface Connection {
                totalCount: Int
                pageInfo: PageInfo!
                edges: [Edge]
              }
  
              interface Node {
                id: ID!
              }
  
              interface Edge {
                cursor: String
              }
  
              type PageInfo {
                startCursor: String
                endCursor: String
                hasNextPage: Boolean
                hasPreviousPage: Boolean
              }
  
              type ProjectEdge implements Edge {
                node: Project
                cursor: String
              }
  
              type ProjectConnection implements Connection {
                totalCount: Int
                edges: [ProjectEdge]
                pageInfo: PageInfo!
              }
  
              type Project2Edge implements Edge {
                  node: Project2
                  cursor: String
                }
  
                type Project2Connection implements Connection {
                  totalCount: Int
                  edges: [Project2Edge]
                  pageInfo: PageInfo!
                }
              `),
      );
    });
  });
});

describe('order', () => {
  it('is false', () => {
    expect(
      mergeTypes([
        `
            type Project {
                id: String
            }
            type Query {
                projects: [Project] @is_relay(order: false)
            }
            `,
      ]),
    ).toEqual(
      print(`
          schema {
              query: Query
            }
  
            type Query {
              projects(before: String,after: String,first: Int,last: Int): ProjectConnection
            }
  
            type Project implements Node {
              id: String
            }
  
            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }
  
            interface Node {
              id: ID!
            }
  
            interface Edge {
              cursor: String
            }
  
            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }
  
            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }
  
            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }`),
    );
  });

  it('is true', () => {
    expect(
      mergeTypes([
        `   type Test {
              name: String
            }
            type Project {
                id: String
                test1: Int!
                test2: Int
                test3: Test!
                test4: Date
            }
            type Query {
                projects: [Project] @is_relay(order: true)
            }
            `,
      ]),
    ).toEqual(
      print(`
          schema {
              query: Query
            }
  
            type Query {
              projects(before: String,after: String,first: Int,last: Int, orderBy: [ProjectNodeOrder]): ProjectConnection
            }
            type Test {
              name: String
            }
            type Project implements Node {
              id: String
              test1: Int!
              test2: Int
              test3: Test!
              test4: Date
            }
  
            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }
  
            interface Node {
              id: ID!
            }
  
            interface Edge {
              cursor: String
            }
  
            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }

            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }

            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }

            enum ProjectNodeOrder {
                id_ASC
                id_DESC
                test1_ASC
                test1_DESC
                test2_ASC
                test2_DESC
                test4_ASC
                test4_DESC
            }
            `),
    );
  });
});

describe('where', () => {
  it('is false', () => {
    expect(
      mergeTypes([
        `
            type Project {
                id: String
            }
            type Query {
                projects: [Project] @is_relay(where: false)
            }
            `,
      ]),
    ).toEqual(
      print(`
          schema {
              query: Query
            }
  
            type Query {
              projects(before: String,after: String,first: Int,last: Int): ProjectConnection
            }
  
            type Project implements Node {
              id: String
            }
  
            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }
  
            interface Node {
              id: ID!
            }
  
            interface Edge {
              cursor: String
            }
  
            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }
  
            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }
  
            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }`),
    );
  });
  it('is true', () => {
    expect(
      mergeTypes([
        `
            type Project {
                id: ID!
                name: String!
                age: Int
                created_At: Date
                range: Float
                published: Boolean
            }
            type Query {
                projects: [Project] @is_relay(where: true)
            }
            `,
      ]),
    ).toEqual(
      print(`
          schema {
              query: Query
            }
  
            type Query {
              projects(before: String,after: String,first: Int,last: Int, where: ProjectNodeWhere): ProjectConnection
            }
  
            type Project implements Node {
              id: ID!
              name: String!
              age: Int
              created_At: Date
              range: Float
              published: Boolean
            }
  
            interface Connection {
              totalCount: Int
              pageInfo: PageInfo!
              edges: [Edge]
            }
  
            interface Node {
              id: ID!
            }
  
            interface Edge {
              cursor: String
            }
  
            type PageInfo {
              startCursor: String
              endCursor: String
              hasNextPage: Boolean
              hasPreviousPage: Boolean
            }
  
            type ProjectEdge implements Edge {
              node: Project
              cursor: String
            }
  
            type ProjectConnection implements Connection {
              totalCount: Int
              edges: [ProjectEdge]
              pageInfo: PageInfo!
            }
            input ProjectNodeWhere {
              id_eq: ID
              id_not_eq: ID
              id_in: [ID]
              id_not_in: [ID]
              id_lt: ID
              id_lte: ID
              id_gt: ID
              id_gte: ID
              name_starts_with: String
              name_ends_with: String
              name_eq: String
              name_not_eq: String
              name_in: [String]
              name_not_in: [String]
              age_eq: Int
              age_not_eq: Int
              age_in: [Int]
              age_not_in: [Int]
              age_lt: Int
              age_lte: Int
              age_gt: Int
              age_gte: Int
              created_At_eq: Date
              created_At_not_eq: Date
              created_At_in: [Date]
              created_At_not_in: [Date]
              created_At_lt: Date
              created_At_lte: Date
              created_At_gt: Date
              created_At_gte: Date
              range_eq: Float
              range_not_eq: Float
              range_in: [Float]
              range_not_in: [Float]
              range_lt: Float
              range_lte: Float
              range_gt: Float
              range_gte: Float
              published: Boolean
          }
            `),
    );
  });
});
