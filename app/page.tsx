"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type YouTubePlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getDuration: () => number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (element: HTMLElement, options: {
        height: string;
        width: string;
        videoId: string;
        playerVars: Record<string, number | string>;
        events: {
          onReady: () => void;
          onStateChange: (event: { data: number }) => void;
          onError: () => void;
        };
      }) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type City = {
  name: string;
  state: string;
  lat: number;
  lon: number;
  timezone: string;
  story: string;
  detail: string;
};

type WeatherMood = "clear" | "rain" | "summer" | "winter";
type TimeMood = "day" | "evening" | "night" | "midnight";

const cities: City[] = [
  { name: "Delhi", state: "Delhi", lat: 28.61, lon: 77.21, timezone: "Asia/Kolkata", story: "A city that has watched empires arrive and depart", detail: "Delhi's streets carry layers of history—from Shahjahanabad's lanes to the grand avenues of New Delhi." },
  { name: "Jaipur", state: "Rajasthan", lat: 26.91, lon: 75.79, timezone: "Asia/Kolkata", story: "The Pink City, drawn in symmetry and sandstone", detail: "Jaipur was founded by Sawai Jai Singh II in 1727 and planned around a precise nine-part grid." },
  { name: "Mumbai", state: "Maharashtra", lat: 19.08, lon: 72.88, timezone: "Asia/Kolkata", story: "Seven islands, one restless city of dreams", detail: "Mumbai is home to Hindi cinema and a sea-facing rhythm that has inspired generations of songwriters." },
  { name: "Lucknow", state: "Uttar Pradesh", lat: 26.85, lon: 80.95, timezone: "Asia/Kolkata", story: "Where poetry lives in everyday conversation", detail: "Lucknow's celebrated tehzeeb, food and architecture grew around the refined culture of the Nawabs of Awadh." },
  { name: "Kolkata", state: "West Bengal", lat: 22.57, lon: 88.36, timezone: "Asia/Kolkata", story: "A river city of books, trams and timeless melodies", detail: "Kolkata gave India Rabindranath Tagore and Satyajit Ray, and remains one of the country's great cultural capitals." },
  { name: "Bengaluru", state: "Karnataka", lat: 12.97, lon: 77.59, timezone: "Asia/Kolkata", story: "Garden roads, new ideas and an easy evening breeze", detail: "Known for both its green spaces and technology culture, Bengaluru sits more than 900 metres above sea level." },
  { name: "Goa", state: "Goa", lat: 15.49, lon: 73.83, timezone: "Asia/Kolkata", story: "A small state with a very long musical memory", detail: "Goa's musical identity blends Konkani traditions, Portuguese influence and India's enduring love of live bands." },
  { name: "Chandigarh", state: "Chandigarh", lat: 30.73, lon: 76.78, timezone: "Asia/Kolkata", story: "A modern city framed by the Shivalik hills", detail: "Planned by Le Corbusier, Chandigarh is famous for its ordered sectors, generous greenery and Rock Garden." },
];

