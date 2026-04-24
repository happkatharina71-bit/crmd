const BIRDS = [
  {
    id: 'amsel',
    name: 'Amsel',
    sci: 'Turdus merula',
    size: 'Mittelgroß (24–25 cm)',
    habitat: 'Gärten & Wälder',
    song: 'Melodiös & flötenartig',
    facts: [
      'Das Männchen ist tiefschwarz mit leuchtend orangem Schnabel – das Weibchen braun und unauffällig.',
      'Die Amsel singt oft bis in die Dämmerung – sie gehört zu den lautesten Stadtvögeln Deutschlands.',
      'Amseln lernen neue Melodien von ihren Nachbarn und entwickeln so lokale "Dialekte".'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#d4ecd4" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#b8ddb8" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="132" x2="86" y2="148" stroke="#444" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="110" y1="132" x2="116" y2="148" stroke="#444" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#444" stroke-width="2" stroke-linecap="round"/>
      <line x1="116" y1="148" x2="124" y2="148" stroke="#444" stroke-width="2" stroke-linecap="round"/>
      <polygon points="68,112 46,100 46,124" fill="#111122"/>
      <ellipse cx="100" cy="114" rx="36" ry="23" fill="#111122"/>
      <ellipse cx="97" cy="112" rx="30" ry="19" fill="#1e1e30" opacity="0.7"/>
      <circle cx="132" cy="92" r="22" fill="#111122"/>
      <polygon points="152,90 176,85 176,95" fill="#ff8c00"/>
      <circle cx="142" cy="85" r="9" fill="#ff8c00"/>
      <circle cx="142" cy="85" r="6" fill="#111"/>
      <circle cx="144" cy="83" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'rotkehlchen',
    name: 'Rotkehlchen',
    sci: 'Erithacus rubecula',
    size: 'Klein (13–14 cm)',
    habitat: 'Wälder & Gärten',
    song: 'Weich & melodisch',
    facts: [
      'Die orangerote Brust ist bei Männchen und Weibchen gleich – Rotkehlchen unterscheiden sich kaum.',
      'Rotkehlchen sind erstaunlich mutig: Sie folgen Gärtnern und picken Würmer aus frisch gegrabenem Boden.',
      'Im Winter singen sie auch nachts – ihr Gesang klingt dann besonders melancholisch.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#e8f0d8" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#c8e0b0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="135" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="135" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,114 52,103 52,125" fill="#7a5c20"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#7a5c20"/>
      <ellipse cx="98" cy="114" rx="25" ry="17" fill="#8a6c30" opacity="0.7"/>
      <circle cx="128" cy="94" r="20" fill="#7a5c20"/>
      <ellipse cx="122" cy="108" rx="22" ry="18" fill="#d94510"/>
      <ellipse cx="130" cy="96" r="14" fill="#e05520"/>
      <polygon points="146,92 164,88 164,96" fill="#3a2808"/>
      <circle cx="137" cy="87" r="5" fill="#111"/>
      <circle cx="138" cy="86" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'blaumeise',
    name: 'Blaumeise',
    sci: 'Cyanistes caeruleus',
    size: 'Klein (11–12 cm)',
    habitat: 'Gärten & Laubwälder',
    song: 'Hoch & zwitschernd',
    facts: [
      'Die Blaumeise ist einer der wenigen europäischen Vögel mit echter blauer Kappe – ein echtes Farbjuwel.',
      'Sie ist ein Akrobat: Sie hängt kopfüber an Zweigen, um Insekten unter Blättern zu finden.',
      'Im Winter fressen Blaumeisen gerne Meisenknödel – sie merken sich bis zu hundert Verstecke für Futter.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#e0ecfc" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#c0d8f0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="136" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="136" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,114 52,103 52,125" fill="#3a7fd0"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#3a7fd0"/>
      <ellipse cx="98" cy="116" rx="25" ry="16" fill="#4a90e0" opacity="0.8"/>
      <ellipse cx="108" cy="122" rx="20" ry="14" fill="#f0e820"/>
      <circle cx="128" cy="93" r="20" fill="#ffffff"/>
      <circle cx="128" cy="83" r="14" fill="#3a7fd0"/>
      <ellipse cx="122" cy="93" rx="12" ry="8" fill="#1a2060" opacity="0.18"/>
      <polygon points="146,91 162,88 162,95" fill="#444"/>
      <circle cx="136" cy="86" r="5" fill="#111"/>
      <circle cx="137" cy="85" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'kohlmeise',
    name: 'Kohlmeise',
    sci: 'Parus major',
    size: 'Mittelklein (13–15 cm)',
    habitat: 'Überall – sehr anpassungsfähig',
    song: 'Laut: "Zi-zi-bäh"',
    facts: [
      'Die Kohlmeise hat einen markanten schwarzen Streifen auf dem gelben Bauch – breiter beim Männchen.',
      'Sie ist der häufigste Meisenvogel Deutschlands und besiedelt Parks, Wälder und Gärten gleichermaßen.',
      'Kohlmeisen nutzen Nistkästen begeistert – und vertreiben notfalls sogar Kleiber aus deren Höhlen.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#e4f4dc" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#c4e4b0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="136" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="136" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,112 50,101 50,123" fill="#5a7020"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#6a8028"/>
      <ellipse cx="108" cy="120" rx="22" ry="16" fill="#e8e020"/>
      <rect x="102" y="110" width="6" height="26" rx="3" fill="#111" opacity="0.85"/>
      <circle cx="128" cy="92" r="20" fill="#111"/>
      <ellipse cx="118" cy="94" rx="10" ry="7" fill="white"/>
      <ellipse cx="138" cy="94" rx="10" ry="7" fill="white"/>
      <polygon points="146,90 162,87 162,94" fill="#333"/>
      <circle cx="136" cy="85" r="5" fill="#111"/>
      <circle cx="137" cy="84" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'buchfink',
    name: 'Buchfink',
    sci: 'Fringilla coelebs',
    size: 'Mittelklein (14–16 cm)',
    habitat: 'Wälder & Gärten',
    song: 'Schmetterndes Trillern',
    facts: [
      'Das Männchen trägt einen blaugrauen Kopf und eine rosarote Brust – eines der farbenfrohsten heimischen Vögel.',
      'Buchfinken sind Zugvögel, doch viele überwintern inzwischen in Deutschland – dank milder Winter.',
      'Sein Gesang endet immer mit einem typischen "Schnörkel" – Ornithologen nennen es den "Abschluss-Knicks".'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#ece8f8" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#d0c8f0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="136" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="136" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,112 50,101 50,123" fill="#a05c28"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#b06830"/>
      <ellipse cx="97" cy="114" rx="25" ry="17" fill="#c07838" opacity="0.8"/>
      <ellipse cx="112" cy="118" rx="20" ry="15" fill="#d06868"/>
      <rect x="90" y="106" width="30" height="5" rx="2" fill="white" opacity="0.7"/>
      <rect x="90" y="116" width="30" height="4" rx="2" fill="white" opacity="0.5"/>
      <circle cx="128" cy="92" r="20" fill="#5060a8"/>
      <polygon points="146,90 163,87 163,94" fill="#c8c8c0"/>
      <circle cx="136" cy="85" r="5" fill="#111"/>
      <circle cx="137" cy="84" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'stieglitz',
    name: 'Stieglitz',
    sci: 'Carduelis carduelis',
    size: 'Klein (12–13 cm)',
    habitat: 'Offene Landschaft & Gärten',
    song: 'Helles Klingeln & Trillern',
    facts: [
      'Mit seiner roten Gesichtsmaske, dem schwarz-weißen Kopf und dem goldgelben Flügelband ist er kaum zu verwechseln.',
      'Stieglitze lieben Disteln – ihr langer Schnabel ist perfekt geformt, um die Samen herauszupulen.',
      'Ihr englischer Name "Goldfinch" bezieht sich auf das leuchtend gelbe Band auf den Flügeln.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#faf8e0" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#e8e8b0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="136" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="136" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,112 50,101 50,123" fill="#222"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#111"/>
      <ellipse cx="97" cy="116" rx="25" ry="16" fill="#333" opacity="0.8"/>
      <rect x="66" y="108" width="46" height="10" rx="5" fill="#f0c000"/>
      <ellipse cx="112" cy="122" rx="20" ry="12" fill="#f8f4ec"/>
      <circle cx="128" cy="92" r="20" fill="#fff"/>
      <circle cx="128" cy="82" r="12" fill="#111"/>
      <ellipse cx="118" cy="92" rx="9" ry="8" fill="#111" opacity="0.15"/>
      <ellipse cx="133" cy="95" rx="8" ry="7" fill="#cc1010"/>
      <polygon points="147,90 166,86 166,95" fill="#e8c060"/>
      <circle cx="136" cy="84" r="5" fill="#111"/>
      <circle cx="137" cy="83" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'gimpel',
    name: 'Gimpel',
    sci: 'Pyrrhula pyrrhula',
    size: 'Mittelklein (14–16 cm)',
    habitat: 'Wälder & Gärten',
    song: 'Weich & leise pfeifend',
    facts: [
      'Das Männchen leuchtet mit leuchtend roter Brust – das Weibchen trägt ein dezenteres Braun-Rosa.',
      'Gimpel gelten als besonders zutraulich – früher wurden sie als Stubenvögel gehalten, da sie Melodien lernen.',
      'Im Winter besuchen sie Gärten und fressen Knospen von Obstbäumen – was Obstbauern weniger erfreut.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#f0f0f8" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#d8d8f0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="92" y1="136" x2="86" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="108" y1="136" x2="114" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="86" y1="148" x2="78" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="114" y1="148" x2="122" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="72,112 50,100 50,124" fill="#111"/>
      <ellipse cx="100" cy="116" rx="30" ry="20" fill="#707880"/>
      <ellipse cx="97" cy="114" rx="25" ry="17" fill="#808890" opacity="0.8"/>
      <ellipse cx="113" cy="120" rx="22" ry="16" fill="#d83030"/>
      <ellipse cx="100" cy="128" rx="16" ry="8" fill="#f0f0f0"/>
      <circle cx="128" cy="92" r="20" fill="#111"/>
      <polygon points="147,91 163,88 163,95" fill="#555"/>
      <circle cx="136" cy="85" r="5" fill="#111"/>
      <circle cx="137" cy="84" r="2" fill="white" opacity="0.9"/>
    </svg>`
  },
  {
    id: 'zaunkoenig',
    name: 'Zaunkönig',
    sci: 'Troglodytes troglodytes',
    size: 'Winzig (9–10 cm)',
    habitat: 'Dickicht & Wälder',
    song: 'Laut & sprudelnd – erstaunlich für seine Größe',
    facts: [
      'Der Zaunkönig ist einer der kleinsten Vögel Europas – aber sein Gesang ist für seine Größe unglaublich laut.',
      'Er hält seinen Schwanz charakteristisch steil aufgerichtet – das macht ihn sofort erkennbar.',
      'Trotz seiner Winzigkeit überwintert er bei uns – er sucht Schutz in dichten Büschen und Efeu.'
    ],
    svg: `<svg viewBox="0 0 220 190" xmlns="http://www.w3.org/2000/svg">
      <rect width="220" height="190" fill="#e8ece0" rx="16"/>
      <ellipse cx="110" cy="188" rx="95" ry="18" fill="#c8d4b0" opacity="0.6"/>
      <rect x="25" y="148" width="170" height="13" rx="6" fill="#6b4c1a"/>
      <rect x="25" y="148" width="170" height="5" rx="3" fill="#8b6c2a" opacity="0.6"/>
      <line x1="96" y1="138" x2="90" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="110" y1="138" x2="116" y2="148" stroke="#666" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="90" y1="148" x2="82" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <line x1="116" y1="148" x2="124" y2="148" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      <polygon points="115,100 128,78 122,78 120,100" fill="#8a6030"/>
      <ellipse cx="103" cy="124" rx="22" ry="16" fill="#9a7040"/>
      <ellipse cx="100" cy="122" rx="18" ry="13" fill="#aa8050" opacity="0.8"/>
      <line x1="80" y1="116" x2="124" y2="116" stroke="#7a5828" stroke-width="1.5" opacity="0.5"/>
      <line x1="80" y1="122" x2="124" y2="122" stroke="#7a5828" stroke-width="1.5" opacity="0.4"/>
      <ellipse cx="112" cy="126" rx="12" ry="9" fill="#c8a870" opacity="0.6"/>
      <circle cx="118" cy="110" r="14" fill="#9a7040"/>
      <polygon points="130,109 144,106 144,113" fill="#555"/>
      <circle cx="124" cy="106" r="4" fill="#111"/>
      <circle cx="125" cy="105" r="1.5" fill="white" opacity="0.9"/>
      <path d="M80,110 Q88,106 80,102 Q88,98 80,94" stroke="#7a5828" stroke-width="1.5" fill="none" opacity="0.4"/>
    </svg>`
  }
];
