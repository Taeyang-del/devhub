import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles with extended information for portfolio display
 */
export const userProfiles = mysqlTable("userProfiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id),
  avatarUrl: text("avatarUrl"),
  avatarKey: text("avatarKey"), // S3 key for avatar
  bio: text("bio"),
  location: varchar("location", { length: 255 }),
  website: varchar("website", { length: 255 }),
  github: varchar("github", { length: 255 }),
  twitter: varchar("twitter", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  skills: text("skills"), // JSON array of skills
  followers: int("followers").default(0),
  following: int("following").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * Projects/repositories showcased by users
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  readmeContent: text("readmeContent"), // Markdown content
  repositoryUrl: varchar("repositoryUrl", { length: 255 }),
  liveUrl: varchar("liveUrl", { length: 255 }),
  thumbnailUrl: text("thumbnailUrl"),
  thumbnailKey: text("thumbnailKey"), // S3 key
  techStack: text("techStack"), // JSON array of technologies
  tags: text("tags"), // JSON array of tags
  stars: int("stars").default(0),
  views: int("views").default(0),
  featured: boolean("featured").default(false).notNull(),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Code snippets shared by users
 */
export const codeSnippets = mysqlTable("codeSnippets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: varchar("language", { length: 50 }).notNull(), // e.g., 'javascript', 'python'
  tags: text("tags"), // JSON array
  stars: int("stars").default(0),
  views: int("views").default(0),
  visibility: mysqlEnum("visibility", ["public", "private"]).default("public"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CodeSnippet = typeof codeSnippets.$inferSelect;
export type InsertCodeSnippet = typeof codeSnippets.$inferInsert;

/**
 * Project stars/likes tracking
 */
export const projectStars = mysqlTable("projectStars", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  projectId: int("projectId").notNull().references(() => projects.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProjectStar = typeof projectStars.$inferSelect;
export type InsertProjectStar = typeof projectStars.$inferInsert;

/**
 * Code snippet stars/likes tracking
 */
export const snippetStars = mysqlTable("snippetStars", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  snippetId: int("snippetId").notNull().references(() => codeSnippets.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SnippetStar = typeof snippetStars.$inferSelect;
export type InsertSnippetStar = typeof snippetStars.$inferInsert;

/**
 * User follows/connections
 */
export const userFollows = mysqlTable("userFollows", {
  id: int("id").autoincrement().primaryKey(),
  followerId: int("followerId").notNull().references(() => users.id),
  followingId: int("followingId").notNull().references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = typeof userFollows.$inferInsert;

/**
 * Notifications for user interactions
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  actorId: int("actorId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["star", "follow", "comment"]).notNull(),
  targetType: mysqlEnum("targetType", ["project", "snippet", "profile"]).notNull(),
  targetId: int("targetId"), // ID of the project/snippet
  message: text("message"),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Code screenshots generated for social sharing
 */
export const codeScreenshots = mysqlTable("codeScreenshots", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  snippetId: int("snippetId").references(() => codeSnippets.id),
  projectId: int("projectId").references(() => projects.id),
  imageUrl: text("imageUrl"),
  imageKey: text("imageKey"), // S3 key
  theme: varchar("theme", { length: 50 }).default("dark"), // dark, light, etc.
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CodeScreenshot = typeof codeScreenshots.$inferSelect;
export type InsertCodeScreenshot = typeof codeScreenshots.$inferInsert;