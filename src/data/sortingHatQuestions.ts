import { SortingHatQuestion } from '../types/game';

// 14 rich Sorting Hat Questions (Original 4 + 10 brand-new themed Hogwarts questions)
export const ALL_SORTING_HAT_QUESTIONS: SortingHatQuestion[] = [
  // 1. Great Hall entrance
  {
    id: 1,
    question: "It is Tomisin's 27th Birthday Feast in the Great Hall! How do you make the entrance?",
    context: "The enchanted ceiling is raining golden confetti and glowing pink butterflies.",
    answers: [
      {
        text: 'Stride in with flaming sparklers, leading the crowd in a triumphant birthday cheer!',
        house: 'gryffindor',
        flavor: 'Bold, charismatic and fiery spirit!',
      },
      {
        text: 'Arrive carrying an intricately designed magical puzzle-box gift filled with enchanted starlight scrolls.',
        house: 'ravenclaw',
        flavor: 'Clever, thoughtful and intellectually gifted!',
      },
      {
        text: 'Bring a massive tray of freshly baked Butterbeer cupcakes and warm hugs for all our friends.',
        house: 'hufflepuff',
        flavor: 'Warm, devoted, fiercely loving and reliable!',
      },
      {
        text: 'Glide in impeccably dressed in emerald and gold silk, commanding total attention with effortless swagger.',
        house: 'slytherin',
        flavor: 'Ambitious, elegant and always playing to win!',
      },
    ],
  },
  // 2. Babalawo shadow hounds alert
  {
    id: 2,
    question: 'Reports come in: The Evil Babalawo has sent shadow hounds toward the castle gates. What is your first instinct?',
    context: 'The Forbidden Forest roars with dark sorcery and eerie whispers.',
    answers: [
      {
        text: 'Draw my wand without hesitation and charge to the front line to shield my friends!',
        house: 'gryffindor',
        flavor: 'Courage under fire!',
      },
      {
        text: 'Analyze the Babalawo’s rune patterns and decipher his ancient hex counters before striking.',
        house: 'ravenclaw',
        flavor: 'Strategic genius and spellcraft mastery!',
      },
      {
        text: 'Form a tight protective circle around our squad, locking shields and passing out stamina elixirs.',
        house: 'hufflepuff',
        flavor: 'Unyielding loyalty and teamwork!',
      },
      {
        text: 'Flank them through the shadows and turn their own dark curses against them with ruthless precision.',
        house: 'slytherin',
        flavor: 'Cunning tactics and devastating counter-moves!',
      },
    ],
  },
  // 3. Secret Chamber artifact
  {
    id: 3,
    question: 'You discover a secret chamber hidden behind a portrait of Tomisin in the Hogwarts corridors. What catches your eye?',
    context: 'The room hums with four distinct magical artifacts.',
    answers: [
      {
        text: 'The Gilded Sword of Lionheart, vibrating with burning valor and untamed strength.',
        house: 'gryffindor',
        flavor: 'Seeking glory and brave adventure!',
      },
      {
        text: 'The Astral Diadem of Infinite Prophecy, whispering secrets of the cosmos and forgotten magic.',
        house: 'ravenclaw',
        flavor: 'Seeking boundless wisdom and magical mastery!',
      },
      {
        text: 'The Golden Chalice of Endless Festivities, bubbling with warmth, restoration and eternal companionship.',
        house: 'hufflepuff',
        flavor: 'Seeking eternal friendship and harmony!',
      },
      {
        text: 'The Emerald Scepter of Sovereign Power, granting mastery over ancient curses and destiny.',
        house: 'slytherin',
        flavor: 'Seeking limitless influence and majesty!',
      },
    ],
  },
  // 4. Milestone birthday wish
  {
    id: 4,
    question: "What is your birthday wish for Tomisin on her 27th milestone?",
    context: "Make a wish on the enchanted Hogwarts Birthday Sorting Candle!",
    answers: [
      {
        text: 'Unstoppable adventures, fearless joy, and conquering every heroic goal in life!',
        house: 'gryffindor',
        flavor: 'Heroic blessings of fire and courage!',
      },
      {
        text: 'Brilliant breakthroughs, deep inspiration, and uncovering wondrous new horizons!',
        house: 'ravenclaw',
        flavor: 'Sagely blessings of wisdom and starry success!',
      },
      {
        text: 'Endless love, true loyal friendships, cozy warm days, and pure golden happiness!',
        house: 'hufflepuff',
        flavor: 'Warm hearth blessings of devotion and delight!',
      },
      {
        text: 'Absolute greatness, undeniable luxury, legendary achievements, and ruling her 27th year in style!',
        house: 'slytherin',
        flavor: 'Sovereign blessings of power and opulence!',
      },
    ],
  },
  // 5. Ollivanders Wand Wood (NEW 1)
  {
    id: 5,
    question: "At Ollivanders Wand Shop, Mr. Ollivander places four unique wand woods before you. Which one hums in resonance with your core?",
    context: "Sparks of magical energy dance across the velvet wand counter.",
    answers: [
      {
        text: 'Blazing Dragonheart Redwood, vibrating with fiery courage and fierce protective power.',
        house: 'gryffindor',
        flavor: 'Valiant spirit and daring will!',
      },
      {
        text: 'Silver Birch entwined with Starlight Crystal, buzzing with deep analytical foresight.',
        house: 'ravenclaw',
        flavor: 'Boundless curiosity and keen perception!',
      },
      {
        text: 'Ancient English Oak bound in Honeyed Amber, sturdy, devoted, and nurturing.',
        house: 'hufflepuff',
        flavor: 'True fidelity and rooted strength!',
      },
      {
        text: 'Black Walnut tipped with Venomous Jade, refined, calculating, and exceptionally potent.',
        house: 'slytherin',
        flavor: 'Ambition, refinement, and razor edge!',
      },
    ],
  },
  // 6. Care of Magical Creatures (NEW 2)
  {
    id: 6,
    question: "Hagrid introduces an enchanted creature to your party on the castle grounds. Which companion do you bond with first?",
    context: "A soft breeze rustles the enchanted paddock leaves.",
    answers: [
      {
        text: 'A Golden Griffon that challenges you to a test of bravery before lowering its wings.',
        house: 'gryffindor',
        flavor: 'Bravery proven in trial!',
      },
      {
        text: 'An Celestial Owl capable of reading ancient celestial scrolls and star maps.',
        house: 'ravenclaw',
        flavor: 'Kindred intellectual kinship!',
      },
      {
        text: 'A playful Niffler puppy who nuzzles your pockets and shares shiny birthday gemstones.',
        house: 'hufflepuff',
        flavor: 'Warm companionship and joyful bonding!',
      },
      {
        text: 'A Shadow Thestral that only reveals itself to those who understand the deepest secrets.',
        house: 'slytherin',
        flavor: 'Exclusivity and arcane mastery!',
      },
    ],
  },
  // 7. Potions Dungeon Concoction (NEW 3)
  {
    id: 7,
    question: "In the dungeon Potions class, you brew an exquisite celebratory elixir for Tomisin's birthday. What is its signature effect?",
    context: "The cauldron bubbles with swirling hues of iridescent violet and gold.",
    answers: [
      {
        text: 'Liquid Valor: Grants indomitable confidence, bold leadership, and immune to fear.',
        house: 'gryffindor',
        flavor: 'Courage distilled into pure flame!',
      },
      {
        text: 'Draught of Eureka: Instantly solves any intricate riddle and illuminates hidden truths.',
        house: 'ravenclaw',
        flavor: 'Mental clarity beyond mortal limits!',
      },
      {
        text: 'Elixir of Endless Jubilee: Spreads hearty laughter, warm hugs, and mends broken spirits.',
        house: 'hufflepuff',
        flavor: 'Soul-soothing warmth and unity!',
      },
      {
        text: 'Essence of Supreme Ascendancy: Magnifies charisma and commands respect in any court.',
        house: 'slytherin',
        flavor: 'Pure sovereign magnetic presence!',
      },
    ],
  },
  // 8. Defense Against the Dark Arts Boggart (NEW 4)
  {
    id: 8,
    question: "You face a rattling wardrobe in Defense Against the Dark Arts. What does your Boggart transform into?",
    context: "The class holds its breath as the brass doorknob turns.",
    answers: [
      {
        text: 'Failing to stand up for your friends when they needed you the most.',
        house: 'gryffindor',
        flavor: 'The noble fear of cowardice!',
      },
      {
        text: 'A blank library where every book is erased and answers are forever lost.',
        house: 'ravenclaw',
        flavor: 'The sage fear of ignorance!',
      },
      {
        text: 'A cold, empty dining hall where everyone you love has grown distant and alone.',
        house: 'hufflepuff',
        flavor: 'The caring fear of loneliness and isolation!',
      },
      {
        text: 'Being stripped of your accomplishments and trapped in powerless mediocrity.',
        house: 'slytherin',
        flavor: 'The ruler fear of helplessness and obscurity!',
      },
    ],
  },
  // 9. Quidditch World Cup Match (NEW 5)
  {
    id: 9,
    question: "You are playing in the Hogwarts Birthday Quidditch Cup. What position fits your natural style of play?",
    context: "The golden snitch zips past the enchanted goal hoops amid stadium roars.",
    answers: [
      {
        text: 'Chaser: Diving courageously into heavy traffic to score the game-winning goal!',
        house: 'gryffindor',
        flavor: 'Aggressive momentum and glorious daring!',
      },
      {
        text: 'Seeker: Analyzing flight trajectories and outsmarting the opposing seeker from above.',
        house: 'ravenclaw',
        flavor: 'Calculated precision and laser focus!',
      },
      {
        text: 'Keeper: Guarding the hoops with unwavering dependability and lifting teammates’ spirits.',
        house: 'hufflepuff',
        flavor: 'Steadfast loyalty and rock-solid defense!',
      },
      {
        text: 'Beater: Dominating the air space and directing Bludgers with calculated tactical control.',
        house: 'slytherin',
        flavor: 'Strategic domination and ruthless leverage!',
      },
    ],
  },
  // 10. The Mirror of Erised (NEW 6)
  {
    id: 10,
    question: "You stumble upon the Mirror of Erised in an abandoned Hogwarts tower. What deepest reflection do you see?",
    context: "The ornate golden frame whispers: 'Erised stra ehru oyt ube cafru oyt on wohsi.'",
    answers: [
      {
        text: 'Yourself leading your allies through historic trials and emerging victorious as legends.',
        house: 'gryffindor',
        flavor: 'The heart of a born hero!',
      },
      {
        text: 'Yourself uncovering the greatest mysteries of the universe in a tower of cosmic knowledge.',
        house: 'ravenclaw',
        flavor: 'The soul of a grand scholar!',
      },
      {
        text: 'Yourself surrounded by Tomisin and lifelong companions laughing around a warm hearth.',
        house: 'hufflepuff',
        flavor: 'The spirit of boundless devotion!',
      },
      {
        text: 'Yourself crowned in emerald regalia, steering the destiny of the wizarding world.',
        house: 'slytherin',
        flavor: 'The vision of an unyielding sovereign!',
      },
    ],
  },
  // 11. Midnight Corridor Patrol (NEW 7)
  {
    id: 11,
    question: "While sneaking through the castle after curfew with Tomisin, you hear Filch and Mrs. Norris approaching! What is your move?",
    context: "Torches flicker along the stone walls as footsteps echo in the dark.",
    answers: [
      {
        text: 'Create a loud distraction down the hall so Tomisin and our party can safely escape!',
        house: 'gryffindor',
        flavor: 'Selfless bravery and quick action!',
      },
      {
        text: 'Cast an illusion charm on the wall tapestry to create a fake door and outsmart them.',
        house: 'ravenclaw',
        flavor: 'Inventive spellcraft under pressure!',
      },
      {
        text: 'Pull everyone into the nearby kitchen pantry and offer Mrs. Norris a treat from the house-elves.',
        house: 'hufflepuff',
        flavor: 'Resourceful kindness and peaceful defusing!',
      },
      {
        text: 'Slip into the shadows, tip-toeing through a secret shortcut known only to the elite.',
        house: 'slytherin',
        flavor: 'Effortless stealth and insider knowledge!',
      },
    ],
  },
  // 12. Ancient Yoruba Runes vs Dark Juju (NEW 8)
  {
    id: 12,
    question: "The Evil Babalawo casts a cursed fog in the forest. You can channel an elemental ancestral blessing to dispel it. Which do you invoke?",
    context: "Ancient drums resound in the mist as pink lightning illuminates the canopy.",
    answers: [
      {
        text: 'The Roaring Thunder of Sango: Smashing dark wards with holy lightning and righteous fire!',
        house: 'gryffindor',
        flavor: 'Furious righteous storm!',
      },
      {
        text: 'The Star Whispers of Orunmila: Reading the cosmic oracle to unweave the curse strand by strand.',
        house: 'ravenclaw',
        flavor: 'Ancient divination and supreme intellect!',
      },
      {
        text: 'The Nurturing Waters of Osun: Cleansing the poisoned roots with pure healing golden dew.',
        house: 'hufflepuff',
        flavor: 'Restorative grace and pure compassion!',
      },
      {
        text: 'The Fierce Winds of Oya: Turning the dark cyclone back upon the Babalawo with ferocious mastery.',
        house: 'slytherin',
        flavor: 'Commanding power and whirlwind vengeance!',
      },
    ],
  },
  // 13. Great Hall Birthday Toast (NEW 9)
  {
    id: 13,
    question: "You stand up to give the main 27th Birthday Toast to Tomisin. What is the central theme of your speech?",
    context: "Hundreds of enchanted goblets are raised across the Four House tables.",
    answers: [
      {
        text: '"To Tomisin: May your 27th year be as fearless, bold, and blazing as a golden phoenix!"',
        house: 'gryffindor',
        flavor: 'Inspiring courage and epic triumphs!',
      },
      {
        text: '"To Tomisin: May every dream unfold like the deepest constellations and bring limitless wonder!"',
        house: 'ravenclaw',
        flavor: 'Poetic insight and boundless horizons!',
      },
      {
        text: '"To Tomisin: No matter how far we wander, you will always have our loyalty, warmth, and love!"',
        house: 'hufflepuff',
        flavor: 'Unconditional love and loyal bond!',
      },
      {
        text: '"To Tomisin: May you dominate your path, shatter every ceiling, and reign with grace and prestige!"',
        house: 'slytherin',
        flavor: 'Empowering ambition and victorious legacy!',
      },
    ],
  },
  // 14. Forbidden Library Restricted Section (NEW 10)
  {
    id: 14,
    question: "You slip into the Restricted Section of the Hogwarts Library to find a counter-curse. Which book calls to you?",
    context: "Books bound in velvet and chains whisper under glowing moonlight.",
    answers: [
      {
        text: 'The Chronicle of Golden Champions: Stories of heroic sacrifices and legendary deeds.',
        house: 'gryffindor',
        flavor: 'Inspired by noble champions of old!',
      },
      {
        text: 'The Codex of Celestial Equations: The fundamental blueprint of magical reality and time.',
        house: 'ravenclaw',
        flavor: 'Thirsting for the ultimate answers!',
      },
      {
        text: 'The Book of Ancient Hospitality: Folk charms that bind communities and protect the hearth.',
        house: 'hufflepuff',
        flavor: 'Rooted in timeless communion!',
      },
      {
        text: 'The Grim Sovereign: Forbidden hexes that break thrones and turn rivals into allies.',
        house: 'slytherin',
        flavor: 'Drawn to absolute mastery and influence!',
      },
    ],
  },
];

/**
 * Utility function to pick `count` random questions from the pool
 * and randomize the positions of their answer options!
 */
export function getRandomSortingQuestions(count: number = 5): SortingHatQuestion[] {
  // 1. Shuffle all questions
  const shuffledQuestions = [...ALL_SORTING_HAT_QUESTIONS].sort(() => Math.random() - 0.5);

  // 2. Pick the first `count`
  const selected = shuffledQuestions.slice(0, count);

  // 3. For each question, randomize the positions of its answers
  return selected.map((q, idx) => ({
    ...q,
    id: idx + 1, // display ID 1..count
    answers: [...q.answers].sort(() => Math.random() - 0.5),
  }));
}
