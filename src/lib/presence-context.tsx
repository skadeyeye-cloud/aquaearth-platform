'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PresenceUser, PushNotificationEvent } from './types';
import { useAuth } from './auth-context';
import { haptics, playNotificationChime } from './haptics';

interface PresenceContextType {
  activeUsers: PresenceUser[];
  currentModule: string;
  setCurrentModule: (module: string, itemTitle?: string) => void;
  getColleaguesInModule: (module: string) => PresenceUser[];
  activePush: PushNotificationEvent | null;
  dismissPush: () => void;
  sendPushNotification: (event: Omit<PushNotificationEvent, 'id' | 'timestamp'>) => void;
  quickApproveFromPush: () => void;
  isPushSupported: boolean;
  pushPermission: NotificationPermission | 'default';
  requestPushPermission: () => Promise<void>;
}

const PresenceContext = createContext<PresenceContextType | undefined>(undefined);

const INITIAL_ACTIVE_TEAMMATES: PresenceUser[] = [
  {
    id: 'usr-2',
    name: 'Engr. Femi Adebayo',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    jobTitle: 'Technical Director & QA Lead',
    activeModule: '/qa',
    activeItemTitle: 'Chevron Escravos Geotech Interpretative Report',
    location: 'Bonny Terminal',
    status: 'ACTIVE',
    lastPing: 'Just now'
  },
  {
    id: 'usr-4',
    name: 'Tunde Bakare',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    jobTitle: 'Senior Field Hydrogeologist',
    activeModule: '/field/capture',
    activeItemTitle: 'Borehole Log BH-04 (Escravos Channel)',
    location: 'Escravos Field Site',
    status: 'ACTIVE',
    lastPing: '2m ago'
  },
  {
    id: 'usr-3',
    name: 'Chioma Okonkwo',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    jobTitle: 'Lead Commercial & BD Manager',
    activeModule: '/bd/pipeline',
    activeItemTitle: 'Chevron Escravos ₦125M Gas Expansion Bid',
    location: 'Lekki HQ',
    status: 'ACTIVE',
    lastPing: 'Just now'
  },
  {
    id: 'usr-5',
    name: 'Dr. Ngozi Eze',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    jobTitle: 'Senior Environmental Consultant',
    activeModule: '/compliance',
    activeItemTitle: 'NESREA Triennial Environmental Audit',
    location: 'Lekki HQ',
    status: 'ACTIVE',
    lastPing: '5m ago'
  }
];

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, approveTask } = useAuth();
  const [activeUsers, setActiveUsers] = useState<PresenceUser[]>(INITIAL_ACTIVE_TEAMMATES);
  const [currentModule, setCurrentModuleState] = useState<string>('/workspace');
  const [activeItem, setActiveItem] = useState<string | undefined>('Personal Workspace');
  const [activePush, setActivePush] = useState<PushNotificationEvent | null>(null);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'default'>('default');

  const isPushSupported = typeof window !== 'undefined' && 'Notification' in window;

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const res = await Notification.requestPermission();
        setPushPermission(res);
        if (res === 'granted') {
          haptics.success();
          playNotificationChime('success');
        }
      } catch (e) {
        console.warn('Notification permission error', e);
      }
    }
  };

  const setCurrentModule = useCallback((module: string, itemTitle?: string) => {
    setCurrentModuleState(module);
    if (itemTitle) setActiveItem(itemTitle);
  }, []);

  const getColleaguesInModule = useCallback((module: string) => {
    return activeUsers.filter(u => u.activeModule === module);
  }, [activeUsers]);

  const dismissPush = useCallback(() => {
    setActivePush(null);
  }, []);

  const sendPushNotification = useCallback((event: Omit<PushNotificationEvent, 'id' | 'timestamp'>) => {
    const newPush: PushNotificationEvent = {
      ...event,
      id: `push-${Date.now()}`,
      timestamp: 'Just now'
    };

    setActivePush(newPush);
    playNotificationChime('push');
    haptics.impact();

    // Native browser push if granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`AquaEarth • ${event.title}`, {
          body: event.body,
          icon: event.actorAvatar || '/favicon.ico'
        });
      } catch (e) {}
    }

    // Auto dismiss after 30 seconds if not interacted
    setTimeout(() => {
      setActivePush(prev => (prev?.id === newPush.id ? null : prev));
    }, 30000);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__aquaPush = sendPushNotification;
    }
  }, [sendPushNotification]);

  const quickApproveFromPush = useCallback(() => {
    if (!activePush) return;
    haptics.success();
    playNotificationChime('success');

    if (activePush.targetId) {
      // Approve task or item
      approveTask(activePush.targetId, 'Quick-approved via mobile lockscreen push action.');
    }

    // Show approved state briefly then dismiss
    setActivePush(prev => prev ? { ...prev, title: 'Approved Successfully ✓', body: 'Approval signed off and synced to database.' } : null);
    setTimeout(() => {
      setActivePush(null);
    }, 2200);
  }, [activePush, approveTask]);

  return (
    <PresenceContext.Provider
      value={{
        activeUsers,
        currentModule,
        setCurrentModule,
        getColleaguesInModule,
        activePush,
        dismissPush,
        sendPushNotification,
        quickApproveFromPush,
        isPushSupported,
        pushPermission,
        requestPushPermission
      }}
    >
      {children}
    </PresenceContext.Provider>
  );
}

export function usePresence() {
  const context = useContext(PresenceContext);
  if (!context) {
    throw new Error('usePresence must be used within a PresenceProvider');
  }
  return context;
}
