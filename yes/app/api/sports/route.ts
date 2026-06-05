import { NextResponse } from "next/server";

const RAPIDAPI_KEY = "4de3bb459emsha30338f8efca4e2p12d700jsne05c72c52353";

function randomOdds() {
  return parseFloat((1.2 + Math.random() * 4).toFixed(2));
}

const COUNTRY_TRANSLATIONS: Record<string, string> = {
  "ENG": "🏴󠁧󠁢󠁥󠁮󠁧󠁿 Англия",
  "ESP": "🇪🇸 Испания",
  "GER": "🇩🇪 Германия",
  "ITA": "🇮🇹 Италия",
  "FRA": "🇫🇷 Франция",
  "USA": "🇺🇸 США",
  "RUS": "🇷🇺 Россия",
  "INT": "🌍 Международные",
  "EUR": "🇪🇺 Европа",
  "TUR": "🇹🇷 Турция",
  "BRA": "🇧🇷 Бразилия",
  "ARG": "🇦🇷 Аргентина",
  "CAN": "🇨🇦 Канада",
  "AUS": "🇦🇺 Австралия",
  "JPN": "🇯🇵 Япония",
  "KOR": "🇰🇷 Южная Корея",
  "CHN": "🇨🇳 Китай",
  "POL": "🇵🇱 Польша",
  "SWE": "🇸🇪 Швеция",
  "NOR": "🇳🇴 Норвегия",
  "FIN": "🇫🇮 Финляндия",
  "CZE": "🇨🇿 Чехия",
  "SVK": "🇸🇰 Словакия",
  "SUI": "🇨🇭 Швейцария",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get("sport") || "basketball";
  const today = new Date().toISOString().split("T")[0];
  const noDrawSports = ["tennis", "mma", "basketball"];
  const noDraw = noDrawSports.includes(sport);

  try {
    const res = await fetch(
      `https://sportapi7.p.rapidapi.com/api/v1/sport/${sport}/scheduled-events/${today}`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "sportapi7.p.rapidapi.com",
        },
      }
    );
    const data = await res.json();

    const events = data?.events || [];

    const matches = events.slice(0, 30).map((e: any) => {
      const ruCountry = e.tournament?.category?.fieldTranslations?.nameTranslation?.ru;
      const ruLeague = e.tournament?.fieldTranslations?.nameTranslation?.ru;
      const ruHome = e.homeTeam?.fieldTranslations?.nameTranslation?.ru;
      const ruAway = e.awayTeam?.fieldTranslations?.nameTranslation?.ru;

      return {
        id: e.id || Math.random(),
        home: ruHome || e.homeTeam?.name || "Команда 1",
        away: ruAway || e.awayTeam?.name || "Команда 2",
        homeScore: e.homeScore?.current ?? null,
        awayScore: e.awayScore?.current ?? null,
        time: e.startTimestamp
          ? new Date(e.startTimestamp * 1000).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
          : "—",
        league: ruLeague || e.tournament?.name || "Лига",
        country: ruCountry
          ? `🌍 ${ruCountry}`
          : COUNTRY_TRANSLATIONS[e.tournament?.category?.alpha2 || ""] || e.tournament?.category?.name || "🌍 Мир",
        status: e.status?.type === "inprogress" ? "LIVE" : "upcoming",
        sport,
        odds: {
          home: randomOdds(),
          draw: noDraw ? null : randomOdds(),
          away: randomOdds(),
        },
      };
    });

    return NextResponse.json({ matches });
  } catch (e) {
    console.log("Error:", e);
    return NextResponse.json({ matches: [] });
  }
}