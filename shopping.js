const fractions = {'¼':'1/4','½':'1/2','¾':'3/4','⅓':'1/3','⅔':'2/3','⅛':'1/8'};
const numberPattern = String.raw`\d+(?:\.\d+)?(?:\s+\d+/\d+|/\d+)?`;
const quantityPattern = new RegExp(
  '^(' + numberPattern + ')(?:\\s*-\\s*(' + numberPattern +
  '))?\\s*(?:(kg|g|ml|litres?|tbsp|tsp|handfuls?|bunch(?:es)?|pinch(?:es)?|slices?)\\b)?\\s*(.+)$', 'i'
);

function quantityNumber(value) {
  return value.split(/\s+/).reduce((total, part) => {
    const [top, bottom = 1] = part.split('/');
    return total + Number(top) / Number(bottom);
  }, 0);
}

const ingredientAliases = {
  'clove of garlic': 'garlic cloves',
  'garlic clove': 'garlic cloves',
  carrots: 'carrot',
  onions: 'onion',
  leeks: 'leek',
  lemons: 'lemon',
  limes: 'lime',
  'bay leaf': 'bay leaves',
  'celery stick': 'celery sticks',
  'red onions': 'red onion',
  'red peppers': 'red pepper',
  'turmeric': 'ground turmeric',
  'cinnamon': 'ground cinnamon',
  'fish fillet': 'fish fillets',
  'regular soy sauce': 'soy sauce',
  'edible oil': 'cooking oil',
  'neutral cooking oil': 'neutral oil',
  'gnocchi': 'potato gnocchi',
  'tofu, extra firm': 'extra-firm tofu',
  'parmesan or vegetarian': 'parmesan or vegetarian hard cheese',
  'chicken breast or boneless': 'chicken breast or boneless chicken thighs',
  'ground black pepper': 'black pepper',
  'creme fraiche': 'crème fraîche',
  'full-fat creme fraiche': 'full-fat crème fraîche',
  'tomato puree': 'tomato purée',
  'gruyere': 'gruyère',
  'basil leaves': 'basil',
  'thyme leaves': 'thyme',
  'fennel bulb': 'fennel',
  'broccoli florets': 'broccoli',
  'rump': 'rump, sirloin or bavette steak',
};

function shoppingIngredient(raw) {
  let line = raw.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
    .replace(/[–—]/g, '-').replace(/[¼½¾⅓⅔⅛]/g, (char, index, source) =>
      (/\d/.test(source[index - 1] || '') ? ' ' : '') + fractions[char])
    .replace(/^(?:optional:|to serve:|about |up to |remaining )\s*/, '')
    .replace(/\s+x\s+(\d+(?:-\d+)?\s*g\b)/, ' × $1')
    .replace(/^(\d+) × (\d+(?:-\d+)?\s*g)\s+tin /, '$2 tinned ')
    .replace(/^(\d+) × (\d+)(?:-(\d+))?\s*g\s+/, (_, count, low, high) =>
      (high ? count * low + '-' + count * high : count * low) + 'g ')
    .replace(/^(\d+(?:\.\d+)?)\s*g tin\s+/, '$1g tinned ')
    .replace(/^(\d+) tbsp \+ (\d+) tsp /, (_, tbsp, tsp) => (3 * tbsp + Number(tsp)) + ' tsp ')
    .replace(/^(?:finely grated )?(?:zest and juice|juice|zest) of (?:remaining )?(\d+(?:[/-]\d+)?) (lemons?|limes?)\b/, '$1 $2')
    .replace(/\bheaped\s+(?=tsp|tbsp)/g, '');

  // Keep distinctions that affect what to buy, such as smoked fish or salted butter.
  line = line.replace(/\s*\([^)]*\)/g, '')
    .replace(/,\s*(?:skinless |bone-in |skin-on )(?=chicken)/g, ' ')
    .split(/[,;]| - |\b for (?:oven|soaking|the |serving)|\b to (?:serve|taste|finish|loosen)|\b plus\b/)[0]
    .replace(/\b(?:finely|roughly|freshly|coarsely|thinly|thickly)\b/g, '')
    .replace(/\b(?:chopped|grated|crushed|softened|melted|optional|good-quality|generous|large|medium|small|thick|ripe)\b/g, (word, offset, source) =>
      word === 'chopped' && /chopped tomatoes/.test(source.slice(offset)) ? word : '')
    .replace(/\s+/g, ' ').trim();

  const match = line.match(quantityPattern);
  const measured = match && !/^[-\d]/.test(match[4]);
  let low = measured ? quantityNumber(match[1]) : null;
  let high = measured ? quantityNumber(match[2] || match[1]) : null;
  let unit = measured ? (match[3] || '') : '';
  let name = (measured ? match[4] : line)
    .replace(/^(?:a little|a|few drops|handful|pinch|lots of)\s+(?:of\s+)?/, '')
    .replace(/^(?:fresh|plain|good|runny|regular|lower-salt|low-salt|reduced-salt|cold|hot|boiling)\s+/g, '')
    .trim();

  if (unit === 'kg' || unit.startsWith('litre')) {
    low *= 1000;
    high *= 1000;
    unit = unit === 'kg' ? 'g' : 'ml';
  }
  if (unit === 'tbsp') {
    low *= 3;
    high *= 3;
    unit = 'tsp';
  }
  name = ingredientAliases[name] || name;
  return {name, low, high, unit};
}

