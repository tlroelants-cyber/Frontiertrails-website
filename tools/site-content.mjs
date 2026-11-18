/* ==============================================
   FRONTIER TRAILS — site-content.mjs
   All copy for the generated pages, in one place.
   Agreed text lives in HQ/Website/Pages/*.md — keep the two in sync.
   Facts still to confirm carry a [CHECK] note in `check`, which never
   renders on the page; build-pages.mjs prints them as a to-do list.
   Rules: soft-road, never "off-road" as a description; never the car's
   brand or model; never an invented fact.
   ============================================== */

export const SITE = {
  origin: 'https://www.frontiertrails.es',
  email: 'hello@frontiertrails.es',
  instagram: 'https://www.instagram.com/frontiertrails_/',
  formspree: 'https://formspree.io/f/mqeyjwdv',
  launch: 'spring 2027',
};

/* ── The six landscapes ──
   Each landscape is one region with its own page. `lonlat` is where the
   map camera centres when the landscape opens. Badge positions, outlines
   and the named spots on the map live in FRONTIER_MAP below. */
export const LANDSCAPES = [
  {
    slug: 'pyrenees',
    landscape: 'The High Mountains',
    place: 'The Pyrenees',
    region: 'Catalonia and Aragón',
    line: 'High peaks, mountain lakes and villages where the road runs out.',
    acts: ['Hiking', 'Via ferrata', 'Climbing', 'Mountain biking'],
    lonlat: [0.6, 42.6],
    title: 'Pyrenees Road Trip with a Rooftop Tent | Frontier Trails',
    description: 'The Spanish Pyrenees by 4x4: Ordesa, Aigüestortes, Mont-rebei and the Montsec dark-sky area. What to do, where to go and the best season.',
    why: [
      'The Pyrenees are the mountain wall between Spain and France, topped by Aneto at 3,404 metres. On the Spanish side you get two national parks, high lakes, stone villages and valleys that empty out once you leave the main road.',
      'Below the high peaks, the pre-Pyrenees add deep gorges and some of the darkest night skies in Catalonia.',
    ],
    todo: [
      { activity: 'Hiking', items: [
        { name: 'Ordesa valley and the Cola de Caballo', what: 'The classic day walk in Ordesa y Monte Perdido National Park: up the valley through beech forest to the horsetail waterfall at the head of the canyon.', practical: 'A full day, long but not technical. In summer the valley is reached by shuttle bus from Torla.', check: 'Summer shuttle bus from Torla, and its dates' },
        { name: 'Estany de Sant Maurici', what: 'A mountain lake under the twin Encantats peaks, in Aigüestortes i Estany de Sant Maurici National Park.', practical: 'Easy walking around the lake. Private cars can only go so far, and park taxis run from Espot.', check: 'Car access limit and park taxis from Espot' },
      ] },
      { activity: 'Gorges and kayaking', items: [
        { name: 'Congost de Mont-rebei', what: 'A path cut into the wall of a gorge, high above a turquoise river. Kayaks go through it below.', practical: 'Half a day. Parking can need a reservation in busy periods.', check: 'Parking reservation system' },
      ] },
      { activity: 'Stargazing', items: [
        { name: 'Montsec', what: 'A certified Starlight area in the pre-Pyrenees, known for its dark skies.', practical: 'Park, open the tent and look up. Clear, moonless nights are best.', check: 'Starlight certification wording' },
      ] },
      { activity: 'Climbing and mountaineering', items: [
        { name: 'Aneto', what: 'The highest peak of the Pyrenees, at 3,404 metres.', practical: 'A serious glacier climb: for experienced mountaineers, or with a guide.' },
      ] },
    ],
    season: 'June to October for the high trails. From late autumn to spring the high ground is under snow.',
  },
  {
    slug: 'bardenas-reales',
    landscape: 'The Desert',
    place: 'Bardenas Reales',
    region: 'Navarra',
    line: 'Yes, Spain has a desert. Clay towers, gravel tracks and huge night skies.',
    acts: ['Stargazing', 'Gravel tracks', 'Photography', 'Mountain biking'],
    lonlat: [-1.54, 42.2],
    title: 'Bardenas Reales by 4x4: A Desert Guide | Frontier Trails',
    description: "Bardenas Reales, the semi-desert in Navarra: Castildetierra, the Bardena Blanca and the rules for driving the park's gravel tracks. Best season and what to do.",
    why: [
      "A semi-desert of clay, gypsum and sandstone in the south of Navarra, protected as a natural park and a UNESCO Biosphere Reserve. Wind and water have carved it into towers, flat-topped hills and dry gullies.",
      'It feels like nowhere else in Europe, and it is driveable on gravel tracks.',
    ],
    todo: [
      { activity: 'Viewpoints and photography', items: [
        { name: 'Castildetierra', what: 'The clay chimney everyone photographs, in the white heart of the park.', practical: 'Go an hour before sunset, when the towers start to glow. Stay on the track and keep your distance from the tower.' },
      ] },
      { activity: 'Gravel tracks', items: [
        { name: 'The Bardena Blanca loop', what: 'A gravel loop through the white, most eroded part of the park.', practical: 'Vehicles may only use the marked tracks, and only during opening hours. A military firing range sits in the middle of the park and is off limits.', check: 'Opening hours, track rules and the firing range' },
      ] },
      { activity: 'Stargazing', items: [
        { name: 'Night skies at the edge of the park', what: 'Big, dark skies over flat land.', practical: 'The park closes at night, so stargaze from outside it, at a legal place to stay.', check: 'Park closing time' },
      ] },
      { activity: 'Mountain biking', items: [
        { name: 'Marked cycling routes', what: 'Long gravel routes through the badlands.', practical: 'Take more water than you think, and avoid the hottest hours.', check: 'Official cycling routes' },
      ] },
    ],
    season: 'October to May. Summer days are very hot.',
  },
  {
    slug: 'monegros',
    landscape: 'The Outback',
    place: 'Los Monegros',
    region: 'Aragón',
    line: 'Long empty tracks, abandoned villages and nobody else around.',
    acts: ['Gravel tracks', 'Stargazing', 'Photography'],
    lonlat: [-0.2, 41.55],
    title: "Los Monegros: Spain's Empty Outback | Frontier Trails",
    description: 'Los Monegros in Aragón: a dry steppe of long gravel tracks, seasonal salt lakes and wide skies. What to do and the best time to go.',
    why: [
      'A dry steppe in Aragón, between Zaragoza and Lleida. Long straight tracks, low ridges, seasonal salt lakes and very few people.',
      'It is the emptiest landscape within reach of Barcelona, and that is the point.',
    ],
    todo: [
      { activity: 'Gravel tracks', items: [
        { name: 'The steppe tracks', what: 'Long, straight farm and gravel tracks across open land.', practical: 'Soft-road driving at its simplest. Respect closed gates and crops.' },
      ] },
      { activity: 'Photography', items: [
        { name: 'The salt lakes near Bujaraloz', what: 'Seasonal salt lakes that turn white as they dry out.', practical: 'Protected ground: look from the edge and stay off the crust.', check: 'Salt lakes near Bujaraloz and Sástago, and their access rules' },
      ] },
      { activity: 'Stargazing', items: [
        { name: 'Open skies', what: 'Flat land and little light pollution away from the towns.', practical: 'Moonless nights in spring and autumn.' },
      ] },
    ],
    season: 'Spring and autumn. Summers are very hot, and winter mornings can be freezing.',
    check: ['"Abandoned villages" in the landscape line: confirm, or change the line'],
  },
  {
    slug: 'garrotxa',
    landscape: 'Volcanoes & Forests',
    place: 'La Garrotxa',
    region: 'Catalonia',
    line: 'Old volcanoes under beech forest, an easy drive from Barcelona.',
    acts: ['Hiking', 'Mountain biking', 'Good food'],
    lonlat: [2.5, 42.15],
    title: 'La Garrotxa: Volcanoes an Hour from Barcelona | Frontier Trails',
    description: "La Garrotxa's volcanic zone near Olot: the Croscat volcano, the Fageda d'en Jordà beech forest, Santa Margarida crater and Castellfollit de la Roca.",
    why: [
      'La Garrotxa Volcanic Zone Natural Park, around Olot in Girona province, holds dozens of old volcanic cones, now covered in oak and beech forest.',
      'Easy walking, green all year, and close enough to Barcelona for a first night out.',
    ],
    todo: [
      { activity: 'Hiking', items: [
        { name: 'Volcà del Croscat', what: 'A volcano cut open by old quarrying, so you can see inside the cone.', practical: 'Short, easy walk on marked paths.' },
        { name: "Fageda d'en Jordà", what: 'A beech forest growing on an old lava flow.', practical: 'Beautiful in autumn, when the beeches turn.' },
        { name: 'Volcà de Santa Margarida', what: 'A wide crater with a small chapel in the middle.', practical: 'A short climb from the parking area.' },
      ] },
      { activity: 'Viewpoints', items: [
        { name: 'Castellfollit de la Roca', what: 'A village built on the edge of a basalt cliff.', practical: 'Best seen from the road below the cliff.' },
      ] },
    ],
    season: 'All year. Spring and autumn are best.',
  },
  {
    slug: 'sierra-de-guara',
    landscape: 'Gorges & Rivers',
    place: 'Sierra de Guara',
    region: 'Aragón',
    line: 'Turquoise rivers, deep canyons and a medieval village on a cliff.',
    acts: ['Canyoning', 'Kayaking', 'Via ferrata', 'Hiking'],
    lonlat: [-0.05, 42.27],
    title: 'Sierra de Guara: Canyoning in Spain | Frontier Trails',
    description: 'Sierra de Guara in Aragón: canyoning, the Río Vero walkways at Alquézar and the climbing village of Rodellar. What to do and the best season.',
    why: [
      'Sierra y Cañones de Guara Natural Park, in Huesca: limestone gorges cut by rivers, and one of the best-known canyoning areas in Europe.',
      'Spend the day in the water, and the evening in a stone village.',
    ],
    todo: [
      { activity: 'Hiking', items: [
        { name: 'Alquézar and the Río Vero walkways', what: 'A medieval village on a cliff, and a loop on boardwalks along the river gorge below it.', practical: 'Half a day. There may be a small fee in season.', check: 'Fee for the walkways' },
      ] },
      { activity: 'Canyoning', items: [
        { name: 'The canyons of Guara', what: 'Dozens of canyons, from easy water walks to technical descents.', practical: 'Go with a local guide unless you are experienced.' },
      ] },
      { activity: 'Climbing', items: [
        { name: 'Rodellar', what: 'A small village surrounded by limestone overhangs, famous for sport climbing.', practical: 'Mostly hard routes. Best in summer, when the gorge stays cool.', check: 'Rodellar climbing season' },
      ] },
    ],
    season: 'Late spring to early autumn for canyoning. Spring and autumn for walking.',
  },
  {
    slug: 'cap-de-creus',
    landscape: 'The Wild Coast',
    place: 'Cap de Creus',
    region: 'Costa Brava, Catalonia',
    line: 'Wind, bare rock and hidden coves. Swim, paddle, hike.',
    acts: ['Kayaking', 'Snorkelling', 'Coastal hikes'],
    lonlat: [3.25, 42.3],
    title: 'Cap de Creus: The Wild Costa Brava | Frontier Trails',
    description: 'Cap de Creus Natural Park, the wild end of the Costa Brava: the lighthouse, Cadaqués, coves by kayak and coastal walks. What to do and the best season.',
    why: [
      'The eastern tip of mainland Spain, at the northern end of the Costa Brava. Cap de Creus Natural Park is bare rock shaped by the tramuntana wind, with small coves in between.',
      'Quieter and wilder than the beaches further south.',
    ],
    todo: [
      { activity: 'Viewpoints', items: [
        { name: 'Cap de Creus lighthouse', what: 'The easternmost point of mainland Spain, at the end of the road.', practical: 'Come for sunrise: it is the first in mainland Spain.' },
        { name: 'Cadaqués', what: 'A whitewashed fishing village tucked into a bay.', practical: 'Busy in August. Lovely the rest of the year.' },
      ] },
      { activity: 'Kayaking and snorkelling', items: [
        { name: 'The coves of the cape', what: 'Small rocky coves that are easiest to reach from the water.', practical: 'Go on calm days. When the tramuntana blows, stay on land.' },
      ] },
      { activity: 'Coastal hikes', items: [
        { name: 'The end of the GR 11', what: 'The long-distance trail across the Pyrenees reaches the sea here.', practical: 'Walk the last coastal stretch to the lighthouse.', check: 'GR 11 end point at Cap de Creus' },
      ] },
    ],
    season: 'May to October for swimming. Spring and autumn for walking.',
  },
];