const playlists: Record<TimeMood, { title: string; artist: string; film: string; fact: string; color: string; youtubeId: string }[]> = {
  day: [
    { title: "Ilahi", artist: "Arijit Singh", film: "Yeh Jawaani Hai Deewani", fact: "A road song made for the feeling of setting out with no hurry.", color: "#ed7b43", youtubeId: "fdubeMFwuGs" },
    { title: "Aao Milo Chalo", artist: "Shaan & Ustad Sultan Khan", film: "Jab We Met", fact: "The song turns an ordinary journey into a warm, wandering conversation.", color: "#dd9d42", youtubeId: "U0JYkRqU6eY" },
    { title: "Khaabon Ke Parinday", artist: "Alyssa Mendonsa & Mohit Chauhan", film: "Zindagi Na Milegi Dobara", fact: "Its open-road arrangement was shaped to feel light, airborne and unforced.", color: "#5c9b91", youtubeId: "R0XjwtP_iTY" },
    { title: "Safarnama", artist: "Lucky Ali", film: "Tamasha", fact: "Lucky Ali's weathered voice gives the song its unmistakable traveller's soul.", color: "#bd704f", youtubeId: "7mTDBsdfw88" },
  ],
  evening: [
    { title: "Neele Neele Ambar Par", artist: "Kishore Kumar", film: "Kalaakaar", fact: "A beloved 1980s melody whose guitar motif is instantly recognisable.", color: "#9a4d55", youtubeId: "eVnG_Rqfgg4" },
    { title: "Pehla Nasha", artist: "Udit Narayan & Sadhana Sargam", film: "Jo Jeeta Wohi Sikandar", fact: "The slow-motion picturisation helped make this 1990s love song iconic.", color: "#c15f58", youtubeId: "1R8MGdgZDns" },
    { title: "Humein Tumse Pyaar Kitna", artist: "Kishore Kumar", film: "Kudrat", fact: "R. D. Burman's composition remains one of Hindi cinema's tenderest declarations.", color: "#7d5573", youtubeId: "QazDQF4p49A" },
    { title: "Gulabi Aankhen", artist: "Mohammed Rafi", film: "The Train", fact: "A classic road-friendly tune carried by R. D. Burman's buoyant rhythm.", color: "#b65055", youtubeId: "I5t894l5b1w" },
  ],
  night: [
    { title: "Khaike Paan Banaraswala", artist: "Kishore Kumar", film: "Don", fact: "The song was added after the film was completed—and became one of its biggest moments.", color: "#753b73", youtubeId: "I7yrlKxIzwk" },
    { title: "Gallan Goodiyaan", artist: "Yashita Sharma & ensemble", film: "Dil Dhadakne Do", fact: "The energetic sequence was designed to feel like one continuous family celebration.", color: "#86406b", youtubeId: "9fxfKaTOAV0" },
    { title: "Badtameez Dil", artist: "Benny Dayal", film: "Yeh Jawaani Hai Deewani", fact: "A rapid-fire party track built around big-band brass and playful vocal phrasing.", color: "#633c82", youtubeId: "vbTkIlPCsgs" },
    { title: "Aankh Marey", artist: "Neha Kakkar, Mika Singh & Kumar Sanu", film: "Simmba", fact: "The remake nods directly to its 1990s original through Kumar Sanu's cameo vocal.", color: "#8d405c", youtubeId: "zC3UbTf4qrM" },
  ],
  midnight: [
    { title: "Aaj Jaane Ki Zid Na Karo", artist: "Farida Khanum", film: "Ghazal", fact: "Farida Khanum's rendition made Fayyaz Hashmi's words beloved across generations.", color: "#293d62", youtubeId: "CbiRKybmJDQ" },
    { title: "Hothon Se Chhu Lo Tum", artist: "Jagjit Singh", film: "Prem Geet", fact: "Jagjit Singh composed and sang this enduring bridge between ghazal and film music.", color: "#324660", youtubeId: "1GdJS6J-fx8" },
    { title: "Chupke Chupke Raat Din", artist: "Ghulam Ali", film: "Nikaah", fact: "The ghazal's unhurried pace makes it a natural companion for quiet late-night roads.", color: "#273954", youtubeId: "M-YIJ9Hugv0" },
    { title: "Ranjish Hi Sahi", artist: "Mehdi Hassan", film: "Ghazal", fact: "Ahmed Faraz's poetry and Mehdi Hassan's voice created a modern ghazal standard.", color: "#3c405f", youtubeId: "dOtqwZdhBkc" },
  ],
};

const pad = (n: number) => String(n).padStart(2, "0");

function hash(value: string) {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return Math.abs(result);
}

function timeMoodFor(hour: number): TimeMood {
  if (hour >= 0 && hour < 5) return "midnight";
  if (hour >= 18 && hour < 22) return "evening";
  if (hour >= 22) return "night";
  return "day";
}

function weatherLabel(mood: WeatherMood) {
  return { clear: "Clear skies", rain: "Rain on the road", summer: "Warm & bright", winter: "Cool breeze" }[mood];
}

