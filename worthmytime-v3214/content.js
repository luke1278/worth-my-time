// ===================================
// TIMEPRICE - 3-TIER DETECTION SYSTEM
// ===================================

// Currency symbols and their regex patterns
// Covers all ~150 active ISO 4217 currencies
// Supports formats: $399, AU$399, USD 399, NT$399, 399 TWD, RM49.90, etc.
const CURRENCY_PATTERNS = {
  // ── Major / High-volume ──────────────────────────────────────────────────
  USD: { symbol: '$',    code: 'USD', regex: /(?:USD\s*\$?|US\$|\$\s*USD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*USD)?/g },
  EUR: { symbol: '€',    code: 'EUR', regex: /(?:EUR\s*€?|€\s*EUR\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*EUR)?/g },
  GBP: { symbol: '£',    code: 'GBP', regex: /(?:GBP\s*£?|£\s*GBP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*GBP)?/g },
  JPY: { symbol: '¥',    code: 'JPY', regex: /(?:JPY\s*¥?|¥\s*JPY\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*JPY)?/g },
  CNY: { symbol: '¥',    code: 'CNY', regex: /(?:CNY\s*¥?|RMB\s*¥?|¥\s*CNY\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*CNY|\s*RMB)?/g },
  AUD: { symbol: 'A$',   code: 'AUD', regex: /(?:AUD\s*\$?|AU\$|A\$\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*AUD)?/g },
  CAD: { symbol: 'C$',   code: 'CAD', regex: /(?:CAD\s*\$?|CA\$|C\$\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*CAD)?/g },
  CHF: { symbol: 'Fr',   code: 'CHF', regex: /(?:CHF\s*Fr\.?|Fr\.?\s*CHF\s*)?(\d{1,3}(?:['.\,]\d{3})*(?:[.,]\d{2})?)(?:\s*CHF)?/g },
  HKD: { symbol: 'HK$',  code: 'HKD', regex: /(?:HKD\s*\$?|HK\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*HKD)/g },
  SGD: { symbol: 'S$',   code: 'SGD', regex: /(?:SGD\s*\$?|SG\$|S\$\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*SGD)?/g },
  NZD: { symbol: 'NZ$',  code: 'NZD', regex: /(?:NZD\s*\$?|NZ\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*NZD)/g },
  SEK: { symbol: 'kr',   code: 'SEK', regex: /(?:SEK\s*kr?)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*kr|\s*SEK)/g },
  NOK: { symbol: 'kr',   code: 'NOK', regex: /(?:NOK\s*kr?)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*kr|\s*NOK)/g },
  DKK: { symbol: 'kr',   code: 'DKK', regex: /(?:DKK\s*kr?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*kr\.|\s*DKK)/g },
  // ── Asia-Pacific ─────────────────────────────────────────────────────────
  KRW: { symbol: '₩',    code: 'KRW', regex: /(?:KRW\s*₩?|₩\s*KRW\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*KRW|\s*원)?/g },
  TWD: { symbol: 'NT$',  code: 'TWD', regex: /(?:TWD\s*\$?|NT\$|NTD\s*\$?|\$\s*TWD\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*TWD|\s*NTD)?/g },
  INR: { symbol: '₹',    code: 'INR', regex: /(?:INR\s*₹?|₹\s*INR\s*|Rs\.?\s*)?(\d{1,3}(?:,\d{2})*(?:,\d{3})*(?:\.\d{2})?)(?:\s*INR)?/g },
  IDR: { symbol: 'Rp',   code: 'IDR', regex: /(?:IDR\s*Rp?|Rp\s*IDR\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*IDR)?/g },
  MYR: { symbol: 'RM',   code: 'MYR', regex: /(?:MYR\s*RM?|RM\s*MYR\s*|RM\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MYR)?/g },
  THB: { symbol: '฿',    code: 'THB', regex: /(?:THB\s*฿?|฿\s*THB\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*THB)?/g },
  PHP: { symbol: '₱',    code: 'PHP', regex: /(?:PHP\s*₱?|₱\s*PHP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*PHP)?/g },
  VND: { symbol: '₫',    code: 'VND', regex: /(?:VND\s*₫?|₫\s*VND\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*₫|\s*VND)?/g },
  PKR: { symbol: '₨',    code: 'PKR', regex: /(?:PKR\s*₨?|Rs\.?\s*PKR\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*PKR)?/g },
  BDT: { symbol: '৳',    code: 'BDT', regex: /(?:BDT\s*৳?|৳\s*BDT\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BDT)?/g },
  LKR: { symbol: '₨',    code: 'LKR', regex: /(?:LKR\s*₨?|Rs\.?\s*LKR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*LKR)?/g },
  MMK: { symbol: 'K',    code: 'MMK', regex: /(?:MMK\s*K?|K\s*MMK\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*MMK|\s*Ks)?/g },
  KHR: { symbol: '៛',    code: 'KHR', regex: /(?:KHR\s*៛?|៛\s*KHR\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*KHR)?/g },
  LAK: { symbol: '₭',    code: 'LAK', regex: /(?:LAK\s*₭?|₭\s*LAK\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*LAK)?/g },
  NPR: { symbol: '₨',    code: 'NPR', regex: /(?:NPR\s*₨?|Rs\.?\s*NPR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*NPR)?/g },
  MVR: { symbol: 'Rf',   code: 'MVR', regex: /(?:MVR\s*Rf?|Rf\.?\s*MVR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MVR)?/g },
  MNT: { symbol: '₮',    code: 'MNT', regex: /(?:MNT\s*₮?|₮\s*MNT\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*MNT|\s*₮)?/g },
  KZT: { symbol: '₸',    code: 'KZT', regex: /(?:KZT\s*₸?|₸\s*KZT\s*)?(\d{1,3}(?:[\s,]\d{3})*(?:[.,]\d{2})?)(?:\s*KZT|\s*₸)?/g },
  UZS: { symbol: 'сум',  code: 'UZS', regex: /(?:UZS\s*)?(\d{1,3}(?:[\s,]\d{3})*)(?:\s*UZS|\s*сум)?/g },
  AZN: { symbol: '₼',    code: 'AZN', regex: /(?:AZN\s*₼?|₼\s*AZN\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*AZN|\s*₼)?/g },
  GEL: { symbol: '₾',    code: 'GEL', regex: /(?:GEL\s*₾?|₾\s*GEL\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*GEL|\s*₾)?/g },
  AMD: { symbol: '֏',    code: 'AMD', regex: /(?:AMD\s*֏?|֏\s*AMD\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*AMD|\s*֏)?/g },
  // ── Middle East ───────────────────────────────────────────────────────────
  AED: { symbol: 'د.إ',  code: 'AED', regex: /(?:AED\s*|د\.إ\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*AED|\s*د\.إ)?/g },
  SAR: { symbol: '﷼',    code: 'SAR', regex: /(?:SAR\s*﷼?|﷼\s*SAR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*SAR)?/g },
  QAR: { symbol: '﷼',    code: 'QAR', regex: /(?:QAR\s*﷼?|﷼\s*QAR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*QAR)?/g },
  OMR: { symbol: '﷼',    code: 'OMR', regex: /(?:OMR\s*﷼?|﷼\s*OMR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{3})?)(?:\s*OMR)?/g },
  KWD: { symbol: 'د.ك',  code: 'KWD', regex: /(?:KWD\s*|د\.ك\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{3})?)(?:\s*KWD|\s*د\.ك)?/g },
  BHD: { symbol: 'BD',   code: 'BHD', regex: /(?:BHD\s*BD?|BD\s*BHD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{3})?)(?:\s*BHD)?/g },
  JOD: { symbol: 'JD',   code: 'JOD', regex: /(?:JOD\s*JD?|JD\s*JOD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{3})?)(?:\s*JOD)?/g },
  ILS: { symbol: '₪',    code: 'ILS', regex: /(?:ILS\s*₪?|₪\s*ILS\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*ILS)?/g },
  IRR: { symbol: '﷼',    code: 'IRR', regex: /(?:IRR\s*﷼?|﷼\s*IRR\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*IRR)?/g },
  IQD: { symbol: 'ع.د',  code: 'IQD', regex: /(?:IQD\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*IQD|\s*ع\.د)?/g },
  LBP: { symbol: 'ل.ل',  code: 'LBP', regex: /(?:LBP\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*LBP|\s*ل\.ل)?/g },
  // ── Europe (non-EUR) ──────────────────────────────────────────────────────
  TRY: { symbol: '₺',    code: 'TRY', regex: /(?:TRY\s*₺?|₺\s*TRY\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*TRY|\s*₺)?/g },
  RUB: { symbol: '₽',    code: 'RUB', regex: /(?:RUB\s*₽?|₽\s*RUB\s*)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*RUB|\s*₽)?/g },
  UAH: { symbol: '₴',    code: 'UAH', regex: /(?:UAH\s*₴?|₴\s*UAH\s*)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*UAH|\s*₴)?/g },
  PLN: { symbol: 'zł',   code: 'PLN', regex: /(?:PLN\s*zł?)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*zł|\s*PLN)/g },
  CZK: { symbol: 'Kč',   code: 'CZK', regex: /(?:CZK\s*Kč?)?(\d{1,3}(?:[\s]\d{3})*(?:[.,]\d{2})?)(?:\s*Kč|\s*CZK)/g },
  HUF: { symbol: 'Ft',   code: 'HUF', regex: /(?:HUF\s*Ft?)?(\d{1,3}(?:[\s]\d{3})*)(?:\s*Ft|\s*HUF)/g },
  RON: { symbol: 'lei',  code: 'RON', regex: /(?:RON\s*lei?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*lei|\s*RON)/g },
  ISK: { symbol: 'kr',   code: 'ISK', regex: /(?:ISK\s*kr?)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*kr\.?|\s*ISK)/g },
  HRK: { symbol: 'kn',   code: 'HRK', regex: /(?:HRK\s*kn?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*kn|\s*HRK)/g },
  BGN: { symbol: 'лв',   code: 'BGN', regex: /(?:BGN\s*лв?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*лв|\s*BGN)/g },
  MKD: { symbol: 'ден',  code: 'MKD', regex: /(?:MKD\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*ден|\s*MKD)/g },
  RSD: { symbol: 'din',  code: 'RSD', regex: /(?:RSD\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*din\.?|\s*RSD)/g },
  BAM: { symbol: 'KM',   code: 'BAM', regex: /(?:BAM\s*KM?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*KM|\s*BAM)/g },
  ALL: { symbol: 'L',    code: 'ALL', regex: /(?:ALL\s*L?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*ALL|\s*Lek)/g },
  BYN: { symbol: 'Br',   code: 'BYN', regex: /(?:BYN\s*Br?)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*Br|\s*BYN)/g },
  MDL: { symbol: 'L',    code: 'MDL', regex: /(?:MDL\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*MDL|\s*lei)/g },
  // ── Latin America ─────────────────────────────────────────────────────────
  BRL: { symbol: 'R$',   code: 'BRL', regex: /(?:BRL\s*R?\$?|R\$\s*BRL\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*BRL)?/g },
  MXN: { symbol: '$',    code: 'MXN', regex: /(?:MXN\s*\$?|MX\$|\$\s*MXN\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MXN)/g },
  ARS: { symbol: '$',    code: 'ARS', regex: /(?:ARS\s*\$?|AR\$|\$\s*ARS\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*ARS)/g },
  CLP: { symbol: '$',    code: 'CLP', regex: /(?:CLP\s*\$?|CL\$|\$\s*CLP\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*CLP)/g },
  COP: { symbol: '$',    code: 'COP', regex: /(?:COP\s*\$?|CO\$|\$\s*COP\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*COP)/g },
  PEN: { symbol: 'S/.',  code: 'PEN', regex: /(?:PEN\s*S\/\.?|S\/\.\s*PEN\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*PEN)?/g },
  UYU: { symbol: '$U',   code: 'UYU', regex: /(?:UYU\s*\$U?|\$U\s*UYU\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?)(?:\s*UYU)?/g },
  BOB: { symbol: 'Bs.',  code: 'BOB', regex: /(?:BOB\s*Bs?\.?|Bs\.\s*BOB\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BOB)?/g },
  PYG: { symbol: '₲',    code: 'PYG', regex: /(?:PYG\s*₲?|₲\s*PYG\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*PYG|\s*₲)?/g },
  GTQ: { symbol: 'Q',    code: 'GTQ', regex: /(?:GTQ\s*Q?|Q\s*GTQ\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*GTQ)?/g },
  HNL: { symbol: 'L',    code: 'HNL', regex: /(?:HNL\s*L?|L\s*HNL\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*HNL)?/g },
  CRC: { symbol: '₡',    code: 'CRC', regex: /(?:CRC\s*₡?|₡\s*CRC\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*CRC|\s*₡)?/g },
  DOP: { symbol: 'RD$',  code: 'DOP', regex: /(?:DOP\s*RD\$?|RD\$\s*DOP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*DOP)?/g },
  NIO: { symbol: 'C$',   code: 'NIO', regex: /(?:NIO\s*C\$?|C\$\s*NIO\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*NIO)?/g },
  PAB: { symbol: 'B/.',  code: 'PAB', regex: /(?:PAB\s*B\/\.?|B\/\.\s*PAB\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*PAB)?/g },
  // ── Africa ────────────────────────────────────────────────────────────────
  ZAR: { symbol: 'R',    code: 'ZAR', regex: /(?:ZAR\s*R?|R\s*ZAR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*ZAR)/g },
  NGN: { symbol: '₦',    code: 'NGN', regex: /(?:NGN\s*₦?|₦\s*NGN\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*NGN|\s*₦)?/g },
  KES: { symbol: 'Ksh',  code: 'KES', regex: /(?:KES\s*Ksh?|Ksh\s*KES\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*KES)?/g },
  GHS: { symbol: '₵',    code: 'GHS', regex: /(?:GHS\s*₵?|₵\s*GHS\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*GHS|\s*₵)?/g },
  EGP: { symbol: 'E£',   code: 'EGP', regex: /(?:EGP\s*E£?|E£\s*EGP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*EGP)?/g },
  MAD: { symbol: 'د.م.', code: 'MAD', regex: /(?:MAD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MAD|\s*د\.م\.)/g },
  TZS: { symbol: 'Sh',   code: 'TZS', regex: /(?:TZS\s*Sh?|Tsh\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*TZS|\s*Tsh)?/g },
  UGX: { symbol: 'Sh',   code: 'UGX', regex: /(?:UGX\s*Sh?)?(\d{1,3}(?:,\d{3})*)(?:\s*UGX|\s*USh)?/g },
  ETB: { symbol: 'Br',   code: 'ETB', regex: /(?:ETB\s*Br?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*ETB|\s*Br)?/g },
  XOF: { symbol: 'Fr',   code: 'XOF', regex: /(?:XOF\s*Fr?|CFA\s*XOF\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*XOF|\s*CFA)?/g },
  XAF: { symbol: 'Fr',   code: 'XAF', regex: /(?:XAF\s*Fr?|CFA\s*XAF\s*)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*XAF|\s*FCFA)?/g },
  DZD: { symbol: 'دج',   code: 'DZD', regex: /(?:DZD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*DZD|\s*دج)?/g },
  TND: { symbol: 'DT',   code: 'TND', regex: /(?:TND\s*DT?|DT\s*TND\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{3})?)(?:\s*TND)?/g },
  SDG: { symbol: '£',    code: 'SDG', regex: /(?:SDG\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*SDG)/g },
  RWF: { symbol: 'Fr',   code: 'RWF', regex: /(?:RWF\s*Fr?)?(\d{1,3}(?:,\d{3})*)(?:\s*RWF|\s*RF)?/g },
  MZN: { symbol: 'MT',   code: 'MZN', regex: /(?:MZN\s*MT?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MT|\s*MZN)?/g },
  AOA: { symbol: 'Kz',   code: 'AOA', regex: /(?:AOA\s*Kz?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*Kz|\s*AOA)?/g },
  MWK: { symbol: 'MK',   code: 'MWK', regex: /(?:MWK\s*MK?)?(\d{1,3}(?:,\d{3})*)(?:\s*MK|\s*MWK)?/g },
  ZMW: { symbol: 'ZK',   code: 'ZMW', regex: /(?:ZMW\s*ZK?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*ZK|\s*ZMW)?/g },
  BWP: { symbol: 'P',    code: 'BWP', regex: /(?:BWP\s*P?|P\s*BWP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BWP)?/g },
  // ── Other ─────────────────────────────────────────────────────────────────
  AFN: { symbol: '؋',    code: 'AFN', regex: /(?:AFN\s*؋?|؋\s*AFN\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*AFN|\s*؋)?/g },
  IRR_ALT: { symbol: '﷼', code: 'IRR', regex: /(?:IRR\s*)?(\d{1,3}(?:,\d{3})*)(?:\s*IRR|\s*ریال)?/g },
  FJD: { symbol: 'FJ$',  code: 'FJD', regex: /(?:FJD\s*\$?|FJ\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*FJD)/g },
  XPF: { symbol: 'Fr',   code: 'XPF', regex: /(?:XPF\s*Fr?)?(\d{1,3}(?:[.,]\d{3})*)(?:\s*XPF|\s*CFP)?/g },
  SRD: { symbol: '$',    code: 'SRD', regex: /(?:SRD\s*\$?|\$\s*SRD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*SRD)/g },
  GYD: { symbol: '$',    code: 'GYD', regex: /(?:GYD\s*\$?|\$\s*GYD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*GYD)/g },
  TTD: { symbol: 'TT$',  code: 'TTD', regex: /(?:TTD\s*\$?|TT\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*TTD)/g },
  JMD: { symbol: 'J$',   code: 'JMD', regex: /(?:JMD\s*\$?|J\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*JMD)/g },
  BBD: { symbol: 'Bds$', code: 'BBD', regex: /(?:BBD\s*\$?|Bds\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BBD)/g },
  XCD: { symbol: 'EC$',  code: 'XCD', regex: /(?:XCD\s*\$?|EC\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*XCD)/g },
  BSD: { symbol: '$',    code: 'BSD', regex: /(?:BSD\s*\$?|\$\s*BSD\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BSD)/g },
  BND: { symbol: 'B$',   code: 'BND', regex: /(?:BND\s*\$?|B\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*BND)/g },
  PGK: { symbol: 'K',    code: 'PGK', regex: /(?:PGK\s*K?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*PGK|\s*Kina)?/g },
  WST: { symbol: 'T',    code: 'WST', regex: /(?:WST\s*T?)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*WST|\s*Tālā)?/g },
  SBD: { symbol: 'SI$',  code: 'SBD', regex: /(?:SBD\s*\$?|SI\$)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)|(?<!\w)(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*SBD)/g },
  TOP: { symbol: 'T$',   code: 'TOP', regex: /(?:TOP\s*T\$?|T\$\s*TOP\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*TOP)?/g },
  VUV: { symbol: 'Vt',   code: 'VUV', regex: /(?:VUV\s*Vt?)?(\d{1,3}(?:,\d{3})*)(?:\s*VUV|\s*Vt)?/g },
  MUR: { symbol: '₨',    code: 'MUR', regex: /(?:MUR\s*₨?|Rs\.?\s*MUR\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)(?:\s*MUR)?/g }
};


