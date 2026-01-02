import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserProfile,
  upsertUserProfile,
  createProject,
  getProjectById,
  getUserProjects,
  updateProject,
  deleteProject,
  createCodeSnippet,
  getSnippetById,
  getUserSnippets,
  updateSnippet,
  deleteSnippet,
  starProject,
  unstarProject,
  hasUserStarredProject,
  followUser,
  unfollowUser,
  isFollowing,
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  getUserById,
} from "./db";
import { storagePut, storageGet } from "./storage";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // User Profile Router
  profile: router({
    getProfile: publicProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        const profile = await getUserProfile(input.userId);
        const user = await getUserById(input.userId);
        return { profile, user };
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          bio: z.string().optional(),
          location: z.string().optional(),
          website: z.string().optional(),
          github: z.string().optional(),
          twitter: z.string().optional(),
          linkedin: z.string().optional(),
          skills: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const skillsJson = input.skills ? JSON.stringify(input.skills) : undefined;
        return upsertUserProfile(ctx.user.id, {
          ...input,
          skills: skillsJson,
        });
      }),

    uploadAvatar: protectedProcedure
      .input(
        z.object({
          imageBase64: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const buffer = Buffer.from(input.imageBase64, "base64");
          const fileKey = `avatars/${ctx.user.id}-${Date.now()}.jpg`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          return upsertUserProfile(ctx.user.id, {
            avatarUrl: url,
            avatarKey: fileKey,
          });
        } catch (error) {
          throw new Error("Failed to upload avatar");
        }
      }),
  }),

  // Project Router
  projects: router({
    list: publicProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        if (input.userId) {
          return getUserProjects(input.userId);
        }
        return [];
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getProjectById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          readmeContent: z.string().optional(),
          repositoryUrl: z.string().optional(),
          liveUrl: z.string().optional(),
          techStack: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const techStackJson = input.techStack
          ? JSON.stringify(input.techStack)
          : null;
        const tagsJson = input.tags ? JSON.stringify(input.tags) : null;
        return createProject(ctx.user.id, {
          ...input,
          techStack: techStackJson,
          tags: tagsJson,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          readmeContent: z.string().optional(),
          repositoryUrl: z.string().optional(),
          liveUrl: z.string().optional(),
          techStack: z.array(z.string()).optional(),
          tags: z.array(z.string()).optional(),
          featured: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        const techStackJson = input.techStack
          ? JSON.stringify(input.techStack)
          : undefined;
        const tagsJson = input.tags ? JSON.stringify(input.tags) : undefined;
        return updateProject(input.id, {
          ...input,
          techStack: techStackJson,
          tags: tagsJson,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return deleteProject(input.id);
      }),

    uploadThumbnail: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          imageBase64: z.string(),
          mimeType: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        if (!project || project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        try {
          const buffer = Buffer.from(input.imageBase64, "base64");
          const fileKey = `projects/${input.projectId}-${Date.now()}.jpg`;
          const { url } = await storagePut(fileKey, buffer, input.mimeType);
          return updateProject(input.projectId, {
            thumbnailUrl: url,
            thumbnailKey: fileKey,
          });
        } catch (error) {
          throw new Error("Failed to upload thumbnail");
        }
      }),

    star: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const success = await starProject(ctx.user.id, input.projectId);
        if (success) {
          const project = await getProjectById(input.projectId);
          await createNotification(
            project!.userId,
            ctx.user.id,
            "star",
            "project",
            input.projectId
          );
        }
        return success;
      }),

    unstar: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return unstarProject(ctx.user.id, input.projectId);
      }),

    isStarred: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(async ({ ctx, input }) => {
        return hasUserStarredProject(ctx.user.id, input.projectId);
      }),
  }),

  // Code Snippets Router
  snippets: router({
    list: publicProcedure
      .input(
        z.object({
          userId: z.number().optional(),
          language: z.string().optional(),
          limit: z.number().default(20),
        })
      )
      .query(async ({ input }) => {
        if (input.userId) {
          return getUserSnippets(input.userId);
        }
        return [];
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getSnippetById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
          code: z.string(),
          language: z.string(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const tagsJson = input.tags ? JSON.stringify(input.tags) : null;
        return createCodeSnippet(ctx.user.id, {
          ...input,
          tags: tagsJson,
        });
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          code: z.string().optional(),
          language: z.string().optional(),
          tags: z.array(z.string()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const snippet = await getSnippetById(input.id);
        if (!snippet || snippet.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        const tagsJson = input.tags ? JSON.stringify(input.tags) : undefined;
        return updateSnippet(input.id, {
          ...input,
          tags: tagsJson,
        });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const snippet = await getSnippetById(input.id);
        if (!snippet || snippet.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        return deleteSnippet(input.id);
      }),

    explainCode: publicProcedure
      .input(z.object({ code: z.string(), language: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert code explainer. Provide clear, concise explanations of code snippets.",
              },
              {
                role: "user",
                content: `Explain this ${input.language} code:\n\n${input.code}`,
              },
            ],
          });
          return response.choices[0]?.message.content || "";
        } catch (error) {
          throw new Error("Failed to explain code");
        }
      }),

    generateDocumentation: publicProcedure
      .input(z.object({ code: z.string(), language: z.string() }))
      .query(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You are an expert technical writer. Generate clear, professional documentation for code.",
              },
              {
                role: "user",
                content: `Generate documentation for this ${input.language} code:\n\n${input.code}`,
              },
            ],
          });
          return response.choices[0]?.message.content || "";
        } catch (error) {
          throw new Error("Failed to generate documentation");
        }
      }),
  }),

  // Social Router
  social: router({
    follow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.id === input.userId) {
          throw new Error("Cannot follow yourself");
        }
        const success = await followUser(ctx.user.id, input.userId);
        if (success) {
          await createNotification(
            input.userId,
            ctx.user.id,
            "follow",
            "profile"
          );
        }
        return success;
      }),

    unfollow: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return unfollowUser(ctx.user.id, input.userId);
      }),

    isFollowing: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        return isFollowing(ctx.user.id, input.userId);
      }),
  }),

  // Notifications Router
  notifications: router({
    list: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return getUserNotifications(ctx.user.id, input.limit);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        return markNotificationAsRead(input.notificationId);
      }),
  }),
});

export type AppRouter = typeof appRouter;
