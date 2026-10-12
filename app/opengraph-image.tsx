import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = `${profile.name}, ${profile.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#f3f4f1",
          color: "#14171c",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 12,
              border: "3px solid #14171c",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            ab
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 600 }}>{profile.name}</div>
            <div style={{ fontSize: 24, color: "#545b64" }}>{profile.role}</div>
          </div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, letterSpacing: -2, lineHeight: 1.05, maxWidth: 940 }}>
          {profile.headline}
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 24, color: "#0c6478" }}>
          {["Next.js", "React", "Flutter", "Node.js", "PostgreSQL"].map((item) => (
            <div key={item} style={{ display: "flex", padding: "6px 14px", border: "2px solid #b9beb6", borderRadius: 8 }}>
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
