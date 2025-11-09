import { PreGameTasks, PostGameTasks } from './types';

export const INITIAL_PRE_GAME_TASKS: PreGameTasks = {
  arrival_announce: false,
  setup_station: false,
  verify_caller_email: false,
  initial_software_actions: false,
  update_officials: false,
  confirm_officials: false,
  print_rosters: false,
  verify_rosters: false,
  enter_coach_names: false,
  check_system_ready: false,
  send_ready_screenshot: false,
  check_tv_broadcast: false,
  report_halftime_stats: false,
  report_final_stats: false,
};

export const PRE_GAME_TASK_LABELS: Record<keyof PreGameTasks, string> = {
  arrival_announce: 'הגעה ואישור מיקום',
  setup_station: 'הקמת עמדת עבודה',
  verify_caller_email: 'אימות מייל קולר',
  initial_software_actions: 'פעולות ראשוניות בתוכנה',
  update_officials: 'עדכון שמות שופטים',
  confirm_officials: 'וידוא שמות מול מזכירות',
  print_rosters: 'הדפסת רשימות',
  verify_rosters: 'אימות רשימות וצבעי קבוצות',
  enter_coach_names: 'הזנת שמות מאמנים',
  check_system_ready: 'בדיקת מוכנות מערכת',
  send_ready_screenshot: 'שליחת צילום מסך READY',
  check_tv_broadcast: 'בדיקת שידור TV',
  report_halftime_stats: 'דיווח סטטיסטיקות מחצית',
  report_final_stats: 'דיווח סטטיסטיקות סיום',
};


export const INITIAL_POST_GAME_TASKS: PostGameTasks = {
  verify_upload: false,
  send_final_report: false,
  report_expenses: false,
  log_for_payment: false,
  check_errors_file: false,
  verify_next_game: false,
  follow_updates: false,
};

export const POST_GAME_TASK_LABELS: Record<keyof PostGameTasks, string> = {
    verify_upload: 'אימות העלאת נתונים',
    send_final_report: 'שליחת דו"ח BOX SCORE סופי',
    report_expenses: 'דיווח הוצאות נסיעה',
    log_for_payment: 'רישום למעקב תשלומים',
    check_errors_file: 'בדיקת קובץ טעויות',
    verify_next_game: 'וידוא שיבוץ המשחק הבא',
    follow_updates: 'מעקב עדכונים בווטסאפ',
};