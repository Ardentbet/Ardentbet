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
    await loadLeagues();

    const today = new Date().toISOString().split("T")[0].replace(/-/g, "");

    const [liveRes, fixturesRes] = await Promise.all([
      fetch(
        "https://free-api-live-football-data.p.rapidapi.com/football-current-live",
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
          },
        }
      ),
      fetch(
        `https://free-api-live-football-data.p.rapidapi.com/football-get-matches-by-date?date=${today}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-rapidapi-key": RAPIDAPI_KEY,
            "x-rapidapi-host": "free-api-live-football-data.p.rapidapi.com",
          },
        }
      ),
    ]);

    const liveData = await liveRes.json();
    const fixturesData = await fixturesRes.json();

    const liveEvents = liveData?.response?.live || [];
    const fixtureEvents = fixturesData?.response?.matches || [];

    const allEvents = [
      ...liveEvents.map((e: any) => ({ ...e, isLive: true })),
      ...fixtureEvents.map((e: any) => ({ ...e, isLive: false })),
    ];

    const matches = allEvents.slice(0, 50).map((e: any) => {
      const leagueInfo = leagueCache[e.leagueId] || {};
      const rawLeague = leagueInfo.name || "";
      const rawCountry = leagueInfo.country || "INT";

      return {
        id: e.id || Math.random(),
        home: e.home?.name || e.homeTeam?.name || "Команда 1",
        away: e.away?.name || e.awayTeam?.name || "Команда 2",
        homeScore: e.home?.score ?? null,
        awayScore: e.away?.score ?? null,
        time: e.time ? e.time.slice(11, 16) : "—",
        league: translateLeague(rawLeague) || "Товарищеские матчи",
        country: translateCountry(rawCountry),
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