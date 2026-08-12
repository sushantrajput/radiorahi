"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type YouTubePlayer = { playVideo: () => void; pauseVideo: () => void; stopVideo: () => void; seekTo: (seconds: number, allowSeekAhead: boolean) => void; cuePlaylist: (options: { listType: "playlist"; list: string; index: number; startSeconds: number }) => void; getPlaylist: () => string[]; getPlaylistIndex: () => number; getVideoData: () => { title?: string; author?: string }; destroy: () => void; getCurrentTime: () => number; getDuration: () => number };
declare global { interface Window { YT?: { Player: new (element: HTMLElement, options: { height: string; width: string; videoId: string; playerVars: Record<string, number | string>; events: { onReady: () => void; onStateChange: (event: { data: number }) => void; onError: () => void } }) => YouTubePlayer }; onYouTubeIframeAPIReady?: () => void } }

type Biome = "high-desert" | "snow" | "alpine" | "forest" | "lake" | "valley" | "plains" | "desert" | "coast";
type City = { name: string; state: string; lat: number; lon: number; story: string; detail: string; biome: Biome; symbol: string };
type WeatherMood = "clear" | "rain" | "summer" | "winter";
type TimeMood = "day" | "evening" | "night" | "midnight";
type RouteTerrain = "mountains" | "plains" | "deserts";
type Track = { title: string; artist: string; film: string; fact: string; color: string; youtubeId: string };
const TIME_PLAYLISTS:Partial<Record<TimeMood,string>>={evening:"PLIPDf95_3JuY",night:"PLHd1XcVg5sFQ",midnight:"PLCwDI18At20k"};

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
  { name:"Agra",state:"Uttar Pradesh",lat:27.18,lon:78.01,biome:"plains",symbol:"TAJ MAHAL",story:"A river city shaped by Mughal artistry",detail:"Agra's Taj Mahal, red sandstone fort and marble-inlay workshops preserve one of India's most recognisable architectural legacies." },
  { name:"Varanasi",state:"Uttar Pradesh",lat:25.32,lon:82.97,biome:"plains",symbol:"GANGA GHATS",story:"An ancient city turning toward the river",detail:"Varanasi's stepped ghats, music traditions and labyrinthine lanes have drawn pilgrims, poets and travellers for centuries." },
  { name:"Lucknow",state:"Uttar Pradesh",lat:26.85,lon:80.95,biome:"plains",symbol:"RUMI DARWAZA",story:"Where refinement lives in everyday speech",detail:"Lucknow is celebrated for Awadhi cuisine, chikankari embroidery, gracious tehzeeb and the architecture of its historic imambaras." },
  { name:"Amritsar",state:"Punjab",lat:31.63,lon:74.87,biome:"plains",symbol:"GOLDEN TEMPLE",story:"A city gathered around a sacred pool",detail:"Amritsar's Golden Temple welcomes visitors around the clock, while its lanes carry the flavours and stories of Punjab." },
  { name:"Udaipur",state:"Rajasthan",lat:24.59,lon:73.71,biome:"lake",symbol:"LAKE PICHOLA",story:"Palaces reflected in a chain of lakes",detail:"Udaipur rises around Lake Pichola with white palaces, forested Aravalli ridges and a long tradition of Mewar painting." },
  { name:"Jodhpur",state:"Rajasthan",lat:26.24,lon:73.02,biome:"desert",symbol:"MEHRANGARH",story:"The blue city beneath a desert fort",detail:"Mehrangarh towers above Jodhpur's blue old quarter, opening toward the immense ochre landscape of the Thar." },
  { name:"Ahmedabad",state:"Gujarat",lat:23.02,lon:72.57,biome:"plains",symbol:"SABARMATI",story:"Pol houses, stepwells and modern design",detail:"Ahmedabad brings together the old city's carved wooden houses, Sabarmati Ashram and a remarkable modern architectural heritage." },
  { name:"Pune",state:"Maharashtra",lat:18.52,lon:73.86,biome:"plains",symbol:"SAHYADRI",story:"A cultural city at the edge of the hills",detail:"Pune combines Maratha history, university life and easy access to the forts and monsoon valleys of the Sahyadris." },
  { name:"Goa",state:"Goa",lat:15.49,lon:73.83,biome:"coast",symbol:"KONKAN",story:"A small state with a long musical memory",detail:"Goa's identity blends Konkani traditions, Portuguese-era streets, laterite villages and India's enduring love of live bands." },
  { name:"Bengaluru",state:"Karnataka",lat:12.97,lon:77.59,biome:"plains",symbol:"GARDEN CITY",story:"New ideas in an old garden city",detail:"Bengaluru's parks, neighbourhood cafés, music scene and technology culture sit on a cool plateau above the southern plains." },
  { name:"Hyderabad",state:"Telangana",lat:17.39,lon:78.49,biome:"plains",symbol:"CHARMINAR",story:"Granite hills, minarets and biryani",detail:"Hyderabad's old bazaars, Deccani culture and lake-framed modern districts give the city a distinctive double rhythm." },
  { name:"Chennai",state:"Tamil Nadu",lat:13.08,lon:80.27,biome:"coast",symbol:"MARINA",story:"A coastal capital tuned to classical rhythm",detail:"Chennai is a centre of Carnatic music, Tamil cinema, temple culture and one of the world's longest urban beaches." },
  { name:"Kolkata",state:"West Bengal",lat:22.57,lon:88.36,biome:"plains",symbol:"HOWRAH",story:"Books, trams and a wide river",detail:"Kolkata's literary life, markets, colonial avenues and Durga Puja traditions make it one of India's great cultural capitals." },
  { name:"Bhubaneswar",state:"Odisha",lat:20.30,lon:85.82,biome:"plains",symbol:"TEMPLE CITY",story:"Ancient stone temples in a planned capital",detail:"Bhubaneswar pairs Kalinga temple architecture with broad modern avenues and serves as a gateway to Puri and Konark." },
  { name:"Kochi",state:"Kerala",lat:9.93,lon:76.27,biome:"coast",symbol:"FORT KOCHI",story:"A harbour city facing many worlds",detail:"Kochi's spice-trade history lives in waterfront warehouses, synagogues, churches, ferries and the arts spaces of Fort Kochi." },
  { name:"Munnar",state:"Kerala",lat:10.09,lon:77.06,biome:"alpine",symbol:"TEA HILLS",story:"Tea gardens folded over green mountains",detail:"Munnar's high plantations, shola forests and misty roads climb through the Western Ghats toward Eravikulam." },
  { name:"Mysuru",state:"Karnataka",lat:12.30,lon:76.64,biome:"plains",symbol:"MYSORE PALACE",story:"A royal city of markets and music",detail:"Mysuru is known for its illuminated palace, Dasara celebrations, sandalwood craft and graceful avenues beneath Chamundi Hill." },
  { name:"Hampi",state:"Karnataka",lat:15.34,lon:76.46,biome:"desert",symbol:"VIJAYANAGARA",story:"Ruins scattered through a boulder landscape",detail:"Hampi's temples, bazaars and royal enclosures preserve the scale of Vijayanagara amid surreal granite hills." },
  { name:"Ooty",state:"Tamil Nadu",lat:11.41,lon:76.70,biome:"alpine",symbol:"NILGIRIS",story:"A cool hill town reached by toy train",detail:"Ooty sits among Nilgiri tea, eucalyptus groves and high meadows, connected to the plains by a historic mountain railway." },
  { name:"Guwahati",state:"Assam",lat:26.14,lon:91.74,biome:"valley",symbol:"BRAHMAPUTRA",story:"A river city beneath blue-green hills",detail:"Guwahati stretches along the Brahmaputra, with Kamakhya Temple above the city and ferries crossing its immense river." },
  { name:"Patna",state:"Bihar",lat:25.61,lon:85.14,biome:"plains",symbol:"GANGA",story:"An ancient capital on the southern Ganga",detail:"Patna stands near the site of Pataliputra and connects Buddhist, Sikh and Mauryan histories along one of India's great rivers." },
  { name:"Ranchi",state:"Jharkhand",lat:23.34,lon:85.31,biome:"forest",symbol:"WATERFALLS",story:"A plateau city ringed by waterfalls",detail:"Ranchi sits on the forested Chota Nagpur Plateau, close to Hundru, Dassam and Jonha falls." },
  { name:"Bhopal",state:"Madhya Pradesh",lat:23.26,lon:77.41,biome:"lake",symbol:"UPPER LAKE",story:"A city of lakes and wooded hills",detail:"Bhopal spreads between two large lakes, with a historic old quarter and the nearby prehistoric shelters of Bhimbetka." },
  { name:"Indore",state:"Madhya Pradesh",lat:22.72,lon:75.86,biome:"plains",symbol:"RAJWADA",story:"A trading city with an all-night appetite",detail:"Indore is known for Holkar-era Rajwada, textile markets and the celebrated street-food lanes of Sarafa." },
  { name:"Raipur",state:"Chhattisgarh",lat:21.25,lon:81.63,biome:"plains",symbol:"CENTRAL INDIA",story:"A central gateway to forests and craft",detail:"Raipur links the plains of Chhattisgarh with tribal art traditions, forest regions and the planned city of Naya Raipur." },
  { name:"Surat",state:"Gujarat",lat:21.17,lon:72.83,biome:"coast",symbol:"TAPI",story:"A river port built on trade and sparkle",detail:"Surat grew as a historic port and remains renowned for textiles, diamond cutting and energetic Gujarati food culture." },
  { name:"Nashik",state:"Maharashtra",lat:20.01,lon:73.79,biome:"valley",symbol:"GODAVARI",story:"Vineyards and temples beside the Godavari",detail:"Nashik combines sacred river ghats, ancient cave sites and the vineyard country of the northern Western Ghats." },
  { name:"Puri",state:"Odisha",lat:19.81,lon:85.83,biome:"coast",symbol:"JAGANNATH",story:"A pilgrimage city facing the Bay of Bengal",detail:"Puri is centred on the Jagannath Temple and a long beach, with Konark's Sun Temple nearby along the coast." },
  { name:"Visakhapatnam",state:"Andhra Pradesh",lat:17.69,lon:83.22,biome:"coast",symbol:"EASTERN GHATS",story:"A harbour between green hills and sea",detail:"Visakhapatnam curves around the Bay of Bengal where the Eastern Ghats reach the coast, with beaches and hilltop viewpoints." },
  { name:"Puducherry",state:"Puducherry",lat:11.94,lon:79.83,biome:"coast",symbol:"PROMENADE",story:"Tamil streets meet a French seaside grid",detail:"Puducherry's shaded boulevards, Tamil quarter, ashram and long promenade create a distinct coastal atmosphere." },
  { name:"Madurai",state:"Tamil Nadu",lat:9.93,lon:78.12,biome:"plains",symbol:"MEENAKSHI",story:"A temple city alive with colour",detail:"Madurai has grown around the towering gopurams of Meenakshi Temple and one of South India's oldest continuous urban traditions." },
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
function timeMoodFor(hour:number):TimeMood { if(hour<5)return"midnight"; if(hour>=15&&hour<21)return"evening"; if(hour>=21)return"night"; return"day"; }
function weatherLabel(mood:WeatherMood){ return {clear:"Clear skies",rain:"Rain on the road",summer:"Warm & bright",winter:"Cold mountain air"}[mood]; }
function routeScore(city:City, start:City, end:City){
  const ax=start.lon, ay=start.lat, bx=end.lon, by=end.lat, px=city.lon, py=city.lat;
  const length=(bx-ax)**2+(by-ay)**2||1;
  const t=Math.max(0,Math.min(1,((px-ax)*(bx-ax)+(py-ay)*(by-ay))/length));
  const x=ax+t*(bx-ax), y=ay+t*(by-ay);
  return { city, t, distance:Math.hypot(px-x,py-y)+(t===0||t===1?3:0) };
}

