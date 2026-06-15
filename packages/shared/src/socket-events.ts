export const SOCKET_EVENTS = {
  // Connection
  JOIN_COMMUNITY: 'join:community',
  LEAVE_COMMUNITY: 'leave:community',
  JOIN_CHANNEL: 'join:channel',
  LEAVE_CHANNEL: 'leave:channel',
  PRESENCE_UPDATE: 'presence:update',

  // Chat
  MESSAGE_SEND: 'message:send',
  MESSAGE_NEW: 'message:new',
  MESSAGE_DELETE: 'message:delete',
  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  // Game
  GAME_JOIN: 'game:join',
  GAME_LEAVE: 'game:leave',
  GAME_STATE: 'game:state',
  GAME_START: 'game:start',
  GAME_ANSWER: 'game:answer',
  GAME_NEXT: 'game:next',
  GAME_END: 'game:end',
  GAME_ERROR: 'game:error',

  // Draw & Guess (Pictionary)
  DRAW_JOIN: 'draw:join',
  DRAW_START: 'draw:start',
  DRAW_STROKE: 'draw:stroke',
  DRAW_CLEAR: 'draw:clear',
  DRAW_GUESS: 'draw:guess',
  DRAW_NEXT: 'draw:next',
  DRAW_STATE: 'draw:state',
  DRAW_ERROR: 'draw:error',
} as const;

export type SocketEvent = (typeof SOCKET_EVENTS)[keyof typeof SOCKET_EVENTS];
