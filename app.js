const browse = document.querySelector('#browse');
const detail = document.querySelector('#detail');
const cart = document.querySelector('#cart');
const pdfs = document.querySelector('#pdfs');
const search = document.querySelector('#search');
const grid = document.querySelector('#grid');
const count = document.querySelector('#count');

const accents = {
  'Fish & seafood': '#376c78',
  'Meat & poultry': '#ad603a',
  Soups: '#a57c23',
  'Pasta & noodles': '#996476',
  'Vegetable dishes': '#568165',
  'Baking & preserves': '#88495e',
};
let category = 'All recipes';

function element(tag, value, className) {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
}

function link(label, url, className) {
  const node = element('a', label, className);
  node.href = url;
  return node;
}

const normalize = value => value.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
const searchable = recipes.map(recipe => normalize([
  recipe.title, recipe.description, recipe.category, ...recipe.lines,
].join(' ')));
const pdfPath = recipe => 'pdfs/' + encodeURIComponent(recipe.pdf);

function drawCards() {
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  const matches = recipes.filter((recipe, index) =>
    (category === 'All recipes' || recipe.category === category) &&
    terms.every(term => searchable[index].includes(term))
  );
  count.textContent = matches.length === 1 ? '1 recipe' : matches.length + ' recipes';
  const cards = matches.map(recipe => {
    const card = link('', '#recipe/' + recipe.id, 'card');
    card.style.setProperty('--accent', accents[recipe.category]);
    card.append(element('span', recipe.category, 'tag'), element('h3', recipe.title), element('p', recipe.description));
    return card;
  });
  grid.replaceChildren(...cards);
  if (!matches.length) grid.append(element('p', 'No recipes match. Try a different search or category.', 'empty'));
}

const filters = document.querySelector('#filters');
for (const label of ['All recipes', ...Object.keys(accents)]) {
  const button = element('button', label, 'filter');
  button.type = 'button';
  button.setAttribute('aria-pressed', String(label === category));
  button.addEventListener('click', () => {
    category = label;
    for (const filter of filters.children) {
      filter.setAttribute('aria-pressed', String(filter === button));
    }
    drawCards();
  });
  filters.append(button);
}
search.addEventListener('input', drawCards);
drawCards();

const originals = new Map();
for (const recipe of recipes) originals.set(recipe.pdf, recipe);
const pdfList = document.querySelector('#pdf-list');
for (const recipe of [...originals.values()].sort((a, b) =>
  (a.collection || a.title).localeCompare(b.collection || b.title)
)) {
  const item = element('li');
  const download = link(recipe.collection || recipe.title, pdfPath(recipe));
  download.download = recipe.pdf;
  item.append(download);
  pdfList.append(item);
}

const heading = /^(ingredients\b|method\b|oven method\b|slow cooker\b|hob method\b|tips\b|best tips\b|make it even better$|how to make it$|to serve$|serving suggestions$|cook.s notes\b|storage\b|make-ahead\b|variations\b|notes$)/i;
const subheading = /^(for the .{1,45}|to finish|fruit filling|crumble topping|chicken|vegetables & finishing|sticky peanut glaze|pasta & filling|creamy sauce|capers & topping|quick marinade|traybake)$/i;
const metadata = /^(serves\b|makes\b|about \d.*servings|\d+.{0,20}minutes \||blackberries \d|yield\b|equipment\b|dish\b|oven \d|prep$|cook$|best with$|best for$)/i;

function recipeBody(recipe) {
  const body = element('section', '', 'recipe-body');
  body.setAttribute('aria-label', 'Recipe instructions');
  let activeList;
  let activeText;
  for (const line of recipe.lines) {
    const bullet = line.match(/^•\s+(.+)/);
    const step = line.match(/^(\d{1,2})(?:[.)]\s+|(?<=^0\d)\s+)(.+)/);
    if (bullet || step) {
      const listType = bullet ? 'UL' : 'OL';
      if (activeList?.tagName !== listType || (step && step[1] === '1' && activeList?.children.length)) {
        activeList = element(listType.toLowerCase());
        if (step) activeList.start = Number(step[1]);
        body.append(activeList);
      }
      activeText = element('li', bullet ? bullet[1] : step[2]);
      activeList.append(activeText);
    } else if (heading.test(line) || subheading.test(line) || /^(?:[A-Z][A-Z &-]{4,})$/.test(line)) {
      activeList = null;
      activeText = null;
      body.append(element(heading.test(line) ? 'h2' : 'h3', line === line.toUpperCase() ? line[0] + line.slice(1).toLowerCase() : line));
    } else if (!activeText || metadata.test(line) || /^(?:Useful note|Serving note|Shopping note|To serve):/i.test(line)) {
      activeList = null;
      activeText = element('p', line);
      body.append(activeText);
    } else {
      activeText.append(' ' + line);
    }
  }
  return body;
}

