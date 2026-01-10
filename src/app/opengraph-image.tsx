import { ImageResponse } from "next/og";

export const alt = "Neyro – PARA Productivity App";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px",
          fontFamily: "system-ui",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "16px",
                background: "rgba(255, 255, 255, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              NE
            </div>
            <div
              style={{
                fontSize: "48px",
                fontWeight: "bold",
                color: "white",
                display: "flex",
              }}
            >
              Neyro
            </div>
          </div>
          <div
            style={{
              fontSize: "64px",
              fontWeight: "bold",
              color: "white",
              textAlign: "center",
              lineHeight: "1.2",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>One inbox. Seven projects max.</span>
            <span>Ship the weekly review.</span>
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(255, 255, 255, 0.8)",
              textAlign: "center",
              display: "flex",
            }}
          >
            PARA productivity app with enforced guardrails
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

