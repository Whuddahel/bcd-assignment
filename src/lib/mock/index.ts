// Mock data for dev mode (mirrors DB seed). Prices in whole dollars for UI display.

export const MOCK_CATEGORIES = [
  { id: "cat-watches",      name: "Watches",      slug: "watches",      description: "Luxury and investment-grade timepieces",    count: 10 },
  { id: "cat-art",          name: "Fine Art",      slug: "fine-art",     description: "Original paintings, prints, and sculpture", count: 9  },
  { id: "cat-designer",     name: "Designer",      slug: "designer",     description: "Authenticated luxury handbags and fashion", count: 8  },
  { id: "cat-rare",         name: "Rare Items",    slug: "rare-items",   description: "Coins, memorabilia, and curios",            count: 8  },
  { id: "cat-jewellery",    name: "Jewellery",     slug: "jewellery",    description: "Estate and fine jewellery",                 count: 7  },
  { id: "cat-collectibles", name: "Collectibles",  slug: "collectibles", description: "Limited figures, sneakers, and drops",      count: 8  },
]

export const MOCK_SELLERS = [
  { id: "sp-01", userId: "user-11", businessName: "WatchVault Geneva",  description: "Premier destination for ultra-rare Swiss horology.", verified: true,  totalSales: 47, rating: 4.92, reviewCount: 31, specialty: "Watches"      },
  { id: "sp-02", userId: "user-12", businessName: "Prestige Horology",  description: "Curated investment-grade watches. Decade of expertise.", verified: true,  totalSales: 38, rating: 4.87, reviewCount: 25, specialty: "Watches"      },
  { id: "sp-03", userId: "user-13", businessName: "ArtHouse Collective",description: "Contemporary and modern art. Certificates included.",   verified: true,  totalSales: 22, rating: 4.78, reviewCount: 18, specialty: "Fine Art"     },
  { id: "sp-04", userId: "user-14", businessName: "Galerie Noir",       description: "Post-war and contemporary works. Gallery relationships.", verified: true,  totalSales: 15, rating: 4.93, reviewCount: 12, specialty: "Fine Art"     },
  { id: "sp-05", userId: "user-15", businessName: "Maison Resell",      description: "Hermès, Chanel, LV — Entrupy authenticated.",          verified: true,  totalSales: 63, rating: 4.81, reviewCount: 49, specialty: "Designer"     },
  { id: "sp-06", userId: "user-16", businessName: "Archive Luxury",     description: "Fashion archive specialists. Vintage deadstock only.",  verified: false, totalSales: 11, rating: 4.64, reviewCount: 9,  specialty: "Designer"     },
  { id: "sp-07", userId: "user-17", businessName: "Rare Finds Co.",     description: "The rarest of the rare. Provenance documented.",       verified: true,  totalSales: 29, rating: 4.76, reviewCount: 22, specialty: "Rare Items"   },
  { id: "sp-08", userId: "user-18", businessName: "The Numismatic",     description: "PCGS/NGC graded coins. Portfolio-quality pieces.",     verified: true,  totalSales: 55, rating: 4.88, reviewCount: 41, specialty: "Rare Items"   },
  { id: "sp-09", userId: "user-19", businessName: "Lumière Jewels",     description: "Estate and fine jewellery. GIA-certified diamonds.",  verified: true,  totalSales: 19, rating: 4.95, reviewCount: 16, specialty: "Jewellery"    },
  { id: "sp-10", userId: "user-20", businessName: "Tokyo Drops",        description: "Exclusive Japanese collectibles: KAWS, BE@RBRICK.",   verified: false, totalSales: 34, rating: 4.71, reviewCount: 28, specialty: "Collectibles" },
]

export type MockProduct = {
  id: string
  slug: string
  title: string
  sellerId: string
  sellerName: string
  sellerVerified: boolean
  categorySlug: string
  categoryName: string
  price: number       // whole dollars
  originalPrice?: number
  condition: "mint" | "excellent" | "very_good" | "good" | "fair"
  status: "active" | "sold" | "draft"
  rarity?: string
  badge?: string
  gradient: string
  isFeatured: boolean
  isTrending: boolean
  viewCount: number
  wishlistCount: number
  description: string
  attributes: Record<string, string>
  images: string[]
}