const cartKey = 'peters-cookbook-shopping';
let shopping = {recipes: [], checked: {}};
try {
  const saved = JSON.parse(localStorage.getItem(cartKey));
  if (Array.isArray(saved?.recipes) && saved.checked) shopping = saved;
} catch {}

function saveShopping() {
  try {
    localStorage.setItem(cartKey, JSON.stringify(shopping));
  } catch {}
  document.querySelector('#cart-link').textContent =
    shopping.recipes.length ? 'Shopping cart (' + shopping.recipes.length + ')' : 'Shopping cart';
}

function drawCart() {
  const title = element('h1', 'Shopping cart');
  cart.replaceChildren(link('All recipes', '#', 'back'), title);
  const selected = recipes.filter(recipe => shopping.recipes.includes(recipe.id));
  if (!selected.length) {
    cart.append(element('p', 'Open a recipe and choose Add to cart to start your list.'));
    return title;
  }

  for (const recipe of selected) {
    const section = element('section', '', 'shopping-recipe');
    const header = element('div', '', 'shopping-header');
    const name = element('h2');
    name.append(link(recipe.title, '#recipe/' + recipe.id));
    const remove = element('button', 'Remove', 'action');
    remove.type = 'button';
    remove.setAttribute('aria-label', 'Remove ' + recipe.title);
    remove.addEventListener('click', () => {
      shopping.recipes = shopping.recipes.filter(id => id !== recipe.id);
      delete shopping.checked[recipe.id];
      saveShopping();
      const cartTitle = drawCart();
      cartTitle.tabIndex = -1;
      cartTitle.focus();
    });
    header.append(name, remove);
    section.append(header);
    for (const [index, ingredient] of recipe.shopping.entries()) {
      const label = element('label', '', 'shopping-item');
      const checkbox = element('input');
      checkbox.type = 'checkbox';
      checkbox.checked = Boolean(shopping.checked[recipe.id]?.[index]);
      checkbox.addEventListener('change', () => {
        (shopping.checked[recipe.id] ??= {})[index] = checkbox.checked;
        saveShopping();
      });
      label.append(checkbox, element('span', ingredient));
      section.append(label);
    }
    cart.append(section);
  }
  return title;
}

saveShopping();

function drawRecipe(recipe) {
  const title = element('h1', recipe.title);
  title.tabIndex = -1;
  const actions = element('div', '', 'actions');
  const original = link('Open original PDF', pdfPath(recipe) + '#page=' + recipe.page, 'action');
  original.target = '_blank';
  original.rel = 'noopener';
  const download = link('Download PDF', pdfPath(recipe), 'action');
  download.download = recipe.pdf;
  const print = element('button', 'Print recipe', 'action');
  print.type = 'button';
  print.addEventListener('click', () => window.print());
  const add = element('button', 'Add to cart', 'action add-cart');
  add.type = 'button';
  const updateButton = () => {
    const added = shopping.recipes.includes(recipe.id);
    add.textContent = added ? 'View shopping cart' : 'Add to cart';
  };
  updateButton();
  const feedback = element('p', '', 'cart-feedback');
  feedback.setAttribute('role', 'status');
  add.addEventListener('click', () => {
    if (shopping.recipes.includes(recipe.id)) {
      location.hash = '#cart';
      return;
    }
    shopping.recipes.push(recipe.id);
    saveShopping();
    updateButton();
    feedback.textContent = 'Ingredients added to your shopping cart.';
  });
  actions.append(add, original, download, print);
  detail.replaceChildren(link('All recipes', '#', 'back'), element('div', recipe.collection || recipe.category, 'tag'), title,
    element('p', recipe.description, 'intro'), actions, feedback, recipeBody(recipe));
  return title;
}

function route(moveFocus = false) {
  const hash = location.hash;
  const recipe = hash.startsWith('#recipe/') && recipes.find(item => '#recipe/' + item.id === hash);
  const showPdfs = hash === '#pdfs';
  const showCart = hash === '#cart';
  cart.hidden = !showCart;
  browse.hidden = Boolean(recipe || showPdfs || showCart);
  detail.hidden = !recipe;
  pdfs.hidden = !showPdfs;
  let title = browse.querySelector('h1');
  if (recipe) title = drawRecipe(recipe);
  if (showCart) title = drawCart();
  if (showPdfs) title = pdfs.querySelector('h1');
  document.title = recipe ? recipe.title + ' | Peter’s Cookbook' : showPdfs ? 'PDF collection | Peter’s Cookbook' : 'Peter’s Cookbook';
  if (moveFocus && hash !== '#main') {
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }
}

window.addEventListener('hashchange', () => route(true));
route();
