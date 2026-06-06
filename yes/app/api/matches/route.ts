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
  "POR": "🇵🇹 Португалия",
  "NED": "🇳🇱 Нидерланды",
  "RUS": "🇷🇺 Россия",
  "TUR": "🇹🇷 Турция",
  "BRA": "🇧🇷 Бразилия",
  "ARG": "🇦🇷 Аргентина",
  "USA": "🇺🇸 США",
  "BEL": "🇧🇪 Бельгия",
  "SCO": "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Шотландия",
  "UKR": "🇺🇦 Украина",
  "POL": "🇵🇱 Польша",
  "KAZ": "🇰🇿 Казахстан",
  "INT": "🌍 Международные",
  "EUR": "🇪🇺 Европа",
  "SAM": "🌎 Южная Америка",
  "MEX": "🇲🇽 Мексика",
  "NOR": "🇳🇴 Норвегия",
  "SWE": "🇸🇪 Швеция",
  "DEN": "🇩🇰 Дания",
  "SUI": "🇨🇭 Швейцария",
  "AUT": "🇦🇹 Австрия",
  "GRE": "🇬🇷 Греция",
  "CRO": "🇭🇷 Хорватия",
  "SRB": "🇷🇸 Сербия",
  "ROM": "🇷🇴 Румыния",
  "CZE": "🇨🇿 Чехия",
  "JPN": "🇯🇵 Япония",
  "KOR": "🇰🇷 Южная Корея",
  "CHN": "🇨🇳 Китай",
  "AUS": "🇦🇺 Австралия",
  "MAR": "🇲🇦 Марокко",
  "EGY": "🇪🇬 Египет",
  "SAU": "🇸🇦 Саудовская Аравия",
};

const LEAGUE_TRANSLATIONS: Record<string, string> = {
  "Premier League": "Премьер-лига",
  "La Liga": "Ла Лига",
  "Bundesliga": "Бундеслига",
  "Serie A": "Серия А",
  "Ligue 1": "Лига 1",
  "Champions League": "Лига Чемпионов",
  "Europa League": "Лига Европы",
  "Conference League": "Лига Конференций",
  "Championship": "Чемпионшип",
  "Primeira Liga": "Примейра Лига",
  "Eredivisie": "Эредивизи",
  "Super Lig": "Суперлига",
  "Friendlies": "Товарищеские матчи",
  "Club Friendlies": "Товарищеские матчи клубов",
  "FA Cup": "Кубок Англии",
  "Copa del Rey": "Кубок Испании",
  "DFB Pokal": "Кубок Германии",
  "Coppa Italia": "Кубок Италии",
  "World Cup": "Чемпионат Мира",
  "Nations League": "Лига Наций",
  "Euro": "Евро",
  "Copa America": "Копа Америка",
  "2. Bundesliga": "2. Бундеслига",
  "Ligue 2": "Лига 2",
  "Serie B": "Серия Б",
  "MLS": "МЛС",
  "Brasileirao": "Бразилейран",
  "Coupe de France": "Кубок Франции",
  "Scottish Premiership": "Шотландская Премьер-лига",
};

function translateCountry(code: string): string {
  return COUNTRY_TRANSLATIONS[code] || `🌍 ${code}`;
}

function translateLeague(name: string): string {
  for (const [key, value] of Object.entries(LEAGUE_TRANSLATIONS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return value;
  }
  return name || "Лига";
}

let leagueCache: Record<number, { name: string; country: string }> = {};
let leagueCacheLoaded = false;

async function loadLeagues() {
  if (leagueCacheLoaded) return;
  try {
    const res = await fetch(
      "https://free-api-live-football-data.p.rapidapi.com/football-popular-leagues",
      {
        headers: {
          "Content-Type": "application/json",
          "x-rapidapi-key": RAPIDAPI_KEY,
          "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
        },
      }
    );
    const data = await res.json();
    const leagues = data?.response?.popular || [];
    if (Array.isArray(leagues)) {
      leagues.forEach((l: any) => {
        if (l.id) {
          leagueCache[l.id] = {
            name: l.name || "",
            country: l.ccode || "",
          };
        }
      });
      leagueCacheLoaded = true;
    }
  } catch (e) {
    console.log("League load error:", e);
  }
}

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    const [liveRes, fixturesRes] = await Promise.all([
      fetch(
        `https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${today}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "sportapi7.p.rapidapi.com",
          },
        }
      ),
      fetch(
        `https://sportapi7.p.rapidapi.com/api/v1/sport/football/events/live`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "sportapi7.p.rapidapi.com",
          },
        }
      ),
    ]);

    const fixturesData = await fixturesRes.json();
    const liveData = await liveRes.json();

    console.log("FIXTURES DATA:", JSON.stringify(fixturesData).slice(0, 300));
    console.log("LIVE DATA:", JSON.stringify(liveData).slice(0, 300));

    const fixtureEvents = fixturesData?.events || [];
    const liveEvents = liveData?.events || [];

    const allEvents = [
      ...liveEvents.map((e: any) => ({ ...e, isLive: true })),
      ...fixtureEvents.map((e: any) => ({ ...e, isLive: false })),
    ];

    const matches = allEvents.slice(0, 50).map((e: any) => {
      const ruCountry = e.tournament?.category?.fieldTranslations?.nameTranslation?.ru;
      const ruLeague = e.tournament?.fieldTranslations?.nameTranslation?.ru;
      const ruHome = e.homeTeam?.fieldTranslations?.nameTranslation?.ru;
      const ruAway = e.awayTeam?.fieldTranslations?.nameTranslation?.ru;
      const leagueInfo = leagueCache[e.leagueId] || {};

      return {
        id: e.id || Math.random(),
        home: ruHome || e.homeTeam?.name || "Команда 1",
        away: ruAway || e.awayTeam?.name || "Команда 2",
        homeScore: e.homeScore?.current ?? null,
        awayScore: e.awayScore?.current ?? null,
        time: e.startTimestamp
          ? new Date(e.startTimestamp * 1000).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
          : "—",
        league: ruLeague || e.tournament?.name || translateLeague(leagueInfo.name || "") || "Лига",
        country: ruCountry
          ? `🌍 ${ruCountry}`
          : translateCountry(e.tournament?.category?.alpha2 || leagueInfo.country || "INT"),
        status: e.isLive ? "LIVE" : "upcoming",
        odds: {
          home: randomOdds(),
          draw: randomOdds(),
          away: randomOdds(),
        },
      };
    });

    return NextResponse.json({ matches });
  } catch (e: any) {
    console.log("Error:", e);
    return NextResponse.json({ matches: [], error: String(e) });
  }
}