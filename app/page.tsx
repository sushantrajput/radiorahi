"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type YouTubePlayer = { playVideo: () => void; pauseVideo: () => void; destroy: () => void; getCurrentTime: () => number; getDuration: () => number };
declare global { interface Window { YT?: { Player: new (element: HTMLElement, options: { height: string; width: string; videoId: string; playerVars: Record<string, number | string>; events: { onReady: () => void; onStateChange: (event: { data: number }) => void; onError: () => void } }) => YouTubePlayer }; onYouTubeIframeAPIReady?: () => void } }

type Biome = "high-desert" | "snow" | "alpine" | "forest" | "lake" | "valley" | "plains" | "desert" | "coast";
type City = { name: string; state: string; lat: number; lon: number; story: string; detail: string; biome: Biome; symbol: string };
type WeatherMood = "clear" | "rain" | "summer" | "winter";
type TimeMood = "day" | "evening" | "night" | "midnight";
type Track = { title: string; artist: string; film: string; fact: string; color: string; youtubeId: string };

const cities: City[] = [
  { name:"Delhi",state:"Delhi",lat:28.61,lon:77.21,biome:"plains",symbol:"INDIA GATE",story:"A city where every road meets a century",detail:"Delhi layers medieval lanes, Mughal gardens and broad ceremonial avenues into one immense living archive." },
  { name:"Chandigarh",state:"Chandigarh",lat:30.73,lon:76.78,biome:"plains",symbol:"OPEN HAND",story:"Modern lines beneath the Shivaliks",detail:"Le Corbusier's ordered sectors, the Open Hand and Nek Chand's Rock Garden give Chandigarh its unmistakable geometry." },
  { name:"Shimla",state:"Himachal Pradesh",lat:31.10,lon:77.17,biome:"alpine",symbol:"RIDGE",story:"A hill capital balanced along a ridge",detail:"The toy train, timbered facades and long views from the Ridge make Shimla an enduring Himalayan gateway." },
  { name:"Manali",state:"Himachal Pradesh",lat:32.24,lon:77.19,biome:"snow",symbol:"ROHTANG",story:"A river town looking toward the high passes",detail:"Manali sits beside the Beas among deodar forests, apple orchards and the snow approaches to Rohtang and Lahaul." },
  { name:"Dharamshala",state:"Himachal Pradesh",lat:32.22,lon:76.32,biome:"alpine",symbol:"DHAULADHAR",story:"Monasteries beneath a wall of snow",detail:"Dharamshala and McLeod Ganj bring Tibetan culture, cedar paths and the dramatic Dhauladhar range together." },
  { name:"Dalhousie",state:"Himachal Pradesh",lat:32.54,lon:75.97,biome:"forest",symbol:"KHAJJIAR",story:"Five quiet hills wrapped in pine",detail:"Dalhousie's colonial-era walks open toward the Pir Panjal; nearby Khajjiar is known for its meadow and cedar forest." },
  { name:"Kasol",state:"Himachal Pradesh",lat:32.01,lon:77.32,biome:"valley",symbol:"PARVATI",story:"A small village beside a fast green river",detail:"Kasol is a base for Parvati Valley trails, café culture and journeys onward to Chalal, Tosh and Kheerganga." },
  { name:"Kaza",state:"Himachal Pradesh",lat:32.23,lon:78.07,biome:"high-desert",symbol:"SPITI",story:"A high-desert settlement under enormous skies",detail:"Kaza is Spiti's main hub, surrounded by fossil villages, ancient monasteries and stark mountains above 3,600 metres." },
  { name:"Chamba",state:"Himachal Pradesh",lat:32.56,lon:76.13,biome:"valley",symbol:"RAVI",story:"Temple spires above the Ravi valley",detail:"Chamba is known for its hill architecture, miniature painting tradition and the embroidered Chamba rumal." },
  { name:"Jammu",state:"Jammu & Kashmir",lat:32.73,lon:74.87,biome:"plains",symbol:"TAWI",story:"The temple city on the Himalayan threshold",detail:"Jammu rises above the Tawi River and serves as the traditional southern gateway to Kashmir and the Vaishno Devi pilgrimage." },
  { name:"Patnitop",state:"Jammu & Kashmir",lat:33.09,lon:75.33,biome:"forest",symbol:"CEDARS",story:"A cedar plateau above the Chenab basin",detail:"Patnitop's meadows, forest paths and winter snow make it a restful high stop on the Jammu–Srinagar road." },
  { name:"Srinagar",state:"Jammu & Kashmir",lat:34.08,lon:74.80,biome:"lake",symbol:"DAL LAKE",story:"A city of water, gardens and carved wood",detail:"Srinagar unfolds around Dal Lake, Mughal gardens, old-city bridges and the delicate craft of walnut wood and papier-mâché." },
  { name:"Gulmarg",state:"Jammu & Kashmir",lat:34.05,lon:74.38,biome:"snow",symbol:"GONDOLA",story:"A meadow that climbs into snow",detail:"Gulmarg is famed for winter skiing, summer wildflowers and a gondola rising toward the high slopes of Apharwat." },
  { name:"Pahalgam",state:"Jammu & Kashmir",lat:34.02,lon:75.32,biome:"valley",symbol:"LIDDER",story:"A river valley of pine and pasture",detail:"Pahalgam follows the Lidder River toward Aru and Betaab valleys, with pony trails and mountains in every direction." },
  { name:"Sonamarg",state:"Jammu & Kashmir",lat:34.30,lon:75.29,biome:"snow",symbol:"THAJIWAS",story:"The meadow of gold before Zoji La",detail:"Sonamarg is a glacial landscape and an important halt on the historic route linking Kashmir with Ladakh." },
  { name:"Kargil",state:"Ladakh",lat:34.55,lon:76.13,biome:"high-desert",symbol:"SURU",story:"A mountain crossroads beside the Suru",detail:"Kargil links Kashmir, Leh and Zanskar, with apricot orchards softening its rugged high-desert terrain." },
  { name:"Leh",state:"Ladakh",lat:34.15,lon:77.58,biome:"high-desert",symbol:"SHANTI STUPA",story:"White stupas against a cobalt sky",detail:"Leh's old palace, monasteries and mud-brick lanes sit in the Indus valley, ringed by the Ladakh and Zanskar ranges." },
  { name:"Nubra Valley",state:"Ladakh",lat:34.69,lon:77.57,biome:"high-desert",symbol:"SAND DUNES",story:"A cold desert beyond Khardung La",detail:"Nubra pairs Hunder's dunes and double-humped camels with monasteries, villages and snow peaks along the Shyok River." },
  { name:"Pangong",state:"Ladakh",lat:33.76,lon:78.67,biome:"lake",symbol:"BLUE LAKE",story:"A blue horizon at 4,225 metres",detail:"Pangong Tso shifts colour with the light, stretching through stark mountains across the India–Tibet border region." },
  { name:"Dehradun",state:"Uttarakhand",lat:30.32,lon:78.03,biome:"valley",symbol:"DOON",story:"A green valley between two river systems",detail:"Dehradun lies in the Doon Valley between the Ganga and Yamuna, shaded by sal forests and old educational institutions." },
  { name:"Mussoorie",state:"Uttarakhand",lat:30.46,lon:78.07,biome:"alpine",symbol:"CAMEL'S BACK",story:"A long ridge above the Doon",detail:"Mussoorie's promenades, old libraries and Himalayan viewpoints have made it a classic hill retreat since the nineteenth century." },
  { name:"Rishikesh",state:"Uttarakhand",lat:30.09,lon:78.27,biome:"valley",symbol:"GANGA",story:"Where the river leaves the mountains",detail:"Rishikesh is known for suspension bridges, river ghats, yoga traditions and the rapids of the upper Ganga." },
  { name:"Nainital",state:"Uttarakhand",lat:29.39,lon:79.45,biome:"lake",symbol:"NAINI LAKE",story:"A mountain town gathered around a lake",detail:"Nainital curves around emerald Naini Lake, with wooded ridges, old schools and viewpoints toward the greater Himalaya." },
  { name:"Almora",state:"Uttarakhand",lat:29.60,lon:79.66,biome:"alpine",symbol:"KUMAON",story:"A crescent ridge in the Kumaon hills",detail:"Almora is celebrated for temple craft, copperware, local sweets and wide views across the central Himalayan snowline." },
  { name:"Auli",state:"Uttarakhand",lat:30.53,lon:79.57,biome:"snow",symbol:"NANDA DEVI",story:"Ski slopes facing Nanda Devi",detail:"Auli's high meadows and winter snow look across to some of India's highest peaks, including Nanda Devi and Kamet." },
  { name:"Joshimath",state:"Uttarakhand",lat:30.55,lon:79.57,biome:"alpine",symbol:"JYOTIRMATH",story:"A sacred halt on the upper Alaknanda",detail:"Joshimath is a gateway to Badrinath, Auli and the Valley of Flowers, and an important centre in the Adi Shankara tradition." },
  { name:"Gangtok",state:"Sikkim",lat:27.34,lon:88.61,biome:"alpine",symbol:"KANCHENJUNGA",story:"A steep city facing Kanchenjunga",detail:"Gangtok blends monasteries, mountain viewpoints and lively pedestrian streets on the old trade route toward Nathu La." },
  { name:"Darjeeling",state:"West Bengal",lat:27.04,lon:88.27,biome:"alpine",symbol:"TOY TRAIN",story:"Tea gardens beneath the eastern snow peaks",detail:"Darjeeling's narrow-gauge railway, hillside tea estates and dawn views from Tiger Hill define its mountain character." },
  { name:"Tawang",state:"Arunachal Pradesh",lat:27.59,lon:91.87,biome:"snow",symbol:"MONASTERY",story:"A monastery town above cloud-filled valleys",detail:"Tawang is home to one of the world's largest Buddhist monasteries, high lakes and the snowbound road over Sela Pass." },
  { name:"Shillong",state:"Meghalaya",lat:25.58,lon:91.89,biome:"forest",symbol:"KHASI HILLS",story:"Rain, rock music and pine-covered hills",detail:"Shillong's Khasi culture, waterfalls and enduring live-music scene give the hill city a rhythm unlike anywhere else." },
  { name:"Jaipur",state:"Rajasthan",lat:26.91,lon:75.79,biome:"desert",symbol:"HAWA MAHAL",story:"The Pink City, drawn in symmetry",detail:"Jaipur was founded in 1727 and planned around a precise grid, with rose-coloured facades and the Aravallis at its edge." },
  { name:"Mumbai",state:"Maharashtra",lat:19.08,lon:72.88,biome:"coast",symbol:"ARABIAN SEA",story:"Seven islands, one restless city",detail:"Mumbai is home to Hindi cinema and a sea-facing rhythm that has inspired generations of performers and songwriters." },
];

