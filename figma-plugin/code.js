/* ==========================================================================
   Peek Mee — Build Web Components
   Generates a "Components — Web" frame containing the component set for the
   landing page. Token values are taken from styles.css, which is itself
   derived from this Figma file, so the two stay in agreement.

   Run: Plugins → Development → Import plugin from manifest… → pick
   manifest.json in this folder, then Plugins → Development → Peek Mee.
   ========================================================================== */

// ---------- Tokens (mirrors :root in styles.css) ----------
const HEX = {
  orange: '#FFA74A',
  orangeDark: '#EC9941',
  n0: '#000000',
  n10: '#1C1B1C',
  n20: '#2E2E2E',
  n30: '#484646',
  n90: '#F0F0F0',
  n100: '#FFFFFF',
  cream: '#F6F1EB',
};

const RADIUS_CARD = 16;
const RADIUS_PILL = 32;

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

function solid(hex, opacity) {
  const paint = { type: 'SOLID', color: hexToRgb(hex) };
  if (opacity !== undefined) paint.opacity = opacity;
  return paint;
}

// ---------- Font resolution ----------
// Style names differ between font releases ("SemiBold" vs "Semi Bold"), so
// resolve against what is actually installed rather than hardcoding a guess.
let FONT_INDEX = {};

async function buildFontIndex() {
  const available = await figma.listAvailableFontsAsync();
  FONT_INDEX = {};
  for (const f of available) {
    const family = f.fontName.family;
    if (!FONT_INDEX[family]) FONT_INDEX[family] = [];
    FONT_INDEX[family].push(f.fontName.style);
  }
}

function resolveFont(families, styleCandidates) {
  for (const family of families) {
    const styles = FONT_INDEX[family];
    if (!styles) continue;
    for (const style of styleCandidates) {
      if (styles.indexOf(style) !== -1) return { family, style };
    }
  }
  return null;
}

const BODY_STACK = ['Nunito Sans', 'Inter', 'Roboto'];
const DISPLAY_STACK = ['Fredoka', 'Nunito Sans', 'Inter', 'Roboto'];

const WEIGHT = {
  400: ['Regular'],
  500: ['Medium', 'Regular'],
  600: ['SemiBold', 'Semi Bold', 'Bold', 'Medium'],
  700: ['Bold', 'SemiBold', 'Semi Bold'],
  800: ['ExtraBold', 'Extra Bold', 'Black', 'Bold'],
};

const F = {};
const fontWarnings = [];

async function initFonts() {
  await buildFontIndex();

  const wanted = {
    body400: [BODY_STACK, WEIGHT[400]],
    body500: [BODY_STACK, WEIGHT[500]],
    body700: [BODY_STACK, WEIGHT[700]],
    body800: [BODY_STACK, WEIGHT[800]],
    display600: [DISPLAY_STACK, WEIGHT[600]],
  };

  for (const key of Object.keys(wanted)) {
    const [families, styles] = wanted[key];
    const font = resolveFont(families, styles);
    if (!font) {
      throw new Error(
        'No usable font found for "' + key + '". Tried families: ' +
        families.join(', ') + '. Install Nunito Sans and Fredoka, then re-run.'
      );
    }
    if (font.family !== families[0]) {
      fontWarnings.push(key + ' fell back to ' + font.family + ' ' + font.style);
    }
    F[key] = font;
  }

  const unique = {};
  for (const key of Object.keys(F)) {
    unique[F[key].family + '|' + F[key].style] = F[key];
  }
  for (const k of Object.keys(unique)) {
    await figma.loadFontAsync(unique[k]);
  }
}

// ---------- Node helpers ----------
function autoLayout(name, direction, props) {
  const frame = figma.createFrame();
  frame.name = name;
  frame.layoutMode = direction;
  frame.primaryAxisSizingMode = 'AUTO';
  frame.counterAxisSizingMode = 'AUTO';
  frame.fills = [];
  if (props) {
    for (const key of Object.keys(props)) frame[key] = props[key];
  }
  return frame;
}

function makeText(chars, font, size, lineHeight, colorHex, tracking) {
  const t = figma.createText();
  t.fontName = font;
  t.characters = chars;
  t.fontSize = size;
  t.lineHeight = { unit: 'PIXELS', value: lineHeight };
  t.letterSpacing = { unit: 'PERCENT', value: tracking === undefined ? 1.2 : tracking };
  t.fills = [solid(colorHex)];
  return t;
}

