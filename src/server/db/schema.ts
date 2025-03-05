// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTableCreator, serial, json } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
  (name) => `nextjs_notifications_${name}`,
);

export const pushSubscriptions = createTable("push_subscriptions", {
  id: serial("id").primaryKey(),
  subscriptionJson: json("subscription_json"),
});