function stopsFromRoad(coordinates:number[][],start:City,end:City){
  if(coordinates.length<2)return[];
  const step=Math.max(1,Math.floor(coordinates.length/600));
  return cities.filter(city=>city.name!==start.name&&city.name!==end.name).map(city=>{
    let best=Infinity,bestIndex=0;
    for(let index=0;index<coordinates.length;index+=step){const [lon,lat]=coordinates[index];const adjustedLon=(lon-city.lon)*Math.cos(city.lat*Math.PI/180);const distance=Math.hypot(adjustedLon,lat-city.lat);if(distance<best){best=distance;bestIndex=index;}}
    return{city,distance:best,index:bestIndex};
  }).filter(item=>item.distance<.48).sort((a,b)=>a.index-b.index).filter((item,index,array)=>index===0||item.city.name!==array[index-1].city.name).slice(0,10).map(item=>item.city);
}

function terrainForRoute(start:City,end:City,stops:City[]):RouteTerrain{
  const mountainStates=["Himachal Pradesh","Jammu & Kashmir","Ladakh","Uttarakhand","Sikkim","Arunachal Pradesh"];
  const route=[start,...stops,end];
  const mountainScore=route.filter(city=>mountainStates.includes(city.state)||["snow","alpine","high-desert","valley"].includes(city.biome)).length;
  const desertScore=route.filter(city=>city.state==="Rajasthan"||city.biome==="desert").length;
  if(mountainStates.includes(start.state)||mountainStates.includes(end.state)||mountainScore>=Math.max(2,Math.ceil(route.length*.35)))return "mountains";
  if(start.state==="Rajasthan"||end.state==="Rajasthan"||desertScore>=Math.max(2,Math.ceil(route.length*.4)))return "deserts";
  return "plains";
}

