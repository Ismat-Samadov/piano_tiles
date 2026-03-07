/**
 * Lightweight User-Agent parser — no dependencies.
 * Extracts device type, browser name+version, OS name+version.
 */

export interface ParsedUA {
  deviceType: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
}

export function parseUA(ua: string): ParsedUA {
  if (!ua) return { deviceType: "desktop", browser: "Unknown", os: "Unknown" };

  const s = ua.toLowerCase();

  // ── Device type ────────────────────────────────────────────────────────
  let deviceType: ParsedUA["deviceType"] = "desktop";
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    deviceType = "tablet";
  } else if (
    /mobile|iphone|ipod|android.*mobile|windows phone|blackberry|opera mini|iemobile/i.test(ua)
  ) {
    deviceType = "mobile";
  }

  // ── Browser ────────────────────────────────────────────────────────────
  let browser = "Unknown";
  if (/edg\//i.test(ua)) {
    browser = "Edge " + (ua.match(/edg\/([\d.]+)/i)?.[1] ?? "");
  } else if (/opr\//i.test(ua)) {
    browser = "Opera " + (ua.match(/opr\/([\d.]+)/i)?.[1] ?? "");
  } else if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) {
    browser = "Chrome " + (ua.match(/chrome\/([\d.]+)/i)?.[1] ?? "");
  } else if (/firefox\//i.test(ua)) {
    browser = "Firefox " + (ua.match(/firefox\/([\d.]+)/i)?.[1] ?? "");
  } else if (/safari\//i.test(ua) && !/chrome/i.test(ua)) {
    browser = "Safari " + (ua.match(/version\/([\d.]+)/i)?.[1] ?? "");
  } else if (/msie|trident/i.test(ua)) {
    browser = "IE " + (ua.match(/(?:msie |rv:)([\d.]+)/i)?.[1] ?? "");
  }
  browser = browser.trim();

  // ── OS ─────────────────────────────────────────────────────────────────
  let os = "Unknown";
  if (/windows nt/i.test(ua)) {
    const ver: Record<string, string> = {
      "10.0": "10/11",
      "6.3": "8.1",
      "6.2": "8",
      "6.1": "7",
    };
    const v = ua.match(/windows nt ([\d.]+)/i)?.[1] ?? "";
    os = "Windows " + (ver[v] ?? v);
  } else if (/ipad/i.test(ua)) {
    os = "iPadOS " + (ua.match(/os ([\d_]+)/i)?.[1]?.replace(/_/g, ".") ?? "");
  } else if (/iphone|ipod/i.test(ua)) {
    os = "iOS " + (ua.match(/os ([\d_]+)/i)?.[1]?.replace(/_/g, ".") ?? "");
  } else if (/android/i.test(ua)) {
    os = "Android " + (ua.match(/android ([\d.]+)/i)?.[1] ?? "");
  } else if (/mac os x/i.test(ua)) {
    os = "macOS " + (ua.match(/mac os x ([\d_.]+)/i)?.[1]?.replace(/_/g, ".") ?? "");
  } else if (/linux/i.test(ua)) {
    os = "Linux";
  }
  os = os.trim();

  return { deviceType, browser, os };
}
