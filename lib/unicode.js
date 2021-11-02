const _ = require('lodash');
const regenerate = require('regenerate');
const accentsDiacritics = require('remove-accents-diacritics');

// non-printable control characters
// ref: https://en.wikipedia.org/wiki/List_of_Unicode_characters
const CONTROL_CODES = regenerate()
  .addRange(0x0000, 0x001F) // C0 (0000-001F)
  .add(0x007F) // Delete
  .addRange(0x0080, 0x009F) // C1 (0080-009F)
  .toRegExp('g');

// non-standard spaces
// ref: http://jkorpela.fi/chars/spaces.html
const ALTERNATE_SPACES = regenerate()
  .add(0x00A0) // NO-BREAK SPACE
  .add(0x1680) // OGHAM SPACE MARK
  .add(0x180E) // MONGOLIAN VOWEL SEPARATOR
  .addRange(0x2000, 0x200B) // EN QUAD - ZERO WIDTH SPACE
  .add(0x202F) // NARROW NO-BREAK SPACE
  .add(0x205F) // MEDIUM MATHEMATICAL SPACE
  .add(0x3000) // IDEOGRAPHIC SPACE
  .add(0xFEFF) // ZERO WIDTH NO-BREAK SPACE
  .toRegExp('g');

// pattern to match consecutive spaces
// const CONSECUTIVE_SPACES = /\s{2,}/g;

// unicode combining marks
// see: https://github.com/pelias/pelias/issues/829#issuecomment-542614645
// ref: https://en.wikipedia.org/wiki/Combining_character
const COMBINING_MARKS = regenerate()
  .add(0x200D) // ZERO WIDTH JOINER (U+200D)
  .addRange(0x0300, 0x036F) // Combining Diacritical Marks (0300–036F)
  .addRange(0x1AB0, 0x1AFF) // Combining Diacritical Marks Extended (1AB0–1AFF)
  .addRange(0x1DC0, 0x1DFF) // Combining Diacritical Marks Supplement (1DC0–1DFF)
  .addRange(0x20D0, 0x20FF) // Combining Diacritical Marks for Symbols (20D0–20FF)
  .addRange(0xFE00, 0xFE0F) // Variation Selectors (FE00-FE0F)
  .addRange(0xFE20, 0xFE2F) // Combining Half Marks (FE20–FE2F)
  .add(0x3099) // combining dakuten (U+3099)
  .add(0x309A) // combining handakuten (U+309A)
  .toRegExp('g');

// miscellaneous symbols with no relevance to geocoding
const MISC_UNSUPPORTED_SYMBOLS = regenerate()
  // Superscripts and Subscripts (2070-209F)
  // Currency Symbols (20A0-20CF)
  // Letterlike Symbols (2100-214F)
  // Number Forms (2150-218F)
  // Arrows (2190-21FF)
  // Mathematical Operators (2200-22FF)
  // Miscellaneous Technical (2300-23FF)
  // Control Pictures (2400-243F)
  // Optical Character Recognition (2440-245F)
  // Enclosed Alphanumerics (2460-24FF)
  // Box Drawing (2500-257F)
  // Block Elements (2580-259F)
  // Geometric Shapes (25A0-25FF)
  // Miscellaneous Symbols (2600-26FF)
  // Dingbats (2700-27BF)
  // Miscellaneous Mathematical Symbols-A (27C0-27EF)
  // Supplemental Arrows-A (27F0-27FF)
  // Braille Patterns (2800-28FF)
  // Supplemental Arrows-B (2900-297F)
  // Miscellaneous Mathematical Symbols-B (2980-29FF)
  // Supplemental Mathematical Operators (2A00-2AFF)
  // Miscellaneous Symbols and Arrows (2B00-2BFF)
  .addRange(0x2070, 0x2BFF) // A Range Covering Consecutive Blocks Listed Above

  // symbols
  .addRange(0x02B0, 0x02FF) // Spacing Modifier Letters (02B0-02FF)
  .addRange(0x1400, 0x167F) // Unified Canadian Aboriginal Syllabics (1400-167F)
  .addRange(0x1D100, 0x1D1FF) // Musical Symbols (1D100-1D1FF)
  .addRange(0x1D400, 0x1D7FF) // Mathematical Alphanumeric Symbols (1D400-1D7FF)

  // emojis
  .addRange(0x1F300, 0x1F5FF) // Miscellaneous Symbols and Pictographs (1F300-1F5FF)
  .addRange(0x1F3FB, 0x1F3FF) // Emoji Modifier Fitzpatrick (skin tones) (1F3FB–1F3FF)
  .addRange(0x1F600, 0x1F64F) // Emoticons (1F600–1F64F)
  .addRange(0x1F680, 0x1F6FF) // Transport and Map Symbols (1F680-1F6FF)
  .addRange(0x1F900, 0x1F9FF) // Supplemental Symbols and Pictographs (1F900-1F9FF)
  .toRegExp('g');

function normalize(str) {

  // sanity checking
  if(!_.isString(str)){ return str; }

  return str
    .normalize('NFKC')
    .replace(CONTROL_CODES, '')
    .replace(ALTERNATE_SPACES, ' ')
    .replace(MISC_UNSUPPORTED_SYMBOLS, '')
    .replace(COMBINING_MARKS, '');
}

/**
 * Converts alphabetic, numeric, and symbolic characters that are not
 * in the Basic Latin Unicode block(first 127 ASCII characters) to their
 * ASCII equivalent, if one exists.For example, the filter changes à to a.
 */
function fold(str) {

  // sanity checking
  if (!_.isString(str)) { return str; }

  return accentsDiacritics.remove(str)
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .normalize('NFKC');
}

module.exports.normalize = normalize;
module.exports.fold = fold;
