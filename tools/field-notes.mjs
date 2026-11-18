/* ==============================================
   FRONTIER TRAILS — field-notes.mjs
   The Journal's field notes: practical guides to the questions people
   ask before a trip like this. Plain voice, warm, no hype.
   Each note has sources; anything not yet confirmed carries a `check`
   (never shown on the page; build-pages.mjs lists them).
   Rules: soft-road, never "off-road" as a description; never the car's
   brand or model; never an invented fact.
   ============================================== */

export const FIELD_NOTES = [
  {
    slug: 'overlanding-in-spain',
    no: '01',
    title: 'Overlanding in Spain: a beginner’s guide',
    seo: 'Overlanding in Spain: A Beginner’s Guide | Frontier Trails',
    description: 'What overlanding is, how it differs from off-roading, what you need, and how to plan a first soft-road trip in Spain from Barcelona.',
    hook: 'What it is, what you need, and how to plan your first trip without overthinking it.',
    lands: ['garrotxa', 'cap-de-creus', 'pyrenees'],
    sections: [
      { h: 'What overlanding is', p: [
        'Overlanding is travelling by 4x4 with everything you need on board, and camping along the way. The car is your transport, your base for the day’s activities, and your bed at night.',
        'The point isn’t the vehicle or the driving. It’s the freedom to follow a road because it looks good, stop where the view is, and wake up somewhere you didn’t plan the week before.',
      ] },
      { h: 'Overlanding is not off-roading', p: [
        'Off-roading is about the driving itself: steep, technical terrain that tests the car. Overlanding is about the journey. Most of it happens on soft-road: gravel, forest tracks and quiet mountain roads that any careful driver can handle.',
        'That’s also how a Frontier Trails trip works. You don’t need 4x4 experience. You need curiosity and a sense of direction.',
      ] },
      { h: 'What you need', list: [
        'A capable car: high enough for rough gravel, reliable enough to forget about.',
        'A place to sleep: a rooftop tent is up in minutes and keeps you off the ground.',
        'A camp kitchen: a stove, a cool box or fridge, water and a few good pans.',
        'A safety kit: a jump-starter, a compressor, a tyre-plug kit, a torch and a first-aid kit.',
        'A route to start from, and the freedom to leave it.',
      ] },
      { h: 'How to plan a first trip', p: [
        'Start short. A weekend near home teaches you more than a fortnight of planning. From Barcelona, La Garrotxa or Cap de Creus are an easy first night out.',
        'Plan where you’ll sleep before you plan what you’ll see. In Spain the rules for camping change from region to region, and that decides more of your route than anything else. Our field note on wild camping explains them.',
        'Keep the rest loose. Fill up with fuel and water when you can, not when you must, and leave room in the day for the detour you didn’t know about.',
      ] },
      { h: 'Leave no trace', p: [
        'Take everything back out with you, stay on the tracks, keep fires to places where they’re allowed, and leave a spot the way you’d want to find it. Overlanding only works as long as the places stay open, and wild.',
      ] },
    ],
    sources: [],
  },
  {
    slug: 'wild-camping-in-spain',
    no: '02',
    title: 'Wild camping in Spain: the rules, region by region',
    seo: 'Wild Camping in Spain: The Rules, Region by Region | Frontier Trails',
    description: 'Can you wild camp in Spain? The difference between sleeping in a vehicle and camping, and the rules in Catalonia, Aragón and Navarra, including Bardenas Reales.',
    hook: 'Where you can sleep in a rooftop tent, where you can’t, and why it changes at every regional border.',
    lands: ['bardenas-reales', 'monegros', 'pyrenees'],
    intro: 'Short answer: wild camping is not allowed in most of Spain, and the rules are set by each region, national and natural parks, and even each town. Here is how it works in the regions our six landscapes are in. Rules change, so check locally before you go.',
    sections: [
      { h: 'Parking is not camping', p: [
        'Spanish traffic rules draw a line between parking and camping. A vehicle that is properly parked, standing only on its wheels, with nothing set up outside it, is parked. That includes sleeping inside it, where parking is allowed.',
        'Camping starts when you set up outside the vehicle: chairs, a table, an awning, levelling blocks. A rooftop tent folded open above the car is widely treated as camping too, so plan to sleep at campsites or places where camping is allowed.',
      ], check: 'Name and date of the current DGT instruction on parking and overnight stays (it replaced instruction 08/V-74); how rooftop tents are treated' },
      { h: 'Catalonia', p: [
        'Camping outside campsites and authorised areas is not allowed, and the natural parks are strict: in the parks run by the Diputació de Barcelona, free camping is not permitted in any form, motorhomes included. Sleeping inside a vehicle is only allowed in car parks where it’s permitted, without awnings, tables or chairs.',
        'Towns can also ban overnight parking with their own by-laws. Fines vary by town and by park.',
      ], check: 'The general Catalan rule (decree) on free camping outside parks' },
      { h: 'Aragón', p: [
        'Free camping is prohibited throughout Aragón. The region does regulate a few forms of camping outside campsites, such as itinerant camping, under strict conditions: at least five kilometres from a campsite, and at least one kilometre from towns and busy public places.',
        'For Los Monegros, Sierra de Guara and the Aragonese Pyrenees, that means campsites, authorised areas, or a properly regulated camp.',
      ], check: 'Conditions and any permit for itinerant camping under Decree 61/2006' },
      { h: 'Navarra and Bardenas Reales', p: [
        'In Bardenas Reales, camping and overnight stays are prohibited throughout the park, motorhomes included. The nearest place to spend the night is outside the park, for example the motorhome area at Arguedas.',
        'Elsewhere in Navarra, camping with a tent needs prior permission from the local authority, and some areas, such as the Irati forest, need a permit from the park.',
      ], check: 'Arguedas area conditions; Navarra rule for tent camping (Decreto Foral 226/1993)' },
      { h: 'What this means on a Frontier Trails trip', p: [
        'Every route we give you only uses places where you can legally sleep: campsites, authorised areas and spots we’ve checked against the rules. If you leave the route, and you should, ask at the town hall or the park office before you settle in for the night.',
      ] },
    ],
    sources: [
      ['Parcs Naturals de la Diputació de Barcelona: camping and overnight stays (FAQ)', 'https://parcs.diba.cat/en/faqs/acampada-pernoctacio'],
      ['Parques naturales de Catalunya: regulation of activities', 'https://parcsnaturals.gencat.cat/es/detalls/Article/Regulacio-dactivitats'],
      ['Aragón, Decreto 61/2006 (camping regulation), Boletín Oficial de Aragón', 'https://www.boa.aragon.es/cgi-bin/EBOA/BRSCGI?CMD=VERDOC&BASE=BOLE&SEC=BUSQUEDA_AVANZADA&DOCN=000104976'],
      ['Bardenas Reales: rules for visitors', 'https://bardenasreales.es/turismo/normativa-de-uso-turistico/'],
      ['DGT instruction 08/V-74 on motorhomes (since updated)', 'https://www.autocaravanas.es/wp-content/uploads/2016/08/DGT_Instruccion_08-V-74_Autocaravanas_2076.pdf'],
    ],
  },
  {
    slug: 'best-time-for-a-road-trip-in-spain',
    no: '03',
    title: 'The best time for a road trip in Spain, month by month',
    seo: 'Best Time for a Road Trip in Spain, Month by Month | Frontier Trails',
    description: 'When to go where: the best months for the Pyrenees, Bardenas Reales, Los Monegros, La Garrotxa, Sierra de Guara and Cap de Creus.',
    hook: 'Mountains in summer, desert in winter, coast in the months in between.',
    lands: ['pyrenees', 'bardenas-reales', 'sierra-de-guara'],
    intro: 'There’s no bad month for a trip from Barcelona, only the wrong landscape for the season. The trick is to follow the weather inland and uphill in summer, and down to the desert and the coast in winter.',
    table: [
      ['January–February', 'The desert and the outback: cold, clear days in Bardenas Reales and Los Monegros. La Garrotxa and quiet coast walks at Cap de Creus.', 'The high Pyrenees are under snow.'],
      ['March–April', 'The desert and outback at their best. Walking in Sierra de Guara. The coast wakes up.', 'High trails are still snowbound.'],
      ['May', 'Almost everything opens: green valleys in the Pyrenees, the first canyoning in Guara, flowers in La Garrotxa.', 'Snow can linger on the highest passes.'],
      ['June', 'The high Pyrenees open up. Canyoning season in Guara. The sea gets warm enough to swim.', ''],
      ['July–August', 'Peak season for the Pyrenees and the canyons of Guara.', 'The desert and outback are very hot. The coast is busiest in August.'],
      ['September', 'Arguably the best month: the mountains are still open, the sea is warm and the crowds have gone.', ''],
      ['October', 'Autumn colour in the Pyrenees, and the desert comes back into season.', 'Early snow is possible up high.'],
      ['November–December', 'Beech forests turn in La Garrotxa, the desert is quiet, coast walks are wild and empty.', 'The high Pyrenees close for winter.'],
    ],
    sections: [
      { h: 'A rule of thumb', p: [
        'Summer: go up. Winter: go south and to the sea. Spring and autumn: anywhere, which is why they’re our favourite seasons.',
      ] },
    ],
    sources: [],
    check: 'Month ranges are general guidance; snow and road conditions vary by year',
  },
  {
    slug: 'rooftop-tent-vs-campervan',
    no: '04',
    title: 'Rooftop tent vs campervan: which suits a Spain trip?',
    seo: 'Rooftop Tent vs Campervan: Which Suits a Spain Trip? | Frontier Trails',
    description: 'An honest comparison of a 4x4 with a rooftop tent and a campervan for a road trip in Spain: roads, sleeping, weather, cooking and where you can stay.',
    hook: 'Gravel tracks, narrow mountain roads and parking in old towns. An honest comparison.',
    lands: ['sierra-de-guara', 'monegros', 'pyrenees'],
    intro: 'Both are great ways to see Spain. They suit different trips. Here’s the honest version.',
    compare: [
      ['Where it can go', 'A 4x4 handles gravel, forest tracks and steep, narrow mountain roads, and fits in village car parks.', 'Best on paved roads. Gravel and narrow mountain roads get tricky, and old-town parking can be hard.'],
      ['Setting up', 'The rooftop tent is up in about two minutes, with the bed already made.', 'Nothing to set up: you sleep inside.'],
      ['Sleeping', 'Above the ground, with the view through the tent windows.', 'Inside, out of the wind and the cold.'],
      ['Weather', 'Fine in rain and wind, but you’ll hear it. Cold nights mean a good sleeping bag.', 'Warmer and quieter in bad weather.'],
      ['Cooking', 'A camp kitchen outside, with the view.', 'A kitchen inside, useful in the rain.'],
      ['Where you can sleep', 'An open rooftop tent counts as camping, so you plan around campsites and authorised areas.', 'Sleeping inside a properly parked van is allowed in more places.'],
    ],
    sections: [
      { h: 'Our take', p: [
        'If your trip is about cities and the coast, a campervan is hard to beat. If it’s about the landscapes in between, gravel tracks, mountain valleys, the desert, a 4x4 with a rooftop tent takes you further, and it’s simply more fun to drive.',
      ] },
    ],
    sources: [],
  },
];