const playlists: Record<TimeMood, Track[]> = {
  day: [
    { title:"Ilahi",artist:"Arijit Singh",film:"Yeh Jawaani Hai Deewani",fact:"A road song made for the feeling of setting out with no hurry.",color:"#ed7b43",youtubeId:"fdubeMFwuGs" },
    { title:"Aao Milo Chalo",artist:"Shaan & Ustad Sultan Khan",film:"Jab We Met",fact:"The song turns an ordinary journey into a warm, wandering conversation.",color:"#dd9d42",youtubeId:"U0JYkRqU6eY" },
    { title:"Khaabon Ke Parinday",artist:"Alyssa Mendonsa & Mohit Chauhan",film:"Zindagi Na Milegi Dobara",fact:"Its open-road arrangement was shaped to feel light, airborne and unforced.",color:"#5c9b91",youtubeId:"R0XjwtP_iTY" },
    { title:"Safarnama",artist:"Lucky Ali",film:"Tamasha",fact:"Lucky Ali's weathered voice gives the song its unmistakable traveller's soul.",color:"#bd704f",youtubeId:"7mTDBsdfw88" },
  ],
  evening: [
    { title:"Neele Neele Ambar Par",artist:"Kishore Kumar",film:"Kalaakaar",fact:"A beloved 1980s melody whose guitar motif is instantly recognisable.",color:"#9a4d55",youtubeId:"eVnG_Rqfgg4" },
    { title:"Pehla Nasha",artist:"Udit Narayan & Sadhana Sargam",film:"Jo Jeeta Wohi Sikandar",fact:"The slow-motion picturisation helped make this 1990s love song iconic.",color:"#c15f58",youtubeId:"1R8MGdgZDns" },
    { title:"Humein Tumse Pyaar Kitna",artist:"Kishore Kumar",film:"Kudrat",fact:"R. D. Burman's composition remains one of Hindi cinema's tenderest declarations.",color:"#7d5573",youtubeId:"QazDQF4p49A" },
    { title:"Gulabi Aankhen",artist:"Mohammed Rafi",film:"The Train",fact:"A classic road-friendly tune carried by R. D. Burman's buoyant rhythm.",color:"#b65055",youtubeId:"I5t894l5b1w" },
  ],
  night: [
    { title:"Khaike Paan Banaraswala",artist:"Kishore Kumar",film:"Don",fact:"The song was added after the film was completed—and became one of its biggest moments.",color:"#753b73",youtubeId:"I7yrlKxIzwk" },
    { title:"Gallan Goodiyaan",artist:"Yashita Sharma & ensemble",film:"Dil Dhadakne Do",fact:"The energetic sequence was designed to feel like one continuous family celebration.",color:"#86406b",youtubeId:"9fxfKaTOAV0" },
    { title:"Badtameez Dil",artist:"Benny Dayal",film:"Yeh Jawaani Hai Deewani",fact:"A rapid-fire party track built around big-band brass and playful vocal phrasing.",color:"#633c82",youtubeId:"vbTkIlPCsgs" },
    { title:"Aankh Marey",artist:"Neha Kakkar, Mika Singh & Kumar Sanu",film:"Simmba",fact:"The remake nods to its 1990s original through Kumar Sanu's cameo vocal.",color:"#8d405c",youtubeId:"zC3UbTf4qrM" },
  ],
  midnight: [
    { title:"Aaj Jaane Ki Zid Na Karo",artist:"Farida Khanum",film:"Ghazal",fact:"Farida Khanum's rendition made Fayyaz Hashmi's words beloved across generations.",color:"#293d62",youtubeId:"CbiRKybmJDQ" },
    { title:"Hothon Se Chhu Lo Tum",artist:"Jagjit Singh",film:"Prem Geet",fact:"Jagjit Singh composed and sang this enduring bridge between ghazal and film music.",color:"#324660",youtubeId:"1GdJS6J-fx8" },
    { title:"Chupke Chupke Raat Din",artist:"Ghulam Ali",film:"Nikaah",fact:"Its unhurried pace is a natural companion for quiet late-night roads.",color:"#273954",youtubeId:"M-YIJ9Hugv0" },
    { title:"Ranjish Hi Sahi",artist:"Mehdi Hassan",film:"Ghazal",fact:"Ahmed Faraz's poetry and Mehdi Hassan's voice created a modern ghazal standard.",color:"#3c405f",youtubeId:"dOtqwZdhBkc" },
  ],
};