/* ── The Frontier map ──
   The map is clean since 2026-11-17 (Tom): `badge`, `label` and `leader`
   (where each landscape's drawing and name sat) are no longer shown, kept
   only in case they come back. `pois` are
   the named spots shown once a landscape is open — the same spots as on
   its page ('left' puts a label on the left of its dot). Coordinates are approximate (to within a kilometre or so),
   good enough to place a label: [CHECK] before relying on them for more. */
export const FRONTIER_MAP = {
  barcelona: { name: 'Barcelona', note: 'Your start', lonlat: [2.17, 41.39], badge: [2.95, 41.1], label: 'right' },
  reachKm: 340,   // the "a day's drive" ring around Barcelona
  areas: {
    // No single official boundary for the Pyrenees: an approximate band from
    // Navarra to Catalonia, with the pre-Pyrenees lobe for Mont-rebei and Montsec.
    pyrenees: { badge: [1.25, 42.66], label: 'top', ring: [[-1.0, 42.95], [-0.3, 42.85], [0.3, 42.82], [0.7, 42.88], [1.4, 42.7], [2.0, 42.55], [2.6, 42.45], [2.9, 42.4], [2.85, 42.27], [2.2, 42.27], [1.6, 42.22], [1.15, 42.12], [1.0, 41.97], [0.5, 41.97], [0.4, 42.15], [0.15, 42.45], [-0.4, 42.5], [-1.0, 42.62]], pois: [
      ['Ordesa valley', [-0.06, 42.65]], ['Estany de Sant Maurici', [1.0, 42.58]], ['Aneto', [0.66, 42.63]],
      ['Congost de Mont-rebei', [0.69, 42.08]], ['Montsec', [0.74, 42.02]],
    ] },
    'bardenas-reales': { badge: [-1.66, 42.16], label: 'left', pois: [['Castildetierra', [-1.487, 42.19]], ['Bardena Blanca', [-1.47, 42.12]]] },
    monegros: { badge: [-0.35, 41.72], label: 'bottom', pois: [['Salt lakes near Bujaraloz', [-0.17, 41.45]]] },
    garrotxa: { badge: [2.53, 42.14], label: 'bottom', pois: [['Volcà del Croscat', [2.524, 42.147]], ['Volcà de Santa Margarida', [2.531, 42.135], 'left'], ['Castellfollit de la Roca', [2.547, 42.221], 'left']] },
    'sierra-de-guara': { badge: [-0.15, 42.27], label: 'top', pois: [['Alquézar', [0.025, 42.171]], ['Rodellar', [-0.084, 42.285]]] },
    'cap-de-creus': { badge: [3.75, 42.55], label: 'right', leader: true, pois: [['Cap de Creus lighthouse', [3.316, 42.319]], ['Cadaqués', [3.278, 42.289]]] },
  },
};

