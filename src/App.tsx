import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameRoom, Player, HouseId } from './types/game';
import { HeaderBar } from './components/HeaderBar';
import { LobbyView } from './components/LobbyView';
import { SortingHatView } from './components/SortingHatView';
import { CommonRoomView } from './components/CommonRoomView';
import { CombatArenaView } from './components/CombatArenaView';
import { VictoryView } from './components/VictoryView';
import { DatabaseModal } from './components/DatabaseModal';
import { Sparkles, AlertCircle } from 'lucide-react';

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDatabaseModalOpen, setIsDatabaseModalOpen] = useState(false);

  useEffect(() => {
    // Initialize Socket connection to server
    const newSocket = io({
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Connected to Hogwarts Realm Socket:', newSocket.id);
    });

    newSocket.on('room_joined', ({ room: initialRoom, playerId: joinedPlayerId }: { room: GameRoom; playerId: string }) => {
      setRoom(initialRoom);
      setPlayerId(joinedPlayerId);
    });

    newSocket.on('room_updated', (updatedRoom: GameRoom) => {
      setRoom(updatedRoom);
    });

    newSocket.on('error_message', (msg: string) => {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 4000);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const currentPlayer = room && playerId ? room.players[playerId] || null : null;

  const handleCreateRoom = (hostName: string, avatarUrl: string) => {
    if (!socket) return;
    socket.emit('create_room', { hostName, avatarUrl });
  };

  const handleJoinRoom = (code: string, playerName: string, avatarUrl: string) => {
    if (!socket) return;
    socket.emit('join_room', { code, playerName, avatarUrl });
  };

  const handleStartSorting = () => {
    if (!socket) return;
    socket.emit('start_sorting_ceremony');
  };

  const handleSubmitSorting = (houseId: HouseId) => {
    if (!socket) return;
    socket.emit('submit_sorting_answers', { houseId });
  };

  const handleEnterCommonRoomDirect = () => {
    if (!socket) return;
    socket.emit('enter_common_room_direct');
  };

  const handleBuySpell = (spellId: string) => {
    if (!socket) return;
    socket.emit('buy_spell', { spellId });
  };

  const handleToggleReady = () => {
    if (!socket) return;
    socket.emit('toggle_ready');
  };

  const handleStartQuest = () => {
    if (!socket) return;
    socket.emit('start_quest');
  };

  const handlePlayerAction = (payload: {
    actionType: 'wand_attack' | 'spell' | 'ability' | 'defend' | 'use_item';
    spellId?: string;
    targetId?: string;
    itemId?: string;
  }) => {
    if (!socket) return;
    socket.emit('player_action', payload);
  };

  const handleSendMessage = (text: string) => {
    if (!socket) return;
    socket.emit('send_chat', { text });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-pink-500 selection:text-white relative flex flex-col">
      {/* Global Magical Header */}
      <HeaderBar
        room={room}
        currentPlayer={currentPlayer}
        onOpenDatabase={() => setIsDatabaseModalOpen(true)}
      />

      {/* Floating Error Toast */}
      {errorMessage && (
        <div
          id="global-error-toast"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-rose-950/90 border border-rose-500 text-rose-200 text-xs font-bold flex items-center gap-2 shadow-2xl animate-bounce"
        >
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Dynamic Stage Routing */}
      <main className="flex-1">
        {!room || room.stage === 'lobby' ? (
          <LobbyView
            room={room}
            currentPlayer={currentPlayer}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onStartSorting={handleStartSorting}
            onSendMessage={handleSendMessage}
          />
        ) : room.stage === 'sorting' && currentPlayer ? (
          <SortingHatView
            player={currentPlayer}
            onSubmitSorting={handleSubmitSorting}
            onEnterCommonRoom={handleEnterCommonRoomDirect}
          />
        ) : room.stage === 'common_room' && currentPlayer ? (
          <CommonRoomView
            room={room}
            currentPlayer={currentPlayer}
            onBuySpell={handleBuySpell}
            onToggleReady={handleToggleReady}
            onStartQuest={handleStartQuest}
            onSendMessage={handleSendMessage}
          />
        ) : room.stage === 'quest_forest' && currentPlayer ? (
          <CombatArenaView
            room={room}
            currentPlayer={currentPlayer}
            onPlayerAction={handlePlayerAction}
            onSendMessage={handleSendMessage}
            onReturnToLobby={handleEnterCommonRoomDirect}
          />
        ) : room.stage === 'victory' && currentPlayer ? (
          <VictoryView
            room={room}
            currentPlayer={currentPlayer}
            onReturnToCommonRoom={handleEnterCommonRoomDirect}
          />
        ) : (
          <div className="text-center py-24 text-pink-200">
            <Sparkles className="w-8 h-8 mx-auto text-amber-300 animate-spin mb-3" />
            <p>Gathering Hogwarts Ley-Lines...</p>
          </div>
        )}
      </main>

      {/* Database Inspector Modal */}
      <DatabaseModal
        isOpen={isDatabaseModalOpen}
        onClose={() => setIsDatabaseModalOpen(false)}
      />
    </div>
  );
}