let settings = {
  salary: 0,
  currency: 'USD',
  workHours: 8,
  workDays: 22,
  enabled: true
};

let hourlyRate = 0;
let processedElements = new WeakSet();
let processedPrices = new Map();
let pageConversionCount = 0; // Track conversions on current page

// ===================================
// CORE FUNCTIONS
// ===================================

function loadSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(['salary', 'workHours', 'workDays', 'enabled'], (data) => {
      settings = {
        salary: parseFloat(data.salary) || 0,
        workHours: parseFloat(data.workHours) || 8,
        workDays: parseFloat(data.workDays) || 22,
        enabled: data.enabled !== false
      };
      
      if (settings.salary > 0 && settings.workHours > 0 && settings.workDays > 0) {
        const totalHoursPerMonth = settings.workHours * settings.workDays;
        hourlyRate = settings.salary / totalHoursPerMonth;
      }
      
      console.log('[Worth My Time] Settings loaded:', {
        salary: settings.salary,
        workHours: settings.workHours,
        workDays: settings.workDays,
        enabled: settings.enabled
      });
      console.log('[Worth My Time] Hourly rate:', hourlyRate);
      resolve();
    });
  });
}

function calculateWorkTime(price) {
  if (hourlyRate === 0 || !price || price <= 0) return null;
  
  const hours = price / hourlyRate;
  
  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}min`;
  } else if (hours < settings.workHours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  } else {
    const days = Math.floor(hours / settings.workHours);
    const remainingHours = Math.round(hours % settings.workHours);
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
}

function parsePrice(priceStr) {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d.]/g, '');
  return parseFloat(cleaned) || 0;
}

function createConvertedElement(price, workTime) {
  const span = document.createElement('span');
  span.className = 'timeprice-converted';
  // Pill badge with gradient background matching the extension's brand colours.
  // display:inline-flex keeps it compact and self-contained on its own line.
  span.style.cssText = [
    'display: inline-flex',
    'align-items: center',
    'gap: 4px',
    'margin-top: 0px',
    'padding: 2px 7px',
    'border-radius: 20px',
    'background: linear-gradient(135deg, #7B6FF0 0%, #5BB8F5 100%)',
    'white-space: nowrap',
    'font-size: 0.78em',
    'line-height: 1.5',
    'font-family: inherit',
    'box-shadow: 0 1px 3px rgba(0,0,0,0.15)',
    'cursor: default',
    // Flex/grid layout reset — prevents the badge from stretching or
    // breaking when injected inside a flex/grid price container
    'align-self: flex-start',
    'flex-shrink: 0',
    'flex-basis: auto',
    'max-width: fit-content',
    'width: fit-content',
    // Block-level wrapper so it sits on its own line even inside flex rows
    // We achieve this by wrapping in a block div at injection time
    'vertical-align: middle'
  ].join(';');

  // Use document.createElement to stay XSS-safe
  const approx = document.createElement('span');
  approx.style.cssText = 'color: rgba(255,255,255,0.75); font-weight: 400;';
  approx.textContent = '≈';

  const time = document.createElement('span');
  time.style.cssText = 'color: #ffffff; font-weight: 700; letter-spacing: 0.01em;';
  time.textContent = workTime;

  span.appendChild(approx);
  span.appendChild(time);
  span.title = `${workTime} of work for $${price.toFixed(2)}`;
  return span;
}

function findProductContainer(element) {
  let current = element;
  const maxLevels = 10;
  
  for (let i = 0; i < maxLevels && current; i++) {
    const classes = current.className || '';
    const id = current.id || '';
    
    if (
      classes.includes('product') ||
      classes.includes('item') ||
      classes.includes('card') ||
      classes.includes('listing') ||
      id.includes('product') ||
      current.hasAttribute('data-asin') ||
      current.hasAttribute('data-component-type')
    ) {
      return current;
    }
    
    current = current.parentElement;
  }
  
  return element.parentElement || element;
}

function isElementVisible(element) {
  if (!element) return false;
  
  const style = window.getComputedStyle(element);
  
  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    style.opacity === '0' ||
    element.hidden ||
    element.offsetParent === null
  ) {
    return false;
  }
  
  if (element.getAttribute('aria-hidden') === 'true') {
    return false;
  }
  
  let parent = element.parentElement;
  let levels = 0;
  while (parent && levels < 5) {
    const parentStyle = window.getComputedStyle(parent);
    if (
      parentStyle.display === 'none' ||
      parentStyle.visibility === 'hidden' ||
      parent.hidden
    ) {
      return false;
    }
    parent = parent.parentElement;
    levels++;
  }
  
  return true;
}

function isStrikethrough(element) {
  if (!element) return false;
  
  let current = element;
  for (let i = 0; i < 5 && current; i++) {
    const style = window.getComputedStyle(current);
    const className = current.className?.toString().toLowerCase() || '';
    const id = current.id?.toLowerCase() || '';
    const tagName = current.tagName?.toUpperCase() || '';
    
    // Skip buttons and interactive elements
    if (
      tagName === 'BUTTON' ||
      tagName === 'A' && className.includes('button') ||
      className.includes('btn') ||
      className.includes('badge') ||
      className.includes('chip') ||
      className.includes('tag')
    ) {
      console.log('[Worth My Time] Skipping button/badge element');
      return true;
    }
    
    if (style.textDecoration.includes('line-through')) {
      console.log('[Worth My Time] Skipping struck-through price');
      return true;
    }
    
    if (
      className.includes('original-price') ||
      className.includes('was-price') ||
      className.includes('rrp') ||
      className.includes('msrp') ||
      className.includes('strike') ||
      className.includes('crossed') ||
      className.includes('old-price') ||
      id.includes('original-price') ||
      id.includes('was-price')
    ) {
      console.log('[Worth My Time] Skipping original/RRP price element');
      return true;
    }
    
    if (tagName === 'DEL' || tagName === 'S') {
      console.log('[Worth My Time] Skipping <del> or <s> price element');
      return true;
    }
    
    current = current.parentElement;
  }
  return false;
}

// Check if a price is a promotional/statistical number (not a product price)
function isPromotionalNumber(price, element) {
  // Periodic/rental prices should never be converted
  if (isPeriodicPrice(element)) return true;
  
  // Skip very large numbers (likely promotional statistics)
  if (price > 100000) { // $100,000+
    console.log('[Worth My Time] Skipping large promotional number:', price);
    return true;
  }
  
  // Check for promotional context in element's own text only
  // (checking parentElement.textContent was too aggressive — sale containers
  //  with "Save" or "Discount" anywhere inside were blocking the actual current price)
  const text = element.textContent?.toLowerCase() || '';
  
  // Skip if element's own text contains promotional indicators
  const promotionalIndicators = [
    'million', 'm+', 'k+', 'billion', 'earned', 'saved', 'cashback earned',
    'shoppers', 'stores', 'trips', 'members', 'users', 'customers'
  ];
  
  for (const indicator of promotionalIndicators) {
    if (text.includes(indicator)) {
      console.log('[Worth My Time] Skipping promotional context:', indicator);
      return true;
    }
  }
  
  return false;
}

// ===================================
// TIER 1: SITE-SPECIFIC DETECTORS
// ===================================

const SITE_DETECTORS = {
  amazon: {
    detect: function(hostname) {
      return hostname.includes('amazon.');
    },
    
    patterns: [
      // Pattern 1: Standard split price (.a-price structure)
      {
        name: 'Amazon Standard Split',
        find: () => document.querySelectorAll('.a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (symbolEl && wholeEl) {
            const symbol = symbolEl.textContent.trim();
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      },
      
      // Pattern 2: Inline price (.a-color-price)
      {
        name: 'Amazon Color Price',
        find: () => document.querySelectorAll('.a-color-price, .a-price-text-normal, .a-price-text'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 3: Deal price
      {
        name: 'Amazon Deal Price',
        find: () => document.querySelectorAll('.dealPrice, [class*="deal"] .a-price, .priceBlockDealPrice'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 4: Buy box price
      {
        name: 'Amazon Buy Box',
        find: () => document.querySelectorAll('#corePrice_feature_div .a-price, #corePriceDisplay_desktop_feature_div .a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (symbolEl && wholeEl) {
            const symbol = symbolEl.textContent.trim();
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      },
      
      // Pattern 5: Subscribe & Save
      {
        name: 'Amazon Subscribe & Save',
        find: () => document.querySelectorAll('.a-declarative .a-color-price, [class*="subscribe"] .a-price'),
        extract: (element) => {
          const text = element.textContent.trim();
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (match) {
            return { price: parsePrice(match[1]), element };
          }
          return null;
        }
      },
      
      // Pattern 6: Search result price  
      {
        name: 'Amazon Search Result',
        find: () => document.querySelectorAll('.s-item__price .a-price, [data-component-type="s-search-result"] .a-price'),
        extract: (container) => {
          const symbolEl = container.querySelector('.a-price-symbol');
          const wholeEl = container.querySelector('.a-price-whole');
          const fractionEl = container.querySelector('.a-price-fraction');
          
          if (wholeEl) {
            const whole = wholeEl.textContent.replace(/[^\d]/g, '');
            const fraction = fractionEl ? fractionEl.textContent.replace(/[^\d]/g, '') : '00';
            const symbol = symbolEl ? symbolEl.textContent.trim() : '$';
            
            if (symbol === '$') {
              return { price: parseFloat(`${whole}.${fraction}`), element: container };
            }
          }
          return null;
        }
      }
    ],
    
    process: function() {
      console.log('[Worth My Time] Using Amazon-specific detector');
      let totalConverted = 0;
      
      this.patterns.forEach(pattern => {
        const elements = pattern.find();
        console.log(`[Worth My Time] ${pattern.name}: Found ${elements.length} elements`);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (isStrikethrough(element)) return;
          
          const priceData = pattern.extract(element);
          if (!priceData) return;
          
          const { price, element: targetElement } = priceData;
          if (price < 1) return;
          
          // Skip promotional/statistical numbers
          if (isPromotionalNumber(price, targetElement)) return;
          
          const productContainer = findProductContainer(targetElement);
          const priceKey = `${productContainer.id || productContainer.className}-${price}`;
          if (processedPrices.has(priceKey)) {
            console.log('[Worth My Time] Skipping duplicate price:', price);
            return;
          }
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          const timeElement = createConvertedElement(price, workTime);
          
          if (targetElement.nextSibling) {
            targetElement.parentNode.insertBefore(timeElement, targetElement.nextSibling);
          } else {
            targetElement.parentNode.appendChild(timeElement);
          }
          
          processedElements.add(element);
          processedElements.add(targetElement);
          processedPrices.set(priceKey, true);
          totalConverted++;
            pageConversionCount++;
          
          console.log(`[Worth My Time] ${pattern.name}: $${price.toFixed(2)} → ${workTime}`);
        });
      });
      
      console.log(`[Worth My Time] Amazon detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // APPLE
  apple: {
    detect: function(hostname) {
      return hostname.includes('apple.com');
    },
    
    patterns: [
      {
        name: 'Apple Product Page - Main Price',
        selector: '[data-autom="prices"], .as-producttile-price, .rf-pdp-pricing',
        validate: function(element) {
          // Skip if already has conversion
          if (element.querySelector('.timeprice-converted')) return false;
          
          // Skip if this is a parent container with child price elements
          const childPrices = element.querySelectorAll('[data-autom="prices"], .as-producttile-price');
          if (childPrices.length > 0 && childPrices[0] !== element) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Apple Price Text Elements',
        selector: 'span',
        validate: function(element) {
          // Skip if already has conversion
          if (element.querySelector('.timeprice-converted')) return false;
          
          // Must be exactly a price format (nothing else)
          const text = element.textContent?.trim();
          if (!text) return false;
          
          // Match Apple's formats: "A$1,799" or "From A$1,799"
          if (!text.match(/^(From\s+)?A?\$\d{1,3}(?:,\d{3})*$/)) return false;
          
          // Skip if parent is already processed
          if (processedElements.has(element.parentElement)) return false;
          
          // Skip very small text
          const fontSize = window.getComputedStyle(element).fontSize;
          if (fontSize && parseFloat(fontSize) < 14) return false;
          
          // Skip if this element has children with the same price
          const children = Array.from(element.children);
          if (children.length > 0) {
            const hasChildPrice = children.some(child => {
              const childText = child.textContent?.trim();
              return childText && childText.match(/A?\$\d{1,3}(?:,\d{3})*$/);
            });
            if (hasChildPrice) return false;
          }
          
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      const seenPriceElements = new Set(); // Track exact elements
      const seenPriceValues = new Set(); // Track price values to avoid duplicates
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        console.log(`[Worth My Time] Apple ${pattern.name}: Found ${elements.length} elements`);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (seenPriceElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          // Extract price (handle "From A$1,799" format)
          const match = text.match(/A?\$(\d{1,3}(?:,\d{3})*)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 100000) return;
          if (isPromotionalNumber(price, element)) return;
          
          // On Apple pages, heavily deduplicate - only show each price value once
          if (seenPriceValues.has(price)) {
            console.log(`[Worth My Time] Apple: Skipping duplicate price $${price}`);
            return;
          }
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          seenPriceElements.add(element);
          seenPriceValues.add(price);
          processedPrices.add(price);
          totalConverted++;
            pageConversionCount++;
          
          console.log(`[Worth My Time] Apple: Converted $${price} → ${workTime} (${pattern.name})`);
        });
      }
      
      console.log(`[Worth My Time] Apple detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // WALMART
  walmart: {
    detect: function(hostname) {
      return hostname.includes('walmart.com');
    },
    
    patterns: [
      {
        name: 'Walmart Product Price',
        selector: '[itemprop="price"], [data-testid="price-wrap"] .price-main, .price-characteristic, span[class*="price"]',
        validate: function(element) {
          // Skip "Was" prices
          const ariaLabel = element.getAttribute('aria-label') || '';
          if (ariaLabel.toLowerCase().includes('was')) return false;
          
          // Skip strikethrough
          if (isStrikethrough(element)) return false;
          
          return true;
        }
      },
      {
        name: 'Walmart Search Results',
        selector: '[data-automation-id="product-price"], [data-testid="list-view"] span[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
            pageConversionCount++;
        });
      }
      
      console.log(`[Worth My Time] Walmart detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // TARGET
  target: {
    detect: function(hostname) {
      return hostname.includes('target.com');
    },
    
    patterns: [
      {
        name: 'Target Product Price',
        selector: '[data-test="product-price"], [data-test="current-price"], .h-text-red, span[class*="Price"]',
        validate: function(element) {
          // Skip "reg" prices (regular/was prices)
          const testAttr = element.getAttribute('data-test') || '';
          if (testAttr.includes('reg')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Target Search Results',
        selector: '[data-test*="ProductCard"] [data-test*="price"], [data-test*="product-price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
            pageConversionCount++;
        });
      }
      
      console.log(`[Worth My Time] Target detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // ETSY
  etsy: {
    detect: function(hostname) {
      return hostname.includes('etsy.com');
    },
    
    patterns: [
      {
        name: 'Etsy Split Price (symbol + value)',
        selector: '.currency-value',
        validate: function(element) {
          // Check if parent has wt-text-strikethrough class
          let parent = element.parentElement;
          for (let i = 0; i < 3 && parent; i++) {
            const classes = parent.className || '';
            if (classes.includes('wt-text-strikethrough')) return false;
            parent = parent.parentElement;
          }
          
          // Check if sibling currency-symbol exists
          const container = element.parentElement;
          if (!container) return false;
          const symbol = container.querySelector('.currency-symbol');
          return symbol !== null;
        },
        extract: function(element) {
          const container = element.parentElement;
          const symbolEl = container.querySelector('.currency-symbol');
          const symbol = symbolEl ? symbolEl.textContent?.trim() : '';
          const value = element.textContent?.trim() || '';
          
          // Combine symbol + value (e.g., "AU$" + "24.98" = "AU$24.98")
          const fullPrice = `${symbol}${value}`;
          
          // Use updated currency regex that handles AU$, USD, etc.
          // For now, just extract the number part
          const match = fullPrice.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return null;
          
          return { 
            price: parseFloat(match[1].replace(/,/g, '')),
            element: container,
            currency: symbol // For future currency matching
          };
        }
      },
      {
        name: 'Etsy Product Price',
        selector: '[data-buy-box-region="price"] .currency-value, [data-selector="price-only"], .wt-text-title-03, p[class*="price"]',
        validate: function(element) {
          // Skip strikethrough prices
          let parent = element.parentElement;
          for (let i = 0; i < 3 && parent; i++) {
            const classes = parent.className || '';
            if (classes.includes('wt-text-strikethrough')) return false;
            parent = parent.parentElement;
          }
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Etsy Search Results',
        selector: '.v2-listing-card .currency-value, .wt-text-body-01, span[class*="currency"]',
        validate: function(element) {
          // Skip strikethrough prices
          let parent = element.parentElement;
          for (let i = 0; i < 3 && parent; i++) {
            const classes = parent.className || '';
            if (classes.includes('wt-text-strikethrough')) return false;
            parent = parent.parentElement;
          }
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      const convertedCards = new WeakSet(); // Per-card deduplication
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          // Find product card for deduplication
          const card = findProductContainer(element);
          if (convertedCards.has(card)) return;
          
          let price, targetElement;
          
          // If pattern has extract function (for split prices), use it
          if (pattern.extract) {
            const extracted = pattern.extract(element);
            if (!extracted) return;
            price = extracted.price;
            targetElement = extracted.element;
          } else {
            // Normal text-based extraction
            const text = element.textContent?.trim();
            if (!text) return;
            
            const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (!match) return;
            
            price = parsePrice(match[1]);
            targetElement = element;
          }
          
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, targetElement)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          targetElement.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          convertedCards.add(card);
          totalConverted++;
            pageConversionCount++;
        });
      }
      
      console.log(`[Worth My Time] Etsy detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // BEST BUY
  bestbuy: {
    detect: function(hostname) {
      return hostname.includes('bestbuy.com');
    },
    
    patterns: [
      {
        name: 'Best Buy Customer Price',
        selector: '[data-testid="price-block-customer-price"] span, [data-testid="customer-price"], .priceView-hero-price span, .priceView-customer-price',
        validate: function(element) {
          // Skip if element is a container with child prices (get innermost)
          const children = Array.from(element.children);
          const hasChildPrice = children.some(child => {
            const childText = child.textContent?.trim();
            return childText && childText.match(/\$\d/);
          });
          if (hasChildPrice) return false;
          
          // Skip regular price (was price)
          const classes = element.className || '';
          if (classes.includes('regular-price')) return false;
          if (classes.includes('was-price')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Best Buy Search Results',
        selector: '[data-testid="price-block-customer-price"] span, .priceView-layout-large .priceView-customer-price, .pricing-price span',
        validate: function(element) {
          // Get innermost price element
          const children = Array.from(element.children);
          const hasChildPrice = children.some(child => {
            const childText = child.textContent?.trim();
            return childText && childText.match(/\$\d/);
          });
          if (hasChildPrice) return false;
          
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      const convertedCards = new WeakSet(); // Per-card deduplication
      
      const runConversion = () => {
        for (const pattern of this.patterns) {
          const elements = document.querySelectorAll(pattern.selector);
          
          elements.forEach(element => {
            if (processedElements.has(element)) return;
            if (element.querySelector('.timeprice-converted')) return;
            if (!isElementVisible(element)) return;
            if (pattern.validate && !pattern.validate(element)) return;
            
            // Find product card container for deduplication
            const card = findProductContainer(element);
            if (convertedCards.has(card)) return;
            
            const text = element.textContent?.trim();
            if (!text) return;
            
            const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
            if (!match) return;
            
            const price = parsePrice(match[1]);
            if (price <= 0 || price > 1000000) return;
            if (isPromotionalNumber(price, element)) return;
            
            const workTime = calculateWorkTime(price);
            if (!workTime) return;
            
            // Best Buy Deals page: price containers are small (29px height)
            // Insert conversion AFTER the container, not inside it
            const conversionElement = createConvertedElement(price, workTime);
            
            // Check if this is a narrow price container (Deals page)
            const containerHeight = element.offsetHeight;
            if (containerHeight < 40) {
              // Insert after the parent to avoid overflow issues
              if (element.nextSibling) {
                element.parentElement.insertBefore(conversionElement, element.nextSibling);
              } else {
                element.parentElement.appendChild(conversionElement);
              }
            } else {
              // Normal insertion for regular product/category pages
              element.appendChild(conversionElement);
            }
            
            processedElements.add(element);
            convertedCards.add(card);
            totalConverted++;
            pageConversionCount++;
          });
        }
        return totalConverted;
      };
      
      // Initial conversion
      totalConverted = runConversion();
      
      // Deals of the Day page: top product loads via React after 1500ms
      // Run delayed conversion to catch late-loading products
      setTimeout(() => {
        const newlyConverted = runConversion();
        if (newlyConverted > totalConverted) {
          console.log(`[Worth My Time] Best Buy: Converted ${newlyConverted - totalConverted} late-loading products`);
          totalConverted = newlyConverted;
        }
      }, 1500);
      
      console.log(`[Worth My Time] Best Buy detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // HOME DEPOT
  homedepot: {
    detect: function(hostname) {
      return hostname.includes('homedepot.com');
    },
    
    patterns: [
      {
        name: 'Home Depot Product Price',
        selector: '[data-testid="price-format__main-price"], .price-format__main-price, .price, span[class*="price"]',
        validate: function(element) {
          // Skip strike prices
          const classes = element.className || '';
          if (classes.includes('strike')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Home Depot Search Results',
        selector: '.price-format__large .price, .product-pod__price, div[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
            pageConversionCount++;
        });
      }
      
      console.log(`[Worth My Time] Home Depot detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },
  
  // COSTCO
  costco: {
    detect: function(hostname) {
      return hostname.includes('costco.com');
    },
    
    patterns: [
      {
        name: 'Costco Product Page - Split Price (whole + decimal)',
        selector: '[data-testid="Text_single-price-whole-value"]',
        validate: function(element) {
          // Check if decimal part exists as sibling
          const parent = element.parentElement;
          if (!parent) return false;
          const decimal = parent.querySelector('[data-testid="Text_single-price-decimal-value"]');
          return decimal !== null;
        },
        extract: function(element) {
          const whole = element.textContent?.trim() || '';
          const parent = element.parentElement;
          const decimalEl = parent.querySelector('[data-testid="Text_single-price-decimal-value"]');
          const decimal = decimalEl ? decimalEl.textContent?.trim() : '00';
          return { price: parseFloat(`${whole}.${decimal}`), element: parent };
        }
      },
      {
        name: 'Costco Product Page - Main Price',
        selector: '[automation-id="productPriceOutput"]',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Costco Product Page - Your Price',
        selector: '.your-price',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          const specificChild = element.querySelector('[automation-id="productPriceOutput"]');
          if (specificChild) return false;
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Costco Home/Listing - Price Spans',
        selector: 'span',
        validate: function(element) {
          if (element.querySelector('.timeprice-converted')) return false;
          const text = element.textContent?.trim();
          if (!text) return false;
          if (!text.match(/^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/)) return false;
          const children = Array.from(element.children);
          const hasChildPrice = children.some(child => {
            const childText = child.textContent?.trim();
            return childText && childText.match(/^\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?$/);
          });
          if (hasChildPrice) return false;
          const fontSize = window.getComputedStyle(element).fontSize;
          if (fontSize && parseFloat(fontSize) < 14) return false;
          const parentText = element.parentElement?.textContent || '';
          if (parentText.toLowerCase().includes('save')) return false;
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      let attempts = 0;
      const maxAttempts = 3;
      
      const attemptConversion = () => {
        attempts++;
        let convertedThisRound = 0;
        const isProductPage = window.location.pathname.includes('/p/');
        const processedPatterns = new Set();
        
        for (const pattern of this.patterns) {
          const elements = document.querySelectorAll(pattern.selector);
          console.log(`[Worth My Time] Costco ${pattern.name}: Found ${elements.length} elements (attempt ${attempts})`);
          
          elements.forEach(element => {
            if (processedElements.has(element)) return;
            if (element.querySelector('.timeprice-converted')) return;
            if (!isElementVisible(element)) return;
            if (pattern.validate && !pattern.validate(element)) return;
            
            let price, targetElement;
            
            // If pattern has extract function (for split prices), use it
            if (pattern.extract) {
              const extracted = pattern.extract(element);
              if (!extracted) return;
              price = extracted.price;
              targetElement = extracted.element;
            } else {
              // Normal text-based extraction
              const text = element.textContent?.trim();
              if (!text) return;
              
              const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
              if (!match) return;
              
              price = parsePrice(match[1]);
              targetElement = element;
            }
            
            if (price <= 0 || price > 1000000) return;
            if (isPromotionalNumber(price, targetElement)) return;
            
            if (isProductPage) {
              const patternKey = `${pattern.name}`;
              if (processedPatterns.has(patternKey)) {
                console.log(`[Worth My Time] Costco: Skip duplicate pattern ${patternKey}`);
                return;
              }
              processedPatterns.add(patternKey);
            }
            
            const workTime = calculateWorkTime(price);
            if (!workTime) return;
            
            targetElement.appendChild(createConvertedElement(price, workTime));
            processedElements.add(element);
            processedPrices.add(price);
            convertedThisRound++;
            totalConverted++;
            pageConversionCount++;
            
            console.log(`[Worth My Time] Costco: Converted $${price} → ${workTime} (${pattern.name})`);
          });
        }
        
        if (convertedThisRound > 0 && attempts < maxAttempts) {
          console.log(`[Worth My Time] Costco: Retry ${attempts}/${maxAttempts}, found ${convertedThisRound} new prices`);
          setTimeout(attemptConversion, 800);
        } else {
          console.log(`[Worth My Time] Costco detector converted ${totalConverted} total prices after ${attempts} attempts`);
        }
      };
      
      attemptConversion();
      return totalConverted;
    }
  },
  
  // SHEIN
  shein: {
    detect: function(hostname) {
      return hostname.includes('shein.com') || hostname.includes('us.shein.com');
    },
    
    patterns: [
      {
        name: 'Shein Product Price',
        selector: '.product-intro__head-price, .from-price-text .price-text, .del-price-box__price, span[class*="price"]',
        validate: function(element) {
          // Skip original price
          const classes = element.className || '';
          if (classes.includes('original')) return false;
          
          return !isStrikethrough(element);
        }
      },
      {
        name: 'Shein Search Results',
        selector: '.S-product-item__price, .product-card__prices, .goods-price, div[class*="price"]',
        validate: function(element) {
          return !isStrikethrough(element);
        }
      }
    ],
    
    process: function() {
      let totalConverted = 0;
      
      for (const pattern of this.patterns) {
        const elements = document.querySelectorAll(pattern.selector);
        
        elements.forEach(element => {
          if (processedElements.has(element)) return;
          if (element.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(element)) return;
          if (pattern.validate && !pattern.validate(element)) return;
          
          const text = element.textContent?.trim();
          if (!text) return;
          
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          
          const price = parsePrice(match[1]);
          if (price <= 0 || price > 1000000) return;
          if (isPromotionalNumber(price, element)) return;
          
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          
          element.appendChild(createConvertedElement(price, workTime));
          processedElements.add(element);
          processedPrices.add(price);
          totalConverted++;
            pageConversionCount++;
        });
      }
      
      console.log(`[Worth My Time] Shein detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // ===================================
  // NEW SITE-SPECIFIC DETECTORS
  // Each site has its own isolated process() function.
  // To adjust a site, only edit its block below.
  // ===================================

  // --------------------------------------------------
  // CATEGORY 1: PREMIUM BRANDED ELECTRONICS (DTC)
  // --------------------------------------------------

  // SAMSUNG
  // Structure: DTC store uses .price-info spans and [class*="price__"] elements.
  // Product pages: .price__value, .price__currency. Listing: .card-price__value
  samsung: {
    detect: function(hostname) {
      return hostname.includes('samsung.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '.price__value',           // Product page main price
        '.card-price__value',      // Category/listing cards
        '[class*="price-value"]',  // Variant prices
        '.price-info .price',      // Promotions block
        '[data-testid="price"]'    // React-rendered prices
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        // Samsung splits symbol from value — grab closest text with digit
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/[\$USD]*\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Samsung detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SONY
  // Structure: Sony DTC uses .price-container, .product-price, [data-price]
  // Electronics store pages use .pdp-price__amount and .product-tile__price
  sony: {
    detect: function(hostname) {
      return hostname.includes('sony.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '.pdp-price__amount',          // Product detail page
        '.product-tile__price',        // Listing tiles
        '[class*="price__amount"]',    // Variant: price amount spans
        '[data-price]',                // Data attribute prices
        '.price-container .price',     // Price container
        '[class*="ProductPrice"]'      // React component prices
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Sony detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // MICROSOFT STORE
  // Structure: Uses [data-bi-id="price"], .price-info span, .product-price
  // Surface/Xbox pages use .c-price and [data-price-value]
  microsoft: {
    detect: function(hostname) {
      return hostname.includes('microsoft.com') && (
        window.location.pathname.includes('/store') ||
        window.location.pathname.includes('/d/') ||
        window.location.pathname.includes('/p/')
      );
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '.c-price',                    // Legacy store price
        '[data-price-value]',          // Data attribute price
        '[class*="ProductPrice"]',     // React store component
        '.price-info',                 // Price info block
        '[aria-label*="price"]',       // ARIA labelled prices
        '[data-bi-id="price"] span'    // BI-tracked price elements
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        // Skip elements that contain child prices (get leaf nodes only)
        if (el.querySelector('[data-price-value], .c-price')) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Microsoft Store detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // DELL
  // Structure: Dell uses .ps-dell-price, [data-price], .ps-price__sale
  // Alienware/XPS product pages: .dell-price, [data-testid*="price"]
  dell: {
    detect: function(hostname) {
      return hostname.includes('dell.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '.ps-dell-price',              // Standard Dell product price
        '.ps-price__sale',             // Sale price block
        '[data-testid*="price"]',      // Testid-marked prices
        '.dell-price',                 // Generic Dell price class
        '[class*="PriceDisplay"]',     // React price display
        '[class*="price-value"]'       // Price value variants
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Dell detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 2: LUXURY RESALE & AUTHENTICATION
  // --------------------------------------------------

  // STOCKX
  // Structure: React app. Uses [data-testid="product-price"], .chakra-text with price,
  // and .LowestAsk--price, .product-grid-item__price
  stockx: {
    detect: function(hostname) {
      return hostname.includes('stockx.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="product-price"]',         // Product page main price
        '[data-testid="lowest-ask"]',             // Lowest ask price
        '[class*="LowestAsk"]',                   // Lowest ask component
        '[class*="product-grid-item__price"]',    // Grid card price
        '[class*="ProductPrice"]',                // React product price
        '[data-testid*="price"]'                  // Any testid price
      ];

      // StockX is React — retry logic needed
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip "Last Sale" container labels
          const label = el.closest('[data-testid]')?.getAttribute('data-testid') || '';
          if (label.includes('last-sale') || label.includes('ask-bid')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500); // React late-load retry

      console.log(`[Worth My Time] StockX detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GOAT
  // Structure: Next.js app. Uses [data-qa="product-price"], .ProductPrice,
  // .product-card__price, [class*="ListingPrice"]
  goat: {
    detect: function(hostname) {
      return hostname.includes('goat.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-qa="product-price"]',      // Product page QA price
        '[data-qa="listing-price"]',      // Listing price
        '[class*="ProductPrice"]',        // React price component
        '[class*="ListingPrice"]',        // Listing price component
        '.product-card__price',           // Card price in grid
        '[class*="price-tag"]'            // Price tag elements
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip "Retail Price" labels (original retail, not resale price)
          const parentText = el.parentElement?.textContent?.toLowerCase() || '';
          if (parentText.startsWith('retail')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] GOAT detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // THE REALREAL
  // Structure: Uses .price-container, [data-testid="price"], .product-price
  // Listing pages: .listing-price, [class*="Price__"]
  therealreal: {
    detect: function(hostname) {
      return hostname.includes('therealreal.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="price"]',          // Main product price
        '[data-testid="listing-price"]',  // Listing card price
        '[class*="Price__"]',             // CSS module price
        '.price-container',               // Price container
        '.listing-price',                 // Listing price
        '[class*="product-price"]'        // Product price generic
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] The RealReal detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // POSHMARK
  // Structure: React app. Uses [data-et-element-id="listing_price"],
  // .listing-price, [class*="Price"], .tile__price
  poshmark: {
    detect: function(hostname) {
      return hostname.includes('poshmark.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-et-element-id="listing_price"]',  // Tracked listing price
        '.listing-price',                         // Listing price class
        '[class*="listing__price"]',              // CSS module
        '.tile__price',                           // Grid tile price
        '[class*="Price"]',                       // Price component
        '[itemprop="price"]'                      // Schema.org price
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 50000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Poshmark detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 3: HIGH-END FASHION MULTI-BRAND RETAILERS
  // --------------------------------------------------

  // NORDSTROM
  // Structure: React app. Uses [data-element-id="price"], [class*="PriceDisplay"],
  // .price-wrapper, [class*="price__current"]
  nordstrom: {
    detect: function(hostname) {
      return hostname.includes('nordstrom.com') && !hostname.includes('nordstromrack');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-element-id="price"]',       // Main price element
        '[class*="PriceDisplay"]',         // React price display
        '[class*="price__current"]',       // Current price
        '[class*="price-wrapper"]',        // Price wrapper
        '[data-testid="price"]',           // Test ID price
        '[class*="Price_current"]'         // CSS module current price
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip "Was" price containers
          const ariaLabel = el.getAttribute('aria-label') || '';
          if (ariaLabel.toLowerCase().includes('was')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Nordstrom detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // FARFETCH
  // Structure: React/Next.js. Uses [data-component="Price"], [class*="price_"],
  // [data-testid="price-value"], [class*="ProductCard__price"]
  farfetch: {
    detect: function(hostname) {
      return hostname.includes('farfetch.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-component="Price"]',         // Price component
        '[data-testid="price-value"]',      // Price value testid
        '[class*="price_"]',                // CSS module price
        '[class*="ProductCard__price"]',    // Product card price
        '[class*="PriceDisplay"]',          // Price display component
        '[data-tstid="priceInfo-newPrice"]' // New price info
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Farfetch detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SSENSE
  // Structure: Vue app. Uses .price, [class*="product__price"],
  // [class*="ProductCard_price"], .c-price
  ssense: {
    detect: function(hostname) {
      return hostname.includes('ssense.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[class*="product__price"]',       // Product page price
        '[class*="ProductCard_price"]',    // Card price
        '[class*="ProductPrice"]',         // Price component
        '.c-price',                        // Generic price class
        '[data-testid="price"]',           // Test ID
        'h2[class*="price"]'               // h2 price headers
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] SSENSE detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SAKS FIFTH AVENUE
  // Structure: Uses [data-testid="product-price"], [class*="PriceDisplay"],
  // .product-price, [itemprop="price"]
  saks: {
    detect: function(hostname) {
      return hostname.includes('saksfifthavenue.com') || hostname.includes('saks.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="product-price"]',   // Main product price
        '[itemprop="price"]',              // Schema.org price
        '[class*="PriceDisplay"]',         // React price display
        '.product-price',                  // Generic price
        '[class*="price__"]',              // CSS module price
        '[data-auto="price"]'              // Automation attribute price
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Saks Fifth Avenue detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // NET-A-PORTER
  // Structure: Uses [data-test="product-price"], [class*="ProductPrice"],
  // [data-test*="price"], .product-price__price
  netaporter: {
    detect: function(hostname) {
      return hostname.includes('net-a-porter.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-test="product-price"]',      // Main product price
        '[data-test*="price"]',             // Any test price
        '[class*="ProductPrice"]',          // React price component
        '.product-price__price',            // BEM price element
        '[class*="price__amount"]',         // Price amount
        '[itemprop="price"]'                // Schema.org price
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Net-a-Porter detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 4: PREMIUM AUDIO & LIFESTYLE ACCESSORIES
  // --------------------------------------------------

  // BOSE
  // Structure: React app. Uses [class*="Price"], [data-autom="price"],
  // .price-wrapper span, [class*="product-price"]
  bose: {
    detect: function(hostname) {
      return hostname.includes('bose.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-autom="price"]',            // Automation price marker
        '[class*="Price__value"]',         // CSS module price value
        '[class*="product-price"]',        // Product price class
        '.price-wrapper span',             // Price wrapper span
        '[class*="PriceDisplay"]',         // React price display
        '[data-testid="price"]'            // Test ID price
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Bose detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SONOS
  // Structure: Next.js. Uses [class*="Price"], [data-testid="product-price"],
  // .price-value, [class*="priceContainer"]
  sonos: {
    detect: function(hostname) {
      return hostname.includes('sonos.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="product-price"]',   // Product price testid
        '[class*="Price"]',                // Price class variants
        '.price-value',                    // Price value
        '[class*="priceContainer"]',       // Price container
        '[itemprop="price"]',              // Schema.org
        '[class*="PriceTag"]'              // Price tag component
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        // Avoid price containers that have child price elements
        if (el.querySelector('[class*="Price"], [itemprop="price"]')) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Sonos detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 5: FAST FASHION & IMPULSE PLATFORMS
  // --------------------------------------------------

  // TEMU
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // ._2Eg0_, .price__current (highly obfuscated class names — use data attrs)
  temu: {
    detect: function(hostname) {
      return hostname.includes('temu.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="price"]',              // Test ID price
        '[class*="price-content"]',           // Price content wrapper
        '[class*="product-price"]',           // Product price
        '[class*="goods-price"]',             // Goods price (Temu specific)
        '[class*="sale-price"]',              // Sale price
        '[class*="Price__"]'                  // CSS module price
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 0.5 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 2000); // Temu loads slowly via React

      console.log(`[Worth My Time] Temu detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // H&M
  // Structure: Uses [class*="ProductPrice"], [data-testid="price"],
  // .product-price-value, [class*="Price__"]
  hm: {
    detect: function(hostname) {
      return hostname.includes('hm.com') || hostname.includes('h&m.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="price"]',          // Test ID price
        '[class*="ProductPrice"]',        // Product price component
        '.product-price-value',           // Price value
        '[class*="Price__"]',             // CSS module price
        '[class*="price-value"]',         // Price value generic
        '[itemprop="price"]'              // Schema.org
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] H&M detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // ASOS
  // Structure: React app. Uses [data-auto-id="productPrice"], [class*="Price"],
  // [data-testid*="price"], .price-wrapper
  asos: {
    detect: function(hostname) {
      return hostname.includes('asos.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-auto-id="productPrice"]',    // Product page price
        '[data-auto-id="price"]',           // Auto ID price
        '[class*="ProductPrice"]',          // React price component
        '[data-testid*="price"]',           // Test ID price
        '[class*="price__current"]',        // Current price BEM
        '[class*="Price_price"]'            // CSS module price
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip "Was" price labels
          const label = el.previousElementSibling?.textContent?.toLowerCase() || '';
          if (label.includes('was') || label.includes('rrp')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] ASOS detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 6: GAMING & PERIPHERALS
  // --------------------------------------------------

  // RAZER
  // Structure: Uses [class*="price"], [data-testid="price"],
  // .product-price, [class*="ProductPrice"]. Shopify-based.
  razer: {
    detect: function(hostname) {
      return hostname.includes('razer.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="price"]',           // Test ID price
        '[class*="ProductPrice"]',         // Product price component
        '.product-price',                  // Product price generic
        '[class*="price__current"]',       // Current price
        '[class*="price-item"]',           // Shopify price item
        'span[class*="price"]'             // Price spans
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        // Skip "Regular price" (Shopify original price)
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Razer detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CORSAIR
  // Structure: Uses [class*="price"], .product-price, [itemprop="price"],
  // [data-product-price]. Custom Shopify store.
  corsair: {
    detect: function(hostname) {
      return hostname.includes('corsair.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[itemprop="price"]',              // Schema.org
        '[data-product-price]',            // Data attribute price
        '[class*="price-item--regular"]',  // Shopify regular price
        '[class*="price-item--sale"]',     // Shopify sale price
        '.product-price',                  // Generic product price
        '[class*="ProductPrice"]'          // Price component
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Corsair detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 7: BEAUTY & SKINCARE
  // --------------------------------------------------

  // SEPHORA
  // Structure: React app. Uses [data-comp="Price"], [class*="Price"],
  // [data-at="price"], [class*="css-Price"]
  sephora: {
    detect: function(hostname) {
      return hostname.includes('sephora.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-comp="Price"]',             // Price component
        '[data-at="price"]',               // Data attribute price
        '[class*="Price__"]',              // CSS module price
        '[class*="css-Price"]',            // CSS-in-JS price
        '[data-testid="price"]',           // Test ID price
        'b[class*="Price"]'                // Bold price text
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Sephora detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // ULTA
  // Structure: React app. Uses [class*="ProductPrice"], [data-testid="price"],
  // .product__price, [class*="price__"]
  ulta: {
    detect: function(hostname) {
      return hostname.includes('ulta.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[class*="ProductPrice"]',         // Product price component
        '[data-testid="price"]',           // Test ID price
        '.product__price',                 // Product price BEM
        '[class*="price__"]',              // CSS module price
        '[itemprop="price"]',              // Schema.org
        '[class*="Price_price"]'           // CSS module price variant
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Ulta detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 8: STREETWEAR & SNEAKER CULTURE
  // --------------------------------------------------

  // NIKE
  // Structure: React app. Uses [data-testid="product-price"],
  // [class*="price"], [data-automation*="price"], .product-price
  nike: {
    detect: function(hostname) {
      return hostname.includes('nike.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-testid="product-price"]',      // Product price testid
        '[data-testid="currentPrice-container"]', // Current price container
        '[data-automation="product-price"]',  // Automation price
        '[class*="product-price"]',           // Product price class
        '[class*="css-price"]',               // CSS-in-JS price
        '[class*="Price__"]'                  // CSS module price
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip MSRP / original price labels
          const classes = el.className?.toString() || '';
          if (classes.includes('msrp') || classes.includes('original')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Nike detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // ADIDAS
  // Structure: React app. Uses [class*="ProductPrice"], [data-auto-id="price"],
  // [class*="gl-price"], [data-testid="price"]
  adidas: {
    detect: function(hostname) {
      return hostname.includes('adidas.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-auto-id="price"]',          // Auto ID price
        '[class*="gl-price"]',             // Global price class
        '[class*="ProductPrice"]',         // React price component
        '[data-testid="price"]',           // Test ID price
        '[class*="price__value"]',         // Price value BEM
        '[class*="Price__"]'               // CSS module price
      ];

      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;

          // Skip "original price" labels
          const classes = el.className?.toString().toLowerCase() || '';
          if (classes.includes('original') || classes.includes('crossed')) return;

          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;

          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;

          const workTime = calculateWorkTime(price);
          if (!workTime) return;

          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };

      runConversion();
      setTimeout(runConversion, 1500);

      console.log(`[Worth My Time] Adidas detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SUPREME
  // Structure: Custom Shopify. Uses [class*="price"], .ProductPrice,
  // [itemprop="price"], .product__price
  supreme: {
    detect: function(hostname) {
      return hostname.includes('supremenewyork.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[itemprop="price"]',              // Schema.org price
        '.ProductPrice',                   // Shopify product price
        '.product__price',                 // Product price BEM
        '[class*="price-item"]',           // Shopify price item
        '.checkout-item-price'             // Checkout item price
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Supreme detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 9: TECH ACCESSORIES & PERIPHERALS
  // --------------------------------------------------

  // CASETIFY
  // Structure: Shopify-based. Uses [class*="ProductPrice"], .price,
  // [itemprop="price"], [data-product-price]
  casetify: {
    detect: function(hostname) {
      return hostname.includes('casetify.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[data-product-price]',            // Shopify data attribute price
        '[itemprop="price"]',              // Schema.org price
        '[class*="ProductPrice"]',         // Price component
        '[class*="price__"]',              // CSS module price
        '.price-item--regular',            // Shopify regular price item
        '.price-item--sale'                // Shopify sale price item
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 5000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Casetify detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 10: SUBSCRIPTION & MEMBERSHIP CLUBS
  // --------------------------------------------------

  // SAM'S CLUB
  // Structure: React app. Uses [itemprop="price"], [data-testid="price"],
  // [class*="Price"], .sc-price, [class*="product-price"]
  samsclub: {
    detect: function(hostname) {
      return hostname.includes('samsclub.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();

      const selectors = [
        '[itemprop="price"]',              // Schema.org price
        '[data-testid="price"]',           // Test ID price
        '[class*="Price"]',                // Price component
        '.sc-price',                       // Sam's Club price class
        '[class*="product-price"]',        // Product price generic
        '[class*="itemPrice"]'             // Item price class
      ];

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;

        // Avoid containers with child prices
        if (el.querySelector('[itemprop="price"], [class*="Price"]')) return;

        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;

        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;

        const workTime = calculateWorkTime(price);
        if (!workTime) return;

        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });

      console.log(`[Worth My Time] Sam's Club detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 1 (continued): PREMIUM BRANDED ELECTRONICS
  // --------------------------------------------------

  // HP (Spectre/Omen DTC store)
  // Structure: React app. Uses [data-testid="price"], [class*="Price"],
  // .price-current, [class*="product-price"]
  hp: {
    detect: function(hostname) {
      return hostname.includes('hp.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-testid="price"]',
        '[class*="Price"]',
        '.price-current',
        '[class*="product-price"]',
        '[itemprop="price"]',
        '[data-hp="price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[class*="Price"], [itemprop="price"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] HP detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // LENOVO
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // .price-display, [class*="ProductPrice"]. Split price possible.
  lenovo: {
    detect: function(hostname) {
      return hostname.includes('lenovo.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[class*="price-display"]',
        '[class*="ProductPrice"]',
        '[data-testid*="price"]',
        '[class*="priceBlock"]',
        '[itemprop="price"]',
        '[class*="price__"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[class*="price-display"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Lenovo detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GOOGLE STORE
  // Structure: Angular/React app. Uses [class*="price"], [data-price],
  // [aria-label*="price"], .gb-price
  googlestore: {
    detect: function(hostname) {
      return hostname.includes('store.google.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-price]',
        '[aria-label*="price"]',
        '[class*="price"]',
        '.gb-price',
        '[class*="ProductPrice"]',
        '[itemprop="price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Google Store detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // DJI
  // Structure: Vue app. Uses [class*="price"], [data-price],
  // .product-price, [class*="Price__"]
  dji: {
    detect: function(hostname) {
      return hostname.includes('dji.com') || hostname.includes('store.dji.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-price]',
        '[class*="product-price"]',
        '[class*="Price__"]',
        '[class*="price-value"]',
        '[itemprop="price"]',
        '.price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[data-price], [class*="price-value"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] DJI detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GOPRO
  // Structure: Shopify-based DTC. Uses [itemprop="price"], .price,
  // [data-product-price], [class*="price-item"]
  gopro: {
    detect: function(hostname) {
      return hostname.includes('gopro.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] GoPro detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 2 (continued): LUXURY RESALE & AUTHENTICATION
  // --------------------------------------------------

  // VESTIAIRE COLLECTIVE
  // Structure: React app. Uses [data-testid="price"], [class*="Price"],
  // [class*="product-price"], .price-tag
  vestiairecollective: {
    detect: function(hostname) {
      return hostname.includes('vestiairecollective.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-testid="price"]',
        '[class*="Price__"]',
        '[class*="product-price"]',
        '.price-tag',
        '[itemprop="price"]',
        '[class*="ProductPrice"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Vestiaire Collective detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GRAILED
  // Structure: React app. Uses [class*="Price"], [data-testid*="price"],
  // [class*="listing-price"], .price
  grailed: {
    detect: function(hostname) {
      return hostname.includes('grailed.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[class*="listing-price"]',
        '[class*="Price__"]',
        '[data-testid*="price"]',
        '[class*="ListingPrice"]',
        '[itemprop="price"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Grailed detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // DEPOP
  // Structure: React app. Uses [data-testid="price"], [class*="Price"],
  // [class*="product__price"], .price
  depop: {
    detect: function(hostname) {
      return hostname.includes('depop.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-testid="price"]',
        '[class*="Price__"]',
        '[class*="product__price"]',
        '[class*="listing__price"]',
        '[itemprop="price"]',
        '[class*="ProductPrice"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 50000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Depop detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // STADIUM GOODS
  // Structure: Shopify-based. Uses [itemprop="price"], .price,
  // [data-product-price], [class*="ProductPrice"]
  stadiumgoods: {
    detect: function(hostname) {
      return hostname.includes('stadiumgoods.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Stadium Goods detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // FLIGHT CLUB (GOAT GROUP)
  // Structure: Same underlying platform as GOAT. Uses [data-qa="product-price"],
  // [class*="ProductPrice"], .product-card__price
  flightclub: {
    detect: function(hostname) {
      return hostname.includes('flightclub.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-qa="product-price"]',
        '[data-qa="listing-price"]',
        '[class*="ProductPrice"]',
        '[class*="ListingPrice"]',
        '.product-card__price',
        '[class*="price-tag"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Flight Club detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 3 (continued): HIGH-END FASHION MULTI-BRAND
  // --------------------------------------------------

  // BLOOMINGDALE'S
  // Structure: React app. Uses [data-auto="product-price"], [class*="Price"],
  // [itemprop="price"], [data-auto-id*="price"]
  bloomingdales: {
    detect: function(hostname) {
      return hostname.includes('bloomingdales.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-auto="product-price"]',
        '[data-auto-id*="price"]',
        '[class*="PriceDisplay"]',
        '[class*="Price__"]',
        '[itemprop="price"]',
        '[data-testid*="price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const ariaLabel = el.getAttribute('aria-label') || '';
          if (ariaLabel.toLowerCase().includes('was')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Bloomingdale's detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // NEIMAN MARCUS
  // Structure: React app. Uses [data-auto="product-price"],
  // [class*="PriceDisplay"], [class*="Price__"], [itemprop="price"]
  neimanmarcus: {
    detect: function(hostname) {
      return hostname.includes('neimanmarcus.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-auto="product-price"]',
        '[class*="PriceDisplay"]',
        '[class*="Price__"]',
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Neiman Marcus detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // MYTHERESA
  // Structure: Custom frontend. Uses [class*="price"], [itemprop="price"],
  // [data-component="Price"], [class*="ProductPrice"]
  mytheresa: {
    detect: function(hostname) {
      return hostname.includes('mytheresa.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-component="Price"]',
        '[itemprop="price"]',
        '[class*="Price__"]',
        '[class*="product-price"]',
        '[class*="ProductPrice"]',
        '[data-testid*="price"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Mytheresa detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // REVOLVE
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // [itemprop="price"], [class*="ProductPrice"]
  revolve: {
    detect: function(hostname) {
      return hostname.includes('revolve.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[class*="price__"]',
        '[class*="ProductPrice"]',
        '[data-testid*="price"]',
        '.u-price',
        '[class*="price-value"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const classes = el.className?.toString().toLowerCase() || '';
          if (classes.includes('was') || classes.includes('original')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 50000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Revolve detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 4 (continued): PREMIUM AUDIO & LIFESTYLE
  // --------------------------------------------------

  // BEATS (beats.com DTC, distinct from Apple store)
  // Structure: Apple-affiliated Shopify. Uses [itemprop="price"],
  // [class*="Price"], .product__price
  beats: {
    detect: function(hostname) {
      return hostname.includes('beatsbydre.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.product__price',
        '[class*="ProductPrice"]',
        '[class*="price-item"]',
        '[data-testid="price"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Beats detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SENNHEISER
  // Structure: Shopify-based DTC. Uses [itemprop="price"], [data-product-price],
  // [class*="price"], .price-item
  sennheiser: {
    detect: function(hostname) {
      return hostname.includes('sennheiser.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Sennheiser detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // JBL
  // Structure: Harman/React app. Uses [class*="price"], [itemprop="price"],
  // [data-testid="price"], [class*="ProductPrice"]
  jbl: {
    detect: function(hostname) {
      return hostname.includes('jbl.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid="price"]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[class*="price-value"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] JBL detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // MARSHALL
  // Structure: Shopify-based. Uses [itemprop="price"], [data-product-price],
  // .price-item, [class*="ProductPrice"]
  marshall: {
    detect: function(hostname) {
      return hostname.includes('marshallheadphones.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Marshall detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // BANG & OLUFSEN
  // Structure: Custom React. Uses [class*="Price"], [data-testid*="price"],
  // [class*="product-price"], [itemprop="price"]
  bangolufsen: {
    detect: function(hostname) {
      return hostname.includes('bang-olufsen.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="Price__"]',
        '[class*="product-price"]',
        '[class*="ProductPrice"]',
        '[class*="price-value"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="Price__"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Bang & Olufsen detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 5 (continued): FAST FASHION & IMPULSE
  // --------------------------------------------------

  // ZARA
  // Structure: Custom React. Uses [class*="price"], [data-testid*="price"],
  // [class*="Price__"], .money-amount
  zara: {
    detect: function(hostname) {
      return hostname.includes('zara.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[class*="price__amount"]',
        '[data-testid*="price"]',
        '[class*="Price__"]',
        '.money-amount__main',
        '[itemprop="price"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          // Skip original prices
          const classes = el.className?.toString().toLowerCase() || '';
          if (classes.includes('original') || classes.includes('line-through')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Zara detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // FASHION NOVA
  // Structure: Shopify-based. Uses [itemprop="price"], [data-product-price],
  // .price-item, [class*="ProductPrice"]
  fashionnova: {
    detect: function(hostname) {
      return hostname.includes('fashionnova.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Fashion Nova detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // BOOHOO
  // Structure: Custom platform. Uses [class*="price"], [itemprop="price"],
  // [class*="Price__"], [data-testid*="price"]
  boohoo: {
    detect: function(hostname) {
      return hostname.includes('boohoo.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[class*="Price__"]',
        '[data-testid*="price"]',
        '[class*="product-price"]',
        '[class*="price__current"]',
        '[class*="ProductPrice"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const classes = el.className?.toString().toLowerCase() || '';
        if (classes.includes('was') || classes.includes('original')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Boohoo detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // PRETTYLITTLETHING
  // Structure: Same platform family as Boohoo. Uses [class*="price"],
  // [itemprop="price"], [class*="Price__"]
  prettylittlething: {
    detect: function(hostname) {
      return hostname.includes('prettylittlething.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[class*="Price__"]',
        '[data-testid*="price"]',
        '[class*="product-price"]',
        '[class*="price__current"]',
        '[class*="ProductPrice"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const classes = el.className?.toString().toLowerCase() || '';
        if (classes.includes('was') || classes.includes('original')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] PrettyLittleThing detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 6 (continued): GAMING & PERIPHERALS
  // --------------------------------------------------

  // STEELSERIES
  // Structure: Shopify-based DTC. Uses [itemprop="price"], [data-product-price],
  // .price-item, [class*="ProductPrice"]
  steelseries: {
    detect: function(hostname) {
      return hostname.includes('steelseries.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] SteelSeries detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // LOGITECH (G series gaming store)
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  logitech: {
    detect: function(hostname) {
      return hostname.includes('logitech.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[class*="price-value"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 5000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Logitech detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // ASUS ROG (Republic of Gamers)
  // Structure: Custom React. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  asusrog: {
    detect: function(hostname) {
      return hostname.includes('asus.com') || hostname.includes('rog.asus.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[class*="price-value"]',
        '[data-testid*="price"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] ASUS/ROG detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // HYPERX (Kingston/HP Gaming)
  // Structure: React app. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  hyperx: {
    detect: function(hostname) {
      return hostname.includes('hyperx.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[class*="price-value"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] HyperX detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // PLAYSTATION DIRECT (Sony DTC gaming store)
  // Structure: React/custom. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  playstationdirect: {
    detect: function(hostname) {
      return hostname.includes('direct.playstation.com') || hostname.includes('playstation.com/en-us/ps-store');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-qa="mfeCtaMain#offer0#finalPrice"]',   // PlayStation specific price attr
        '[data-qa*="Price"]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[itemprop="price"]',
        '[class*="price-container"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[data-qa*="Price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] PlayStation Direct detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 7 (continued): BEAUTY & SKINCARE
  // --------------------------------------------------

  // BATH & BODY WORKS
  // Structure: React app. Uses [class*="ProductPrice"], [data-testid="price"],
  // [class*="Price__"], [itemprop="price"]
  bathandbodyworks: {
    detect: function(hostname) {
      return hostname.includes('bathandbodyworks.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-testid="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[itemprop="price"]',
        '[class*="product__price"]',
        '[class*="price__"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[class*="ProductPrice"], [itemprop="price"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Bath & Body Works detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GLOSSIER
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  glossier: {
    detect: function(hostname) {
      return hostname.includes('glossier.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Glossier detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CHARLOTTE TILBURY
  // Structure: Custom React. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  charlottetilbury: {
    detect: function(hostname) {
      return hostname.includes('charlottetilbury.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Charlotte Tilbury detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // DRUNK ELEPHANT
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  drunkelephant: {
    detect: function(hostname) {
      return hostname.includes('drunkelephant.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Drunk Elephant detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // TATCHA
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  tatcha: {
    detect: function(hostname) {
      return hostname.includes('tatcha.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Tatcha detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // THE ORDINARY (DECIEM)
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  theordinary: {
    detect: function(hostname) {
      return hostname.includes('theordinary.com') || hostname.includes('deciem.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] The Ordinary detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 8 (continued): STREETWEAR & SNEAKER CULTURE
  // --------------------------------------------------

  // NEW BALANCE
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  newbalance: {
    detect: function(hostname) {
      return hostname.includes('newbalance.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] New Balance detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // KITH
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  kith: {
    detect: function(hostname) {
      return hostname.includes('kith.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Kith detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // OFF-WHITE (now owned by Farfetch group)
  // Structure: Custom React. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  offwhite: {
    detect: function(hostname) {
      return hostname.includes('off---white.com') || hostname.includes('offwhite.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 10000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Off-White detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // FEAR OF GOD (Essentials)
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // .price-item, [class*="ProductPrice"]
  fearofgod: {
    detect: function(hostname) {
      return hostname.includes('fearofgod.com') || hostname.includes('essentialsfog.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 5000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Fear of God detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // PALACE SKATEBOARDS
  // Structure: Shopify-based. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  palace: {
    detect: function(hostname) {
      return hostname.includes('palaceskateboards.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 5000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Palace detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 9 (continued): TECH ACCESSORIES
  // --------------------------------------------------

  // ANKER
  // Structure: Shopify-based DTC. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  anker: {
    detect: function(hostname) {
      return hostname.includes('anker.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Anker detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // NOMAD GOODS
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  nomadgoods: {
    detect: function(hostname) {
      return hostname.includes('nomadgoods.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Nomad Goods detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // OTTERBOX
  // Structure: Magento/custom. Uses [class*="price"], [itemprop="price"],
  // [data-price], [class*="ProductPrice"]
  otterbox: {
    detect: function(hostname) {
      return hostname.includes('otterbox.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-price]',
        '[class*="ProductPrice"]',
        '[class*="price__"]',
        '[class*="price-box"]',
        '.product-info-price .price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 500) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] OtterBox detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // PEAK DESIGN
  // Structure: Shopify Plus. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  peakdesign: {
    detect: function(hostname) {
      return hostname.includes('peakdesign.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Peak Design detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // BELKIN
  // Structure: Custom platform. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  belkin: {
    detect: function(hostname) {
      return hostname.includes('belkin.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 500) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Belkin detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // SPIGEN
  // Structure: Shopify-based. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  spigen: {
    detect: function(hostname) {
      return hostname.includes('spigen.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 200) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Spigen detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // MOPHIE
  // Structure: Shopify-based. Uses [itemprop="price"], [data-product-price],
  // [class*="ProductPrice"], [class*="price-item"]
  mophie: {
    detect: function(hostname) {
      return hostname.includes('mophie.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-product-price]',
        '.price-item--sale',
        '.price-item--regular',
        '[class*="ProductPrice"]',
        '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 500) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] Mophie detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // --------------------------------------------------
  // CATEGORY 10 (continued): SUBSCRIPTION & MEMBERSHIP
  // --------------------------------------------------

  // BJ'S WHOLESALE
  // Structure: React app. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  bjs: {
    detect: function(hostname) {
      return hostname.includes('bjs.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el);
        seen.add(el);
        totalConverted++;
        pageConversionCount++;
      });
      console.log(`[Worth My Time] BJ's Wholesale detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // THRIVE MARKET
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  thrivemarket: {
    detect: function(hostname) {
      return hostname.includes('thrivemarket.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Thrive Market detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // FABFITFUN
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  fabfitfun: {
    detect: function(hostname) {
      return hostname.includes('fabfitfun.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] FabFitFun detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // GROVE COLLABORATIVE
  // Structure: React app. Uses [class*="price"], [itemprop="price"],
  // [data-testid*="price"], [class*="ProductPrice"]
  grove: {
    detect: function(hostname) {
      return hostname.includes('grove.co') || hostname.includes('grovecollaborative.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 500) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Grove Collaborative detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // BOXYCHARM / IPSY (now merged as Ipsy)
  // Structure: React app. Uses [class*="price"], [data-testid*="price"],
  // [class*="ProductPrice"], [itemprop="price"]
  ipsy: {
    detect: function(hostname) {
      return hostname.includes('ipsy.com') || hostname.includes('boxycharm.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]',
        '[data-testid*="price"]',
        '[class*="ProductPrice"]',
        '[class*="Price__"]',
        '[class*="price__"]',
        '[class*="product-price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 500) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el);
          seen.add(el);
          totalConverted++;
          pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion();
      setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Ipsy/Boxycharm detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 2: EBAY
  ebay: {
    detect: function(hostname) { return hostname.includes('ebay.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-testid="formatted-price"]', '.x-price-primary',
        '[class*="s-item__price"]', '[itemprop="price"]',
        '.ux-textspans--BOLD', '[class*="price__value"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[data-testid="formatted-price"], .x-price-primary')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion(); setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] eBay detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 3: MACY'S
  macys: {
    detect: function(hostname) { return hostname.includes('macys.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-auto="product-price"]', '[data-auto-id*="price"]',
        '[class*="PriceDisplay"]', '[itemprop="price"]',
        '[data-testid*="price"]', '[class*="price__"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const ariaLabel = el.getAttribute('aria-label') || '';
          if (ariaLabel.toLowerCase().includes('was')) return;
          if (el.querySelector('[class*="PriceDisplay"], [itemprop="price"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 100000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion(); setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Macy's detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 4: FOCAL (focal.com — premium headphones/speakers)
  focal: {
    detect: function(hostname) { return hostname.includes('focal.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-product-price]',
        '.price-item--sale', '.price-item--regular',
        '[class*="ProductPrice"]', '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 50000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] Focal detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 4: BOWERS & WILKINS (bowerswilkins.com)
  bowerswilkins: {
    detect: function(hostname) { return hostname.includes('bowerswilkins.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-product-price]',
        '[class*="ProductPrice"]', '[class*="price__"]',
        '[class*="Price__"]', '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 50000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] Bowers & Wilkins detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 4: AUDIOQUEST (audioquest.com — premium cables/DACs)
  audioquest: {
    detect: function(hostname) { return hostname.includes('audioquest.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-product-price]',
        '[class*="ProductPrice"]', '[class*="price__"]',
        '[class*="Price__"]', '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] AudioQuest detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 5: ROMWE (romwe.com — ultra fast fashion, Shein sister brand)
  romwe: {
    detect: function(hostname) { return hostname.includes('romwe.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[class*="product-price"]', '[class*="goods-price"]',
        '[class*="sale-price"]', '[class*="Price__"]',
        'span[class*="price"]', '[data-testid="price"]'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          const classes = el.className?.toString().toLowerCase() || '';
          if (classes.includes('original') || classes.includes('del')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 0.5 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion(); setTimeout(runConversion, 2000);
      console.log(`[Worth My Time] Romwe detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 6: XBOX STORE (xbox.com)
  xbox: {
    detect: function(hostname) {
      return hostname.includes('xbox.com') ||
        (hostname.includes('microsoft.com') && window.location.pathname.includes('/store/games'));
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[data-price]', '[class*="Price__"]',
        '[data-testid*="price"]', '[class*="ProductPrice"]',
        '[aria-label*="price"]', '.c-price'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[data-price], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 10000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion(); setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Xbox detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 6: ALIENWARE (alienware.com)
  alienware: {
    detect: function(hostname) { return hostname.includes('alienware.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '.ps-dell-price', '.ps-price__sale',
        '[data-testid*="price"]', '[class*="PriceDisplay"]',
        '[class*="price-value"]', '[itemprop="price"]'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('.ps-dell-price, [class*="PriceDisplay"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 100000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] Alienware detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 6: GAMESTOP
  gamestop: {
    detect: function(hostname) { return hostname.includes('gamestop.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-testid*="price"]',
        '[class*="ProductPrice"]', '[class*="Price__"]',
        '[class*="product-price"]', '.price-display'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] GameStop detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 7: SK-II (sk-ii.com)
  skii: {
    detect: function(hostname) { return hostname.includes('sk-ii.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-testid*="price"]',
        '[class*="ProductPrice"]', '[class*="Price__"]',
        '[class*="price__"]', '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 1000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] SK-II detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 7: LA MER (cremedelamer.com)
  lamer: {
    detect: function(hostname) {
      return hostname.includes('cremedelamer.com') || hostname.includes('lamer.com');
    },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-testid*="price"]',
        '[class*="ProductPrice"]', '[class*="Price__"]',
        '[class*="price__"]', '.product-price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 2000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] La Mer detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 8: CONCEPTS SNEAKER BOUTIQUE (cncpts.com)
  concepts: {
    detect: function(hostname) { return hostname.includes('cncpts.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-product-price]',
        '.price-item--sale', '.price-item--regular',
        '[class*="ProductPrice"]', '.product__price'
      ];
      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        if (seen.has(el) || processedElements.has(el)) return;
        if (el.querySelector('.timeprice-converted')) return;
        if (!isElementVisible(el)) return;
        if (isStrikethrough(el)) return;
        const ariaLabel = el.getAttribute('aria-label') || '';
        if (ariaLabel.toLowerCase().includes('regular price')) return;
        const text = el.textContent?.trim();
        if (!text) return;
        const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
        if (!match) return;
        const price = parseFloat(match[1].replace(/,/g, ''));
        if (price < 1 || price > 5000) return;
        if (isPromotionalNumber(price, el)) return;
        const workTime = calculateWorkTime(price);
        if (!workTime) return;
        el.appendChild(createConvertedElement(price, workTime));
        processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
      });
      console.log(`[Worth My Time] Concepts detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  },

  // CAT 8: FOOT LOCKER (footlocker.com)
  footlocker: {
    detect: function(hostname) { return hostname.includes('footlocker.com'); },
    process: function() {
      let totalConverted = 0;
      const seen = new WeakSet();
      const selectors = [
        '[itemprop="price"]', '[data-testid*="price"]',
        '[class*="ProductPrice"]', '[class*="Price__"]',
        '[class*="price__"]', '.product-price'
      ];
      const runConversion = () => {
        document.querySelectorAll(selectors.join(', ')).forEach(el => {
          if (seen.has(el) || processedElements.has(el)) return;
          if (el.querySelector('.timeprice-converted')) return;
          if (!isElementVisible(el)) return;
          if (isStrikethrough(el)) return;
          if (el.querySelector('[itemprop="price"], [class*="ProductPrice"]')) return;
          const text = el.textContent?.trim();
          if (!text) return;
          const match = text.match(/\$(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
          if (!match) return;
          const price = parseFloat(match[1].replace(/,/g, ''));
          if (price < 1 || price > 1000) return;
          if (isPromotionalNumber(price, el)) return;
          const workTime = calculateWorkTime(price);
          if (!workTime) return;
          el.appendChild(createConvertedElement(price, workTime));
          processedElements.add(el); seen.add(el); totalConverted++; pageConversionCount++;
        });
        return totalConverted;
      };
      runConversion(); setTimeout(runConversion, 1500);
      console.log(`[Worth My Time] Foot Locker detector converted ${totalConverted} prices`);
      return totalConverted;
    }
  }

  // ===================================
  // END OF SITE-SPECIFIC DETECTORS
  // Total: 100 site-specific detectors (9 original + 91 new)
  // To add a new site: insert a new block above this comment.
  // Each detector is fully isolated — editing one never affects others.
  // ===================================
};

// ===================================
// TIER 2: UNIVERSAL DETECTOR
// ===================================

// Build a stable deduplication key for a price injection.
// Uses the element's DOM index path so the same physical element always
// produces the same key, regardless of which pass finds it first.
// Check if any ancestor element already has a timeprice-converted label injected,
// but STOP at the product container boundary so sibling cards don't block each other.
// A "product container" is any element with product/item/card/tile/result in its class,
// or a known list wrapper (ul, ol, [class*="grid"], [class*="list"]).
function ancestorAlreadyConverted(element) {
  const CONTAINER_SIGNALS = ['product', 'item', 'card', 'tile', 'result', 'listing'];
  const STOP_TAGS = new Set(['UL', 'OL', 'MAIN', 'SECTION', 'BODY']);

  // Check if this element itself was marked as an injection parent —
  // meaning a sibling already injected a badge into this same container
  if (processedElements.has(element)) return true;

  let el = element.parentElement;
  let depth = 0;

  while (el && el !== document.body && depth < 12) {
    // If this ancestor was marked as injection parent, a badge is already here
    if (processedElements.has(el)) return true;
    // If this element has our label as a direct or nested child, flag it
    if (el.querySelector('.timeprice-converted')) return true;
    if (el.classList && el.classList.contains('timeprice-converted')) return true;

    // Stop walking up if we've reached a product container boundary —
    // anything above this is shared between sibling cards
    const cls = (el.className || '').toString().toLowerCase();
    const tag = el.tagName;
    const isContainer = CONTAINER_SIGNALS.some(s => cls.includes(s));
    const isListWrapper = STOP_TAGS.has(tag) ||
      cls.includes('grid') || cls.includes('collection') ||
      cls.includes('search-result') || cls.includes('category');

    if (isContainer || isListWrapper) break;

    el = el.parentElement;
    depth++;
  }
  return false;
}

// Build a stable dedup key that is:
// 1. Unique per physical slide/card instance (distinguishes Slick clones)
// 2. Stable across re-renders of the same instance (survives React/Vue updates)
// 3. Universal — works on any site without hard-coded attribute names
//
// Strategy (priority order):
// A) data-* numeric index on the card container (data-slick-index, data-index,
//    data-position, data-product-index etc.) + price
//    → Unique per slide instance, stable across Slick repositions
// B) Unique string identifier on container (data-id, data-asin, data-handle,
//    data-product-id, id attribute) + price
//    → Even better — product identity rather than position
// C) Product name (longest non-price text in card) + price
//    → Fallback for sites with no data attributes
// D) Price only
//    → Last resort for simple static pages
function buildPriceKey(element, price) {
  const CONTAINER_SIGNALS = ['product', 'item', 'card', 'tile', 'result', 'listing', 'carousel'];
  const STOP_TAGS = new Set(['UL', 'OL', 'MAIN', 'BODY']);

  // Walk up to find the product card container
  let container = null;
  let el = element.parentElement;
  let depth = 0;
  while (el && !STOP_TAGS.has(el.tagName) && depth < 12) {
    const cls = (el.className || '').toString().toLowerCase();
    if (CONTAINER_SIGNALS.some(s => cls.includes(s))) {
      container = el;
      break;
    }
    el = el.parentElement;
    depth++;
  }

  if (!container) return `price::${price}`;

  // Strategy B: unique string identifier (most stable)
  const STRING_ID_ATTRS = ['data-id', 'data-asin', 'data-handle', 'data-product-id',
                           'data-sku', 'data-variant-id', 'data-item-id'];
  for (const attr of STRING_ID_ATTRS) {
    const val = container.getAttribute(attr);
    if (val && val.length > 2) return `${price}::id::${val}`;
  }
  if (container.id) return `${price}::id::${container.id}`;

  // Strategy A: numeric index attribute (unique per slide instance)
  // Matches any data-*index*, data-*position*, data-*order* attribute
  for (const attr of container.getAttributeNames()) {
    if (/index|position|order|rank|slot/.test(attr)) {
      const val = container.getAttribute(attr);
      if (val !== null && !isNaN(parseInt(val))) {
        return `${price}::${attr}::${val}`;
      }
    }
  }

  // Strategy C: product name (longest non-price text in container)
  let bestName = '';
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
  let node;
  while ((node = walker.nextNode())) {
    const t = node.textContent.trim();
    if (t.length < 4) continue;
    if (/^[\d\s$£€¥,.]+$/.test(t)) continue;
    if (node.parentElement && node.parentElement.classList.contains('timeprice-converted')) continue;
    if (t.length > bestName.length) bestName = t;
  }
  if (bestName) {
    const normName = bestName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50);
    return `${price}::name::${normName}`;
  }

  // Strategy D: price only
  return `price::${price}`;
}

// Get only the direct text content of an element — excluding child element text.
function getDirectText(element) {
  let text = '';
  element.childNodes.forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    }
  });
  return text.trim();
}

// Find the innermost element whose OWN direct text contains a price pattern.
// Recursively walks DOWN the tree — handles any depth of nesting.
// Returns the deepest element that directly holds price text, or null if none found.
const PRICE_DETECT_RE = /(?:NT\$|AU\$|CA\$|NZ\$|HK\$|SG\$|US\$|A\$|C\$|R\$|\$|£|€|¥|₩|₺|₽|₴|₪|₦|₵|₱|₫|฿|₹|RM|Rp)\s*\d[\d,. ]*|\d[\d,. ]*\s*(?:AUD|NZD|CAD|USD|EUR|GBP|JPY|CNY|CHF|HKD|SGD|KRW|TWD|INR|IDR|MYR|THB|PHP|VND|ZAR|AED|SAR|TRY|RUB|PLN|SEK|NOK|DKK)|(?:AUD|NZD|CAD|USD|EUR|GBP|JPY|CHF|HKD|SGD|KRW|TWD|INR|IDR|MYR|THB|PHP|VND|ZAR|AED|SAR|TRY|RUB|PLN|SEK|NOK|DKK)\s+\d[\d,. ]*/;

function findInnermostPriceElement(element, depth) {
  depth = depth || 0;
  if (depth > 8) return null;
  if (!element || !isElementVisible(element)) return null;
  if (isStrikethrough(element)) return null;
  if (element.classList && element.classList.contains('timeprice-converted')) return null;

  // Check if this element's OWN direct text contains a price
  const direct = getDirectText(element);
  if (direct && PRICE_DETECT_RE.test(direct)) {
    return element;
  }

  // No direct price text — recurse into children to find the deepest holder
  // Only recurse into meaningful inline/block elements, not scripts/styles
  const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'IMG', 'INPUT', 'BUTTON', 'SELECT']);
  for (const child of element.children) {
    if (SKIP_TAGS.has(child.tagName)) continue;
    if (child.classList && child.classList.contains('timeprice-converted')) continue;
    const found = findInnermostPriceElement(child, depth + 1);
    if (found) return found;
  }

  return null;
}

// Check if a price element is inside a rental/subscription/periodic payment context.
// These should never be converted — the price is per-period, not a one-off purchase.
function isPeriodicPrice(element) {
  const periodicKeywords = [
    'per week', 'per month', 'per year', 'per day', 'per night',
    '/week', '/month', '/year', '/day', '/wk', '/mo', '/yr', '/night',
    'p/w', 'p/m', 'p.w.', 'p.m.',
    'weekly', 'monthly', 'annually', 'fortnightly',
    'rent', 'rental', 'lease', 'subscription', 'recurring',
    'hire', 'instalment', 'installment'
  ];
  
  // Check up to 4 ancestor levels for periodic context
  let el = element;
  for (let i = 0; i < 4 && el; i++) {
    const text = (el.textContent || '').toLowerCase();
    // Only check short-ish containers to avoid false positives from page-level text
    if (text.length < 300) {
      for (const kw of periodicKeywords) {
        if (text.includes(kw)) return true;
      }
    }
    el = el.parentElement;
  }
  return false;
}

// Mark element as processed — simple and reliable.
// Duplicate prevention is handled primarily by ancestorAlreadyConverted().
function markElementProcessed(element, price) {
  const key = buildPriceKey(element, price);
  processedPrices.set(key, element);
  processedElements.add(element);
}

// Purge processedPrices entries whose source elements are no longer attached
// to the document. Called before each detection run so carousel slide swaps,
// virtual list recycling, and SPA unmounts don't block re-detection.
function purgeStaleKeys() {
  for (const [key, element] of processedPrices.entries()) {
    // Remove keys for elements that are detached OR inside a slick clone
    // (clones are hidden duplicates — their keys should never block real slides)
    if (!document.contains(element) || element.closest('.slick-cloned:not(.slick-active)')) {
      processedPrices.delete(key);
    }
  }
}

const UniversalDetector = {
  process: function() {
    console.log('[Worth My Time] Using Universal detector');
    let totalConverted = 0;
    
    // HIGH-CONFIDENCE PASS: [itemprop="price"] elements
    // Schema.org markup is required by Google for rich results — retailers never
    // obfuscate it. Process these first, bypassing isPriceContext() entirely.
    const schemaElements = document.querySelectorAll('[itemprop="price"], [itemprop="lowPrice"], [itemprop="highPrice"]');
    schemaElements.forEach(element => {
      if (processedElements.has(element)) return;
      if (element.querySelector('.timeprice-converted')) return;
      if (ancestorAlreadyConverted(element)) return;
      if (element.closest('.slick-cloned:not(.slick-active)')) return; // skip inactive clones only
      if (!isElementVisible(element)) return;
      if (isStrikethrough(element)) return;
      
      // Price may be in content attribute (e.g. <meta itemprop="price" content="299.00">)
      // or in direct text content only — not inherited from children
      let priceStr = element.getAttribute('content') || getDirectText(element);
      // If no direct text but has a single inline child, use that
      if (!priceStr && element.children.length === 1) {
        priceStr = element.children[0].getAttribute('content') || getDirectText(element.children[0]);
      }
      if (!priceStr) return;
      
      const match = priceStr.match(/[\d,]+(?:\.\d{2})?/);
      if (!match) return;
      
      const price = parsePrice(match[0]);
      if (price < 1 || price > 999999) return;
      if (isPromotionalNumber(price, element)) return;
      
      // Use a location-stable key: price value + DOM path hash
      // This prevents duplicate injections when Schema pass and Standard pass
      // both find elements that share the same ancestor container
      const priceKey = buildPriceKey(element, price);
      if (processedPrices.has(priceKey)) return;
      
      const workTime = calculateWorkTime(price);
      if (workTime) {
        // For meta elements, find the visible price element nearby instead
        let targetElement = element;
        if (element.tagName === 'META') {
          // Look for a visible sibling or nearby element showing the same price
          const parent = element.parentElement;
          const visiblePrice = parent?.querySelector('[class*="price"]:not(meta), [class*="amount"]:not(meta)');
          if (visiblePrice && isElementVisible(visiblePrice)) {
            targetElement = visiblePrice;
          } else {
            return; // Skip invisible meta-only prices
          }
        }
        
        if (targetElement.querySelector('.timeprice-converted')) return;
        
        // Final guard: check live DOM — if parent already has a badge, skip
        if (targetElement.parentNode && targetElement.parentNode.querySelector('.timeprice-converted')) return;
        const timeElement = createConvertedElement(price, workTime);
        if (targetElement.nextSibling) {
          targetElement.parentNode.insertBefore(timeElement, targetElement.nextSibling);
        } else {
          targetElement.parentNode.appendChild(timeElement);
        }
        
        markElementProcessed(element, price);
        markElementProcessed(targetElement, price);
        // Mark the injection parent so sibling elements in the same price
        // container don't inject a second badge into the same parent
        if (targetElement.parentNode && targetElement.parentNode !== document.body) {
          processedElements.add(targetElement.parentNode);
        }
        totalConverted++;
        pageConversionCount++;
      }
    });
    
    // STANDARD PASS: broad selector scan with isPriceContext() validation
    const selectors = [
      'span', 'div', 'p', 'strong', 'b',
      'td', 'th', 'li',
      '[data-price]',
      '[itemprop*="price"]',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="amount"]'
    ];
    
    const elements = document.querySelectorAll(selectors.join(', '));
    
    elements.forEach(element => {
      if (processedElements.has(element)) return;
      if (element.querySelector('.timeprice-converted')) return;
      if (ancestorAlreadyConverted(element)) return;
      if (element.closest('.slick-cloned:not(.slick-active)')) return; // skip inactive clones only
      if (!isElementVisible(element)) return;
      if (isStrikethrough(element)) return;
      
      // Find the innermost element that directly holds price text.
      // This handles any depth of nesting (div > span > span > "$199.95")
      // without matching container elements that only inherit price text.
      const priceTarget = findInnermostPriceElement(element);
      if (!priceTarget) return;

      // If findInnermostPriceElement resolved to a DEEPER element than the one
      // we're currently iterating, skip this iteration — the deeper element will
      // be processed when the loop reaches it directly, preventing double injection.
      if (priceTarget !== element) return;

      const text = getDirectText(element);
      if (!text || text.length > 80) return;

      // Look for price pattern — matches all major currency formats:
      // $9.99  £9.99  €9.99  ¥999  ₹999  NT$999  AU$9.99  9.99 USD  RM9.99  etc.
      // Three capture groups:
      // [1] symbol-prefix:  $9.99  £9.99  €9.99  RM9.99  AU$9.99
      // [2] code-suffix:    9.99 USD  9,400 AUD
      // [3] code-prefix:    AUD 9,400  USD 299  EUR 1.200  (e.g. Bang & Olufsen)
      const ISO_CODES = '(?:AUD|NZD|CAD|HKD|SGD|USD|EUR|GBP|JPY|CNY|CHF|SEK|NOK|DKK|KRW|TWD|NTD|INR|IDR|MYR|THB|PHP|VND|PKR|BDT|ZAR|NGN|KES|GHS|EGP|AED|SAR|QAR|KWD|BHD|OMR|ILS|TRY|RUB|UAH|PLN|CZK|HUF|RON|ISK|BGN|BRL|MXN|ARS|CLP|COP|PEN)';
      const AMOUNT = '(\\d{1,3}(?:[,.\\ ]\\d{3})*(?:[.,]\\d{2})?)';
      const pattern = new RegExp(
        // Group 1: symbol prefix  e.g. $9.99  £9.99  AU$9.99  RM9.99
        '(?:NT\\$|AU\\$|CA\\$|NZ\\$|HK\\$|SG\\$|S\\$|C\\$|A\\$|R\\$|MX\\$|AR\\$|US\\$|BDS\\$|EC\\$|TT\\$|J\\$|SI\\$|FJ\\$|B\\$|T\\$|RD\\$|Ksh|RM|Rp|kr\\.?|zł|Kč|Ft|lei|лв|din|KM|Lek|Br|MT|Kz|MK|ZK|Rs\\.?|₹|€|£|¥|₩|₺|₽|₴|₪|₦|₵|₱|₫|฿|₭|₲|₡|₼|₾|֏|₮|₸|؋|﷼|₨|৳|₧|\\$)\\s*' + AMOUNT +
        // Group 2: code suffix  e.g. 9.99 USD
        '|' + AMOUNT + '\\s*(?:' + ISO_CODES.slice(4,-1) + ')(?!\\w)' +
        // Group 3: code prefix with space  e.g. AUD 9,400  USD 299
        '|' + ISO_CODES + '\\s+' + AMOUNT
      );
      const match = text.match(pattern);
      
      if (match) {
        // match[1] = symbol-prefixed, match[2] = code-suffixed, match[3+4] = code-prefixed (AUD 9,400)
        const raw = match[1] || match[2] || match[4] || match[3];
        const price = parsePrice(raw);
        
        if (price < 1 || price > 999999) return;
        
        // Skip promotional/statistical numbers
        if (isPromotionalNumber(price, element)) return;
        
        // Context validation
        if (!this.isPriceContext(element)) return;
        
        // Check for duplicates using location-stable key
        const priceKey = buildPriceKey(element, price);
        if (processedPrices.has(priceKey)) return;
        
        // Skip periodic/rental prices
        if (isPeriodicPrice(element)) return;
        
        const workTime = calculateWorkTime(price);
        if (workTime) {
          // Final guard: check live DOM — if parent already has a badge, skip
          if (element.parentNode && element.parentNode.querySelector('.timeprice-converted')) return;
          const timeElement = createConvertedElement(price, workTime);
          if (element.nextSibling) {
            element.parentNode.insertBefore(timeElement, element.nextSibling);
          } else {
            element.parentNode.appendChild(timeElement);
          }
          
          markElementProcessed(element, price);
          // Mark the injection parent so sibling elements in the same price
          // container don't inject a second badge into the same parent
          if (element.parentNode && element.parentNode !== document.body) {
            processedElements.add(element.parentNode);
          }
          totalConverted++;
          pageConversionCount++;
        }
      }
    });
    
    console.log(`[Worth My Time] Universal detector converted ${totalConverted} prices`);
    return totalConverted;
  },
  
  isPriceContext: function(element) {
    let current = element;
    let depth = 0;
    
    while (current && depth < 5) {
      const className = current.className?.toString().toLowerCase() || '';
      const id = current.id?.toLowerCase() || '';
      const tagName = current.tagName?.toUpperCase() || '';
      
      // Strong negative signals - skip these contexts
      if (
        tagName === 'BUTTON' ||
        tagName === 'A' && className.includes('button') ||
        className.includes('btn') ||
        className.includes('badge') ||
        className.includes('stat') ||
        className.includes('metric') ||
        className.includes('counter') ||
        className.includes('hero') ||
        className.includes('banner') ||
        className.includes('promo') ||
        className.includes('review') ||
        className.includes('rating') ||
        className.includes('dimension') ||
        className.includes('weight')
      ) {
        return false;
      }
      
      // Positive signals
      if (
        className.includes('price') ||
        className.includes('cost') ||
        className.includes('product') ||
        className.includes('item') ||
        id.includes('price') ||
        current.hasAttribute('data-price') ||
        current.querySelector('button')
      ) {
        return true;
      }
      
      current = current.parentElement;
      depth++;
    }
    
    return false;
  }
};

// ===================================
// TIER 3: LEARNED PATTERNS (Placeholder)
// ===================================

const LearnedPatterns = {
  // Will be populated with patterns from user feedback
  patterns: {},
  
  process: function() {
    const hostname = window.location.hostname;
    const pattern = this.patterns[hostname];
    
    if (!pattern) return 0;
    
    console.log('[Worth My Time] Using learned pattern for', hostname);
    // Implementation will be added when we have user-submitted patterns
    return 0;
  }
};

// ===================================
// MAIN DETECTION ORCHESTRATOR
// ===================================

// Domains where the extension should never run.
// These sites show prices in contexts that cause false positives, duplicates,
// or broken layouts — search engines, maps, social media, banking, etc.
const BLOCKED_DOMAINS = [
  // Google — Shopping, Search, Maps all show prices incorrectly
  'google.com', 'google.com.au', 'google.co.uk', 'google.ca',
  'google.co.jp', 'google.de', 'google.fr', 'google.com.tw',
  'google.com.hk', 'google.com.sg', 'google.co.in', 'google.co.nz',
  'google.com.br', 'google.com.mx', 'google.es', 'google.it',
  // Other search engines
  'bing.com', 'yahoo.com', 'duckduckgo.com', 'baidu.com',
  // Social media (prices in ads/posts cause false positives)
  'facebook.com', 'instagram.com', 'twitter.com', 'x.com',
  'tiktok.com', 'pinterest.com', 'reddit.com', 'linkedin.com',
  'youtube.com', 'twitch.tv',
  // Banking & finance (never run on financial sites)
  'paypal.com', 'stripe.com', 'square.com', 'venmo.com',
  'wise.com', 'revolut.com', 'cashapp.com',
  // Checkout/payment processors
  'checkout.com', 'shopify.com', 'pay.google.com',
  'apple.com/shop/go', // Apple Pay redirect
];

function isBlockedDomain(hostname) {
  // Allow Google Shopping specifically — genuine product discovery context
  if (hostname === 'shopping.google.com' || hostname.startsWith('shopping.google.')) return false;
  return BLOCKED_DOMAINS.some(domain => hostname === domain || hostname.endsWith('.' + domain));
}

function isBlockedPath(href) {
  const blockedPaths = ['/checkout', '/cart/checkout', '/payment', '/billing', '/pay/', '/order/confirm'];
  return blockedPaths.some(path => href.includes(path));
}

function processAllPrices() {
  if (!settings.enabled || hourlyRate === 0) return;

  const hostname = window.location.hostname;

  // Never run on blocked domains or checkout pages
  if (isBlockedDomain(hostname) || isBlockedPath(window.location.href)) {
    console.log('[Worth My Time] Blocked domain/path — skipping:', hostname);
    return;
  }

  console.log('[Worth My Time] === Starting price detection ===');
  console.log('[Worth My Time] URL:', window.location.href);
  
  // Purge keys for elements no longer in the DOM (carousel slides, SPA unmounts).
  // This allows re-detection of fresh slide content without wiping valid dedup state.
  purgeStaleKeys();
  let totalConverted = 0;
  
  // TIER 1: Check for site-specific detector
  let siteDetector = null;
  for (const [name, detector] of Object.entries(SITE_DETECTORS)) {
    if (detector.detect(hostname)) {
      siteDetector = detector;
      console.log(`[Worth My Time] Matched site-specific detector: ${name}`);
      break;
    }
  }
  
  if (siteDetector) {
    totalConverted = siteDetector.process();
    // TIER 1.5: If site-specific detector found nothing (stale selectors),
    // fall back to Universal Detector rather than giving up entirely
    if (totalConverted === 0) {
      console.log('[Worth My Time] Site detector returned 0, falling back to Universal Detector');
      totalConverted = UniversalDetector.process();
    }
  } else {
    // TIER 2: Use universal detector
    totalConverted = UniversalDetector.process();
  }
  
  // TIER 3: Apply learned patterns (if any)
  totalConverted += LearnedPatterns.process();
  
  console.log(`[Worth My Time] === Detection complete: ${totalConverted} prices converted ===`);
}

// ===================================
// INITIALIZATION
// ===================================

async function init() {
  console.log('[Worth My Time] Initializing 3-Tier Detection System...');
  await loadSettings();
  
  if (!settings.enabled) {
    console.log('[Worth My Time] Extension is disabled');
    return;
  }
  
  if (hourlyRate === 0) {
    console.log('[Worth My Time] No salary configured');
    return;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // SMART DETECTION ENGINE
  // Goal: convert prices as fast as the competitor while being resilient
  // across static pages, SPAs (React/Vue/Angular), and lazy-loaded content.
  //
  // Strategy:
  //   1. Run IMMEDIATELY when DOM is interactive (beats competitor's fixed delays)
  //   2. Debounce all subsequent calls — collapses rapid re-renders into one run
  //   3. MutationObserver watches for new price content — ignores our own nodes
  //   4. Smart retry — only re-runs if we found 0 prices, with exponential backoff
  //   5. SPA navigation detection — resets state and re-runs on URL change
  // ═══════════════════════════════════════════════════════════════════════

  let debounceTimer = null;
  let lastConvertedCount = 0;

  function scheduleProcess(delay) {
    delay = delay == null ? 200 : delay;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      processAllPrices();
    }, delay);
  }

  // ── Phase 1: Immediate run as soon as DOM is ready ───────────────────
  // Don't wait for images/scripts — prices are text and load with the DOM.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => scheduleProcess(0));
  } else {
    // DOM already ready (extension injected after load, or fast page)
    scheduleProcess(0);
  }

  // ── Phase 2: Smart retry — only if needed ────────────────────────────
  // Instead of always retrying at fixed intervals, check if we actually
  // converted anything. If not, retry with exponential backoff.
  // Covers lazy-loaded content, React hydration, and slow CDN responses.
  const RETRY_SCHEDULE = [300, 800, 1800, 3500, 6000];
  let retryIndex = 0;

  function scheduleRetryIfNeeded() {
    if (retryIndex >= RETRY_SCHEDULE.length) return;
    const delay = RETRY_SCHEDULE[retryIndex++];
    setTimeout(() => {
      const converted = document.querySelectorAll('.timeprice-converted').length;
      if (converted === 0) {
        console.log(`[Worth My Time] Retry #${retryIndex} — no prices found yet`);
        scheduleProcess(0);
        scheduleRetryIfNeeded();
      } else {
        // Found some prices — but still continue retrying at remaining intervals
        // in case carousels or lazy content loads more price elements later.
        // Just skip the immediate re-run since we already have results.
        console.log(`[Worth My Time] Retry #${retryIndex} — found ${converted}, continuing watch`);
        scheduleRetryIfNeeded();
      }
    }, delay);
  }
  scheduleRetryIfNeeded();

  // ── Phase 3: MutationObserver — watches for new content ─────────────
  // Fires when the page dynamically adds product cards (infinite scroll,
  // SPA route changes, React re-renders, lazy carousel loads).
  // CRITICAL: ignores mutations caused by our own badge injections.
  const observer = new MutationObserver((mutations) => {
    let hasNewPageContent = false;
    let hasAriaHiddenRemoval = false;

    for (const mutation of mutations) {
      // Track aria-hidden REMOVAL — this is how Slick activates a new slide
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-hidden') {
        const el = mutation.target;
        const newVal = el.getAttribute('aria-hidden');
        const oldVal = mutation.oldValue;
        // aria-hidden going from "true" to null/false = slide becoming active
        if ((oldVal === 'true') && (!newVal || newVal === 'false')) {
          hasAriaHiddenRemoval = true;
        }
        continue;
      }

      // Track new real page content being added
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;
        if (node.classList && node.classList.contains('timeprice-converted')) continue;
        if (node.children.length > 0 &&
            node.querySelectorAll(':not(.timeprice-converted)').length === 0) continue;
        hasNewPageContent = true;
        break;
      }
      if (hasNewPageContent) break;
    }

    if (hasAriaHiddenRemoval) {
      // Slick just made a slide active — wait for it to finish all DOM updates
      // before running detection. 600ms covers most carousel transition durations.
      purgeStaleKeys();
      scheduleProcess(600);
    } else if (hasNewPageContent) {
      purgeStaleKeys();
      scheduleProcess(250);
    }
  });
  
  // Also watch attribute changes so we detect when Slick carousel makes a
  // slide active by removing aria-hidden — this is how we catch clones becoming real
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeOldValue: true,  // needed to detect aria-hidden TRUE → FALSE transition
    attributeFilter: ['aria-hidden', 'class']
  });

  // ── SPA navigation detection ───────────────────────────────────────────
  // On Angular/React SPAs, the URL changes without a page reload.
  // When this happens, reset all dedup state so the new page gets fresh detection.
  let lastUrl = window.location.href;
  setInterval(() => {
    const currentUrl = window.location.href;
    if (currentUrl !== lastUrl) {
      console.log('[Worth My Time] SPA navigation detected, resetting state');
      lastUrl = currentUrl;
      processedPrices.clear();
      // processedElements is a WeakSet — GC handles it, no manual clear needed
      scheduleProcess(800);
    }
  }, 1000);

  console.log('[Worth My Time] Initialization complete');
}

// Listen for settings updates
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'updateSettings') {
    console.log('[Worth My Time] Settings updated, reloading settings and re-processing');
    
    // Reload settings and re-process
    loadSettings().then(() => {
      // Clear processed tracking
      processedElements = new WeakSet();
      processedPrices.clear();
      pageConversionCount = 0;
      
      // Re-process all prices with new settings
      processAllPrices();
    });
  } else if (request.action === 'getPageStatus') {
    // Return current page conversion count
    sendResponse({ count: pageConversionCount });
  }
  return true; // Keep message channel open for async response
});

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