export const MOCK_PRODUCTS: MockProduct[] = [
  // ── Watches ──────────────────────────────────────────────────────
  {
    id: "p01", slug: "patek-nautilus-5711",
    title: "Patek Philippe Nautilus 5711/1A",
    sellerId: "sp-01", sellerName: "WatchVault Geneva", sellerVerified: true,
    categorySlug: "watches", categoryName: "Watches",
    price: 87500, condition: "mint", status: "active",
    rarity: "Ultra Rare", badge: "🔥 Hot",
    gradient: "from-violet-600/40 via-violet-800/60 to-violet-950/80",
    isFeatured: true, isTrending: true, viewCount: 8420, wishlistCount: 312,
    description: "One of the most coveted references in modern horology. Blue sunburst dial, full set. 2019, pristine condition.",
    attributes: { Brand: "Patek Philippe", Model: "Nautilus", Reference: "5711/1A-010", Year: "2019", Material: "Steel", Diameter: "40mm" },
    images: ["https://images.unsplash.com/photo-1548171915-f72d8e2ef7e8?w=800&q=80"],
  },
  {
    id: "p02", slug: "rolex-daytona-white",
    title: "Rolex Daytona 116500LN White Dial",
    sellerId: "sp-01", sellerName: "WatchVault Geneva", sellerVerified: true,
    categorySlug: "watches", categoryName: "Watches",
    price: 38500, condition: "mint", status: "active",
    rarity: "Rare", badge: "⚡ New",
    gradient: "from-slate-600/40 via-slate-800/60 to-slate-950/80",
    isFeatured: true, isTrending: false, viewCount: 5210, wishlistCount: 198,
    description: "Ceramic bezel Daytona in steel. White Panda dial. Full set, 2021. One of the most liquid watches on the secondary market.",
    attributes: { Brand: "Rolex", Model: "Daytona", Reference: "116500LN", Year: "2021", Material: "Oystersteel", Diameter: "40mm" },
    images: ["https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=80"],
  },
  {
    id: "p03", slug: "ap-royal-oak-blue",
    title: "Audemars Piguet Royal Oak 15500ST Blue",
    sellerId: "sp-02", sellerName: "Prestige Horology", sellerVerified: true,
    categorySlug: "watches", categoryName: "Watches",
    price: 62000, condition: "mint", status: "active",
    rarity: "Rare", badge: "✦ Featured",
    gradient: "from-blue-600/40 via-blue-800/60 to-blue-950/80",
    isFeatured: true, isTrending: true, viewCount: 7130, wishlistCount: 267,
    description: "Jumbo Extra-Thin in steel with blue tapisserie dial. 2022, full set. The most wearable Royal Oak ever made.",
    attributes: { Brand: "Audemars Piguet", Model: "Royal Oak", Reference: "15500ST", Year: "2022", Material: "Steel", Diameter: "41mm" },
    images: ["https://images.unsplash.com/photo-1622434641406-a158123450f9?w=800&q=80"],
  },
  {
    id: "p04", slug: "richard-mille-mclaren",
    title: "Richard Mille RM 11-03 McLaren",
    sellerId: "sp-01", sellerName: "WatchVault Geneva", sellerVerified: true,
    categorySlug: "watches", categoryName: "Watches",
    price: 185000, condition: "excellent", status: "active",
    rarity: "1 of 500", badge: "🏎 Limited",
    gradient: "from-orange-600/40 via-orange-800/60 to-orange-950/80",
    isFeatured: true, isTrending: false, viewCount: 9820, wishlistCount: 441,
    description: "Flyback chronograph with McLaren orange accents. Limited to 500 pieces. Full set, 2020. Titanium case.",
    attributes: { Brand: "Richard Mille", Model: "RM 11-03", Variant: "McLaren", Year: "2020", Material: "Titanium", Diameter: "49mm" },
    images: ["https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=80"],
  },
  {
    id: "p05", slug: "rolex-gmt-pepsi",
    title: "Rolex GMT-Master II 126710BLRO Pepsi",
    sellerId: "sp-02", sellerName: "Prestige Horology", sellerVerified: true,
    categorySlug: "watches", categoryName: "Watches",
    price: 18500, condition: "mint", status: "active",
    rarity: "Investment", badge: "↑ Rising",
    gradient: "from-red-600/40 via-red-800/60 to-slate-950/80",
    isFeatured: false, isTrending: true, viewCount: 4720, wishlistCount: 183,
    description: 'The "Pepsi" GMT on Jubilee bracelet. 2022, full set. No waiting list required.',
    attributes: { Brand: "Rolex", Model: "GMT-Master II", Reference: "126710BLRO", Year: "2022", Bracelet: "Jubilee", Diameter: "40mm" },
    images: ["https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80"],
  },

  // ── Fine Art ──────────────────────────────────────────────────────
  {
    id: "p06", slug: "kaws-share-painting",
    title: "KAWS \"SHARE\" Original Painting",
    sellerId: "sp-03", sellerName: "ArtHouse Collective", sellerVerified: true,
    categorySlug: "fine-art", categoryName: "Fine Art",
    price: 285000, condition: "mint", status: "active",
    rarity: "Unique", badge: "🎨 Original",
    gradient: "from-pink-600/40 via-pink-800/60 to-pink-950/80",
    isFeatured: true, isTrending: true, viewCount: 12400, wishlistCount: 521,
    description: "Acrylic on canvas, 48\" × 48\". Signed and dated verso 2021. COA from the artist's studio. Exhibited at KAWS TOKYO FIRST.",
    attributes: { Artist: "KAWS", Year: "2021", Medium: "Acrylic on canvas", Dimensions: "48×48 inches", Signed: "Yes" },
    images: ["https://images.unsplash.com/photo-1578926375605-eaf7559b1458?w=800&q=80"],
  },
  {
    id: "p07", slug: "banksy-girl-balloon",
    title: "Banksy \"Girl with Balloon\" Signed Print",
    sellerId: "sp-03", sellerName: "ArtHouse Collective", sellerVerified: true,
    categorySlug: "fine-art", categoryName: "Fine Art",
    price: 95000, condition: "mint", status: "active",
    rarity: "1 of 150", badge: "✦ Featured",
    gradient: "from-rose-600/40 via-rose-800/60 to-rose-950/80",
    isFeatured: true, isTrending: true, viewCount: 18200, wishlistCount: 740,
    description: "Signed screen print, red edition. Pest Control COA. One of 150 signed copies. Framed under conservation glass.",
    attributes: { Artist: "Banksy", Year: "2004", Medium: "Screen print", Edition: "Signed Red", "Pest Control COA": "Yes" },
    images: ["https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=800&q=80"],
  },
  {
    id: "p08", slug: "basquiat-warrior-lithograph",
    title: "Jean-Michel Basquiat \"Warrior\" Lithograph",
    sellerId: "sp-04", sellerName: "Galerie Noir", sellerVerified: true,
    categorySlug: "fine-art", categoryName: "Fine Art",
    price: 85000, condition: "excellent", status: "active",
    rarity: "12 of 50", badge: "🖼 Museum",
    gradient: "from-amber-600/40 via-amber-800/60 to-amber-950/80",
    isFeatured: false, isTrending: false, viewCount: 6320, wishlistCount: 218,
    description: "Rare signed lithograph, edition 12/50. Published 1983 by Annina Nosei. Full provenance documentation.",
    attributes: { Artist: "Jean-Michel Basquiat", Year: "1983", Medium: "Lithograph", Edition: "12/50", Signed: "Yes" },
    images: ["https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&q=80"],
  },
  {
    id: "p09", slug: "koons-balloon-dog-blue",
    title: "Jeff Koons \"Balloon Dog\" Porcelain Blue",
    sellerId: "sp-04", sellerName: "Galerie Noir", sellerVerified: true,
    categorySlug: "fine-art", categoryName: "Fine Art",
    price: 58000, condition: "mint", status: "active",
    rarity: "2298 of 2300", badge: "⚡ New",
    gradient: "from-cyan-600/40 via-cyan-800/60 to-cyan-950/80",
    isFeatured: true, isTrending: false, viewCount: 5920, wishlistCount: 231,
    description: "Blue porcelain, edition 2298/2300. Unique gift box with COA. From the 2001 collaboration with Bernardaud.",
    attributes: { Artist: "Jeff Koons", Year: "2001", Medium: "Limoges porcelain", Edition: "2298/2300", Color: "Blue" },
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"],
  },

  // ── Designer ──────────────────────────────────────────────────────
  {
    id: "p10", slug: "hermes-birkin-30-bleu",
    title: "Hermès Birkin 30 Bleu Électrique Togo",
    sellerId: "sp-05", sellerName: "Maison Resell", sellerVerified: true,
    categorySlug: "designer", categoryName: "Designer",
    price: 42000, condition: "excellent", status: "active",
    rarity: "Investment", badge: "💎 Premium",
    gradient: "from-emerald-600/40 via-emerald-800/60 to-emerald-950/80",
    isFeatured: true, isTrending: true, viewCount: 9820, wishlistCount: 398,
    description: "Stunning electric blue Togo leather with palladium hardware. Full set with receipt. Authenticated by Entrupy.",
    attributes: { Brand: "Hermès", Model: "Birkin 30", Color: "Bleu Électrique", Leather: "Togo", Hardware: "Palladium", Year: "2022" },
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80"],
  },
  {
    id: "p11", slug: "chanel-classic-flap-black",
    title: "Chanel Classic Flap Medium Black Caviar",
    sellerId: "sp-05", sellerName: "Maison Resell", sellerVerified: true,
    categorySlug: "designer", categoryName: "Designer",
    price: 10500, condition: "excellent", status: "active",
    rarity: "Staple", badge: "↑ Rising",
    gradient: "from-zinc-600/40 via-zinc-800/60 to-zinc-950/80",
    isFeatured: false, isTrending: true, viewCount: 6340, wishlistCount: 254,
    description: "Timeless black caviar leather with gold hardware. Series 30 (2021-22). Includes dustbag, box, and authenticity card.",
    attributes: { Brand: "Chanel", Model: "Classic Flap", Size: "Medium", Color: "Black", Leather: "Caviar", Hardware: "Gold" },
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80"],
  },
  {
    id: "p12", slug: "hermes-kelly-28-rouge",
    title: "Hermès Kelly 28 Sellier Rouge Casaque",
    sellerId: "sp-05", sellerName: "Maison Resell", sellerVerified: true,
    categorySlug: "designer", categoryName: "Designer",
    price: 68000, condition: "mint", status: "active",
    rarity: "Ultra Rare", badge: "🔥 Hot",
    gradient: "from-red-600/40 via-red-800/60 to-red-950/80",
    isFeatured: true, isTrending: false, viewCount: 7420, wishlistCount: 318,
    description: "Rare rouge casaque epsom leather with gold hardware. Full set, receipt. 2021. Extremely hard to source at retail.",
    attributes: { Brand: "Hermès", Model: "Kelly 28", Style: "Sellier", Color: "Rouge Casaque", Leather: "Epsom", Hardware: "Gold" },
    images: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80"],
  },
  {
    id: "p13", slug: "bottega-cassette-cobalt",
    title: "Bottega Veneta Cassette Bag Cobalt",
    sellerId: "sp-06", sellerName: "Archive Luxury", sellerVerified: false,
    categorySlug: "designer", categoryName: "Designer",
    price: 2850, condition: "excellent", status: "active",
    rarity: "Archive", badge: "✦ Archive",
    gradient: "from-blue-600/40 via-indigo-800/60 to-indigo-950/80",
    isFeatured: false, isTrending: true, viewCount: 4180, wishlistCount: 162,
    description: "Intrecciato weave in cobalt. Daniel Lee-era piece, 2020. Includes dustbag. Interior pristine.",
    attributes: { Brand: "Bottega Veneta", Model: "Cassette", Color: "Cobalt", Material: "Intrecciato leather", Era: "Daniel Lee" },
    images: ["https://images.unsplash.com/photo-1594938298603-c8148c4b3bf4?w=800&q=80"],
  },

  // ── Rare Items ────────────────────────────────────────────────────
  {
    id: "p14", slug: "jordan-1986-fleer-psa10",
    title: "Michael Jordan 1986 Fleer RC PSA 10",
    sellerId: "sp-07", sellerName: "Rare Finds Co.", sellerVerified: true,
    categorySlug: "rare-items", categoryName: "Rare Items",
    price: 185000, condition: "mint", status: "active",
    rarity: "Grail", badge: "🏆 Grail",
    gradient: "from-red-600/40 via-red-800/60 to-slate-950/80",
    isFeatured: true, isTrending: true, viewCount: 21400, wishlistCount: 890,
    description: "The holy grail of basketball cards. PSA 10 GEM MINT. Stored in climate-controlled vault. Cert #48291044.",
    attributes: { Type: "Trading Card", Player: "Michael Jordan", Year: "1986", Set: "Fleer", Card: "#57", Grade: "PSA 10" },
    images: ["https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?w=800&q=80"],
  },
  {
    id: "p15", slug: "nike-air-mag-2016",
    title: "Nike Air Mag 2016 (Self-Lacing) DS",
    sellerId: "sp-07", sellerName: "Rare Finds Co.", sellerVerified: true,
    categorySlug: "rare-items", categoryName: "Rare Items",
    price: 95000, condition: "mint", status: "active",
    rarity: "1 of 89", badge: "⚡ Iconic",
    gradient: "from-sky-600/40 via-sky-800/60 to-sky-950/80",
    isFeatured: true, isTrending: true, viewCount: 15820, wishlistCount: 670,
    description: "The self-lacing Air Mag from 2016. Charity auction piece. Original packaging, 100% authenticated. StockX verified.",
    attributes: { Brand: "Nike", Model: "Air Mag", Year: "2016", Size: "US 10", "Self-Lacing": "Yes", Authenticated: "StockX" },
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
  },
  {
    id: "p16", slug: "pokemon-charizard-psa9",
    title: "Pokémon Charizard 1st Ed. PSA 9 — 1999",
    sellerId: "sp-07", sellerName: "Rare Finds Co.", sellerVerified: true,
    categorySlug: "rare-items", categoryName: "Rare Items",
    price: 28000, condition: "mint", status: "active",
    rarity: "Iconic", badge: "🔥 Hot",
    gradient: "from-orange-600/40 via-orange-800/60 to-orange-950/80",
    isFeatured: true, isTrending: true, viewCount: 12400, wishlistCount: 521,
    description: "Base set 1st edition Charizard (4/102). PSA 9 MINT. The most iconic trading card in Pokémon history.",
    attributes: { Franchise: "Pokémon", Card: "Charizard", Set: "Base Set", Edition: "1st Edition", Number: "4/102", Grade: "PSA 9" },
    images: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80"],
  },
  {
    id: "p17", slug: "roman-aureus-nero",
    title: "Ancient Roman Aureus — Nero 64 AD",
    sellerId: "sp-08", sellerName: "The Numismatic", sellerVerified: true,
    categorySlug: "rare-items", categoryName: "Rare Items",
    price: 48000, condition: "excellent", status: "active",
    rarity: "2000yr old", badge: "🏛 Ancient",
    gradient: "from-yellow-600/40 via-yellow-800/60 to-yellow-950/80",
    isFeatured: false, isTrending: true, viewCount: 5120, wishlistCount: 198,
    description: "Beautifully preserved gold aureus of Emperor Nero, 64 AD. PCGS Ancients MS Strike 5/5, Surface 4/5. Full flan.",
    attributes: { Type: "Ancient Coin", Denomination: "Aureus", Emperor: "Nero", Year: "64 AD", Grade: "PCGS Ancients MS", Strike: "5/5" },
    images: ["https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80"],
  },

  // ── Jewellery ─────────────────────────────────────────────────────
  {
    id: "p18", slug: "vca-alhambra-necklace",
    title: "Van Cleef & Arpels Alhambra Long Necklace",
    sellerId: "sp-09", sellerName: "Lumière Jewels", sellerVerified: true,
    categorySlug: "jewellery", categoryName: "Jewellery",
    price: 14500, condition: "excellent", status: "active",
    rarity: "Investment", badge: "💎 Estate",
    gradient: "from-yellow-600/40 via-amber-800/60 to-amber-950/80",
    isFeatured: true, isTrending: true, viewCount: 6820, wishlistCount: 278,
    description: "Vintage Alhambra long necklace, 20 motifs, mother-of-pearl in yellow gold. Full set with COA. Rare find.",
    attributes: { Brand: "Van Cleef & Arpels", Model: "Vintage Alhambra", Motifs: "20", Material: "Mother of Pearl", Metal: "18k Yellow Gold" },
    images: ["https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80"],
  },
  {
    id: "p19", slug: "fancy-blue-diamond-ring",
    title: "8.52ct Fancy Blue Diamond Ring Platinum",
    sellerId: "sp-09", sellerName: "Lumière Jewels", sellerVerified: true,
    categorySlug: "jewellery", categoryName: "Jewellery",
    price: 280000, condition: "mint", status: "active",
    rarity: "Exceptional", badge: "💍 GIA",
    gradient: "from-blue-600/40 via-blue-800/60 to-blue-950/80",
    isFeatured: true, isTrending: false, viewCount: 9420, wishlistCount: 384,
    description: "GIA Fancy Blue, VS1, 8.52ct cushion-cut diamond set in platinum. GIA Certificate #5191234812. Investment grade.",
    attributes: { Weight: "8.52ct", Color: "Fancy Blue", Clarity: "VS1", Cut: "Cushion", Setting: "Platinum", "GIA Cert": "#5191234812" },
    images: ["https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80"],
  },
  {
    id: "p20", slug: "cartier-love-bracelet",
    title: "Cartier Love Bracelet 18k Yellow Gold",
    sellerId: "sp-09", sellerName: "Lumière Jewels", sellerVerified: true,
    categorySlug: "jewellery", categoryName: "Jewellery",
    price: 7200, condition: "excellent", status: "active",
    rarity: "Classic", badge: "✦ Featured",
    gradient: "from-yellow-600/40 via-yellow-800/60 to-yellow-950/80",
    isFeatured: false, isTrending: true, viewCount: 4820, wishlistCount: 192,
    description: "Classic Love bracelet in 18k yellow gold, size 17. Original Cartier box and screwdriver. 2020.",
    attributes: { Brand: "Cartier", Model: "Love Bracelet", Metal: "18k Yellow Gold", Size: "17", Year: "2020" },
    images: ["https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80"],
  },

  // ── Collectibles ──────────────────────────────────────────────────
  {
    id: "p21", slug: "bearbrick-kaws-1000",
    title: "Medicom BE@RBRICK KAWS 1000% Black & White",
    sellerId: "sp-10", sellerName: "Tokyo Drops", sellerVerified: false,
    categorySlug: "collectibles", categoryName: "Collectibles",
    price: 6200, condition: "excellent", status: "active",
    rarity: "Limited", badge: "🐻 Rare",
    gradient: "from-zinc-600/40 via-zinc-800/60 to-zinc-950/80",
    isFeatured: true, isTrending: true, viewCount: 8120, wishlistCount: 324,
    description: "KAWS × Medicom BE@RBRICK 1000%. Black and white colorway. Opened but never displayed. Box 9/10.",
    attributes: { Brand: "Medicom Toy", Model: "BE@RBRICK", Artist: "KAWS", Size: "1000%", Colorway: "Black & White" },
    images: ["https://images.unsplash.com/photo-1631134786026-c1f3f8be3f63?w=800&q=80"],
  },
  {
    id: "p22", slug: "nike-dunk-travis-jackboys",
    title: "Nike SB Dunk Low Travis Scott Jackboys",
    sellerId: "sp-10", sellerName: "Tokyo Drops", sellerVerified: false,
    categorySlug: "collectibles", categoryName: "Collectibles",
    price: 4800, condition: "mint", status: "active",
    rarity: "Event Only", badge: "🔥 Hot",
    gradient: "from-brown-600/40 via-stone-800/60 to-stone-950/80",
    isFeatured: false, isTrending: true, viewCount: 9840, wishlistCount: 418,
    description: "DS in original box. Size US 10. GOAT authenticated. Worn by Travis Scott during the Jackboys album drop event.",
    attributes: { Brand: "Nike", Model: "SB Dunk Low", Collab: "Travis Scott × Jackboys", Size: "US 10", Authenticated: "GOAT" },
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80"],
  },
  {
    id: "p23", slug: "supreme-lv-box-logo-tee",
    title: "Supreme × Louis Vuitton Box Logo Tee SS17",
    sellerId: "sp-10", sellerName: "Tokyo Drops", sellerVerified: false,
    categorySlug: "collectibles", categoryName: "Collectibles",
    price: 2800, originalPrice: 3500, condition: "very_good", status: "active",
    rarity: "Archive", badge: "📦 SS17",
    gradient: "from-red-600/40 via-red-800/60 to-slate-950/80",
    isFeatured: false, isTrending: true, viewCount: 4820, wishlistCount: 182,
    description: "Supreme × Louis Vuitton SS17 collaboration tee. Size L. Worn once. Museum-quality archive piece.",
    attributes: { Brand: "Supreme", Collab: "Louis Vuitton", Season: "SS17", Type: "T-Shirt", Size: "L" },
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80"],
  },
]

