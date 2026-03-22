import { db } from '../database/client';
import { sharedAreas, paraTemplates, collaborationPermissions, users, type SharedArea, type ParaTemplate } from '../database/schema';
import { eq, and } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { supabase } from '../lib/supabase';

export type PermissionType = 'screen_time_control' | 'location_view' | 'project_view';

export class CollaborationService {

    // === EXISTING FEATURES: Shared Areas & Templates ===

    static async shareArea(areaId: string, ownerUserId: string, targetUserEmail: string): Promise<SharedArea | null> {
        const mockTargetUserId = `user_${targetUserEmail.split('@')[0]}`;
        const newShare: SharedArea = {
            id: Crypto.randomUUID(),
            areaId,
            ownerUserId,
            sharedWithUserIds: JSON.stringify([mockTargetUserId]),
            permissions: 'read_write',
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        try {
            await db.insert(sharedAreas).values(newShare);
            return newShare;
        } catch (e) {
            console.error("Failed to share area", e);
            return null;
        }
    }

    static async publishTemplate(name: string, description: string, projectStructure: any, userId: string): Promise<ParaTemplate | null> {
        const newTemplate: ParaTemplate = {
            id: Crypto.randomUUID(),
            creatorUserId: userId,
            name,
            description,
            templateData: JSON.stringify(projectStructure),
            isPublic: true,
            downloadsCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        try {
            await db.insert(paraTemplates).values(newTemplate);
            return newTemplate;
        } catch (e) {
            console.error("Failed to publish template", e);
            return null;
        }
    }

    static async getCommunityTemplates(): Promise<ParaTemplate[]> {
        return await db.select().from(paraTemplates).where(eq(paraTemplates.isPublic, true));
    }

    // === PERMISSIONS (Local DB for Authoritative State) ===

    static async grantPermission(granterId: string, granteeId: string, type: PermissionType) {
        const existing = await db.select().from(collaborationPermissions)
            .where(and(
                eq(collaborationPermissions.granterId, granterId),
                eq(collaborationPermissions.granteeId, granteeId),
                eq(collaborationPermissions.type, type)
            ));

        if (existing.length > 0) {
            if (existing[0].status !== 'active') {
                await db.update(collaborationPermissions)
                    .set({ status: 'active', updatedAt: Date.now() })
                    .where(eq(collaborationPermissions.id, existing[0].id));
            }
            return;
        }

        await db.insert(collaborationPermissions).values({
            id: Crypto.randomUUID(),
            granterId,
            granteeId,
            type,
            status: 'active',
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
    }

    static async revokePermission(granterId: string, granteeId: string, type: PermissionType) {
        await db.update(collaborationPermissions)
            .set({ status: 'revoked', updatedAt: Date.now() })
            .where(and(
                eq(collaborationPermissions.granterId, granterId),
                eq(collaborationPermissions.granteeId, granteeId),
                eq(collaborationPermissions.type, type)
            ));
    }

    static async checkPermission(granterId: string, granteeId: string, type: PermissionType): Promise<boolean> {
        const result = await db.select().from(collaborationPermissions)
            .where(and(
                eq(collaborationPermissions.granterId, granterId),
                eq(collaborationPermissions.granteeId, granteeId),
                eq(collaborationPermissions.type, type),
                eq(collaborationPermissions.status, 'active')
            ));

        return result.length > 0;
    }

    static async updateLocation(userId: string, locationData: { lat: number, lng: number }) {
        // Update local DB
        await db.update(users)
            .set({
                lastLocation: JSON.stringify({ ...locationData, timestamp: Date.now() }),
                lastSeenAt: Date.now()
            })
            .where(eq(users.id, userId));

        // Publish to Supabase Realtime
        const channel = supabase.channel(`user_tracking_${userId}`);
        await channel.send({
            type: 'broadcast',
            event: 'location_update',
            payload: { ...locationData, timestamp: Date.now() }
        });
    }

    // === REAL-TIME COMMANDS ===

    static async sendFocusCommand(targetUserId: string, durationMinutes: number) {
        console.log(`[Collaboration] Sending focus command to ${targetUserId}`);

        // Channel: user_commands_{targetUserId}
        // This means I (sender) am publishing to the target's command channel
        const channel = supabase.channel(`user_commands_${targetUserId}`);

        // Ensure subscribed before sending? 
        // Broadcast works even if only sender is attached provided receiver is also attached.
        // We assume the Target User is subscribed to their own channel on app mount.

        await channel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                await channel.send({
                    type: 'broadcast',
                    event: 'focus_command',
                    payload: { duration: durationMinutes, sentAt: Date.now() }
                });
                // We can unsubscribe after sending if we don't need to stay
                supabase.removeChannel(channel);
            }
        });

        return true;
    }

    static subscribeToCommands(userId: string, onCommand: (cmd: any) => void) {
        const channel = supabase.channel(`user_commands_${userId}`);

        channel
            .on('broadcast', { event: 'focus_command' }, (payload) => {
                console.log("Received focus command:", payload);
                onCommand(payload.payload);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }

    static subscribeToLocation(userId: string, onLocation: (loc: any) => void) {
        const channel = supabase.channel(`user_tracking_${userId}`);

        channel
            .on('broadcast', { event: 'location_update' }, (payload) => {
                onLocation(payload.payload);
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }
}
