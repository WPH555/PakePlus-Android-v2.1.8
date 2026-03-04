export const APP_NAME = "海空智擎";
export const APP_VERSION = "1.0.0";

// MiMo API Configuration as requested
export const MIMO_API_KEY = "sk-c83g7v97wov2zkthm2vfv51myyafn4295c76wdat9i67y091";
export const MIMO_API_BASE_URL = "https://api.xiaomimimo.com/v1";
export const MIMO_MODEL = "mimo-v2-flash";

export const MOCK_HISTORY_DATA = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 52 },
  { day: 'Wed', value: 38 },
  { day: 'Thu', value: 65 },
  { day: 'Fri', value: 48 },
  { day: 'Sat', value: 72 },
  { day: 'Sun', value: 60 },
];

export const CHECKLIST_ITEMS = [
  "桨叶已展开",
  "云台卡扣已拆除",
  "气囊气压正常",
  "SD卡已插入",
  "图传信号检测",
  "电池安装到位"
];

export const MORSE_CODE_MAP: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.'
};