/* ── The Frontier (hub) ── */
export const FRONTIER = {
  title: 'The Frontier: Adventure Travel in Spain | Frontier Trails',
  description: 'The high mountains, the green north, the dry interior and the Mediterranean. Four adventure landscapes in Spain, all within reach from Barcelona.',
  label: 'Adventure travel in Spain',
  // The intro you land on: Tom's text (2026-11-17), spelling fixed only.
  // It makes people ask "really, where can I go?" and scroll to the map.
  intro: {
    heading: 'Most people only know Spain for its beaches, and its cities.',
    sub: 'Very few know it has a desert. Peaks over 3,000 metres, green Atlantic forests, beautiful rivers and gorges. All of it within reach from Barcelona.',
    ask: 'So where would you actually go?',
  },
  // The four landscapes on the main page, by biome (Tom, 2026-11-17). All of
  // Spain, not only the north-east.
  // The plateau and the dry south-east became one (Tom, 2026-11-17).
  // Outlines and zoom targets: tools/frontier-landscapes.json. `page` turns
  // on once the landscape's page exists; until then a click zooms in and
  // shows the name, with a way back.
  categories: [
    // Names and pages from Tom's specs ("Pages build/", 2026-11-17).
    { slug: 'high-mountains', name: 'The High Mountains', page: true },
    { slug: 'green-north', name: 'The Green North', page: true },
    { slug: 'dry-interior', name: 'The Dry Interior', page: true },
    { slug: 'mediterranean', name: 'The Mediterranean', page: true },
  ],
  pick: 'Where do you want to go?',
  hint: 'Pick a landscape',
  cta: 'Explore this area',
};

