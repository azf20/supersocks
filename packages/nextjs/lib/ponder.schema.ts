import { onchainTable, primaryKey } from "ponder";

export const account = onchainTable("account", (t) => ({
  address: t.hex().primaryKey(),
}));

export const token = onchainTable("token", (t) => ({
  id: t.bigint().primaryKey(),
  createdAt: t.integer().notNull(),
  creator: t.hex().notNull(),
  total: t.bigint().notNull(),
  metadata: t.text(),
}));

export const tokenBalance = onchainTable(
  "token_balance",
  (t) => ({
    tokenId: t.bigint().notNull(),
    owner: t.hex().notNull(),
    balance: t.bigint().notNull(),
  }),
  (table) => ({
    pk: primaryKey({ columns: [table.owner, table.tokenId] }),
  })
);

export const transferEvent = onchainTable("transfer_event", (t) => ({
  id: t.text().primaryKey(),
  timestamp: t.integer().notNull(),
  from: t.hex().notNull(),
  to: t.hex().notNull(),
  token: t.bigint().notNull(),
}));
