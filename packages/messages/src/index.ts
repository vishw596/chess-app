export const INIT_GAME = 'init_game';
export const CREATE_INVITE = 'create_invite';
export const INVITE_CREATED = 'invite_created';
export const INVITE_EXPIRED = 'invite_expired';
export const MOVE = 'move';
export const OPPONENT_DISCONNECTED = 'opponent_disconnected';
export const GAME_OVER = 'game_over';
export const JOIN_ROOM = 'join_room';
export const GAME_JOINED = 'game_joined';
export const GAME_ALERT = 'game_alert';
export const GAME_ADDED = 'game_added';
export const USER_TIMEOUT = 'user_timeout';
export const GAME_TIME = 'game_time';
export const GAME_ENDED = 'game_ended';
export const EXIT_GAME = 'exit_game';
export const GAME_NOT_FOUND = 'game_not_found';

export const Result = {
  WHITE_WINS: 'WHITE_WINS',
  BLACK_WINS: 'BLACK_WINS',
  DRAW: 'DRAW',
} as const;

export type Result = (typeof Result)[keyof typeof Result];
export const GAME_TIME_MS = 10 * 60 * 1000;