/* ── About (agreed text, HQ/Website/Pages/About.md) ── */
export const ABOUT = {
  // Tom's own text (2026-11-14), spelling and grammar fixed only.
  title: "About Frontier Trails: What I'm Building and Why",
  description: 'Tom on building Frontier Trails: a retro 4x4 with a rooftop tent from Barcelona, why Spain is the ideal place for this kind of travel, and the community around it.',
  h1: "What I'm building and why",
  intro: [
    "I'm Tom. I'm building Frontier Trails: a new way to explore the adventurous outdoors of Spain. We offer a retro 4x4 with a rooftop tent, overlander style. The idea is that it's fully equipped and ready to go, for any adventure.",
  ],
  sections: [
    { h: 'Why this kind of travel', p: [
      "I've travelled a lot, including camping trips, road trips and rooftop-tent trips. Travelling like this gives you a real feeling of adventure and peace at the same time. You're out in nature, exploring, and living by the day, completely self-sufficient.",
      "It also opens the door to everything else the outdoors has to offer: hiking, climbing, surfing, biking, whatever floats your boat. Then you end the day with a cold beer by the campfire, and look at the stars. It's your means of travel, your activities and your hotel in one. Full freedom.",
    ], photo: true },
    { h: 'Why here', p: [
      "When people think of a trip like this, they probably think of Australia, Africa or Central Asia. I did too.",
      "Then, when I moved to Spain, I realised what this area really has to offer. It's actually the ideal place. Within reach there are mountains, a beautiful blue sea, a desert, gorges and waterfalls, forests, old volcanoes and beautiful authentic villages worth exploring. Most of it is within a day's drive of Barcelona.",
    ], link: ['/the-frontier/', 'See the Frontier'] },
    // Title proposed by Claude: Tom hadn't chosen one yet.
    { h: 'Somewhere in between', p: [
      "The city is busy and can feel like a brick prison. An escape into nature is sometimes well deserved. If you want this today, you have two options. You can rent a car and sort out the rest yourself, or you can join a guided tour and drive in a convoy on someone else's schedule.",
      "I wanted something in between. Everything is ready at your disposal, and then you explore at your own pace. You get the car, a tent that's up in two minutes, a camp kitchen, and a suggested route fitted to your wishes.",
      "It's soft-road: gravel, forest tracks and quiet mountain roads. You don't need 4x4 experience. It starts at €180 a day.",
    ], link: ['/faq/', 'All the details in the FAQ'] },
    { h: 'Where this is going', p: [
      "I don't want this to stop at renting out a car. I want to build a community of outdoorsy, adventurous people around it: trips, activities, hikes and more, with Frontier Trails as the enabler. It will start simply, with a WhatsApp group for people near Barcelona.",
    ], link: ['/community/', 'Come along'] },
  ],
  outro: "Join the waitlist and you'll hear first when it opens. If you have a question, or think I've got something wrong, message me:",
};