function shoppingParts(line) {
  const saltAndPepper = /^(?:(?:fine )?salt and (?:lots of |freshly ground )?black pepper|black pepper and salt)/i;
  if (saltAndPepper.test(line)) return ['salt', 'black pepper'];
  if (line.startsWith('For chilli butter')) return ['20g butter', '1/2 tsp pul biber or chilli flakes', 'pinch of salt', 'pinch of paprika'];
  if (line.startsWith('1 tbsp butter and')) return ['1 tbsp butter', '1 tbsp neutral oil'];
  return line.split(/; (?=zest of)/i);
}

// Match known varieties so compound names such as peanut butter stay intact.
const ingredientFamilies = [
  [/^(waxy|floury|baby or new) potatoes$/, 'potatoes'],
  [/^(chestnut|oyster|shiitake|chestnut or shiitake) mushrooms$/, 'mushrooms'],
  [/^(red|spring) onions?$/, 'onions'],
  [/^(red|yellow|green|red or yellow) peppers?$/, 'peppers'],
  [/^(red|green|tinned green) lentils$/, 'lentils'],
  [/^(beef|chicken|lower-salt chicken|fish|vegetable|fish or vegetable|vegetable or chicken) stock$/, 'stock'],
  [/^(light|dark) soy sauce$/, 'soy sauce'],
  [/^(unsalted|salted) butter$/, 'butter'],
  [/^(whole|semi-skimmed|skimmed) milk$/, 'milk'],
];

function shoppingName(name) {
  for (const [pattern, family] of ingredientFamilies) {
    const match = pattern.exec(name);
    if (match) return family + ' (' + match[1] + ')';
  }
  return name === 'onion' ? 'onions' : name;
}

function totalIngredients(selected) {
  const items = new Map();
  for (const recipe of selected) {
    recipe.shopping.forEach((line, index) => shoppingParts(line).forEach((part, partIndex, parts) => {
      const {name, low, high, unit} = shoppingIngredient(part);
      if (!name) return;
      const key = JSON.stringify([name, unit, low === null]);
      if (!items.has(key)) items.set(key, {name, unit, low, high, sources: []});
      const item = items.get(key);
      if (item.sources.length && low !== null) {
        item.low += low;
        item.high += high;
      }
      item.sources.push([recipe.id, parts.length === 1 ? index : index + ':' + partIndex, index]);
    }));
  }
  return [...items.values()].sort((a, b) => shoppingName(a.name).localeCompare(shoppingName(b.name), 'en-GB'));
}

function shoppingLabel({name: ingredient, low, high, unit}) {
  const name = shoppingName(ingredient);
  if (low === null) return name;
  const format = value => Number(value.toFixed(3)).toString();
  const amount = value => unit === 'tsp' && value >= 3
    ? [Math.floor(value / 3) + ' tbsp', value % 3 ? format(value % 3) + ' tsp' : ''].filter(Boolean).join(' + ')
    : format(value) + (/^(g|ml)$/.test(unit) ? unit : unit ? ' ' + unit : '');
  if (low === high) return amount(low) + ' ' + name;
  if (['g', 'ml'].includes(unit)) return format(low) + '–' + format(high) + unit + ' ' + name;
  return amount(low) + '–' + amount(high) + ' ' + name;
}