// A text node that wraps: set HEIGHT auto-resize BEFORE FILL, otherwise the
// default WIDTH_AND_HEIGHT mode ignores the fill and collapses the node.
function fillWidth(textNode) {
  textNode.textAutoResize = 'HEIGHT';
  textNode.layoutSizingHorizontal = 'FILL';
}

// ---------- Components ----------
function buildButtonPrimary() {
  const c = figma.createComponent();
  c.name = 'Button / Primary';
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 8;
  c.paddingTop = 10;
  c.paddingBottom = 10;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = RADIUS_PILL;
  c.fills = [solid(HEX.orange)];

  const label = makeText('View more', F.body500, 20, 28, HEX.n0);
  label.name = 'Label';
  c.appendChild(label);

  const prop = c.addComponentProperty('Label', 'TEXT', 'View more');
  label.componentPropertyReferences = { characters: prop };

  return c;
}

function buildNavLink() {
  const c = figma.createComponent();
  c.name = 'Nav / Link';
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.paddingTop = 10;
  c.paddingBottom = 10;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = RADIUS_PILL;
  c.fills = [];

  const label = makeText('Games', F.body500, 20, 28, HEX.n0);
  label.name = 'Label';
  c.appendChild(label);

  // Underline sits absolute so it does not affect the hug height.
  const underline = figma.createRectangle();
  underline.name = 'Underline';
  underline.fills = [solid(HEX.orange)];
  c.appendChild(underline);
  underline.layoutPositioning = 'ABSOLUTE';
  underline.resize(Math.max(c.width - 32, 1), 2);
  underline.x = 16;
  underline.y = c.height - 8;
  underline.constraints = { horizontal: 'STRETCH', vertical: 'MAX' };
  underline.visible = false;

  const labelProp = c.addComponentProperty('Label', 'TEXT', 'Games');
  label.componentPropertyReferences = { characters: labelProp };

  const activeProp = c.addComponentProperty('Active', 'BOOLEAN', false);
  underline.componentPropertyReferences = { visible: activeProp };

  return c;
}

function buildServiceCard() {
  const c = figma.createComponent();
  c.name = 'Card / Service';
  c.layoutMode = 'VERTICAL';
  // resize() resets both sizing modes to FIXED, so it must come first.
  c.resize(264, 100);
  c.primaryAxisSizingMode = 'AUTO';   // height hugs
  c.counterAxisSizingMode = 'FIXED';  // width pinned to 264
  c.cornerRadius = RADIUS_CARD;
  c.clipsContent = true;
  c.fills = [solid(HEX.n20)];

  // Icon well — 200px tall, icon centred. Sized before appending so the
  // later FILL on the horizontal axis is not undone by a resize.
  const iconWell = autoLayout('Icon Well', 'HORIZONTAL', {
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
  });
  iconWell.resize(264, 200);
  iconWell.primaryAxisSizingMode = 'FIXED';
  iconWell.counterAxisSizingMode = 'FIXED';
  c.appendChild(iconWell);
  iconWell.layoutSizingHorizontal = 'FILL';

  const icon = figma.createFrame();
  icon.name = 'Icon';
  icon.resize(80, 80);
  icon.fills = [solid(HEX.cream, 0.25)];
  icon.cornerRadius = 8;
  iconWell.appendChild(icon);

  const body = autoLayout('Body', 'VERTICAL', {
    itemSpacing: 4,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
  });
  c.appendChild(body);
  body.layoutSizingHorizontal = 'FILL';

  const title = makeText('Game Development', F.body700, 20, 28, HEX.cream);
  title.name = 'Title';
  body.appendChild(title);
  fillWidth(title);

  const desc = makeText(
    "We've got tons of experience in game development. No matter what game platform you're interested in, we're here to bring your vision to life.",
    F.body400, 16, 24, HEX.n100
  );
  desc.name = 'Description';
  body.appendChild(desc);
  fillWidth(desc);

  const titleProp = c.addComponentProperty('Title', 'TEXT', 'Game Development');
  title.componentPropertyReferences = { characters: titleProp };
  const descProp = c.addComponentProperty('Description', 'TEXT', desc.characters);
  desc.componentPropertyReferences = { characters: descProp };

  return c;
}

