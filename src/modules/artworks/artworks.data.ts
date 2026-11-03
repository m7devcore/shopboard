/**
 * AEVUM — Fine Art Master Collection Dataset
 *
 * Contains the 16 approved candidate artworks across 4 active departments.
 * Prices are fictional educational portfolio values ($80,000+).
 * Unverified historical data is preserved as null per the curatorial integrity rule.
 */

import type { Artwork } from "./artworks.types.ts";

export const ARTWORKS: readonly Artwork[] = [
  // =========================================================================
  // Department 1: Paintings (6 artworks)
  // =========================================================================
  {
    id: "aevum-painting-01",
    title: "Portrait of an Elder Gentleman in White Ruff Collar",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-01-elderly-gentleman.jpg",
    imageWidth: 736,
    imageHeight: 941,
    imageAspectRatio: 0.78,
    altText:
      "Three-quarter painted portrait of an elderly bearded gentleman in a black doublet and pleated white ruff collar, holding a letter.",
    description:
      "A formal three-quarter painted portrait depicting a seated nobleman with white beard and mustache, dressed in a dark doublet with a pleated ruff collar, holding a folded document.",
    curatorialSummary:
      "Display title is provisional. Canvas weave and historical glaze layering visible. Unverified Flemish or Italian school.",
    artist: null,
    period: null,
    medium: "Oil on canvas (unverified)",
    origin: null,
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 185000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-painting-02",
    title: "Self-Portrait with Death Playing the Fiddle",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-02-death-and-fiddle.jpg",
    imageWidth: 736,
    imageHeight: 414,
    imageAspectRatio: 1.78,
    altText:
      "Symbolist painting of a bearded artist holding a brush and palette, while a skeletal figure behind him plays a violin.",
    description:
      "Iconic Symbolist composition depicting the artist listening attentively to a grinning skeletal manifestation of Death playing a single-stringed fiddle over his shoulder.",
    curatorialSummary:
      "Composition after Arnold Böcklin (1872). Horizontal landscape crop from vertical canvas. Original in Alte Nationalgalerie, Berlin.",
    artist: "Arnold Böcklin (compositional attribution)",
    period: "1872",
    medium: "Oil on canvas",
    origin: "Switzerland / Germany",
    dimensions: {
      raw: "Original: 75 cm × 61 cm (file cropped)",
      widthCm: 61,
      heightCm: 75,
      depthCm: null,
    },
    classification: "Historical Reference",
    license: {
      status: "Public Domain",
      attribution: "Original work in Public Domain (Arnold Böcklin, d. 1901)",
      watermarkNote: null,
    },
    price: 420000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-painting-03",
    title: "Kneeling Armored Knight with Bouquet of Roses",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-03-knight-with-flowers.jpg",
    imageWidth: 736,
    imageHeight: 1309,
    imageAspectRatio: 0.56,
    altText:
      "A young knight in polished plate armor kneeling beside a stone wall, holding a bouquet of pink roses in contemplative grief.",
    description:
      "An evocative study of contrast depicting a youthful warrior in burnished steel plate armor kneeling on flagstones, gazing sorrowfully at a cluster of garden roses.",
    curatorialSummary:
      "Romantic Pre-Raphaelite aesthetic with digital specular handling. Attributed as digital concept pending historical provenance.",
    artist: null,
    period: null,
    medium: "Digital concept study",
    origin: null,
    dimensions: null,
    classification: "AI-Generated Concept",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 145000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-painting-04",
    title: "Alpine Pastoral Landscape with Hay Wagon and Stream",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-04-pastoral-valley.jpg",
    imageWidth: 736,
    imageHeight: 947,
    imageAspectRatio: 0.78,
    altText:
      "Pastoral landscape painting with laborers loading hay onto an ox-drawn cart beside a river with towering alpine peaks behind.",
    description:
      "A luminous 19th-century romantic landscape showing rural laborers and children at hay harvest beside a reflective river, framed by towering alpine mountains bathed in sunlight.",
    curatorialSummary:
      "Display title is provisional. Fine craquelure and authentic romantic atmospheric perspective. Specific collection pending verification.",
    artist: null,
    period: "Circa 19th Century (unverified)",
    medium: "Oil on canvas (unverified)",
    origin: "Alpine Central Europe (unverified)",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 95000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-painting-05",
    title: "Grieving Roman Slumped by a Marble Sarcophagus",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-05-classical-interior.jpg",
    imageWidth: 736,
    imageHeight: 1308,
    imageAspectRatio: 0.56,
    altText:
      "Academic history painting showing a Roman youth in orange toga collapsed in grief over a marble sarcophagus with a terracotta vase nearby.",
    description:
      "A dramatic academic historicist interior depicting a toga-clad youth collapsed across a carved marble basin in profound mourning, alongside classical fluted columns and a black-figure terracotta vase.",
    curatorialSummary:
      "Vertical framing from a larger neoclassical salon composition. Rich pigment handling and anatomical drapery study.",
    artist: null,
    period: "Late 19th Century Academic (unverified)",
    medium: "Oil on canvas",
    origin: "European Academic Salon (unverified)",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 230000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-painting-06",
    title: "Allegorical Still Life: Pawn Reflected as King",
    category: "Paintings",
    imageSrc: "./assets/catalog/paintings/aevum-painting-06-chess-and-mirror.jpg",
    imageWidth: 735,
    imageHeight: 980,
    imageAspectRatio: 0.75,
    altText:
      "Heavy impasto oil painting of an oval mirror reflecting a white chess King piece while a white pawn stands in the foreground.",
    description:
      "A textured impasto still life exploring perception and ambition: a modest white chess pawn stands on rough timber before an antique oval mirror that reflects the crowned form of a chess King.",
    curatorialSummary:
      "Modern philosophical allegory executed with palette-knife impasto technique. Contemporary conceptual study.",
    artist: null,
    period: null,
    medium: "Oil or digital impasto on panel",
    origin: null,
    dimensions: null,
    classification: "AI-Generated Concept",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 85000,
    inStock: true,
    saleStatus: "Not for Sale",
  },

  // =========================================================================
  // Department 2: Sculptures (3 artworks — excluding Art Journal torso)
  // =========================================================================
  {
    id: "aevum-sculpture-01",
    title: "Veristic Portrait Bust of an Elder Roman Statesman",
    category: "Sculptures",
    imageSrc: "./assets/catalog/sculptures/aevum-sculpture-01-roman-statesman-bust.jpg",
    imageWidth: 736,
    imageHeight: 981,
    imageAspectRatio: 0.75,
    altText:
      "Carved white marble portrait bust of an elderly Roman patrician with bald crown and draped toga, mounted on a pedestal.",
    description:
      "A masterwork of Roman veristic portraiture depicting an austere patrician elder with deeply lined brow, receding hairline, and toga draped across the shoulder in quiet gravitas.",
    curatorialSummary:
      "Exemplifies Roman Republican realism. Photographed under museum directional lighting on pedestal.",
    artist: null,
    period: "Ancient Roman (unverified accession)",
    medium: "Carved white marble",
    origin: "Ancient Rome / Italy",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: "Museum archival collection (unverified)",
      watermarkNote: null,
    },
    price: 310000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-sculpture-03",
    title: "Sculptural Torso of a Youth in Supplication",
    category: "Sculptures",
    imageSrc: "./assets/catalog/sculptures/aevum-sculpture-03-contemplative-figure.jpg",
    imageWidth: 474,
    imageHeight: 843,
    imageAspectRatio: 0.56,
    altText:
      "Marble sculptural torso of a curly-haired young man gazing upward with parted lips and hand raised toward mouth in supplication.",
    description:
      "An expressive marble figure captured in dynamic pathos: the bare-chested youth arches back with parted lips and an upward gaze, hand gently raised in emotional supplication.",
    curatorialSummary:
      "Emotional dynamism evoking Hellenistic baroque or 17th-century Italian marble work. Low-resolution archival crop.",
    artist: null,
    period: null,
    medium: "Carved marble",
    origin: "European classical tradition",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 190000,
    inStock: true,
    saleStatus: "In Exhibition",
  },
  {
    id: "aevum-sculpture-04",
    title: "Patinated Bronze Bust of Napoleon with Laurel Wreath",
    category: "Sculptures",
    imageSrc: "./assets/catalog/sculptures/aevum-sculpture-04-laurel-crowned-bust.jpg",
    imageWidth: 736,
    imageHeight: 996,
    imageAspectRatio: 0.74,
    altText:
      "Dark patinated bronze portrait bust of Napoleon crowned with laurel wreath on pedestal in side chiaroscuro lighting.",
    description:
      "A dark patinated bronze bust after classical neoclassical models, depicting Napoleon Bonaparte crowned as Roman Emperor with a stylized laurel wreath atop an inscribed pedestal.",
    curatorialSummary:
      "After neoclassical model by Chaudet or Canova. Watermark @Artmajeur.com preserved intact on lower neck per preservation guidelines.",
    artist: "After Antoine-Denis Chaudet / Canova model",
    period: "Neoclassical Empire model",
    medium: "Cast bronze with dark green-brown patina",
    origin: "France",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Restricted (Watermarked)",
      attribution: "Artmajeur gallery listing",
      watermarkNote: "@Artmajeur.com watermark preserved intact",
    },
    price: 160000,
    inStock: true,
    saleStatus: "Not for Sale",
  },

  // =========================================================================
  // Department 3: Decorative Antiques (4 artworks)
  // =========================================================================
  {
    id: "aevum-object-01",
    title: "Engraved Gold Armorial Signet Ring on Stone Plinth",
    category: "Decorative Antiques",
    imageSrc: "./assets/catalog/antiques/aevum-object-01-signet-ring.jpg",
    imageWidth: 736,
    imageHeight: 1104,
    imageAspectRatio: 0.67,
    altText:
      "Polished heavy gold signet ring with deeply engraved heraldic coat of arms, displayed on a rough travertine stone block.",
    description:
      "A heavyweight solid yellow-gold signet ring featuring a deeply intaglio-engraved armorial shield with knightly crest and foliate mantling, resting on a raw travertine pedestal.",
    curatorialSummary:
      "Contemporary digital studio photograph (Sony FX30 capture, July 2025). Highlighting craftsmanship and heraldic engraving.",
    artist: null,
    period: "Contemporary studio photograph",
    medium: "Cast and engraved yellow gold",
    origin: "Western European heraldic tradition",
    dimensions: {
      raw: "Finger ring scale (~2.2 cm)",
      widthCm: 2.2,
      heightCm: 2.5,
      depthCm: 1.8,
    },
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: "Studio capture (Sony FX30 EXIF 2025)",
      watermarkNote: null,
    },
    price: 82000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-object-02",
    title: "Gilt and Blued Steel Ceremonial Saber with Scabbard",
    category: "Decorative Antiques",
    imageSrc: "./assets/catalog/antiques/aevum-object-02-ceremonial-sword.jpg",
    imageWidth: 721,
    imageHeight: 960,
    imageAspectRatio: 0.75,
    altText:
      "Curved officer's ceremonial saber with blued and gilded steel blade, bone grip, alongside ornate gilt scabbard.",
    description:
      "An extraordinary Napoleonic officer's ceremonial saber featuring a curved Damascus-style blade blued and heavily fire-gilded with martial trophies, accompanied by an ormolu scabbard.",
    curatorialSummary:
      "Exemplary high-empire martial metalwork typical of Klingenthal or Versailles royal manufactures. Open museum photograph.",
    artist: null,
    period: "Circa 1795–1815 (Napoleonic Era)",
    medium: "Blued and gilded steel, bone, gilt brass (ormolu)",
    origin: "France / German States",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Public Domain",
      attribution: "Public museum archival collection",
      watermarkNote: null,
    },
    price: 275000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-object-03",
    title: "Ceremonial Diamond and Emerald Collar with Tassels",
    category: "Decorative Antiques",
    imageSrc: "./assets/catalog/antiques/aevum-object-03-royal-necklace.jpg",
    imageWidth: 736,
    imageHeight: 981,
    imageAspectRatio: 0.75,
    altText:
      "Regal ceremonial collar set with table-cut diamonds and dangling carved emerald drops with silk tassels inside a museum vitrine.",
    description:
      "A breathtaking court necklace composed of foil-backed table-cut diamonds set in gold with pendant teardrop emeralds and seed pearls, finished with woven silk suspension tassels.",
    curatorialSummary:
      "Photographed in an international museum vitrine. Bilingual descriptive placards visible in lower foreground preserved untouched.",
    artist: null,
    period: "18th–19th Century court jewelry",
    medium: "Diamonds, emeralds, pearls, gold, silk cord",
    origin: "Mughal or Qajar royal court tradition",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Pending Verification",
      attribution: "Museum exhibition photography",
      watermarkNote: null,
    },
    price: 480000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-object-04",
    title: "Gothic Filigree Imperial Crown with Dark Gemstones",
    category: "Decorative Antiques",
    imageSrc: "./assets/catalog/antiques/aevum-object-04-imperial-crown.jpg",
    imageWidth: 736,
    imageHeight: 1308,
    imageAspectRatio: 0.56,
    altText:
      "Intricate open gothic filigree metal crown set with dark faceted gemstones and pearls resting on reflective black surface.",
    description:
      "An open royal crown composed of pierced gothic arches, intricate floral filigree, and faceted dark gemstones flanked by seed pearls, reflected upon polished dark ground.",
    curatorialSummary:
      "Symmetrical dark fantasy aesthetic. Attributed as contemporary digital render or artisan film prop pending provenance.",
    artist: null,
    period: null,
    medium: "Filigree metalwork or 3D digital model",
    origin: null,
    dimensions: null,
    classification: "AI-Generated Concept",
    license: {
      status: "Pending Verification",
      attribution: null,
      watermarkNote: null,
    },
    price: 350000,
    inStock: true,
    saleStatus: "In Exhibition",
  },

  // =========================================================================
  // Department 4: Ceramics & Glass (3 artworks)
  // =========================================================================
  {
    id: "aevum-ceramics-01",
    title: "Engraved Brass Stemmed Chalice with Floral Relief",
    category: "Ceramics & Glass",
    imageSrc: "./assets/catalog/ceramics/aevum-ceramics-01-gilded-goblet.jpg",
    imageWidth: 683,
    imageHeight: 1024,
    imageAspectRatio: 0.67,
    altText:
      "Flared golden-brass stemmed goblet with fine incised floral motifs and knopped stem on black field.",
    description:
      "A traditional flared brass goblet adorned with delicate hand-chased floral and leaf patterns, resting upon an architectural turned stem and stepped circular base.",
    curatorialSummary:
      "Watermark 'RIYAZI MUZAMMIL 2009' in background field preserved intact per ethical image guidelines.",
    artist: null,
    period: "20th Century traditional brassware",
    medium: "Chased and incised brass",
    origin: "South Asia / Sri Lanka",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Restricted (Watermarked)",
      attribution: "Photo copyright Riyazi Muzammil (2009)",
      watermarkNote: "RIYAZI MUZAMMIL 2009 watermark preserved intact",
    },
    price: 88000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-ceramics-02",
    title: "Stoneware Fluted Baluster Vase with Organic Relief",
    category: "Ceramics & Glass",
    imageSrc: "./assets/catalog/ceramics/aevum-ceramics-02-dark-sculptural-vase.jpg",
    imageWidth: 736,
    imageHeight: 935,
    imageAspectRatio: 0.79,
    altText:
      "Dark brown glazed stoneware vase with undulating fluted rim and organic droplet relief decorations against black background.",
    description:
      "A tactile, organic stoneware baluster vase featuring a flared, undulating flower-like rim and delicate sprigged teardrop relief motifs across a charcoal-mottled glaze.",
    curatorialSummary:
      "Art Nouveau / Art Pottery organic aesthetic. Verified CC0 copyright waiver recorded in EXIF header.",
    artist: null,
    period: "Circa 1895–1910 Art Nouveau (unverified)",
    medium: "Glazed stoneware ceramic",
    origin: "European / American Art Pottery",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Creative Commons CC0",
      attribution: "Open-access museum CC0 digitization",
      watermarkNote: null,
    },
    price: 115000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
  {
    id: "aevum-ceramics-03",
    title: "Monumental Ormolu-Mounted Terracotta Ewer with Putti",
    category: "Ceramics & Glass",
    imageSrc: "./assets/catalog/ceramics/aevum-ceramics-03-ornate-baroque-urn.jpg",
    imageWidth: 736,
    imageHeight: 1407,
    imageAspectRatio: 0.52,
    altText:
      "Monumental terracotta ewer with winged cherub handle, relief frieze of dancing putti, and ornate gilt-bronze mounts.",
    description:
      "A monumental French Rococo ornamental ewer: the terracotta vessel is encircled by a high-relief frieze of dancing putti, crowned with a sculpted gilt-bronze winged cherub handle and supported by grotesque mask mounts.",
    curatorialSummary:
      "Style of Claude Michel (Clodion). Google Arts & Culture profile confirms museum digitization in public exhibition.",
    artist: "Style of Claude Michel (Clodion)",
    period: "Late 18th Century (French Rococo)",
    medium: "Terracotta and gilt bronze (ormolu)",
    origin: "France",
    dimensions: null,
    classification: "Historical Reference",
    license: {
      status: "Public Domain",
      attribution: "Google Arts & Culture / Museum Open Access",
      watermarkNote: null,
    },
    price: 295000,
    inStock: true,
    saleStatus: "Not for Sale",
  },
];

export function getArtworks(): readonly Artwork[] {
  return ARTWORKS;
}

export function getArtworkById(id: string): Artwork | undefined {
  return ARTWORKS.find((item) => item.id === id);
}