const pad = (n:number) => String(n).padStart(2,"0");
function hash(value:string){ let result=2166136261; for(let i=0;i<value.length;i+=1) result=Math.imul(result^value.charCodeAt(i),16777619); return Math.abs(result); }
function timeMoodFor(hour:number):TimeMood { if(hour<5)return"midnight"; if(hour>=18&&hour<22)return"evening"; if(hour>=22)return"night"; return"day"; }
function weatherLabel(mood:WeatherMood){ return {clear:"Clear skies",rain:"Rain on the road",summer:"Warm & bright",winter:"Cold mountain air"}[mood]; }
function routeScore(city:City, start:City, end:City){
  const ax=start.lon, ay=start.lat, bx=end.lon, by=end.lat, px=city.lon, py=city.lat;
  const length=(bx-ax)**2+(by-ay)**2||1;
  const t=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/length));
  const x=ax+t*(bx-ax), y=ay+t*(by-ay);
  return { city, t, distance:Math.hypot(px-x,py-y)+(t===0||t===1?3:0) };
}

export default function Home(){
  const [from,setFrom]=useState("Delhi"); const [to,setTo]=useState("Leh"); const [now,setNow]=useState(new Date());
  const [playing,setPlaying]=useState(false); const [progress,setProgress]=useState(0); const [currentSeconds,setCurrentSeconds]=useState(0);
  const [playerReady,setPlayerReady]=useState(false); const [playbackError,setPlaybackError]=useState("");
  const [weather,setWeather]=useState<WeatherMood>("clear"); const [temperature,setTemperature]=useState(14); const [storyIndex,setStoryIndex]=useState(0);
  const youtubeMount=useRef<HTMLDivElement>(null); const youtubePlayer=useRef<YouTubePlayer|null>(null); const wantsPlayback=useRef(false);
  const origin=cities.find(city=>city.name===from)??cities[0]; const destination=cities.find(city=>city.name===to)??cities[16];
  const routeStops=useMemo(()=>cities.filter(city=>city.name!==from&&city.name!==to).map(city=>routeScore(city,origin,destination)).sort((a,b)=>a.distance-b.distance).slice(0,10).sort((a,b)=>a.t-b.t).map(item=>item.city),[from,to,origin,destination]);
  const hour=now.getHours(); const mood=timeMoodFor(hour); const dayNumber=Math.floor(Date.UTC(now.getFullYear(),now.getMonth(),now.getDate())/86400000);
  const trackList=playlists[mood]; const dailyOffset=hash(`${from}-${to}-bus-radio`)%trackList.length; const track=trackList[(dailyOffset+dayNumber)%trackList.length];
  const stories=useMemo(()=>[
    { kicker:`DESTINATION · ${destination.state}`,title:destination.name,subtitle:destination.story,body:destination.detail },
    ...routeStops.map((city,index)=>({kicker:`STOP ${pad(index+1)} OF ${pad(routeStops.length)} · ${city.state}`,title:city.name,subtitle:city.story,body:city.detail})),
    { kicker:"ON THIS SONG",title:track.title,subtitle:`${track.artist} · ${track.film}`,body:track.fact },
  ],[destination,routeStops,track]);
  const activeStory=stories[storyIndex%stories.length];

  useEffect(()=>{ const timer=window.setInterval(()=>setNow(new Date()),30000); return()=>window.clearInterval(timer); },[]);
  useEffect(()=>{ setStoryIndex(0); },[from,to,track.youtubeId]);
  useEffect(()=>{ const readingMs=Math.min(30000,Math.max(20000,18000+activeStory.body.length*45)); const timer=window.setTimeout(()=>setStoryIndex(value=>(value+1)%stories.length),readingMs); return()=>window.clearTimeout(timer); },[activeStory,stories.length]);

  useEffect(()=>{
    if(!youtubeMount.current)return; let cancelled=false;
    const createPlayer=()=>{ if(cancelled||!window.YT||!youtubeMount.current)return; if(typeof youtubePlayer.current?.destroy==="function")youtubePlayer.current.destroy();
      youtubePlayer.current=new window.YT.Player(youtubeMount.current,{height:"200",width:"200",videoId:track.youtubeId,playerVars:{controls:0,playsinline:1,rel:0,fs:0,disablekb:1,origin:window.location.origin},events:{
        onReady:()=>{setPlayerReady(true);setPlaybackError("");if(wantsPlayback.current)youtubePlayer.current?.playVideo();},
        onStateChange:({data})=>{setPlaying(data===1);if(data===0)setProgress(100);},
        onError:()=>{setPlaying(false);setPlaybackError("Unavailable from YouTube in your region.");},
      }});
    };
    if(window.YT?.Player)createPlayer(); else { window.onYouTubeIframeAPIReady=createPlayer; if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){const script=document.createElement("script");script.src="https://www.youtube.com/iframe_api";script.async=true;document.head.appendChild(script);} }
    return()=>{cancelled=true;if(typeof youtubePlayer.current?.destroy==="function")youtubePlayer.current.destroy();youtubePlayer.current=null;setPlayerReady(false);};
  },[track.youtubeId]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const player=youtubePlayer.current;if(typeof player?.getCurrentTime!=="function"||typeof player?.getDuration!=="function")return;const current=player.getCurrentTime(),duration=player.getDuration();setCurrentSeconds(current);if(duration>0)setProgress(current/duration*100);},1000);return()=>window.clearInterval(timer);},[playing]);
  const togglePlayback=()=>{setPlaybackError("");wantsPlayback.current=!playing;if(!playerReady){setPlaying(true);return;}if(playing)youtubePlayer.current?.pauseVideo();else youtubePlayer.current?.playVideo();};

  useEffect(()=>{const controller=new AbortController();fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lon}&current=temperature_2m,weather_code&timezone=auto`,{signal:controller.signal}).then(r=>r.json()).then(data=>{const temp=Math.round(data.current?.temperature_2m??14),code=Number(data.current?.weather_code??0);setTemperature(temp);if((code>=51&&code<=67)||(code>=80&&code<=99))setWeather("rain");else if(temp>=33)setWeather("summer");else if(temp<=10)setWeather("winter");else setWeather("clear");}).catch(()=>setWeather(destination.biome==="snow"||destination.biome==="high-desert"?"winter":"clear"));return()=>controller.abort();},[destination]);
  const timeLabel=useMemo(()=>new Intl.DateTimeFormat("en-IN",{hour:"numeric",minute:"2-digit",hour12:true}).format(now).toLowerCase(),[now]);
  const moodCopy={day:"Open-road Hindi",evening:"80s, 90s & love",night:"Night bus party",midnight:"After-hours ghazals"}[mood];

  return <main className={`journey ${mood} ${weather} biome-${destination.biome}`}>
    <div className="sky-glow"/><div className="weather-layer" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    <div className="landscape" aria-hidden="true"><span className="sun"/><span className="peak peak-a"/><span className="peak peak-b"/><span className="terrain terrain-a"/><span className="terrain terrain-b"/><span className="city-mark">{destination.symbol}</span><div className="road"><span/><span/><span/></div></div>
    <header className="topbar"><a className="brand" href="#top" aria-label="Raahi Radio home"><span>राही</span> RADIO</a><div className="status"><span className="live-dot"/> LIVE ON ROUTE</div><div className="conditions"><span>{timeLabel}</span><span className="divider"/>{temperature}° · {weatherLabel(weather)}</div></header>

    <section className="hero" id="top"><p className="eyebrow">THE MUSIC BETWEEN PLACES</p><h1>Every road<br/><em>has a story.</em></h1><p className="intro">A living bus radio shaped by your route, the hour, the weather and every remarkable place in between.</p>
      <div className="route-card"><div className="select-wrap"><label htmlFor="from">DEPARTING</label><select id="from" value={from} onChange={e=>setFrom(e.target.value)}>{cities.filter(city=>city.name!==to).map(city=><option key={city.name}>{city.name}</option>)}</select></div><div className="route-line"><span className="bus">BUS</span><span/></div><div className="select-wrap align-right"><label htmlFor="to">ARRIVING</label><select id="to" value={to} onChange={e=>setTo(e.target.value)}>{cities.filter(city=>city.name!==from).map(city=><option key={city.name}>{city.name}</option>)}</select></div></div>
      <div className="route-ribbon" aria-label="Places along this route"><span className="route-end">{origin.name}</span><div className="route-stops">{routeStops.map((city,index)=><button key={city.name} onClick={()=>setStoryIndex(index+1)} aria-label={`Read about ${city.name}`}><i/>{city.name}</button>)}</div><span className="route-end">{destination.name}</span></div>
    </section>

    <aside className="story-card" aria-live="polite"><div className="story-top"><p className="card-kicker">{activeStory.kicker.toUpperCase()}</p><span>{pad(storyIndex+1)} / {pad(stories.length)}</span></div><div className="story-copy" key={`${storyIndex}-${activeStory.title}`}><h2>{activeStory.title}</h2><h3>{activeStory.subtitle}</h3><p>{activeStory.body}</p></div><div className="story-controls"><button onClick={()=>setStoryIndex(value=>(value-1+stories.length)%stories.length)} aria-label="Previous story">←</button><div className="story-dots">{stories.map((_,index)=><button key={index} className={index===storyIndex?"active":""} onClick={()=>setStoryIndex(index)} aria-label={`Show story ${index+1}`}/>)}</div><button onClick={()=>setStoryIndex(value=>(value+1)%stories.length)} aria-label="Next story">→</button></div><div className="reading-line" key={`timer-${storyIndex}`}/></aside>

    <section className="player" aria-label="Now playing"><div className="youtube-stage" style={{"--cover":track.color} as React.CSSProperties}><div ref={youtubeMount}/></div><div className="track"><div className="track-heading"><div><p>{track.title}</p><span>{track.artist} · {track.film}</span></div><span className="daily">TODAY’S PICK</span></div><div className="progress"><i style={{width:`${progress}%`}}/></div><div className="track-meta"><span>{Math.floor(currentSeconds/60)}:{pad(Math.floor(currentSeconds)%60)} · YouTube</span><span>{playbackError||moodCopy}</span></div></div><button className={`play ${playing?"is-playing":""}`} onClick={togglePlayback} aria-label={playing?"Pause YouTube playback":"Play from YouTube"}><span/></button><div className="fact"><span>NO SKIPS · DAILY ROTATION</span><p>{track.fact}</p></div></section>
    <footer><span>No skips. No repeats. Just the road.</span><span>{routeStops.length} STORIES EN ROUTE · {destination.state.toUpperCase()}</span></footer>
  </main>;
}