export const MOCK_ORDERS = [
  {
    id: "ord-01", status: "delivered" as const,
    date: "2024-11-15", total: 1550,
    product: MOCK_PRODUCTS.find(p => p.id === "p11")!,
    tracking: "DHL-4829103",
  },
  {
    id: "ord-02", status: "shipped" as const,
    date: "2024-12-01", total: 7200,
    product: MOCK_PRODUCTS.find(p => p.id === "p20")!,
    tracking: "FEDEX-8821049",
  },
  {
    id: "ord-03", status: "confirmed" as const,
    date: "2024-12-10", total: 38500,
    product: MOCK_PRODUCTS.find(p => p.id === "p02")!,
    tracking: null,
  },
]

export const MOCK_REVIEWS = [
  {
    id: "rev-01", productId: "p11", rating: 5, reviewer: "Emma W.",
    title: "Impeccable condition and fast shipping",
    body: "The bag arrived exactly as described. Condition is honestly better than I expected. Will absolutely buy again.",
    date: "2024-11-20",
  },
  {
    id: "rev-02", productId: "p02", rating: 5, reviewer: "Luca F.",
    title: "Authentication on point, stunning watch",
    body: "Complete set, pristine case. The independent authentication report was thorough. Best purchase on any platform.",
    date: "2024-12-05",
  },
  {
    id: "rev-03", productId: "p10", rating: 4, reviewer: "Priya S.",
    title: "Beautiful bag, great seller",
    body: "The Birkin is gorgeous. Entrupy report put my mind at ease. Minus one star only because shipping took a week.",
    date: "2024-12-08",
  },
  {
    id: "rev-04", productId: "p06", rating: 5, reviewer: "James O.",
    title: "Absolutely jaw-dropping in person",
    body: "KAWS originals are hard to come by. This piece is exactly as described and the studio COA is immaculate.",
    date: "2024-11-30",
  },
  {
    id: "rev-05", productId: "p14", rating: 5, reviewer: "Helena V.",
    title: "The holy grail, delivered",
    body: "PSA 10 MJ rookie. I have been searching for years. Arrived in perfect condition in a hard case.",
    date: "2024-12-01",
  },
]