function buildGameDescCard() {
  const c = figma.createComponent();
  c.name = 'Card / Game Description';
  c.layoutMode = 'VERTICAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(264, 320);
  c.primaryAxisAlignItems = 'MAX'; // copy sits at the bottom
  c.paddingTop = 16;
  c.paddingBottom = 16;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = RADIUS_CARD;
  c.clipsContent = true;
  // Stands in for the artwork fill. In CSS the artwork sits under an 80%
  // neutral-20 scrim; swap this for an image fill and re-add the scrim.
  c.fills = [solid(HEX.n20)];

  const copy = makeText(
    "A 2D side-scrolling game that tells the story of a man who is trapped in a room and he doesn't know what happened to him.",
    F.body400, 20, 28, HEX.n100
  );
  copy.name = 'Copy';
  c.appendChild(copy);
  fillWidth(copy);

  const prop = c.addComponentProperty('Copy', 'TEXT', copy.characters);
  copy.componentPropertyReferences = { characters: prop };

  return c;
}

function buildSocialTile() {
  const c = figma.createComponent();
  c.name = 'Tile / Social';
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';
  c.resize(264, 188);
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.cornerRadius = RADIUS_CARD;
  c.fills = [solid(HEX.orange)];
  c.strokes = [solid(HEX.n20)];
  c.strokeWeight = 2;

  const icon = figma.createFrame();
  icon.name = 'Icon';
  icon.resize(48, 48);
  icon.fills = [solid(HEX.n20)];
  icon.cornerRadius = 4;
  c.appendChild(icon);

  return c;
}

function buildStoreBadge() {
  const c = figma.createComponent();
  c.name = 'Badge / Store';
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisAlignItems = 'CENTER';
  c.counterAxisAlignItems = 'CENTER';
  c.itemSpacing = 10;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = 10;
  c.fills = [solid(HEX.n10)];
  // resize() before the sizing modes, otherwise the width hug is reset to FIXED.
  c.resize(120, 44);
  c.primaryAxisSizingMode = 'AUTO';   // width hugs
  c.counterAxisSizingMode = 'FIXED';  // height pinned to 44

  const icon = figma.createFrame();
  icon.name = 'Icon';
  icon.resize(24, 24);
  icon.fills = [solid(HEX.n100)];
  icon.cornerRadius = 4;
  c.appendChild(icon);

  const label = makeText('itch.io', F.body800, 17, 17, HEX.n100);
  label.name = 'Label';
  c.appendChild(label);

  const prop = c.addComponentProperty('Label', 'TEXT', 'itch.io');
  label.componentPropertyReferences = { characters: prop };

  return c;
}

function buildInputField() {
  const c = figma.createComponent();
  c.name = 'Form / Input';
  c.layoutMode = 'HORIZONTAL';
  c.counterAxisAlignItems = 'CENTER';
  c.paddingTop = 8;
  c.paddingBottom = 8;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = 8;
  c.fills = [solid(HEX.n90)];
  c.resize(744, 40);
  c.primaryAxisSizingMode = 'FIXED';  // width pinned to 744
  c.counterAxisSizingMode = 'AUTO';   // height hugs

  const placeholder = makeText('Your name', F.body400, 16, 24, HEX.n30);
  placeholder.name = 'Placeholder';
  c.appendChild(placeholder);
  fillWidth(placeholder);

  // Focus ring as its own node: componentPropertyReferences only accepts
  // 'visible' | 'characters' | 'mainComponent', so a boolean cannot drive
  // strokes directly — it toggles this overlay instead.
  const ring = figma.createRectangle();
  ring.name = 'Focus Ring';
  ring.fills = [];
  ring.strokes = [solid(HEX.orange)];
  ring.strokeWeight = 1;
  ring.cornerRadius = 8;
  c.appendChild(ring);
  ring.layoutPositioning = 'ABSOLUTE';
  ring.x = 0;
  ring.y = 0;
  ring.resize(c.width, c.height);
  ring.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' };
  ring.visible = false;

  const textProp = c.addComponentProperty('Placeholder', 'TEXT', 'Your name');
  placeholder.componentPropertyReferences = { characters: textProp };

  const focusProp = c.addComponentProperty('Focused', 'BOOLEAN', false);
  ring.componentPropertyReferences = { visible: focusProp };

  return c;
}

function buildTextarea() {
  const c = figma.createComponent();
  c.name = 'Form / Textarea';
  c.layoutMode = 'VERTICAL';
  c.paddingTop = 8;
  c.paddingBottom = 8;
  c.paddingLeft = 16;
  c.paddingRight = 16;
  c.cornerRadius = 8;
  c.fills = [solid(HEX.n90)];
  c.resize(744, 200);
  c.primaryAxisSizingMode = 'FIXED';
  c.counterAxisSizingMode = 'FIXED';

  const placeholder = makeText('Your message to us', F.body400, 16, 24, HEX.n30);
  placeholder.name = 'Placeholder';
  c.appendChild(placeholder);
  fillWidth(placeholder);

  const prop = c.addComponentProperty('Placeholder', 'TEXT', 'Your message to us');
  placeholder.componentPropertyReferences = { characters: prop };

  return c;
}

