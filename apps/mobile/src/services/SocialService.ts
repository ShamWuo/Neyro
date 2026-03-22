import { eq, and, like, inArray, or } from 'drizzle-orm';
import { db } from '../database/client';
import { users, socialConnections, type User, type SocialConnection } from '../database/schema';

export class SocialService {
    // === Profile Management ===

    static async getProfile(userId: string) {
        const result = await db.select().from(users).where(eq(users.id, userId));
        return result[0] || null;
    }

    static async updateProfile(userId: string, updates: Partial<typeof users.$inferInsert>) {
        await db.update(users).set(updates).where(eq(users.id, userId));
    }

    static async searchUsers(query: string) {
        if (!query || query.length < 2) return [];

        return await db.select({
            id: users.id,
            displayName: users.displayName,
            avatarUrl: users.avatarUrl,
            bio: users.bio
        })
            .from(users)
            .where(
                and(
                    eq(users.isDiscoverable, true),
                    or(
                        like(users.displayName, `%${query}%`),
                        like(users.email, `%${query}%`)
                    )
                )
            )
            .limit(20);
    }

    // === Connections ===

    static async followUser(followerId: string, followingId: string) {
        if (followerId === followingId) throw new Error("Cannot follow yourself");

        const existing = await db.select()
            .from(socialConnections)
            .where(and(
                eq(socialConnections.followerId, followerId),
                eq(socialConnections.followingId, followingId)
            ));

        if (existing.length > 0) {
            // Already following or pending
            return existing[0];
        }

        const newConnection: typeof socialConnections.$inferInsert = {
            id: crypto.randomUUID(),
            followerId,
            followingId,
            status: 'accepted', // Auto-accept for now
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        await db.insert(socialConnections).values(newConnection);
        return newConnection;
    }

    static async unfollowUser(followerId: string, followingId: string) {
        await db.delete(socialConnections)
            .where(and(
                eq(socialConnections.followerId, followerId),
                eq(socialConnections.followingId, followingId)
            ));
    }

    static async getFollowing(userId: string) {
        const connections: SocialConnection[] = await db.select().from(socialConnections)
            .where(eq(socialConnections.followerId, userId));

        const profileIds = connections.map((c: SocialConnection) => c.followingId);
        if (profileIds.length === 0) return [];

        const profiles: User[] = await db.select().from(users).where(inArray(users.id, profileIds));

        return connections.map((c: SocialConnection) => ({
            ...c,
            profile: profiles.find((p: User) => p.id === c.followingId)
        }));
    }

    static async getFollowers(userId: string) {
        const connections: SocialConnection[] = await db.select().from(socialConnections)
            .where(eq(socialConnections.followingId, userId));

        const profileIds = connections.map((c: SocialConnection) => c.followerId);
        if (profileIds.length === 0) return [];

        const profiles: User[] = await db.select().from(users).where(inArray(users.id, profileIds));

        return connections.map((c: SocialConnection) => ({
            ...c,
            profile: profiles.find((p: User) => p.id === c.followerId)
        }));
    }
}
