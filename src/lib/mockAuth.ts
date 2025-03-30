import type { Database } from './database.types';
import type { SupabaseClient } from '@supabase/supabase-js';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;
type Row<T extends TableName> = Tables[T]['Row'];
type Insert<T extends TableName> = Tables[T]['Insert'];

interface MockUser {
  id: string;
  email: string;
}

type MockDataSchema = {
  [K in TableName]: Row<K>[];
};

const mockUser: MockUser = {
  id: 'mock-user-id',
  email: 'mock@example.com',
};

const mockData: MockDataSchema = {
  sessions: [],
  session_steps: [],
  knowledge_base: [],
  api_keys: [],
  profiles: [],
};

class PostgrestBuilder<T> {
  protected query: Promise<{ data: T | null; error: string | null }>;

  constructor(query: Promise<{ data: T | null; error: string | null }>) {
    this.query = query;
  }

  then<TResult1 = { data: T | null; error: string | null }>(
    onfulfilled?: (value: { data: T | null; error: string | null }) => TResult1 | Promise<TResult1>
  ): Promise<TResult1> {
    return this.query.then(onfulfilled);
  }
}

class PostgrestFilterBuilder<T> extends PostgrestBuilder<T> {
  eq(column: string, value: unknown) {
    return this;
  }

  neq(column: string, value: unknown) {
    return this;
  }

  gt(column: string, value: unknown) {
    return this;
  }

  lt(column: string, value: unknown) {
    return this;
  }

  gte(column: string, value: unknown) {
    return this;
  }

  lte(column: string, value: unknown) {
    return this;
  }

  like(column: string, pattern: string) {
    return this;
  }

  ilike(column: string, pattern: string) {
    return this;
  }

  is(column: string, value: unknown) {
    return this;
  }

  in(column: string, values: unknown[]) {
    return this;
  }

  contains(column: string, value: unknown) {
    return this;
  }

  containedBy(column: string, value: unknown) {
    return this;
  }

  range(column: string, range: [unknown, unknown]) {
    return this;
  }

  textSearch(column: string, query: string, options?: { config?: string }) {
    return this;
  }

  match(query: Record<string, unknown>) {
    return this;
  }

  not(column: string, operator: string, value: unknown) {
    return this;
  }

  or(conditions: string) {
    return this;
  }

  filter(column: string, operator: string, value: unknown) {
    return this;
  }
}

class MockClient<T extends TableName> {
  private table: T;
  private data: MockDataSchema;
  private filters: ((row: Row<T>) => boolean)[] = [];

  constructor(table: T, data: MockDataSchema) {
    this.table = table;
    this.data = data;
  }

  select() {
    return new PostgrestFilterBuilder(Promise.resolve({
      data: this.data[this.table] as unknown as Row<T>[],
      error: null,
    }));
  }

  insert(record: Insert<T>) {
    const newRecord = {
      id: `mock-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record,
    } as Row<T>;

    this.data[this.table].push(newRecord);

    return new PostgrestFilterBuilder(Promise.resolve({
      data: newRecord,
      error: null,
    }));
  }

  update(updates: Partial<Row<T>>) {
    const matchingRows = this.data[this.table].filter((row) =>
      this.filters.every((filter) => filter(row as Row<T>))
    );

    matchingRows.forEach((row) => {
      Object.assign(row, updates, {
        updated_at: new Date().toISOString(),
      });
    });

    return new PostgrestFilterBuilder(Promise.resolve({
      data: matchingRows[0] as Row<T>,
      error: null,
    }));
  }

  delete() {
    const tableData = this.data[this.table];
    const index = tableData.findIndex((row) =>
      this.filters.every((filter) => filter(row as Row<T>))
    );

    if (index > -1) {
      tableData.splice(index, 1);
    }

    return new PostgrestFilterBuilder(Promise.resolve({
      data: null,
      error: null,
    }));
  }

  eq(column: keyof Row<T>, value: unknown) {
    this.filters.push((row) => row[column] === value);
    return this;
  }
}

class MockAuth {
  private user: MockUser | null = mockUser;

  signUp = async ({ email }: { email: string; password: string }) => {
    return { data: { user: { id: 'new-user-id', email } }, error: null };
  };

  signInWithPassword = async ({ email }: { email: string; password: string }) => {
    this.user = { id: mockUser.id, email };
    return { data: { user: this.user }, error: null };
  };

  signOut = async () => {
    this.user = null;
    return { error: null };
  };

  getUser = async () => {
    return { data: { user: this.user }, error: null };
  };
}

export const mockAuth = new MockAuth();

export const mockSupabase = {
  auth: mockAuth,
  from: <T extends TableName>(table: T) => new MockClient(table, mockData),
} as unknown as SupabaseClient;
