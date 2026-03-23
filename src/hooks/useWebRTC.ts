import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { RealtimeChannel } from '@supabase/supabase-js';

/**
 * WebRTC signaling via Supabase Realtime broadcast.
 * 
 * How it works:
 * 1. Each user joins a Realtime channel named after the room
 * 2. SDP offers/answers and ICE candidates are exchanged via broadcast
 * 3. Each peer connection is managed in a Map keyed by remote userId
 * 
 * For production, replace with a dedicated TURN/STUN server config.
 */

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

interface PeerState {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

export function useWebRTC(roomId: string | undefined) {
  const { user } = useAuth();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const peersRef = useRef<Map<string, PeerState>>(new Map());
  const channelRef = useRef<RealtimeChannel | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const userId = user?.id;

  // Initialize local media
  const initMedia = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('Could not get user media, continuing without:', err);
      return null;
    }
  }, []);

  // Create peer connection for a remote user
  const createPeer = useCallback((remoteUserId: string, channel: RealtimeChannel) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    // Handle incoming tracks
    pc.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStreams(prev => new Map(prev).set(remoteUserId, stream));
    };

    // Send ICE candidates via broadcast
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        channel.send({
          type: 'broadcast',
          event: 'ice-candidate',
          payload: {
            from: userId,
            to: remoteUserId,
            candidate: event.candidate.toJSON(),
          },
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removePeer(remoteUserId);
      }
    };

    peersRef.current.set(remoteUserId, { pc, stream: null });
    return pc;
  }, [userId]);

  const removePeer = useCallback((remoteUserId: string) => {
    const peer = peersRef.current.get(remoteUserId);
    if (peer) {
      peer.pc.close();
      peersRef.current.delete(remoteUserId);
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.delete(remoteUserId);
        return next;
      });
    }
  }, []);

  // Join the signaling channel
  useEffect(() => {
    if (!roomId || !userId) return;

    let mounted = true;

    async function join() {
      const stream = await initMedia();

      const channel = supabase.channel(`room:${roomId}`, {
        config: { broadcast: { self: false } },
      });

      channelRef.current = channel;

      // Handle signaling messages
      channel
        .on('broadcast', { event: 'user-joined' }, async ({ payload }) => {
          if (!mounted || payload.userId === userId) return;
          // Create offer for the new user
          const pc = createPeer(payload.userId, channel);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          channel.send({
            type: 'broadcast',
            event: 'offer',
            payload: {
              from: userId,
              to: payload.userId,
              sdp: pc.localDescription?.toJSON(),
            },
          });
        })
        .on('broadcast', { event: 'offer' }, async ({ payload }) => {
          if (!mounted || payload.to !== userId) return;
          const pc = createPeer(payload.from, channel);
          await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          channel.send({
            type: 'broadcast',
            event: 'answer',
            payload: {
              from: userId,
              to: payload.from,
              sdp: pc.localDescription?.toJSON(),
            },
          });
        })
        .on('broadcast', { event: 'answer' }, async ({ payload }) => {
          if (!mounted || payload.to !== userId) return;
          const peer = peersRef.current.get(payload.from);
          if (peer) {
            await peer.pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          }
        })
        .on('broadcast', { event: 'ice-candidate' }, async ({ payload }) => {
          if (!mounted || payload.to !== userId) return;
          const peer = peersRef.current.get(payload.from);
          if (peer) {
            await peer.pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
          }
        })
        .on('broadcast', { event: 'user-left' }, ({ payload }) => {
          if (payload.userId !== userId) {
            removePeer(payload.userId);
          }
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            // Announce presence
            channel.send({
              type: 'broadcast',
              event: 'user-joined',
              payload: { userId },
            });
          }
        });
    }

    join();

    return () => {
      mounted = false;
      // Announce leaving
      channelRef.current?.send({
        type: 'broadcast',
        event: 'user-left',
        payload: { userId },
      });
      // Cleanup
      peersRef.current.forEach((peer) => peer.pc.close());
      peersRef.current.clear();
      setRemoteStreams(new Map());
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      setLocalStream(null);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [roomId, userId, initMedia, createPeer, removePeer]);

  // Toggle mic
  const toggleMic = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setIsMuted(prev => !prev);
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks().forEach(t => {
        t.enabled = !t.enabled;
      });
      setIsCameraOff(prev => !prev);
    }
  }, []);

  // Toggle screen share
  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      // Revert to camera
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const videoTrack = stream.getVideoTracks()[0];
      peersRef.current.forEach(({ pc }) => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        sender?.replaceTrack(videoTrack);
      });
      if (localStreamRef.current) {
        const oldTrack = localStreamRef.current.getVideoTracks()[0];
        localStreamRef.current.removeTrack(oldTrack);
        localStreamRef.current.addTrack(videoTrack);
        oldTrack.stop();
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = screen.getVideoTracks()[0];
        peersRef.current.forEach(({ pc }) => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          sender?.replaceTrack(screenTrack);
        });
        if (localStreamRef.current) {
          const oldTrack = localStreamRef.current.getVideoTracks()[0];
          localStreamRef.current.removeTrack(oldTrack);
          localStreamRef.current.addTrack(screenTrack);
        }
        screenTrack.onended = () => toggleScreenShare();
        setIsScreenSharing(true);
      } catch {
        // User cancelled
      }
    }
  }, [isScreenSharing]);

  return {
    localStream,
    remoteStreams,
    isMuted,
    isCameraOff,
    isScreenSharing,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
  };
}
