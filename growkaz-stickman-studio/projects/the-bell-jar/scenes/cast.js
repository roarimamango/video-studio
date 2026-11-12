// cast.js — one signature item per recurring character, identical in every shot.
export const SYLVIA = { top: 'dress', color: '#f2c21a', head: 'ponytail', headColor: '#f2d27a' };   // Sylvia / Esther — mustard-yellow dress
export const OTTO = { top: 'suit', color: '#5a4a3a', color2: '#d6a24a', face: 'glasses', head: 'none' }; // father — brown suit, glasses
export const AURELIA = { top: 'dress', color: '#3a6ea5', head: 'bun' };                              // mother — blue dress
export const EDITOR = { top: 'suit', color: '#2a2630', color2: '#e04a6a', head: 'fedora', headColor: '#e04a6a' }; // Cyrilly Abels / Jay Cee — rose hat
export const PROUTY = { top: 'dress', color: '#8a5ad6', head: 'curly' };                             // Olive Higgins Prouty / Philomena Guinea — purple
export const DOCTOR = { top: 'labcoat', face: 'glasses', head: 'bun' };                               // Dr Ruth Beuscher / Dr Nolan
export const BADDOC = { top: 'labcoat', head: 'none' };                                              // first doctor (shock therapy)
export const BUDDY = { top: 'tshirt', color: '#d64a33', head: 'none' };                              // Dick Norton / Buddy Willard — red
export const JOAN = { top: 'dress', color: '#f29ac0', head: 'ponytail', headColor: '#f29ac0' };       // Jane Anderson / Joan Gilling — pink
export const TED = { top: 'suit', color: '#3f7a4a', color2: '#1d3a24', head: 'none' };               // Ted Hughes — green jacket
export const BABY = { top: 'tshirt', color: '#f4efe6', head: 'none', kid: true };
export const INK = { top: 'none', head: 'none' };
export const READER = { top: 'hoodie', color: '#7fd0d6', head: 'none' };                           // a reader today — teal hoodie
export const BROTHER = { top: 'tshirt', color: '#5a7aa0', head: 'none', kid: true };
export const WHO = { READER, BROTHER, KID: { ...SYLVIA, kid: true }, SYLVIA, OTTO, AURELIA, EDITOR, PROUTY, DOCTOR, BADDOC, BUDDY, JOAN, TED, BABY, INK };
export const CAST = [SYLVIA, AURELIA, EDITOR, DOCTOR, BUDDY, JOAN, TED];
