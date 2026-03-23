import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RoomMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

export function useRoomChat(roomId: string | undefined) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<RoomMessage[]>([]);

  // Load existing messages
  useEffect(() => {
    if (!roomId || !user) return;

    async function load() {
      const { data } = await supabase
        .from('messages')
        .select('id, content, created_at, user_id, profiles!inner(display_name)')
        .eq('room_id', roomId!)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data.map((m: any) => ({
          id: m.id,
          senderId: m.user_id,
          senderName: m.profiles?.display_name || 'Unknown',
          text: m.content,
          timestamp: new Date(m.created_at),
          isOwn: m.user_id === user!.id,
        })));
      }
    }

    load();
  }, [roomId, user]);

  // Subscribe to new messages via Realtime
  useEffect(() => {
    if (!roomId || !user) return;

    const channel = supabase
      .channel(`messages:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const msg = payload.new as any;
          if (msg.user_id === user.id) return; // Already added optimistically

          // Fetch sender name
          const { data: prof } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', msg.user_id)
            .single();

          setMessages(prev => [...prev, {
            id: msg.id,
            senderId: msg.user_id,
            senderName: prof?.display_name || 'Unknown',
            text: msg.content,
            timestamp: new Date(msg.created_at),
            isOwn: false,
          }]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [roomId, user]);

  const sendMessage = useCallback(async (text: string) => {
    if (!roomId || !user || !text.trim()) return;

    // Optimistic add
    const tempId = crypto.randomUUID();
    setMessages(prev => [...prev, {
      id: tempId,
      senderId: user.id,
      senderName: profile?.display_name || 'You',
      text,
      timestamp: new Date(),
      isOwn: true,
    }]);

    await supabase.from('messages').insert({
      room_id: roomId,
      user_id: user.id,
      content: text,
    });
  }, [roomId, user, profile]);

  return { messages, sendMessage };
}