function CityPicker({label,value,exclude,onChange}:{label:string;value:string;exclude:string;onChange:(city:string)=>void}){
  const [open,setOpen]=useState(false); const [query,setQuery]=useState("");
  const matches=cities.filter(city=>city.name!==exclude&&`${city.name} ${city.state}`.toLowerCase().includes(query.toLowerCase())).slice(0,12);
  const chosen=cities.find(city=>city.name===value);
  return <div className="city-picker"><label>{label}</label><button className="picker-button" type="button" onClick={()=>{setOpen(true);setQuery("")}} aria-haspopup="listbox" aria-expanded={open}><span>{chosen?.name}</span><small>{chosen?.state}</small><i>⌄</i></button>{open&&<div className="picker-popover"><div className="picker-search"><span>⌕</span><input autoFocus value={query} onChange={event=>setQuery(event.target.value)} onBlur={()=>window.setTimeout(()=>setOpen(false),180)} placeholder="Search any city…" aria-label={`Search ${label.toLowerCase()} city`}/></div><div className="picker-list" role="listbox">{matches.length?matches.map(city=><button type="button" key={city.name} onMouseDown={event=>event.preventDefault()} onClick={()=>{onChange(city.name);setOpen(false)}}><span>{city.name}</span><small>{city.state}</small></button>):<p>No city found</p>}</div></div>}</div>;
}

