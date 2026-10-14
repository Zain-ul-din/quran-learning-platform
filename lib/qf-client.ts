import "server-only";
import { createServerClient } from "@quranjs/api/server";

export const qfClient = createServerClient({
  clientId: process.env.QF_CLIENT_ID!,
  clientSecret: process.env.QF_CLIENT_SECRET!,
  services: {
    gatewayUrl: "https://apis.quran.foundation",
    oauth2BaseUrl: "https://oauth2.quran.foundation",
  },
});
