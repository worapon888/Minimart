import localFont from "next/font/local";

export const Gotham = localFont({
  src: [
    { path: "./Gotham-Thin.woff2", weight: "100", style: "normal" },
    { path: "./Gotham-ThinItalic.woff2", weight: "100", style: "italic" },
    { path: "./Gotham-Book.woff2", weight: "400", style: "normal" },
    { path: "./Gotham-BookItalic.woff2", weight: "300", style: "italic" },
    { path: "./Gotham-Light.woff2", weight: "300", style: "normal" },
    { path: "./Gotham-LightItalic.woff2", weight: "300", style: "italic" },
    { path: "./Gotham-Medium.woff2", weight: "500", style: "normal" },
    { path: "./Gotham-MediumItalic.woff2", weight: "500", style: "italic" },
    { path: "./Gotham-Bold.woff2", weight: "700", style: "normal" },
    { path: "./Gotham-BoldItalic.woff2", weight: "700", style: "italic" },
    { path: "./Gotham-Black.woff2", weight: "900", style: "normal" },
    { path: "./Gotham-BlackItalic.woff2", weight: "900", style: "italic" },
    { path: "./Gotham-Ultra.woff2", weight: "950", style: "normal" },
    { path: "./Gotham-UltraItalic.woff2", weight: "950", style: "italic" },
    { path: "./Gotham-XLight.woff2", weight: "200", style: "normal" },
    { path: "./Gotham-XLightItalic.woff2", weight: "200", style: "italic" },
  ],
  variable: "--font-gotham",
  display: "swap",
});