/* ── FAQ (agreed text, HQ/Website/Pages/FAQ.md) ── */
export const FAQ = {
  title: 'Rooftop Tent 4x4 Rental: Price, Kit and FAQ | Frontier Trails',
  description: 'From €180 a day with everything packed: rooftop tent, camp kitchen and your route. Licence, wild camping and pickup, answered.',
  stages: [
    ['Stage 1 · Before you leave', [
      ['Can I book yet?', "First adventures are on their way, so be ready! Apply for early access and you'll hear first."],
      ['How much does it cost?', 'From €180 a day. That includes the car, the rooftop tent, a camp kitchen, your route, and endless adventure.'],
      ['What licence do I need?', 'A standard driving licence. From outside the EU, you might need an International Driving Permit for local compliance.'],
      ['Where do I pick up the car?', 'In the Barcelona area. Airport pick-up is available on request.'],
      ['What is overlanding?', "Travelling by 4x4 with everything you need on board, camping along the way. It's your travel, your activities and your hotel in one. Compared with a campervan, a 4x4 with a rooftop tent takes you further down the gravel and forest tracks."],
      ['When is the best time to go?', 'All year! Spain has a diverse climate, and its seasons open up different adventures.', ['/the-frontier/', 'See the six landscapes']],
    ]],
    ['Stage 2 · Out there', [
      ['Do I need off-road experience?', "No. It's soft-road: gravel, forest tracks and quiet mountain roads that any careful driver can handle."],
      ['How many people can it sleep?', 'Two fit in the rooftop tent, and the car seats five. Coming with more people? Extra tents are available on request.'],
      ['Can I wild camp in Spain?', "It's nuanced, and it depends on the local rules of the region."],
      ['What if something goes wrong?', "Don't worry, we're available on WhatsApp. In an emergency, you have 24/7 roadside assistance."],
    ]],
  ],
};

