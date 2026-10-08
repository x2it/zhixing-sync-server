/**
 * 时间显示统一工具
 *
 * 背景（重要，别再改回 getHours() 那种写法）：
 * 服务端下发的同步时间/操作日志时间是 ISO UTC（如 "2026-09-29T08:18:10Z"），
 * 而短信/通话本身的 messageDate / callDate 是**本地时间字符串**（如 "2026-09-29 15:08"）。
 *
 * 过去用 `new Date(iso).getHours()` 取本地时，会**跟着浏览器所在系统时区跑**：
 * 设备时区是北京(+8) 正常显示 16:18，但只要设备时区是美东(-4)，
 * 同一条 08:18Z 就会显示成 04:18 —— 看起来像「凌晨4点」，实际是下午4点。
 *
 * 因此凡是要展示「服务端下发的时间戳」，一律走本文件的显式时区格式化，不再依赖浏览器时区。
 */

/** 业务时区：本项目面向国内用户，统一按北京时间渲染 */
const DISPLAY_TIME_ZONE = 'Asia/Shanghai';

const FALLBACK_FULL = '—';
const FALLBACK_SHORT = '-';

/**
 * 按显式时区取时间零件。
 * hourCycle: 'h23' 保证 0-23（避免部分引擎 hour12:false 把午夜渲染成 24:xx）。
 */
function timeParts(
  iso: string,
  options: Intl.DateTimeFormatOptions,
): ((type: Intl.DateTimeFormatPartTypes) => string) | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DISPLAY_TIME_ZONE,
    hourCycle: 'h23',
    ...options,
  }).formatToParts(d);

  return (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
}

/**
 * 完整时间：YYYY-MM-DD HH:mm（24 小时制，北京时间）
 * 用于「最近同步时间」等需要看到日期的场景。
 */
export function formatDateTime(iso?: string | null): string {
  if (!iso) return FALLBACK_FULL;
  const get = timeParts(iso, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!get) return FALLBACK_FULL;
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}

/**
 * 简短时间：MM-DD HH:mm（24 小时制，北京时间）
 * 用于列表/流水等空间紧凑的场景。
 */
export function formatShortDateTime(iso?: string | null): string {
  if (!iso) return FALLBACK_SHORT;
  const get = timeParts(iso, {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  if (!get) return FALLBACK_SHORT;
  return `${get('month')}-${get('day')} ${get('hour')}:${get('minute')}`;
}