export default function Home(){
  const [from,setFrom]=useState("Delhi"); const [to,setTo]=useState("Leh"); const [now,setNow]=useState(()=>new Date(0));
  const [playing,setPlaying]=useState(false); const [progress,setProgress]=useState(0); const [currentSeconds,setCurrentSeconds]=useState(0);
  const [playerReady,setPlayerReady]=useState(false); const [playbackError,setPlaybackError]=useState("");
  const [weather,setWeather]=useState<WeatherMood>("clear"); const [temperature,setTemperature]=useState(14); const [storyIndex,setStoryIndex]=useState(0); const [listeners,setListeners]=useState(1);
  const [routeStops,setRouteStops]=useState<City[]>([]); const [routeDistance,setRouteDistance]=useState(0); const [routeLoading,setRouteLoading]=useState(true); const [roadRoute,setRoadRoute]=useState(true);
  const [trackCursor,setTrackCursor]=useState(0); const [busStopIndex,setBusStopIndex]=useState(0);
  const [playbackMood,setPlaybackMood]=useState<TimeMood>("day");
  const [playlistTrack,setPlaylistTrack]=useState({title:"Raahi Radio",artist:"Your YouTube playlist"});
  const [roomId,setRoomId]=useState(""); const [isRoomHost,setIsRoomHost]=useState(false); const [shareStatus,setShareStatus]=useState("Invite someone to ride along");
  const youtubeMount=useRef<HTMLDivElement>(null); const youtubePlayer=useRef<YouTubePlayer|null>(null); const wantsPlayback=useRef(false);
  const routeStopCount=useRef(0); const journeyAdvancing=useRef(false); const selectionInitialized=useRef(false); const roomOwnerId=useRef(""); const guestRoom=useRef(false); const copiedUntil=useRef(0); const roomSnapshot=useRef({routeFrom:from,routeTo:to,trackCursor:0,playing:false,positionSeconds:0});
  const origin=cities.find(city=>city.name===from)??cities[0]; const destination=cities.find(city=>city.name===to)??cities[16];
  const hour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(now)); const visualMood=timeMoodFor(hour); const mood=playbackMood;
  const trackList=playlists[mood]; const track=trackList[trackCursor%trackList.length];
  const activePlaylistId=TIME_PLAYLISTS[mood]; const usesYouTubePlaylist=Boolean(activePlaylistId); const playlistLabel={day:"Daytime Hindi",evening:"Evening love playlist",night:"Night party playlist",midnight:"Midnight ghazals"}[mood];
  const playerKey=activePlaylistId?`playlist-${activePlaylistId}`:track.youtubeId; const displayTitle=usesYouTubePlaylist?playlistTrack.title:track.title; const displayArtist=usesYouTubePlaylist?playlistTrack.artist:track.artist;
  const stories=useMemo(()=>[
    { kicker:`DESTINATION · ${destination.state}`,title:destination.name,subtitle:destination.story,body:destination.detail },
    ...routeStops.map((city,index)=>({kicker:`STOP ${pad(index+1)} OF ${pad(routeStops.length)} · ${city.state}`,title:city.name,subtitle:city.story,body:city.detail})),
    { kicker:"ON THIS SONG",title:displayTitle,subtitle:usesYouTubePlaylist?`${displayArtist} · ${playlistLabel}`:`${track.artist} · ${track.film}`,body:usesYouTubePlaylist?`Selected from your dedicated ${playlistLabel.toLowerCase()} on YouTube.`:track.fact },
  ],[destination,routeStops,track,displayTitle,displayArtist,usesYouTubePlaylist,playlistLabel]);
  const activeStory=stories[storyIndex%stories.length];
  const busProgress=Math.min(100,((busStopIndex+progress/100)/(routeStops.length+1))*100);
  const routeTerrain=useMemo(()=>terrainForRoute(origin,destination,routeStops),[origin,destination,routeStops]);

  useEffect(()=>{const current=new Date();setNow(current);if(!selectionInitialized.current){selectionInitialized.current=true;const currentHour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(current)),currentMood=timeMoodFor(currentHour);setPlaybackMood(currentMood);const joined=new URLSearchParams(window.location.search).get("room");if(!joined){const sequenceKey=`raahi-sequence-${TIME_PLAYLISTS[currentMood]||currentMood}`,previous=Number(localStorage.getItem(sequenceKey)??-1),next=Number.isFinite(previous)?previous+1:0;localStorage.setItem(sequenceKey,String(next));setTrackCursor(next);}}const timer=window.setInterval(()=>setNow(new Date()),30000); return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{let sessionId=sessionStorage.getItem("raahi-listener");if(!sessionId){sessionId=crypto.randomUUID();sessionStorage.setItem("raahi-listener",sessionId);}const heartbeat=()=>fetch("/api/listeners",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({sessionId})}).then(response=>response.json()).then(data=>setListeners(Math.max(1,Number(data.count)||1))).catch(()=>{});heartbeat();const timer=window.setInterval(heartbeat,30000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{const joined=new URLSearchParams(window.location.search).get("room")?.replace(/[^a-zA-Z0-9_-]/g,"").slice(0,32)||"";if(!joined)return;const owner=sessionStorage.getItem(`raahi-room-${joined}`)||"";roomOwnerId.current=owner;setRoomId(joined);setIsRoomHost(Boolean(owner));setShareStatus(owner?"Your shared journey is live":"Joining your co-passenger…");},[]);
  useEffect(()=>{guestRoom.current=Boolean(roomId&&!isRoomHost);roomSnapshot.current={routeFrom:from,routeTo:to,trackCursor,playing,positionSeconds:currentSeconds};},[roomId,isRoomHost,from,to,trackCursor,playing,currentSeconds]);
  useEffect(()=>{if(!roomId||isRoomHost)return;let cancelled=false;const sync=()=>fetch(`/api/rooms?room=${encodeURIComponent(roomId)}`).then(response=>{if(!response.ok)throw new Error("Room unavailable");return response.json();}).then(data=>{if(cancelled)return;const syncedCursor=Number(data.trackCursor)||0;setFrom(data.routeFrom);setTo(data.routeTo);setTrackCursor(syncedCursor);setBusStopIndex(Math.min(syncedCursor,routeStopCount.current+1));const target=Math.max(0,Number(data.positionSeconds)||0)+(data.playing?Math.max(0,(Date.now()-Number(data.updatedAt||Date.now()))/1000):0);const player=youtubePlayer.current;const currentHour=Number(new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Kolkata",hour:"2-digit",hour12:false}).format(new Date()));const syncedPlaylist=TIME_PLAYLISTS[timeMoodFor(currentHour)];if(player&&syncedPlaylist&&player.getPlaylistIndex()!==syncedCursor)player.cuePlaylist({listType:"playlist",list:syncedPlaylist,index:syncedCursor,startSeconds:target});else if(player&&typeof player.getCurrentTime==="function"&&Math.abs(player.getCurrentTime()-target)>2.5)player.seekTo(target,true);if(data.playing&&wantsPlayback.current)player?.playVideo();if(!data.playing)player?.pauseVideo();if(Date.now()>copiedUntil.current)setShareStatus(data.playing?(wantsPlayback.current?"Listening together · synced":"Tap play to join the live song"):"Co-passenger connected · paused");}).catch(()=>{if(!cancelled&&Date.now()>copiedUntil.current)setShareStatus("Shared journey is unavailable");});sync();const timer=window.setInterval(sync,2500);return()=>{cancelled=true;window.clearInterval(timer);};},[roomId,isRoomHost]);
  useEffect(()=>{if(!roomId||!isRoomHost)return;const update=()=>{const state=roomSnapshot.current;fetch("/api/rooms",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"update",roomId,ownerId:roomOwnerId.current,...state})}).catch(()=>{});};update();const timer=window.setInterval(update,2000);return()=>window.clearInterval(timer);},[roomId,isRoomHost]);
  useEffect(()=>{routeStopCount.current=routeStops.length;},[routeStops.length]);
  useEffect(()=>{
    const controller=new AbortController(); setRouteLoading(true); setBusStopIndex(0);
    const fallback=()=>{const estimated=cities.filter(city=>city.name!==from&&city.name!==to).map(city=>routeScore(city,origin,destination)).filter(item=>item.distance<.55).sort((a,b)=>a.distance-b.distance).slice(0,10).sort((a,b)=>a.t-b.t).map(item=>item.city);setRouteStops(estimated);setRoadRoute(false);setRouteDistance(0);setRouteLoading(false);};
    fetch(`https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=false`,{signal:controller.signal}).then(response=>{if(!response.ok)throw new Error("route unavailable");return response.json();}).then(data=>{const route=data.routes?.[0];if(!route?.geometry?.coordinates)throw new Error("route unavailable");setRouteStops(stopsFromRoad(route.geometry.coordinates,origin,destination));setRouteDistance(Math.round(route.distance/1000));setRoadRoute(true);setRouteLoading(false);}).catch(error=>{if(error.name!=="AbortError")fallback();});
    return()=>controller.abort();
  },[from,to,origin,destination]);
  useEffect(()=>{ setStoryIndex(0); },[from,to,playerKey]);
  useEffect(()=>{ const readingMs=Math.min(30000,Math.max(20000,18000+activeStory.body.length*45)); const timer=window.setTimeout(()=>setStoryIndex(value=>(value+1)%stories.length),readingMs); return()=>window.clearTimeout(timer); },[activeStory,stories.length]);

  useEffect(()=>{
    if(!youtubeMount.current)return; let cancelled=false;
    const createPlayer=()=>{ if(cancelled||!window.YT||!youtubeMount.current)return; if(typeof youtubePlayer.current?.destroy==="function")youtubePlayer.current.destroy();
      const playerVars:Record<string,number|string>={controls:0,playsinline:1,rel:0,fs:0,disablekb:1,origin:window.location.origin};if(activePlaylistId){playerVars.listType="playlist";playerVars.list=activePlaylistId;playerVars.index=trackCursor;}
      youtubePlayer.current=new window.YT.Player(youtubeMount.current,{height:"200",width:"200",videoId:activePlaylistId?"":track.youtubeId,playerVars,events:{
        onReady:()=>{journeyAdvancing.current=false;setPlayerReady(true);setPlaybackError("");const player=youtubePlayer.current;if(activePlaylistId&&player){const playlist=player.getPlaylist();if(playlist.length&&trackCursor>=playlist.length){const normalized=trackCursor%playlist.length;localStorage.setItem(`raahi-sequence-${activePlaylistId}`,String(normalized));setTrackCursor(normalized);player.cuePlaylist({listType:"playlist",list:activePlaylistId,index:normalized,startSeconds:0});}}if(wantsPlayback.current)player?.playVideo();},
        onStateChange:({data})=>{if(data===1&&journeyAdvancing.current){youtubePlayer.current?.pauseVideo();setPlaying(false);return;}setPlaying(data===1);if(data===1&&activePlaylistId){const video=youtubePlayer.current?.getVideoData();if(video?.title)setPlaylistTrack({title:video.title,artist:video.author||"YouTube"});}if(data===0&&!journeyAdvancing.current){journeyAdvancing.current=true;wantsPlayback.current=false;youtubePlayer.current?.stopVideo();setPlaying(false);setProgress(100);setPlaybackError("Song complete · refresh for the next one");if(!guestRoom.current)setBusStopIndex(value=>Math.min(value+1,routeStopCount.current+1));}},
        onError:()=>{setPlaying(false);setPlaybackError("Unavailable from YouTube in your region.");},
      }});
    };
    if(window.YT?.Player)createPlayer(); else { window.onYouTubeIframeAPIReady=createPlayer; if(!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')){const script=document.createElement("script");script.src="https://www.youtube.com/iframe_api";script.async=true;document.head.appendChild(script);} }
    return()=>{cancelled=true;if(typeof youtubePlayer.current?.destroy==="function")youtubePlayer.current.destroy();youtubePlayer.current=null;setPlayerReady(false);};
  },[playerKey]);
  useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{const player=youtubePlayer.current;if(typeof player?.getCurrentTime!=="function"||typeof player?.getDuration!=="function")return;const current=player.getCurrentTime(),duration=player.getDuration();setCurrentSeconds(current);if(duration>0)setProgress(current/duration*100);},1000);return()=>window.clearInterval(timer);},[playing]);
  const togglePlayback=()=>{if(journeyAdvancing.current){setPlaybackError("Song complete · refresh for the next one");return;}setPlaybackError("");wantsPlayback.current=!playing;if(!playerReady){setPlaying(true);return;}if(playing)youtubePlayer.current?.pauseVideo();else youtubePlayer.current?.playVideo();};
  const inviteCoPassenger=async()=>{try{let activeRoom=roomId;if(!activeRoom){activeRoom=crypto.randomUUID().replace(/-/g,"").slice(0,12);const owner=crypto.randomUUID();roomOwnerId.current=owner;await fetch("/api/rooms",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"create",roomId:activeRoom,ownerId:owner,routeFrom:from,routeTo:to,trackCursor,playing,positionSeconds:youtubePlayer.current?.getCurrentTime?.()||currentSeconds})}).then(response=>{if(!response.ok)throw new Error("Could not create journey");});sessionStorage.setItem(`raahi-room-${activeRoom}`,owner);setRoomId(activeRoom);setIsRoomHost(true);window.history.replaceState({},"",`${window.location.pathname}?room=${activeRoom}`);}const shareUrl=`${window.location.origin}${window.location.pathname}?room=${activeRoom}`;try{await navigator.clipboard.writeText(shareUrl);}catch{const field=document.createElement("textarea");field.value=shareUrl;field.style.position="fixed";field.style.opacity="0";document.body.appendChild(field);field.select();document.execCommand("copy");field.remove();}copiedUntil.current=Date.now()+6000;setShareStatus("LINK COPIED · send it to your co-passenger");}catch{setShareStatus("Could not copy the invite link");}};

  useEffect(()=>{const controller=new AbortController();fetch(`https://api.open-meteo.com/v1/forecast?latitude=${destination.lat}&longitude=${destination.lon}&current=temperature_2m,weather_code&timezone=auto`,{signal:controller.signal}).then(r=>r.json()).then(data=>{const temp=Math.round(data.current?.temperature_2m??14),code=Number(data.current?.weather_code??0);setTemperature(temp);if((code>=51&&code<=67)||(code>=80&&code<=99))setWeather("rain");else if(temp>=33)setWeather("summer");else if(temp<=10)setWeather("winter");else setWeather("clear");}).catch(()=>setWeather(destination.biome==="snow"||destination.biome==="high-desert"?"winter":"clear"));return()=>controller.abort();},[destination]);
  const timeLabel=useMemo(()=>new Intl.DateTimeFormat("en-IN",{timeZone:"Asia/Kolkata",hour:"numeric",minute:"2-digit",hour12:true}).format(now).toLowerCase(),[now]);
  const moodCopy={day:"Open-road Hindi",evening:"80s, 90s & love",night:"Night bus party",midnight:"After-hours ghazals"}[mood];

  return <main className={`journey ${visualMood} ${weather} biome-${destination.biome}`}>
    <video className="route-video" key={routeTerrain} autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src={`/${routeTerrain}.mp4`} type="video/mp4"/></video>
    <div className="sky-glow"/><div className="weather-layer" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
    <header className="topbar"><a className="brand" href="#top" aria-label="Raahi Radio home"><span>राही</span> RADIO</a><div className="status"><span className="live-dot"/> {listeners} {listeners===1?"LISTENER":"LISTENERS"} LIVE</div><div className="conditions"><span>{timeLabel}</span><span className="divider"/>{temperature}° · {weatherLabel(weather)}</div></header>

    <section className="hero" id="top"><p className="eyebrow">THE MUSIC BETWEEN PLACES</p><h1>Every road<br/><em>has a story.</em></h1><p className="intro">A living bus radio shaped by your route, the hour, the weather and every remarkable place in between.</p>
      <div className="route-card"><CityPicker label="DEPARTING" value={from} exclude={to} onChange={setFrom}/><div className="route-line"><span className="bus">BUS</span><span/></div><CityPicker label="ARRIVING" value={to} exclude={from} onChange={setTo}/></div>
      <div className="route-ribbon" aria-label="Places along this route"><span className="route-end">{origin.name}</span><div className="route-track"><span className={`moving-bus ${playing?"is-moving":""}`} style={{left:`${busProgress}%`}}>BUS</span><div className="route-stops">{routeStops.map((city,index)=><button className={busStopIndex===index+1?"current":busStopIndex>index+1?"passed":""} key={city.name} onClick={()=>setStoryIndex(index+1)} aria-label={`Read about ${city.name}`}><i/><span>{city.name}</span></button>)}</div></div><span className="route-end">{destination.name}</span><p className="route-summary">{routeLoading?"Finding the best road…":roadRoute?`${routeDistance.toLocaleString("en-IN")} km road journey · ${routeStops.length} notable stops`:`Estimated corridor · ${routeStops.length} notable stops`}</p></div>
    </section>

    <aside className="story-card" aria-live="polite"><div className="story-top"><p className="card-kicker">{activeStory.kicker.toUpperCase()}</p><span>{pad(storyIndex+1)} / {pad(stories.length)}</span></div><div className="story-copy" key={`${storyIndex}-${activeStory.title}`}><h2>{activeStory.title}</h2><h3>{activeStory.subtitle}</h3><p>{activeStory.body}</p></div><div className="story-controls"><button onClick={()=>setStoryIndex(value=>(value-1+stories.length)%stories.length)} aria-label="Previous story">←</button><div className="story-dots">{stories.map((_,index)=><button key={index} className={index===storyIndex?"active":""} onClick={()=>setStoryIndex(index)} aria-label={`Show story ${index+1}`}/>)}</div><button onClick={()=>setStoryIndex(value=>(value+1)%stories.length)} aria-label="Next story">→</button></div><div className="reading-line" key={`timer-${storyIndex}`}/></aside>

    <aside className="co-passenger" aria-label="Invite a co-passenger"><span>TRAVEL TOGETHER</span><strong>ADD YOUR FAVOURITE<br/>CO-PASSENGER</strong><p aria-live="polite">{shareStatus}</p><button type="button" onClick={inviteCoPassenger}>{roomId?"COPY INVITE LINK":"CREATE & COPY INVITE"} ↗</button></aside>
    <section className={`player ${journeyAdvancing.current?"song-complete":""}`} aria-label="Now playing"><div className="youtube-stage" style={{"--cover":track.color} as React.CSSProperties}><div ref={youtubeMount}/></div><div className="track"><div className="track-heading"><div><p>{displayTitle}</p><span>{displayArtist}{usesYouTubePlaylist?` · ${playlistLabel}`:` · ${track.film}`}</span></div><span className="daily">{mood==="midnight"?"YOUR GHAZALS":mood==="night"?"YOUR PARTY MIX":mood==="evening"?"YOUR EVENING MIX":"TODAY’S PICK"}</span></div><div className="progress"><i style={{width:`${progress}%`}}/></div><div className="track-meta"><span>{Math.floor(currentSeconds/60)}:{pad(Math.floor(currentSeconds)%60)} · YouTube</span><span>{playbackError||moodCopy}</span></div></div><button className={`play ${playing?"is-playing":""}`} onClick={togglePlayback} aria-label={playing?"Pause YouTube playback":"Play from YouTube"}><span/></button><div className="fact"><span>NO SKIPS · REFRESH ADVANCES</span><p>{journeyAdvancing.current?"This stop is complete. Refresh the page when you are ready for the next song.":usesYouTubePlaylist?`Now playing from your dedicated ${playlistLabel.toLowerCase()}.`:track.fact}</p></div></section>
    <footer><span>No skips. No repeats. Just the road.</span><span>{routeTerrain.toUpperCase()} ROUTE · {routeStops.length} STORIES EN ROUTE · {destination.state.toUpperCase()}</span></footer>
  </main>;
}