export const MOCK_TICKETS = [
  {
    id: "tkt-01", subject: "Shipping tracking not updating",
    status: "in_progress" as const, priority: "medium" as const,
    user: "Priya Sharma", orderId: "ord-02", date: "2024-12-10",
    messages: [
      { sender: "Priya Sharma",   body: "Hi, my order was marked shipped 4 days ago but the tracking shows no movement. Can you help?", isInternal: false, date: "2024-12-10T09:00:00Z" },
      { sender: "Support Agent",  body: "Looking into this now — carrier delays in the Milan region this week.", isInternal: true,  date: "2024-12-10T09:15:00Z" },
      { sender: "Support Agent",  body: "Hi Priya, we have confirmed with the carrier — your package is in transit and will arrive within 2 days. Apologies for the delay!", isInternal: false, date: "2024-12-10T09:30:00Z" },
    ],
  },
  {
    id: "tkt-02", subject: "Question about authentication process for sellers",
    status: "open" as const, priority: "low" as const,
    user: "Emma Wilson", orderId: null, date: "2024-12-09",
    messages: [
      { sender: "Emma Wilson", body: "Hello! I am interested in selling on Aureon. What authentication is required for handbags?", isInternal: false, date: "2024-12-09T14:00:00Z" },
    ],
  },
]

// Seller dashboard mock stats
export const MOCK_SELLER_STATS = {
  totalRevenue: 248000,
  totalSales: 47,
  activeListings: 12,
  averageRating: 4.92,
  monthlyRevenue: [
    { month: "Jul", revenue: 18000 },
    { month: "Aug", revenue: 22000 },
    { month: "Sep", revenue: 31000 },
    { month: "Oct", revenue: 28000 },
    { month: "Nov", revenue: 45000 },
    { month: "Dec", revenue: 38000 },
  ],
}

// Admin dashboard mock stats
export const MOCK_ADMIN_STATS = {
  totalUsers: 1284,
  totalSellers: 48,
  totalRevenue: 4820000,
  totalOrders: 892,
  pendingApprovals: 7,
  openTickets: 14,
  monthlyRevenue: [
    { month: "Jul", revenue: 380000 },
    { month: "Aug", revenue: 420000 },
    { month: "Sep", revenue: 510000 },
    { month: "Oct", revenue: 490000 },
    { month: "Nov", revenue: 620000 },
    { month: "Dec", revenue: 580000 },
  ],
}