/* ── Journal: Tom's film stories (from his Instagram, Feb 2026) ──
   Captions as posted, lightly fixed: calm (not calmth), Sandwich, Kodak,
   one SPECS format, no emoji. Poetic voice is allowed here and only here. */
export const JOURNAL_INTRO = {
  title: 'Journal: Film Stories from the Road | Frontier Trails',
  description: "Tom's film stories from the road: mountains, deserts and the long way round, shot on 35mm.",
  h1: 'Journal',
  lede: 'Stories from the road, shot on film. Every frame is its own story.',
};

export const STORIES = [
  { slug: 'the-motherland', title: 'The Motherland', place: 'Waaihoek, South Africa', date: '2026-02-03', ig: 'DUTnXZ-lfHu',
    alt: 'A jagged mountain range with cloud spilling over the ridge, sandstone boulders and rust-orange scrub in front',
    body: ['A country so diverse and rich. A place where the stars align and everything just makes sense. It’s a place where the mountains will call to you, and won’t be shy to humble you.', 'One soft shutter click, capturing a moment with a story for another day: the hardest hike I’ve ever done.', 'This is where Frontier Trails began.'],
    specs: 'Olympus OM-1, 35mm Kodak Gold' },
  { slug: 'the-open-air', title: 'The open air', place: 'Austria', date: '2026-02-05', ig: 'DUYP0MCFe15',
    alt: 'A forest road curving away, seen through an open car window',
    body: ['The car is loaded, the engine is humming, and the world begins to move.', 'With interesting chats, old songs on the aux, and snacks within reach, a rhythm can be found on the road. The tires move from pavement to gravel, and the time on the dashboard starts to matter less. Everything needed is already inside the car. Everything else is waiting somewhere out there in the distance.'],
    specs: 'Olympus OM-1, 35mm Kodak UltraMax 400' },
  { slug: 'the-edge-of-the-atlantic', title: 'The Edge of the Atlantic', place: 'Walvis Bay, Namibia', date: '2026-02-06', ig: 'DUbCGxoDxUk',
    alt: 'A panorama of the Walvis Bay lagoon at golden hour: flamingos in the shallows, palms on the left, harbour cranes far on the right',
    body: ['Walvis Bay. A quiet port town, where the Namib desert meets the cold Atlantic Ocean; the air smells of salt and diesel. It’s the last bit of civilization before you head into the great unknown. From the pavement into the sand.', 'This is the place to pack your gear, fuel up and stock the crates. A place to enjoy the calm before the storm.'],
    specs: 'Olympus OM-1, 35mm Kodak Gold' },
  { slug: 'the-detour', title: 'The Detour', place: 'Germany', date: '2026-02-08', ig: 'DUfpYtAFA6Q',
    alt: 'An empty road at blue hour running towards dark Alpine peaks, the streetlights on',
    alts: ['A church spire in silhouette against a bright evening sky, on a Polaroid', 'A pink rose at night, on a Polaroid'],
    body: ['The map offers a route, but the road often has other plans.', 'Emphasis is often placed on the destination, with the beauty of the journey going unnoticed. It can be found in the unexpected detour, led by the wandering of the mind, the curiosity of the eye, or the growing hunger of a belly.', 'When the itinerary suggests to keep moving, there is a sense of freedom in being led by the moment rather than the clock.', 'These are the unexpected kilometers where the story lives.'],
    specs: 'Olympus OM-1, 35mm Kodak UltraMax 400' },
  { slug: 'the-mountain-kingdom', title: 'The Mountain Kingdom', place: 'Lesotho', date: '2026-02-09', ig: 'DUiitgcD8-a',
    alt: 'A panorama of Basotho round huts with thatched roofs on red earth, green mountains and clouds behind',
    body: ['Crossing into Lesotho feels like stepping back in time. It is a world where men on horseback are draped in Basotho blankets, moving across the ridges like shadows of the past.', 'The homesteads are built from mother earth herself, sand, soil and dung, blending into the slopes of the Maloti Mountains. Here the ancient ways are still the primary pulse.'],
    specs: 'Canon Prima AF-7, 35mm Kodak Gold' },
  { slug: 'the-night-watch', title: 'The night watch', place: 'Perth, Western Australia', date: '2026-02-10', ig: 'DUk4HMejERC',
    alt: 'Two people by a small fire and a glowing tent under a purple dusk sky',
    body: ['There is something primitive in spending the night in nature. When camp is set and the sun drops, the world narrows down to the glow of the embers and the reach of the firelight.', 'The flame can be captivating: the light it shines, the heat it brings and the power it holds. As the fire dies down, the ceiling opens up to a sky full of stars. Returning to the basics makes one feel truly alive.'],
    specs: null },
  { slug: 'among-the-giants', title: 'Among the Giants', place: 'Hinterstoder, Austria', date: '2026-02-12', ig: 'DUqoEUrjv_0',
    alt: 'A panorama of Alpine peaks wrapped in heavy cloud above a dark line of fir trees, in cold blue tones',
    body: ['There is a sense of calm that can only be found in the mountains.', 'Up there, the noise of the world below is replaced by a stillness. You find yourself standing among giants, humbled by their scale and the realization of how small you truly are.'],
    specs: 'Olympus OM-1, 35mm Kodak UltraMax 400' },
  { slug: 'the-heart-of-the-namib', title: 'The heart of the Namib', place: 'Sossusvlei, Namibia', date: '2026-02-14', ig: 'DUvVMhoCDQB',
    alt: 'Apricot dunes beyond a dry plain, a camelthorn tree on the left',
    alts: ['The view from high on a dune down onto a white clay pan, dunes rolling into the haze'],
    body: ['The oldest desert in the world. A landscape that has been sculpted by the wind over millions of years. An immense vastness with nothing but sand in sight.', 'The San people navigated these dunes, reading the shifting sands like a map. They found life where most people would see desolation, living in harmony with a desert that feels endless.', 'Standing among these dunes, you can feel the ancient wisdom of the land. It is a place that teaches you when you dare to listen.'],
    specs: 'Olympus OM-1, 35mm Kodak Gold' },
  { slug: 'in-silence', title: 'In silence', place: null, date: '2026-02-16', ig: 'DU1L37WDmkG',
    alt: 'A village at night: a footbridge with rust-red railings under an orange streetlamp',
    body: ['In silence, the mind finds its own path.'],
    specs: null },
  { slug: 'the-sky-fortress', title: 'The Sky Fortress', place: 'Lesotho', date: '2026-02-18', ig: 'DU58KpvDQHC',
    alt: 'Three stone huts with thatched roofs on a steep grassy hillside under big white clouds',
    body: ['Lesotho’s history is written in its heights. The nation was forged in the 1800s when King Moshoeshoe the first led his people into these mountains, seeking refuge from the wars and colonial expansions ravaging the plains below.', 'He transformed these jagged peaks into a natural fortress. By retreating into the "Kingdom in the Sky," he preserved a culture and a sovereignty that many others lost. The mountains weren’t just a home; they were a sanctuary of resistance.', 'Standing on these plateaus today, you can still feel that spirit of defiance. It is a land defined by the strength of its people and the protection of its peaks.'],
    specs: 'Olympus OM-1, 35mm Kodak Gold' },
  { slug: 'sandwich-harbour', title: 'Sandwich Harbour', place: 'Namibia', date: '2026-02-20', ig: 'DU_HgI_iqjg',
    alt: 'A woman walking a tyre-tracked beach beside a 4x4, the surf rolling in behind',
    alts: ['A line of 4x4s on wet sand below a high dune, seen past a side mirror'],
    body: ['Where the massive walls of the Namib Desert drop straight into the cold surge of the Atlantic in a constant battle of territory.', 'Navigating the narrow trail between the desert dunes and the clashing waves can only be done in the pause of battle: low tide. The 4x4 is at the mercy of the swell and the shifting sands, in a landscape that feels like it belongs to another planet.', 'Some trails can never be tamed.'],
    specs: 'Olympus OM-1, 35mm Kodak Gold' },
];

