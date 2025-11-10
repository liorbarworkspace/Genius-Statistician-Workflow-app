
export enum Page {
  Login,
  RoleSelection,
  GameSetup,
  ChecklistSelection,
  OperatorPreGame,
  OperatorPostGame,
  CallerWorkInProgress,
  GameHistory,
  PostGameSelection,
  Admin,
  LoginHistory,
  SetupInstructions,
}

export enum Role {
  None,
  Caller,
  Operator,
}

export type User = {
  uid: string;
  email: string;
  role: 'admin' | 'user';
};

export type LoginRecord = {
    uid: string;
    email: string;
    timestamp: any; // Firestore Timestamp
};

export type PreGameTasks = {
  arrival_announce: boolean;
  setup_station: boolean;
  verify_caller_email: boolean;
  initial_software_actions: boolean;
  update_officials: boolean;
  confirm_officials: boolean;
  print_rosters: boolean;
  verify_rosters: boolean;
  enter_coach_names: boolean;
  check_system_ready: boolean;
  send_ready_screenshot: boolean;
  check_tv_broadcast: boolean;
  report_halftime_stats: boolean;
  report_final_stats: boolean;
};

export type PostGameTasks = {
  verify_upload: boolean;
  send_final_report: boolean;
  report_expenses: boolean;
  log_for_payment: boolean;
  check_errors_file: boolean;
  verify_next_game: boolean;
  follow_updates: boolean;
};

export type GameDetails = {
  id: string; // Unique ID, e.g., Firestore document ID
  operatorEmail: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  league: string;
  callerName: string;
  callerEmail: string;
  homeCoaches: string;
  awayCoaches: string;
  preGameTasks?: PreGameTasks;
  postGameTasks?: PostGameTasks;
};
