'use client';

import { useCallback, useRef } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { useAuth } from '@/hooks/useAuth';
import { useDesignFlowStore } from '@/stores/useDesignFlowStore';
import type { FlowStep, Wall, RoomShape } from '@/stores/useDesignFlowStore';
import type { Id } from '../../../convex/_generated/dataModel';

/**
 * useDesignSession — Convex persistence orchestration
 *
 * Handles create/restore/save for design sessions.
 * Skips persistence for unauthenticated users (Zustand-only demo mode).
 */
export function useDesignSession() {
  const { isLoggedIn, user } = useAuth();
  const sessionId = useDesignFlowStore((s) => s.sessionId);
  const setSessionId = useDesignFlowStore((s) => s.setSessionId);

  // Convex mutations
  const createSession = useMutation(api.designSessions.create);
  const savePhotoMutation = useMutation(api.designSessions.savePhoto);
  const savePhotoAnalysisMutation = useMutation(api.designSessions.savePhotoAnalysis);
  const saveWallsMutation = useMutation(api.designSessions.saveWalls);
  const updateUserContextMutation = useMutation(api.designSessions.updateUserContext);
  const saveLayoutMutation = useMutation(api.designSessions.saveLayout);
  const saveRendersMutation = useMutation(api.designSessions.saveRenders);
  const savePriceEstimateMutation = useMutation(api.designSessions.savePriceEstimate);
  const generateUploadUrlMutation = useMutation(api.designSessions.generateUploadUrl);

  // Query active session for current user
  const activeSession = useQuery(
    api.designSessions.getActiveForUser,
    isLoggedIn && user?._id ? { userId: user._id as Id<"users"> } : 'skip'
  );

  const initCalledRef = useRef(false);

  /**
   * Initialize or restore a session.
   * Called from AIIntroduction on mount.
   */
  const initSession = useCallback(async () => {
    if (!isLoggedIn || !user?._id) return; // Demo mode
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const store = useDesignFlowStore.getState();

    // Check for existing active session
    if (activeSession) {
      // Restore from Convex
      setSessionId(activeSession._id);
      restoreFromSession(activeSession);
      return;
    }

    // Create new session
    try {
      const newSessionId = await createSession({
        userId: user._id as Id<"users">,
      });
      setSessionId(newSessionId);
    } catch (err) {
      console.error('[useDesignSession] Failed to create session:', err);
    }
  }, [isLoggedIn, user, activeSession, createSession, setSessionId]);

  /**
   * Restore Zustand state from a Convex session
   */
  function restoreFromSession(session: NonNullable<typeof activeSession>) {
    const store = useDesignFlowStore.getState();

    // Restore step
    if (session.currentStep) {
      store.setStep(session.currentStep as FlowStep);
    }

    // Restore room shape
    if (session.roomShape) {
      store.setRoomShape(session.roomShape as RoomShape);
    }

    // Restore walls
    if (session.walls && session.walls.length > 0) {
      const restoredWalls: Wall[] = session.walls.map((w: { label: string; lengthMm: number; selected: boolean }, i: number) => ({
        id: String.fromCharCode(97 + i), // a, b, c...
        label: w.label,
        length: w.lengthMm / 1000,
      }));
      store.setWalls(restoredWalls);
    }

    // Restore photo analysis
    if (session.photoAnalysis) {
      try {
        const analysis = JSON.parse(session.photoAnalysis);
        store.setSpaceAnalysis(analysis);
      } catch {
        // Invalid JSON, skip
      }
    }

    // Restore user context
    const ctx = session.userContext as Record<string, unknown> | undefined;
    if (ctx) {
      if (ctx.purpose) store.setPurpose(ctx.purpose as string);
      if (ctx.priorities) store.setPriorities(ctx.priorities as string[]);
      if (ctx.specificRequests) store.setSpecificRequests(ctx.specificRequests as string[]);
    }
  }

  // ── Save helpers ──

  const savePhoto = useCallback(
    async (storageId: string) => {
      if (!sessionId) return;
      try {
        await savePhotoMutation({
          id: sessionId as Id<"designSessions">,
          photoStorageId: storageId,
        });
      } catch (err) {
        console.error('[useDesignSession] savePhoto failed:', err);
      }
    },
    [sessionId, savePhotoMutation]
  );

  const saveAnalysis = useCallback(
    async (analysis: unknown) => {
      if (!sessionId) return;
      try {
        await savePhotoAnalysisMutation({
          id: sessionId as Id<"designSessions">,
          photoAnalysis: JSON.stringify(analysis),
        });
      } catch (err) {
        console.error('[useDesignSession] saveAnalysis failed:', err);
      }
    },
    [sessionId, savePhotoAnalysisMutation]
  );

  const saveWallData = useCallback(
    async (walls: Wall[], shape: string) => {
      if (!sessionId) return;
      try {
        await saveWallsMutation({
          id: sessionId as Id<"designSessions">,
          walls: walls.map((w) => ({
            label: w.label,
            lengthMm: w.length * 1000,
            selected: true,
          })),
          roomShape: shape,
        });
      } catch (err) {
        console.error('[useDesignSession] saveWalls failed:', err);
      }
    },
    [sessionId, saveWallsMutation]
  );

  const saveUserContext = useCallback(
    async (context: {
      purpose?: string;
      styleSignals?: string[];
      stylePresetId?: string;
      priorities?: string[];
      specificRequests?: string[];
    }) => {
      if (!sessionId) return;
      try {
        await updateUserContextMutation({
          id: sessionId as Id<"designSessions">,
          userContext: context,
        });
      } catch (err) {
        console.error('[useDesignSession] saveUserContext failed:', err);
      }
    },
    [sessionId, updateUserContextMutation]
  );

  const saveDesignResult = useCallback(
    async (layout: unknown, renderStorageIds: string[], priceEstimate: {
      lowCents: number;
      estimateCents: number;
      highCents: number;
    }) => {
      if (!sessionId) return;
      try {
        await Promise.all([
          saveLayoutMutation({
            id: sessionId as Id<"designSessions">,
            layoutConfig: layout,
            layoutDescription: '',
          }),
          saveRendersMutation({
            id: sessionId as Id<"designSessions">,
            renderStorageIds,
          }),
          savePriceEstimateMutation({
            id: sessionId as Id<"designSessions">,
            priceEstimate,
          }),
        ]);
      } catch (err) {
        console.error('[useDesignSession] saveDesignResult failed:', err);
      }
    },
    [sessionId, saveLayoutMutation, saveRendersMutation, savePriceEstimateMutation]
  );

  /**
   * Upload a File to Convex storage and return the storage ID
   */
  const uploadFile = useCallback(
    async (file: File): Promise<string | null> => {
      if (!sessionId) return null;
      try {
        const uploadUrl = await generateUploadUrlMutation();
        const response = await fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': file.type },
          body: file,
        });
        const { storageId } = await response.json();
        return storageId;
      } catch (err) {
        console.error('[useDesignSession] uploadFile failed:', err);
        return null;
      }
    },
    [sessionId, generateUploadUrlMutation]
  );

  return {
    initSession,
    savePhoto,
    saveAnalysis,
    saveWallData,
    saveUserContext,
    saveDesignResult,
    uploadFile,
    isAuthenticated: isLoggedIn && !!user,
    sessionId,
    activeSession,
  };
}