function buildFooterColumn() {
  const c = figma.createComponent();
  c.name = 'Footer / Column';
  c.layoutMode = 'VERTICAL';
  c.itemSpacing = 8;
  c.fills = [];
  c.resize(140, 100);
  c.primaryAxisSizingMode = 'AUTO';   // height hugs
  c.counterAxisSizingMode = 'FIXED';  // width pinned to 140

  const heading = makeText('Pages', F.body700, 16, 24, HEX.n0);
  heading.name = 'Heading';
  c.appendChild(heading);
  fillWidth(heading);

  const items = ['Games', 'Services', 'About', 'Contact'];
  for (const item of items) {
    const link = makeText(item, F.body500, 16, 24, HEX.n0);
    link.name = 'Link';
    c.appendChild(link);
    fillWidth(link);
  }

  const prop = c.addComponentProperty('Heading', 'TEXT', 'Pages');
  heading.componentPropertyReferences = { characters: prop };

  return c;
}

function buildProjectTile() {
  const c = figma.createComponent();
  c.name = 'Tile / Project';
  c.resize(480, 270);
  c.fills = [solid(HEX.n20)];
  c.clipsContent = true;
  return c;
}

function buildSectionTitle() {
  const c = figma.createComponent();
  c.name = 'Type / Section Title';
  c.layoutMode = 'HORIZONTAL';
  c.primaryAxisSizingMode = 'AUTO';
  c.counterAxisSizingMode = 'AUTO';
  c.fills = [];

  const t = makeText('Games', F.display600, 56, 72, HEX.n0, -1.2);
  t.name = 'Title';
  t.textAlignHorizontal = 'CENTER';
  c.appendChild(t);

  const prop = c.addComponentProperty('Title', 'TEXT', 'Games');
  t.componentPropertyReferences = { characters: prop };

  return c;
}

// ---------- Assembly ----------
function sectionGroup(label, components) {
  const group = autoLayout('Group / ' + label, 'VERTICAL', { itemSpacing: 20 });

  const heading = makeText(label, F.body700, 20, 28, HEX.n30);
  heading.name = 'Group Label';
  group.appendChild(heading);

  const row = autoLayout('Row', 'HORIZONTAL', {
    itemSpacing: 32,
    counterAxisAlignItems: 'MIN',
  });
  group.appendChild(row);
  for (const c of components) row.appendChild(c);

  return group;
}

async function main() {
  await initFonts();

  const page = figma.currentPage;

  const root = figma.createFrame();
  root.name = 'Components — Web';
  root.layoutMode = 'VERTICAL';
  root.primaryAxisSizingMode = 'AUTO';
  root.counterAxisSizingMode = 'AUTO';
  root.itemSpacing = 56;
  root.paddingTop = 64;
  root.paddingBottom = 64;
  root.paddingLeft = 64;
  root.paddingRight = 64;
  root.fills = [solid(HEX.cream)];
  root.cornerRadius = 24;

  const title = makeText('Peek Mee — Web Components', F.display600, 40, 52, HEX.n0, -1.2);
  root.appendChild(title);

  const groups = [
    sectionGroup('Actions', [buildButtonPrimary(), buildNavLink()]),
    sectionGroup('Cards', [buildServiceCard(), buildGameDescCard()]),
    sectionGroup('Tiles & Badges', [buildSocialTile(), buildStoreBadge(), buildProjectTile()]),
    sectionGroup('Form', [buildInputField(), buildTextarea()]),
    sectionGroup('Footer & Type', [buildFooterColumn(), buildSectionTitle()]),
  ];
  for (const g of groups) root.appendChild(g);

  // Park the frame clear of anything already on the page.
  let maxX = 0;
  for (const node of page.children) {
    if (node === root) continue;
    maxX = Math.max(maxX, node.x + node.width);
  }
  root.x = page.children.length > 1 ? maxX + 200 : 0;
  root.y = 0;

  page.selection = [root];
  figma.viewport.scrollAndZoomIntoView([root]);

  let msg = 'Built "Components — Web" with 11 components.';
  if (fontWarnings.length) msg += ' Font fallbacks: ' + fontWarnings.join('; ');
  figma.closePlugin(msg);
}

main().catch((err) => {
  figma.closePlugin('Error: ' + err.message);
});
