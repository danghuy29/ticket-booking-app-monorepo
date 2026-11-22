import { defineRelations } from "drizzle-orm";
import * as schema from "@/database/schemas";

export const relations = defineRelations(schema, (r) => ({
  users: {
    sessions: r.many.sessions(),
    accounts: r.many.accounts(),
  },
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),

    account: r.one.accounts({
      from: r.sessions.accountId,
      to: r.accounts.id,
      optional: false,
    }),
    refreshTokens: r.many.refreshTokens(),
  },

  refreshTokens: {
    session: r.one.sessions({
      from: r.refreshTokens.sessionId,
      to: r.sessions.id,
      optional: false,
    }),
    replacedBy: r.one.refreshTokens({
      from: r.refreshTokens.replacedById,
      to: r.refreshTokens.id,
    }),
  },

  accounts: {
    user: r.one.users({
      from: r.accounts.userId,
      to: r.users.id,
      optional: false,
    }),
    sessions: r.many.sessions(),
  },
}));