/* ── Community ── */
export const COMMUNITY = {
  // Tom's own text (2026-11-13), only spelling and grammar fixed.
  // One section with scattered photos and one call to action.
  title: 'Hiking & Outdoor Group in Barcelona | Frontier Trails',
  description: 'Spontaneous outdoor plans in and around Barcelona: hiking, trail running, via ferrata, mountain biking, snorkelling and more. Join the WhatsApp group.',
  label: 'The Frontier Trails community',
  h1: 'Come along.',
  // Split for reading: a lead line, two short paragraphs, and the
  // invitation set apart just above the button.
  lead: "There's a lot of nature within reach of Barcelona.",
  text: [
    "Collserola, Montserrat, Montseny, the Garraf, Sant Llorenç del Munt, the Costa Brava and many more. Plenty of trails for hiking and trail running, and mountains that are perfect for climbing and via ferratas. The coast offers beautiful running spots, water activities like kayaking and snorkelling, and good fishing spots.",
    "We don't have a set schedule. We like spontaneous adventures, depending on the season, the weather and whatever comes to mind.",
  ],
  invite: 'Anyone who likes being outside is welcome. Feel free to start a plan, or just tag along.',
  // Tom's own photos, as one collage of taped prints like the Journal.
  // `slot` places each print in the collage (css/community.css).
  photos: [
    { slot: 'forest', src: '/img/community/forest.webp', w: 795, h: 1200, alt: 'Three people walking through a beech forest over fallen leaves' },
    { slot: 'lookout', src: '/img/community/lookout.webp', w: 795, h: 1200, alt: 'A hiker on a rocky lookout above wooded hills' },
    { slot: 'ferrata', src: '/img/community/via-ferrata.webp', w: 900, h: 1200, alt: 'A climber on a via ferrata, clipped to the cable on a limestone wall' },
    { slot: 'pine', src: '/img/community/pine-ridge.webp', w: 900, h: 1200, alt: 'Pine trees on a ridge, with a flat-topped mountain behind' },
    { slot: 'fishing', src: '/img/community/fishing.webp', w: 1200, h: 900, alt: 'Three friends fishing off the rocks by the sea' },
    { slot: 'valley', src: '/img/community/valley.webp', w: 1200, h: 796, alt: 'A wooded valley with the sea in the distance' },
  ],
  // The WhatsApp invite link. null until the group exists: the button then
  // goes nowhere, and the build prints a [CHECK].
  whatsapp: null,
  cta: 'Join the WhatsApp group',
  ctaNote: 'Free',
};

/* ── Dream trip ── */
export const DREAM = {
  title: 'Plan Your Dream Trip in Spain | Frontier Trails',
  description: "Tell us what you're after and we'll come back with a personal trip idea for Spain, put together by hand.",
  h1: 'Your dream trip',
  lede: "Tell us what you're after, and we'll come back with a trip idea, put together by hand.",
  activities: ['Hiking', 'Via ferrata', 'Climbing', 'Canyoning', 'Kayaking', 'Surfing', 'Mountain biking', 'Stargazing', 'Good food'],
  after: 'Tom reads every request and gets back to you personally.',
};

/* ── 404 ── */
export const NOT_FOUND = {
  title: "You're off route | Frontier Trails",
  h1: "You're off route.",
  lede: "This page doesn't exist. The rest of Spain does.",
};