export default function Home() {
  const [from, setFrom] = useState("Delhi");
  const [to, setTo] = useState("Jaipur");
  const [now, setNow] = useState(new Date());
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [playbackError, setPlaybackError] = useState("");
  const [weather, setWeather] = useState<WeatherMood>("clear");
  const [temperature, setTemperature] = useState(27);
  const youtubeMount = useRef<HTMLDivElement>(null);
  const youtubePlayer = useRef<YouTubePlayer | null>(null);
  const wantsPlayback = useRef(false);

  const destination = cities.find((city) => city.name === to) ?? cities[1];
  const hour = Number(new Intl.DateTimeFormat("en-GB", { timeZone: destination.timezone, hour: "2-digit", hour12: false }).format(now));
  const mood = timeMoodFor(hour);
  const dayNumber = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
  const trackList = playlists[mood];
  const dailyOffset = hash(`${from}-${to}-bus-radio`) % trackList.length;
  const track = trackList[(dailyOffset + dayNumber) % trackList.length];

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!youtubeMount.current) return;
    let cancelled = false;
    const createPlayer = () => {
      if (cancelled || !window.YT || !youtubeMount.current) return;
      youtubePlayer.current?.destroy();
      youtubePlayer.current = new window.YT.Player(youtubeMount.current, {
        height: "200",
        width: "200",
        videoId: track.youtubeId,
        playerVars: { controls: 0, playsinline: 1, rel: 0, fs: 0, disablekb: 1, origin: window.location.origin },
        events: {
          onReady: () => {
            setPlayerReady(true);
            setPlaybackError("");
            if (wantsPlayback.current) youtubePlayer.current?.playVideo();
          },
          onStateChange: ({ data }) => {
            setPlaying(data === 1);
            if (data === 0) setProgress(100);
          },
          onError: () => {
            setPlaying(false);
            setPlaybackError("This track is not available from YouTube in your region.");
          },
        },
      });
    };
    if (window.YT?.Player) createPlayer();
    else {
      window.onYouTubeIframeAPIReady = createPlayer;
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }
    return () => {
      cancelled = true;
      youtubePlayer.current?.destroy();
      youtubePlayer.current = null;
      setPlayerReady(false);
    };
  }, [track.youtubeId]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const current = youtubePlayer.current?.getCurrentTime() ?? 0;
      const duration = youtubePlayer.current?.getDuration() ?? 0;
      if (duration > 0) setProgress((current / duration) * 100);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const togglePlayback = () => {
    setPlaybackError("");
    wantsPlayback.current = !playing;
    if (!playerReady) {
      setPlaying(true);
      return;
    }
    if (playing) youtubePlayer.current?.pauseVideo();
    else youtubePlayer.current?.playVideo();
  };

  useEffect(() => {
    const controller = new AbortController();
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lon}&current=temperature_2m,weather_code&timezone=auto`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        const temp = Math.round(data.current?.temperature_2m ?? 27);
        const code = Number(data.current?.weather_code ?? 0);
        setTemperature(temp);
        if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) setWeather("rain");
        else if (temp >= 33) setWeather("summer");
        else if (temp <= 14) setWeather("winter");
        else setWeather("clear");
      })
      .catch(() => setWeather(now.getMonth() >= 5 && now.getMonth() <= 8 ? "rain" : "clear"));
    return () => controller.abort();
  }, [destination, now.getMonth()]);

  const timeLabel = useMemo(() => new Intl.DateTimeFormat("en-IN", { timeZone: destination.timezone, hour: "numeric", minute: "2-digit", hour12: true }).format(now).toLowerCase(), [destination.timezone, now]);
  const moodCopy = { day: "Open-road Hindi", evening: "80s, 90s & love", night: "Night bus party", midnight: "After-hours ghazals" }[mood];
  const theme = `${mood} ${weather}`;

  return (
    <main className={`journey ${theme}`}>
      <div className="sky-glow" />
      <div className="weather-layer" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
      <div className="landscape" aria-hidden="true">
        <span className="sun" /><span className="hill hill-one" /><span className="hill hill-two" />
        <div className="road"><span /><span /><span /></div>
      </div>

      <header className="topbar">
        <a className="brand" href="#top" aria-label="Raahi Radio home"><span>राही</span> RADIO</a>
        <div className="status"><span className="live-dot" /> LIVE ON ROUTE</div>
        <div className="conditions"><span>{timeLabel}</span><span className="divider" />{temperature}° · {weatherLabel(weather)}</div>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">THE MUSIC BETWEEN PLACES</p>
        <h1>Your journey<br /><em>has a sound.</em></h1>
        <p className="intro">A new handpicked soundtrack every day, tuned to the hour, the weather and the road ahead.</p>

        <div className="route-card">
          <div className="select-wrap"><label htmlFor="from">DEPARTING</label><select id="from" value={from} onChange={(event) => setFrom(event.target.value)}>{cities.map((city) => <option key={city.name}>{city.name}</option>)}</select></div>
          <div className="route-line"><span className="bus">BUS</span><span /></div>
          <div className="select-wrap align-right"><label htmlFor="to">ARRIVING</label><select id="to" value={to} onChange={(event) => setTo(event.target.value)}>{cities.filter((city) => city.name !== from).map((city) => <option key={city.name}>{city.name}</option>)}</select></div>
        </div>
      </section>

      <aside className="story-card">
        <p className="card-kicker">ARRIVING SOON · {destination.state.toUpperCase()}</p>
        <h2>{destination.name}</h2>
        <h3>{destination.story}</h3>
        <p>{destination.detail}</p>
        <div className="story-index"><span>ROUTE NOTE</span><span>01 / 03</span></div>
      </aside>

      <section className="player" aria-label="Now playing">
        <div className="youtube-stage" style={{ "--cover": track.color } as React.CSSProperties}>
          <div ref={youtubeMount} />
        </div>
        <div className="track">
          <div className="track-heading"><div><p>{track.title}</p><span>{track.artist} · {track.film}</span></div><span className="daily">TODAY’S PICK</span></div>
          <div className="progress"><i style={{ width: `${progress}%` }} /></div>
          <div className="track-meta"><span>{Math.floor((youtubePlayer.current?.getCurrentTime() ?? 0) / 60)}:{pad(Math.floor(youtubePlayer.current?.getCurrentTime() ?? 0) % 60)} · YouTube</span><span>{playbackError || moodCopy}</span></div>
        </div>
        <button className={`play ${playing ? "is-playing" : ""}`} onClick={togglePlayback} aria-label={playing ? "Pause YouTube playback" : "Play from YouTube"}><span /></button>
        <div className="fact"><span>ON THIS SONG</span><p>{track.fact}</p></div>
      </section>

      <footer><span>No skips. No repeats. Just the road.</span><span>PLAYLIST {String(dailyOffset + 1).padStart(2, "0")} · DAY {String((dayNumber % trackList.length) + 1).padStart(2, "0")}</span></footer>
    </main>
  );
}
