import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  userProfiles,
  projects,
  codeSnippets,
  projectStars,
  snippetStars,
  userFollows,
  notifications,
  codeScreenshots,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db
      .insert(users)
      .values(values)
      .onDuplicateKeyUpdate({
        set: updateSet,
      });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// User Profile queries
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProfile(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db
    .insert(userProfiles)
    .values({ userId, ...data })
    .onDuplicateKeyUpdate({
      set: data,
    });
  return getUserProfile(userId);
}

// Project queries
export async function createProject(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(projects).values({ userId, ...data });
  return result;
}

export async function getProjectById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId));
}

export async function updateProject(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(projects).set(data).where(eq(projects.id, id));
  return getProjectById(id);
}

export async function deleteProject(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(projects).where(eq(projects.id, id));
  return true;
}

// Code Snippet queries
export async function createCodeSnippet(userId: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(codeSnippets).values({ userId, ...data });
  return result;
}

export async function getSnippetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(codeSnippets)
    .where(eq(codeSnippets.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserSnippets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(codeSnippets)
    .where(eq(codeSnippets.userId, userId));
}

export async function updateSnippet(id: number, data: any) {
  const db = await getDb();
  if (!db) return undefined;
  await db.update(codeSnippets).set(data).where(eq(codeSnippets.id, id));
  return getSnippetById(id);
}

export async function deleteSnippet(id: number) {
  const db = await getDb();
  if (!db) return false;
  await db.delete(codeSnippets).where(eq(codeSnippets.id, id));
  return true;
}

// Star/Like queries
export async function starProject(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(projectStars).values({ userId, projectId });
    const project = await getProjectById(projectId);
    if (project && project.stars != null) {
      await db
        .update(projects)
        .set({ stars: project.stars + 1 })
        .where(eq(projects.id, projectId));
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function unstarProject(userId: number, projectId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(projectStars)
      .where(
        and(
          eq(projectStars.userId, userId),
          eq(projectStars.projectId, projectId)
        )
      );
    const project = await getProjectById(projectId);
    if (project && project.stars != null && project.stars > 0) {
      await db
        .update(projects)
        .set({ stars: project.stars - 1 })
        .where(eq(projects.id, projectId));
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function hasUserStarredProject(
  userId: number,
  projectId: number
) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(projectStars)
    .where(
      and(
        eq(projectStars.userId, userId),
        eq(projectStars.projectId, projectId)
      )
    )
    .limit(1);
  return result.length > 0;
}

// Follow queries
export async function followUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db.insert(userFollows).values({ followerId, followingId });
    const profile = await getUserProfile(followingId);
    if (profile && profile.followers != null) {
      await db
        .update(userProfiles)
        .set({ followers: profile.followers + 1 })
        .where(eq(userProfiles.userId, followingId));
    }
    const followerProfile = await getUserProfile(followerId);
    if (followerProfile && followerProfile.following != null) {
      await db
        .update(userProfiles)
        .set({ following: followerProfile.following + 1 })
        .where(eq(userProfiles.userId, followerId));
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function unfollowUser(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  try {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        )
      );
    const profile = await getUserProfile(followingId);
    if (profile && profile.followers != null && profile.followers > 0) {
      await db
        .update(userProfiles)
        .set({ followers: profile.followers - 1 })
        .where(eq(userProfiles.userId, followingId));
    }
    const followerProfile = await getUserProfile(followerId);
    if (followerProfile && followerProfile.following != null && followerProfile.following > 0) {
      await db
        .update(userProfiles)
        .set({ following: followerProfile.following - 1 })
        .where(eq(userProfiles.userId, followerId));
    }
    return true;
  } catch (error) {
    return false;
  }
}

export async function isFollowing(followerId: number, followingId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db
    .select()
    .from(userFollows)
    .where(
      and(
        eq(userFollows.followerId, followerId),
        eq(userFollows.followingId, followingId)
      )
    )
    .limit(1);
  return result.length > 0;
}

// Notification queries
export async function createNotification(
  userId: number,
  actorId: number,
  type: "star" | "follow" | "comment",
  targetType: "project" | "snippet" | "profile",
  targetId?: number,
  message?: string
) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.insert(notifications).values({
    userId,
    actorId,
    type,
    targetType,
    targetId: targetId || null,
    message: message || null,
  });
  return result;
}

export async function getUserNotifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy((t) => t.createdAt)
    .limit(limit);
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) return false;
  await db
    .update(notifications)
    .set({ read: true })
    .where(eq(notifications.id, notificationId));
  return true;
}
