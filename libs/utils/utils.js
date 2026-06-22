/* eslint-disable no-console */
const BOT_REGEX = /GoogleBot|Google-InspectionTool|BingBot|PerplexityBot|Perplexity-User|ClaudeBot|Claude-User|Claude-SearchBot|Tokowaka-AI|ChatGPT-User|GPTBot|OAI-SearchBot|AdobeEdgeOptimize-AI/i;
export const isBot = () => BOT_REGEX.test(navigator.userAgent);

const MILO_TEMPLATES = [
  '404',
  'featured-story',
];
const C1_BLOCKS = [
  'accordion',
  'action-item',
  'action-scroller',
  'adobetv',
  'article-feed',
  'article-header',
  'aside',
  'author-header',
  'brand-concierge',
  'brick',
  'bulk-publish',
  'bulk-publish-v2',
  'caas',
  'caas-config',
  'caas-marquee',
  'caas-marquee-metadata',
  'card',
  'card-horizontal',
  'card-metadata',
  'carousel',
  'chart',
  'columns',
  'comparison-table',
  'editorial-card',
  'email-collection',
  'faas',
  'featured-article',
  'figure',
  'form',
  'fragment',
  'featured-article',
  'gallery',
  'gist',
  'global-footer',
  'global-navigation',
  'graybox',
  'footer',
  'gnav',
  'hero-marquee',
  'how-to',
  'icon-block',
  'iframe',
  'instagram',
  'language-selector',
  'language-banner',
  'market-selector',
  'mas-compare-chart-autoblock',
  'locui',
  'locui-create',
  'm7',
  'marketo',
  'marketo-config',
  'marquee',
  'marquee-anchors',
  'martech-metadata',
  'media',
  'merch',
  'merch-card',
  'merch-card-autoblock',
  'merch-card-collection-autoblock',
  'merch-offers',
  'mmm',
  'mnemonic-list',
  'mobile-app-banner',
  'modal',
  'modal-metadata',
  'notification',
  'nps-csat-form',
  'pdf-viewer',
  'quote',
  'read-more',
  'recommended-articles',
  'region-nav',
  'review',
  'section-metadata',
  'slideshare',
  'preflight',
  'promo',
  'quick-facts',
  'quiz',
  'quiz-entry',
  'quiz-marquee',
  'quiz-results',
  'tabs',
  'table-of-contents',
  'text',
  'timeline',
  'walls-io',
  'table',
  'table-metadata',
  'tags',
  'tag-selector',
  'tiktok',
  'twitter',
  'video',
  'vimeo',
  'youtube',
  'z-pattern',
  'share',
  'susi-light-login',
  'reading-time',
];

const C2_BLOCKS = [
  'base-card',
  'box',
  'brand-concierge',
  'carousel-c2',
  'comparison-table-c2',
  'elastic-carousel',
  'explore-card',
  'faq',
  'floating-cta',
  'global-footer',
  'global-navigation',
  'hover-list',
  'hub-hero',
  'iframe',
  'logo-ticker',
  'martech-metadata',
  'modal-metadata',
  'modal',
  'news',
  'offer-hero',
  'pdf-space',
  'plans-hero',
  'product-marquee-grid',
  'quick-actions',
  'region-nav',
  'rich-content',
  'router-marquee',
  'section-metadata',
  'side-by-side',
  'social-proof',
  'split-aside-grid',
  'tabs',
  'tour',
  'visually-hidden',
];

const AUTO_BLOCKS = [
  { adobetv: 'tv.adobe.com' },
  { gist: 'gist.github.com' },
  { caas: '/tools/caas' },
  { faas: '/tools/faas' },
  { fragment: '/fragments/', styles: false },
  { instagram: 'instagram.com' },
  { slideshare: 'slideshare.net', styles: false },
  { tiktok: 'tiktok.com', styles: false },
  { twitter: 'twitter.com' },
  { vimeo: 'vimeo.com' },
  { vimeo: 'player.vimeo.com' },
  { youtube: 'youtube.com' },
  { youtube: 'youtu.be' },
  { 'pdf-viewer': '.pdf', styles: false },
  { video: '.mp4' },
  { merch: '/tools/ost?' },
  { merch: '/miniplans' },
  { 'mas-compare-chart-autoblock': 'mas.adobe.com/studio.html#content-type=mas-compare-chart' },
  { 'merch-card-collection-autoblock': 'mas.adobe.com/studio.html#content-type=merch-card-collection', styles: false },
  { 'merch-card-autoblock': 'mas.adobe.com/studio.html', styles: false },
  { m7: '/creativecloud/business-plans', styles: false },
  { m7: '/creativecloud/education-plans', styles: false },
];
const DO_NOT_INLINE = [
  'accordion',
  'columns',
  'z-pattern',
];

const ENVS = {
  stage: {
    name: 'stage',
    ims: 'stg1',
    adobeIO: 'cc-collab-stage.adobe.io',
    adminconsole: 'stage.adminconsole.adobe.com',
    account: 'stage.account.adobe.com',
    edgeConfigId: '8d2805dd-85bf-4748-82eb-f99fdad117a6',
    pdfViewerClientId: 'a76f1668fd3244d98b3838e189900a5e',
  },
  prod: {
    name: 'prod',
    ims: 'prod',
    adobeIO: 'cc-collab.adobe.io',
    adminconsole: 'adminconsole.adobe.com',
    account: 'account.adobe.com',
    edgeConfigId: '2cba807b-7430-41ae-9aac-db2b0da742d5',
    pdfViewerClientId: '3c0a5ddf2cc04d3198d9e48efc390fa9',
  },
};
ENVS.local = {
  ...ENVS.stage,
  name: 'local',
};

export const MILO_EVENTS = {
  DEFERRED: 'milo:deferred',
  QUERY_INDEX_PRIMARY_LOADED: 'milo:query-index:primary-loaded',
  QUERY_INDEX_ALL_LOADED: 'milo:query-index:all-loaded',
};
const TARGET_TIMEOUT_MS = 4000;

const LANGSTORE = 'langstore';
const PREVIEW = 'target-preview';
const PAGE_URL = new URL(window.location.href);
// TODO remove LANGUAGE_BASED_PATHS once news.adobe.com is using new langFirst site structure
const LANGUAGE_BASED_PATHS = [
  // don't add milo too. It's a special case because of tools, merch, etc.
  'news.adobe.com',
];
const DEFAULT_LANG = 'en';
export const SLD = 'aem';

const PROMO_PARAM = 'promo';
let isMartechLoaded = false;

let langConfig;
const queryIndexes = {};
let baseQueryIndex;
let lingoSiteMapping;
let lingoSiteMappingLoaded;
let isLoadingQueryIndexes = false;
let queryIndexesAllLoaded = false;
let siteQueryIndexMapLingo = [];
let lingoModule = null;
let langRoutingConfig = null;
let langBannerPromise;
export const getLangRoutingConfig = () => langRoutingConfig;
export const setLangRoutingConfig = (config) => { langRoutingConfig = config; };

const parseList = (str) => str.split(/[\n,]+/).map((t) => t.trim()).filter(Boolean);

export function getEnv(conf) {
  const { host } = window.location;
  const query = PAGE_URL.searchParams.get('env');

  if (query) return { ...ENVS[query], consumer: conf[query] };

  const { clientEnv } = conf;
  if (clientEnv) return { ...ENVS[clientEnv], consumer: conf[clientEnv] };

  if (host.includes('localhost')) return { ...ENVS.local, consumer: conf.local };
  /* c8 ignore start */
  if (host.includes(`${SLD}.page`)
    || host.includes(`${SLD}.live`)
    || host.includes('stage.adobe')
    || host.includes('corp.adobe')
    || host.includes('graybox.adobe')
    || host.includes('aem.reviews')) {
    return { ...ENVS.stage, consumer: conf.stage };
  }
  return { ...ENVS.prod, consumer: conf.prod };
  /* c8 ignore stop */
}

function hydrateLocale(locales, key) {
  const locale = locales[key];

  const buildExpandedLocale = (localeData, localeKey) => ({
    ...localeData,
    prefix: localeKey ? `/${localeKey}` : '',
    region: localeData.region || localeKey.split('_')[0] || 'us',
  });

  const isBaseLocale = !('base' in locale);
  if (isBaseLocale) {
    const hydratedChildren = Object.entries(locales)
      .filter(([, childLocale]) => childLocale.base === key)
      .reduce((acc, [childKey, childLocale]) => {
        const mergedLocale = { ...locale, ...childLocale, base: childLocale.base };
        acc[childKey] = buildExpandedLocale(mergedLocale, childKey);
        return acc;
      }, {});

    const hydratedBase = buildExpandedLocale(locale, key);
    return { ...hydratedBase, regions: hydratedChildren };
  }

  const hasValidBase = 'base' in locale && locales[locale.base] !== undefined;
  if (hasValidBase) {
    const baseLocale = locales[locale.base];
    const mergedLocale = { ...baseLocale, ...locale };
    return buildExpandedLocale(mergedLocale, key);
  }

  return { ...locale };
}

export function getLocale(locales, pathname = window.location.pathname) {
  if (!locales) return { ietf: 'en-US', tk: 'hah7vzn.css', prefix: '' };

  const split = pathname.split('/');
  const localeString = split[1];
  const specialPrefix = [LANGSTORE, PREVIEW].includes(localeString) ? localeString : '';
  const ietfSegment = split[2];

  let matchedKey = '';
  if (specialPrefix) {
    matchedKey = Object.keys(locales).find((key) => locales[key]?.ietf?.startsWith(ietfSegment)) ?? '';
  } else if (localeString in locales) {
    matchedKey = localeString;
  }

  const locale = hydrateLocale(locales, matchedKey);
  if (specialPrefix) locale.prefix = `/${specialPrefix}${ietfSegment ? `/${ietfSegment}` : ''}`;
  return locale;
}

export function getLanguage(languages, locales, pathname = window.location.pathname) {
  const split = pathname.split('/');
  const locOffset = [LANGSTORE, PREVIEW].includes(split[1]) ? 1 : 0;
  const languageString = split[locOffset + 1];
  const region = split[locOffset + 2];
  let regionPath = '';

  const language = languages?.[languageString];
  if (language && region && language.regions) {
    const [matchingRegion] = language.regions.filter((r) => r.region === region);
    if (matchingRegion?.region) language.region = matchingRegion.region;
    if (matchingRegion?.ietf) language.ietf = matchingRegion.ietf;
    if (matchingRegion?.tk) language.tk = matchingRegion.tk;
    regionPath = matchingRegion ? `/${region}` : '';
  }

  const isLegacyLocaleRoutingMode = !language
    || (language.languageBased === false && !language.region);
  if (isLegacyLocaleRoutingMode) {
    const locale = getLocale(locales, pathname);
    const englishLang = languages?.en;
    if (locale.prefix === '' && englishLang) {
      locale.language = DEFAULT_LANG;
      if (englishLang.region) locale.region = englishLang.region;
      if (englishLang.ietf) locale.ietf = englishLang.ietf;
      if (englishLang.tk) locale.tk = englishLang.tk;
    }
    return locale;
  }

  if (!language.ietf) language.ietf = `${languageString}${language.region ? `_${language.region.toUpperCase()}` : ''}`;
  language.language = languageString;
  language.prefix = `${languageString === DEFAULT_LANG && !regionPath ? '' : '/'}${languageString}${regionPath}`;
  return language;
}

export function setInternational(prefix) {
  const domain = window.location.host.endsWith('.adobe.com') ? 'domain=adobe.com' : '';
  const maxAge = 365 * 24 * 60 * 60; // max-age in seconds for 365 days
  document.cookie = `international=${prefix};max-age=${maxAge};path=/;${domain}`;
  sessionStorage.setItem('international', prefix);
}

export function setMarket(marketCode) {
  const domain = window.location.host.endsWith('.adobe.com') ? 'domain=adobe.com' : '';
  const maxAge = 365 * 24 * 60 * 60;
  document.cookie = `country=${marketCode};max-age=${maxAge};path=/;${domain}`;
  sessionStorage.setItem('market', marketCode);
}

export function getMetadata(name, doc = document) {
  const attr = name && name.includes(':') ? 'property' : 'name';
  const meta = doc.head.querySelector(`meta[${attr}="${name}"]`);
  return meta && meta.content;
}

(() => { if (getMetadata('mweb') === 'on') document.body.classList.add('mweb-enabled'); })();

const handleEntitlements = (() => {
  const { martech } = Object.fromEntries(PAGE_URL.searchParams);
  if (martech === 'off') return () => { };
  let entResolve;
  const entPromise = new Promise((resolve) => {
    entResolve = resolve;
  });

  return (resolveVal) => {
    if (resolveVal !== undefined) {
      entResolve(resolveVal);
    }
    return entPromise;
  };
})();

function setupMiloObj(config) {
  window.milo ||= {};
  window.milo.deferredPromise = new Promise((resolve) => {
    config.resolveDeferred = resolve;
  });
}

export const [setConfig, updateConfig, getConfig] = (() => {
  let config = {};
  return [
    (conf) => {
      const origin = conf.origin || window.location.origin;
      const pathname = conf.pathname || window.location.pathname;
      config = { env: getEnv(conf), ...conf };
      config.codeRoot = conf.codeRoot ? `${origin}${conf.codeRoot}` : origin;
      config.base = config.miloLibs || config.codeRoot;
      config.locale = conf.languages
        ? getLanguage(conf.languages, conf.locales, pathname) : getLocale(conf.locales, pathname);
      config.pathname = pathname;
      config.autoBlocks = conf.autoBlocks ? [...AUTO_BLOCKS, ...conf.autoBlocks] : AUTO_BLOCKS;
      config.signInContext = conf.signInContext || {};
      config.doNotInline = conf.doNotInline
        ? [...DO_NOT_INLINE, ...conf.doNotInline]
        : DO_NOT_INLINE;
      const lang = getMetadata('content-language') || config.locale.ietf;
      document.documentElement.setAttribute('lang', lang);
      try {
        const dir = getMetadata('content-direction')
          || config.locale.dir
          || (config.locale.ietf && (new Intl.Locale(config.locale.ietf)?.textInfo?.direction))
          || 'ltr';
        document.documentElement.setAttribute('dir', dir);
      } catch (e) {
        console.log('Invalid or missing locale:', e);
      }
      config.locale.contentRoot = `${origin}${config.locale.prefix}${config.contentRoot ?? ''}`;
      config.useDotHtml = !PAGE_URL.origin.includes(`.${SLD}.`)
        && (conf.useDotHtml ?? PAGE_URL.pathname.endsWith('.html'));
      config.entitlements = handleEntitlements;
      config.consumerEntitlements = conf.entitlements || [];
      setupMiloObj(config);

      return config;
    },
    (conf) => (config = conf),
    () => config,
  ];
})();

let federatedContentRoot;
export const getFederatedContentRoot = () => {
  if (federatedContentRoot) return federatedContentRoot;

  const cdnWhitelistedOrigins = [
    'https://www.adobe.com',
    'https://business.adobe.com',
    'https://blog.adobe.com',
    'https://milo.adobe.com',
    'https://news.adobe.com',
    'graybox.adobe.com',
  ];
  const { allowedOrigins = [], origin: configOrigin, fedContentPrefix } = getConfig();
  if (federatedContentRoot) return federatedContentRoot;
  // Non milo consumers will have its origin from config
  const origin = configOrigin || window.location.origin;

  const isAllowedOrigin = [...allowedOrigins, ...cdnWhitelistedOrigins].some((o) => {
    const originNoStage = origin.replace('.stage', '');
    return o.startsWith('https://')
      ? originNoStage === o
      : originNoStage.endsWith(o);
  });
  federatedContentRoot = isAllowedOrigin ? origin : 'https://www.adobe.com';

  if (origin.includes('localhost') || origin.includes(`.${SLD}.`)) {
    federatedContentRoot = `https://main--federal--adobecom.aem.${origin.endsWith('.live') ? 'live' : 'page'}`;
  }

  if (fedContentPrefix) {
    federatedContentRoot = `${federatedContentRoot}${fedContentPrefix}`;
  }

  return federatedContentRoot;
};

export const getFederatedUrl = (url = '') => {
  if (typeof url !== 'string' || !url.includes('/federal/')) return url;
  if (url.startsWith('/')) return `${getFederatedContentRoot()}${url}`;
  try {
    const { fedContentPrefix, locale } = getConfig();
    const { pathname, search, hash } = new URL(url);
    const hasPrefix = fedContentPrefix && (pathname.startsWith(fedContentPrefix)
      || pathname.startsWith(`${locale.prefix}${fedContentPrefix}`));
    return `${getFederatedContentRoot()}${hasPrefix
      ? pathname.replace(fedContentPrefix, '') : pathname}${search}${hash}`;
  } catch (e) {
    window.lana?.log(`getFederatedUrl errored parsing the URL: ${url}: ${e.toString()}`, {
      tags: 'utils',
      severity: 'error',
    });
  }
  return url;
};

function isPathMatch(path, href) {
  if (path.includes('*')) {
    const regex = new RegExp(path.replace(/\*/g, '[a-zA-Z]{1}'));
    return regex.test(href);
  }
  return href.includes(path);
}

export function hasLanguageLinks(area, paths = LANGUAGE_BASED_PATHS) {
  if (!area) return false;
  const links = area.querySelectorAll('a');
  return Array.from(links).some((link) => {
    const { href } = link;
    if (!href) return false;
    return paths.some((path) => isPathMatch(path, href));
  });
}

export async function loadLanguageConfig() {
  if (langConfig) return langConfig;

  try {
    const response = await fetch(`${getFederatedContentRoot()}/federal/assets/data/languages-config.json`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const configJson = await response.json();

    langConfig = {
      localeToLanguageMap: configJson['locale-to-language-map']?.data,
      siteLanguages: configJson['site-languages']?.data?.map((site) => ({
        ...site,
        pathMatches: parseList(site.pathMatches),
        languages: parseList(site.languages),
      })),
      nativeToEnglishMapping: configJson['langmap-native-to-en']?.data || [],
    };

    return langConfig;
  } catch (e) {
    window.lana?.log(`Failed to load language-config.json: ${e}`, {
      tags: 'utils',
      severity: 'error',
    });
  }

  return {};
}

let fedsPlaceholderConfig;
export const getFedsPlaceholderConfig = ({ useCache = true } = {}) => {
  if (useCache && fedsPlaceholderConfig) return fedsPlaceholderConfig;

  const { locale, placeholders } = getConfig();
  const libOrigin = getFederatedContentRoot();

  fedsPlaceholderConfig = {
    locale: {
      ...locale,
      contentRoot: `${libOrigin}${locale.prefix}/federal/globalnav`,
    },
    placeholders,
  };

  return fedsPlaceholderConfig;
};

/**
 * TODO: This method will be deprecated and removed in a future version.
 * @see https://jira.corp.adobe.com/browse/MWPW-173470
 * @see https://jira.corp.adobe.com/browse/MWPW-174411
*/
export const shouldAllowKrTrial = (link, localePrefix) => {
  const allowKrTrialHash = '#_allow-kr-trial';
  const hasAllowKrTrial = link.href?.includes(allowKrTrialHash);
  if (hasAllowKrTrial) {
    link.href = link.href.replace(allowKrTrialHash, '');
    const modalHash = link.getAttribute('data-modal-hash');
    if (modalHash) link.setAttribute('data-modal-hash', modalHash.replace(allowKrTrialHash, ''));
  }
  return localePrefix === '/kr' && hasAllowKrTrial;
};

/**
 * TODO: This method will be deprecated and removed in a future version.
 * @see https://jira.corp.adobe.com/browse/MWPW-173470
 * @see https://jira.corp.adobe.com/browse/MWPW-174411
*/
export const shouldBlockFreeTrialLinks = (link) => {
  const localePrefix = getConfig()?.locale?.prefix;
  const hasAllowKrTrialMeta = getMetadata('allow-kr-free-trial') === 'on';
  if (hasAllowKrTrialMeta || shouldAllowKrTrial(link, localePrefix) || localePrefix !== '/kr'
      || (!link.dataset?.modalPath?.includes('/kr/cc-shared/fragments/trial-modals')
       && !['free-trial', 'free trial', '무료 체험판', '무료 체험하기', '{{try-for-free}}', '무료', 'free']
         .some((pattern) => link.textContent?.toLowerCase()?.includes(pattern.toLowerCase())))) {
    return false;
  }

  if (link.dataset.wcsOsi) {
    link.dataset.hideKrFreeTrial = 'true';
    return false;
  }

  const parent = link.parentElement;
  const elementToRemove = (parent?.tagName === 'STRONG' || parent?.tagName === 'EM') && parent?.children?.length === 1 ? parent : link;
  elementToRemove.remove();
  return true;
};

export function isInTextNode(node) {
  return (node.parentElement.childNodes.length > 1 && node.parentElement.firstChild.tagName === 'A') || node.parentElement.firstChild.nodeType === Node.TEXT_NODE;
}

export function lingoActive() {
  const langFirst = (PAGE_URL.searchParams.get('langfirst') || getMetadata('langfirst'))?.toLowerCase();
  return ['true', 'on'].includes(langFirst);
}

export function mepLingoSkipQI() {
  const skip = (PAGE_URL.searchParams.get('mep-lingo-skip-qi') || getMetadata('mep-lingo-skip-qi'))?.toLowerCase();
  return lingoActive() && ['true', 'on'].includes(skip);
}

export function createTag(tag, attributes, html, options = {}) {
  const el = document.createElement(tag);
  if (html) {
    if (html.nodeType === Node.ELEMENT_NODE
      || html instanceof SVGElement
      || html instanceof DocumentFragment) {
      el.append(html);
    } else if (Array.isArray(html)) {
      el.append(...html);
    } else {
      el.insertAdjacentHTML('beforeend', html);
    }
  }
  if (attributes) {
    Object.entries(attributes).forEach(([key, val]) => {
      el.setAttribute(key, val);
    });
  }
  options.parent?.append(el);
  return el;
}

function getExtension(path) {
  const pageName = path.split('/').pop();
  return pageName.includes('.') ? pageName.split('.').pop() : '';
}

function getPrefixBySite(locale, url, relative) {
  let { prefix } = locale;
  // eslint-disable-next-line max-len
  const site = langConfig?.siteLanguages?.find((s) => s.pathMatches.some((d) => isPathMatch(d, url.href)));
  const localeSiteWithLanguageTarget = !locale.language && site && langConfig?.localeToLanguageMap;
  const languageSiteWithLocaleTarget = locale.language && !relative && !site?.languages.some((l) => (l === DEFAULT_LANG ? '' : `/${l}`) === prefix);
  if (localeSiteWithLanguageTarget) {
    const mappedLanguageFromPrefix = langConfig?.localeToLanguageMap?.find((m) => `${m.locale === '' ? '' : '/'}${m.locale}` === prefix);
    const languageInUseBySite = site.languages.find((l) => `${l}` === mappedLanguageFromPrefix.languagePath);
    if (languageInUseBySite) {
      prefix = languageInUseBySite === DEFAULT_LANG ? '' : `/${languageInUseBySite}`;
    }
  }
  if (languageSiteWithLocaleTarget) {
    const mappedLocaleFromLanguage = langConfig?.localeToLanguageMap?.find((m) => `/${m.languagePath}` === prefix);
    prefix = mappedLocaleFromLanguage ? `${mappedLocaleFromLanguage.locale === '' ? '' : '/'}${mappedLocaleFromLanguage.locale}` : prefix;
  }

  return prefix;
}

function isLocalizedPath(path, locales) {
  const langstorePath = path.startsWith(`/${LANGSTORE}`);
  const isMerchLink = path === '/tools/ost';
  const previewPath = path.startsWith(`/${PREVIEW}`);
  const anyTypeOfLocaleOrLanguagePath = langConfig?.localeToLanguageMap
    && (langConfig.localeToLanguageMap.some((l) => l.locale !== '' && (path.startsWith(`/${l.locale}/`) || path === `/${l.locale}`))
      || (langConfig.localeToLanguageMap.some((l) => path.startsWith(`/${l.languagePath}/`) || path === `/${l.languagePath}`)));
  const legacyLocalePath = locales && Object.keys(locales).some((loc) => loc !== '' && (path.startsWith(`/${loc}/`)
    || path.endsWith(`/${loc}`)));
  return langstorePath
    || isMerchLink
    || previewPath
    || anyTypeOfLocaleOrLanguagePath
    || legacyLocalePath;
}

function processQueryIndexMap(link, domain) {
  const result = {
    pathsRequest: null,
    requestResolved: false,
    domains: [domain],
  };

  result.pathsRequest = fetch(`${link}?limit=30000`)
    .then((response) => response.json())
    .then((json) => json.data?.map((d) => (d.path ?? d.Path)?.replace(/\.html$/, '')) ?? [])
    .catch((error) => {
      window.lana?.log(`Failed to load query index: ${link} | ${error}`, {
        tags: 'utils',
        severity: 'error',
      });
      return [];
    })
    .finally(() => {
      result.requestResolved = true;
    });

  return result;
}
const getDomainLingo = (path) => path?.split('/*')[0];

export function resolveCrossSiteIndex(
  { queryIndexWebPath, stageHost },
  prefix,
  suffix,
  currentHost,
) {
  const prodHost = getDomainLingo(queryIndexWebPath);
  let host = prodHost;
  let sfx = '';

  if (/\.stage\.adobe\.com$/.test(currentHost) && stageHost) {
    host = stageHost;
    sfx = suffix;
  }

  const path = queryIndexWebPath.slice(prodHost.length)
    .replace('/*', prefix)
    .replace(/\/query-index\.json$/, `/query-index${sfx}.json`);
  return { url: `https://${host}${path}`, host };
}

async function loadQueryIndexes(prefix, links = []) {
  const config = getConfig();
  const suffix = config.env?.name === 'prod' || window.location.host.includes(`${SLD}.live`) ? '' : '-preview';

  if (links.length && links.some((l) => l.includes('/federal/')) && !queryIndexes.federal) {
    const fedRoot = getFederatedContentRoot();
    queryIndexes.federal = processQueryIndexMap(
      `${fedRoot}${prefix}/federal/assets/lingo/query-index${suffix}.json`,
      fedRoot.replace('https://', ''),
    );
    queryIndexes.federal.domains.push(window.location.hostname);
  }
  if (lingoSiteMapping || isLoadingQueryIndexes) return;
  isLoadingQueryIndexes = true;

  const origin = config.origin || window.location.origin;
  const contentRoot = config.contentRoot ?? '';
  const siteId = config.uniqueSiteId ?? '';
  const host = window.location.hostname;
  const indexUrl = (pfx, sfx = suffix) => `${origin}${pfx}${contentRoot}/assets/lingo/query-index${sfx}.json`;

  queryIndexes[siteId] = processQueryIndexMap(indexUrl(prefix), host);

  const { base: localeBase, prefix: localePrefix } = config.locale;
  let basePfx = localePrefix ?? '';
  if (localeBase !== undefined) basePfx = localeBase ? `/${localeBase}` : '';
  baseQueryIndex = processQueryIndexMap(indexUrl(basePfx, ''), host);

  Promise.all([queryIndexes[siteId]?.pathsRequest, baseQueryIndex?.pathsRequest].filter(Boolean))
    .then(() => window.dispatchEvent(new CustomEvent(MILO_EVENTS.QUERY_INDEX_PRIMARY_LOADED)));

  lingoSiteMapping = (async () => {
    try {
      const resp = await fetch(`${getFederatedContentRoot()}/federal/assets/data/lingo-site-mapping.json`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json = await resp.json();
      siteQueryIndexMapLingo = json['site-query-index-map']?.data ?? [];
      const localesData = json['site-locales']?.data ?? [];

      const existingDomain = getDomainLingo(
        siteQueryIndexMapLingo.find((d) => d.uniqueSiteId === siteId)?.queryIndexWebPath,
      );
      if (existingDomain) {
        [queryIndexes[siteId], baseQueryIndex].forEach((qi) => {
          if (qi && !qi.domains.includes(existingDomain)) qi.domains.push(existingDomain);
        });
      }

      siteQueryIndexMapLingo
        .filter((d) => d.uniqueSiteId !== siteId
          && config.prodDomains?.includes(getDomainLingo(d.queryIndexWebPath)))
        .forEach(({ uniqueSiteId: uid, queryIndexWebPath, stageHost }) => {
          const hasRegional = localesData
            .some((s) => s.uniqueSiteId === uid && parseList(s.regionalSites).includes(prefix));
          if (!hasRegional) return;
          const prodDomain = getDomainLingo(queryIndexWebPath);
          const { url, host: envHost } = resolveCrossSiteIndex(
            { queryIndexWebPath, stageHost },
            prefix,
            suffix,
            window.location.hostname,
          );
          queryIndexes[uid] = processQueryIndexMap(url, prodDomain);
          if (envHost !== prodDomain) queryIndexes[uid].domains.push(envHost);
        });
    } catch (e) {
      window.lana?.log(`Failed to load lingo-site-mapping.json: ${e}`, { tags: 'utils', severity: 'error' });
    } finally {
      lingoSiteMappingLoaded = true;
    }
  })();

  const lingoImport = import('./lingo.js').then((mod) => { lingoModule = mod; });

  lingoSiteMapping.then(() => Promise.all([
    ...Object.values(queryIndexes).map((q) => q.pathsRequest).filter(Boolean),
    lingoImport,
  ])).then(() => {
    queryIndexesAllLoaded = true;
    window.dispatchEvent(new CustomEvent(MILO_EVENTS.QUERY_INDEX_ALL_LOADED));
  });
}

function attachLingoPendingListener(a, hostname, rawPath, basePrefix, regionalPrefix, isBasePage) {
  let primaryHandler;
  let allHandler;
  let cleaned = false;

  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    window.removeEventListener(MILO_EVENTS.QUERY_INDEX_PRIMARY_LOADED, primaryHandler);
    window.removeEventListener(MILO_EVENTS.QUERY_INDEX_ALL_LOADED, allHandler);
  };

  const handle = (isFinal) => {
    if (!a.isConnected) { cleanup(); return; }
    (lingoModule ? Promise.resolve(lingoModule) : import('./lingo.js'))
      .then((mod) => mod.tryLocalizeLink(
        a,
        hostname,
        rawPath,
        basePrefix,
        regionalPrefix,
        isBasePage,
        Object.values(queryIndexes),
        baseQueryIndex,
        isFinal,
      ))
      .then((done) => { if (done) cleanup(); })
      .catch(() => { if (isFinal) cleanup(); });
  };

  primaryHandler = () => handle(false);
  allHandler = () => handle(true);

  if (queryIndexesAllLoaded) {
    handle(true);
  } else {
    window.addEventListener(MILO_EVENTS.QUERY_INDEX_PRIMARY_LOADED, primaryHandler);
    window.addEventListener(MILO_EVENTS.QUERY_INDEX_ALL_LOADED, allHandler);
    if (lingoSiteMapping) {
      lingoSiteMapping.then(() => {
        if (cleaned || !a.isConnected) return;
        const hasIndex = Object.values(queryIndexes)
          .some((q) => q.domains.includes(hostname));
        if (!hasIndex) {
          if (!isBasePage && regionalPrefix !== basePrefix) {
            const { origin, search, hash } = new URL(a.href);
            a.href = `${origin}${regionalPrefix}${rawPath}${search}${hash}`;
          }
          cleanup();
        }
      });
    }
  }
}

function localizeLinkCore(
  href,
  originHostName,
  overrideDomain,
  useAsync,
  { overridePrefix = null, overrideBase = null, aTag = null } = {},
) {
  try {
    const url = new URL(href);
    const relative = url.hostname === originHostName;
    const processedHref = relative ? href.replace(url.origin, '') : href;
    if (url.hash.includes('#_dnt')) return processedHref.replace('#_dnt', '');
    const path = url.pathname;
    const extension = getExtension(path);
    if (!['', 'html', 'json'].includes(extension)) return processedHref;
    const { locale, locales, languages, prodDomains, uniqueSiteId } = getConfig();
    if (!locale || !(locales || languages)) return processedHref;
    const isLocalizable = relative
      || (url.hostname && prodDomains?.includes(url.hostname))
      || overrideDomain
      || (url.hostname && getFederatedContentRoot().includes(url.hostname));
    if (!isLocalizable || isLocalizedPath(path, locales)) return processedHref;

    const isFragment = path.includes('/fragments/');
    const isMepLingoFragment = isFragment && aTag?.dataset.mepLingo === 'true';
    const prefix = overridePrefix ?? getPrefixBySite(locale, url, relative);
    const buildUrl = (pfx) => {
      const urlPath = `${pfx}${path}${url.search}${url.hash}`;
      return relative ? urlPath : `${url.origin}${urlPath}`;
    };

    const isLingoPage = locale.base !== undefined || !!locale.regions;
    const isLcpSection = aTag?.closest('.section')?.dataset.idx === '0';
    const siteId = uniqueSiteId ?? '';
    const qiResolved = queryIndexes[siteId]?.requestResolved;
    const skipQueryIndex = isMepLingoFragment
        && (mepLingoSkipQI() || (isLcpSection && !qiResolved));
    const enterAsync = useAsync && aTag && extension !== 'json' && !skipQueryIndex
      && lingoActive() && isLingoPage
      && (!isFragment || (isMepLingoFragment && !!locale.regions));

    if (enterAsync) {
      return (async () => {
        loadQueryIndexes(prefix, [href]);
        const base = overrideBase ?? locale.base;
        const basePrefix = base === '' ? '' : `/${base}`;

        if (isMepLingoFragment) {
          if (!(queryIndexes[siteId]?.requestResolved || lingoSiteMappingLoaded)) {
            await Promise.all([
              queryIndexes[siteId]?.pathsRequest,
              lingoSiteMapping,
            ].filter(Boolean));
          }
          if (!lingoModule) lingoModule = await import('./lingo.js');
        }

        const matchingIndexes = Object.values(queryIndexes)
          .filter((q) => q.domains.includes(url.hostname)
            && (isMepLingoFragment || q.requestResolved));
        const needsListener = !isMepLingoFragment && !queryIndexesAllLoaded;

        const domainInSiteMap = !lingoSiteMappingLoaded
          || Object.values(queryIndexes).some((q) => q.domains.includes(url.hostname));
        const isBasePage = !!locale.regions;

        let resolvedPrefix = basePrefix;
        if (lingoModule) {
          resolvedPrefix = await lingoModule.resolveLingoPrefix(
            path,
            prefix,
            basePrefix,
            url.hostname,
            matchingIndexes,
            baseQueryIndex,
            aTag,
            { isMepLingo: isMepLingoFragment, domainInSiteMap, isBasePage },
          );
        }

        if (needsListener && resolvedPrefix === basePrefix) {
          attachLingoPendingListener(aTag, url.hostname, path, basePrefix, prefix, isBasePage);
        }

        return buildUrl(resolvedPrefix);
      })();
    }

    if (skipQueryIndex && aTag) aTag.dataset.mepLingoSkippedQI = 'true';
    return buildUrl(prefix);
  } catch (error) {
    return href;
  }
}

function setCountry() {
  const country = window.performance?.getEntriesByType('navigation')?.[0]?.serverTiming
    ?.find((timing) => timing?.name === 'geo')?.description?.toLowerCase();
  if (!country) return;
  sessionStorage.setItem('akamai', country);
  sessionStorage.setItem('feds_location', JSON.stringify({ country: country.toUpperCase() }));
}

export async function getCountry(skipFallback = false) {
  if (isBot()) return null;

  const rawAkamai = PAGE_URL.searchParams.get('akamaiLocale');
  const akamaiLocale = /^[a-zA-Z]{2,6}$/.test(rawAkamai) ? rawAkamai : null;
  const country = akamaiLocale || sessionStorage.getItem('akamai');
  if (country || skipFallback) return country?.toLowerCase();

  try {
    const { getAkamaiCode } = await import('./geo.js');
    return await getAkamaiCode();
  } catch (error) {
    window.lana?.log(`Error getting Akamai code: ${error}`, { severity: 'error' });
    return null;
  }
}

export const getCookie = (name) => document.cookie
  .split('; ')
  .find((row) => row.startsWith(`${name}=`))
  ?.split('=')[1];

export function normCountryCode(country) {
  if (country == null || typeof country !== 'string') return undefined;
  const lower = country.toLowerCase();
  return lower === 'uk' ? 'gb' : lower.split('_')[0];
}

export function computeDetectedMarketCountry(search, cookieCountry, countryFromGeo) {
  const params = new URLSearchParams(search);
  const countryParam = normCountryCode(params.get('country'));
  const akamaiParam = normCountryCode(params.get('akamaiLocale'));
  return countryParam || akamaiParam || cookieCountry || normCountryCode(countryFromGeo);
}

export async function resolveDetectedMarketCountry() {
  if (isBot()) return null;
  const cookieMarket = getCookie('country');
  const countryFromGeo = await getCountry();
  let detectedMarket = computeDetectedMarketCountry(
    window.location.search,
    cookieMarket,
    countryFromGeo,
  );
  if (!detectedMarket) {
    try {
      const { default: getAkamaiCode } = await import('./geo.js');
      detectedMarket = normCountryCode(await getAkamaiCode());
    } catch (error) {
      window.lana?.log(`Error getting Akamai code: ${error}`, { severity: 'error' });
    }
  }
  return detectedMarket;
}

export async function getLingoRegion({ useGeoLocation = false } = {}) {
  if (!lingoActive()) return null;
  const config = getConfig();
  const { locale } = config || {};
  const { regions } = locale || {};

  if (!regions || !Object.keys(regions).length) return null;

  if (useGeoLocation) {
    const intlPrefix = sessionStorage.getItem('international') || getCookie('international');
    if (intlPrefix) return Object.values(regions).find((r) => r.prefix === `/${intlPrefix}`) ?? null;
  }

  const country = useGeoLocation
    ? normCountryCode(await getCountry())
    : (await resolveDetectedMarketCountry())?.toLowerCase();
  if (!country) return null;

  const localeKey = locale.prefix === '' ? 'en' : locale.prefix.replace('/', '');

  let regionKey = Object.entries(regions).find(
    ([key]) => key === country || key === `${country}_${localeKey}`,
  )?.[0];

  if (!regionKey && config.mepLingoCountryToRegion) {
    regionKey = Object.entries(config.mepLingoCountryToRegion).find(
      ([key, countries]) => Array.isArray(countries) && countries.includes(country) && regions[key],
    )?.[0];
  }

  return regionKey ? regions[regionKey] : null;
}

export async function getGeoLocalePrefix() {
  const region = await getLingoRegion();
  return region?.prefix ?? null;
}

let mepLingoModulePreloaded = false;

function preloadMepLingoModule() {
  if (mepLingoModulePreloaded) return;
  mepLingoModulePreloaded = true;
  import('../features/mep/lingo.js');
}

function detectMepLingoSwap(a) {
  if (!a) return;
  const isInsertHash = a.href.includes('#_mep-lingo-insert');
  const isRemoveHash = !isInsertHash && a.href.includes('#_mep-lingo-remove');
  const isRegularHash = !isInsertHash && !isRemoveHash && a.href.includes('#_mep-lingo');

  if (isInsertHash || isRemoveHash || isRegularHash) {
    let hashToRemove = '#_mep-lingo';
    if (isInsertHash) hashToRemove = '#_mep-lingo-insert';
    if (isRemoveHash) hashToRemove = '#_mep-lingo-remove';

    a.dataset.mepLingo = 'true';
    if (isInsertHash) a.dataset.mepLingoInsert = 'true';
    if (isRemoveHash) a.dataset.mepLingoRemove = 'true';
    a.dataset.originalHref = a.href.replace(hashToRemove, '');
    a.href = a.href.replace(hashToRemove, '');
    if (lingoActive()) preloadMepLingoModule();
    if (isInsertHash || isRemoveHash) return;
  }
  const row = a.closest('.section > div > div');
  const firstCellText = row?.children[0]?.textContent?.toLowerCase().trim();

  if (firstCellText === 'mep-lingo') {
    a.dataset.mepLingo = 'true';
    a.dataset.originalHref = a.href;
    if (lingoActive()) preloadMepLingoModule();
    const swapBlock = a.closest('.section > div[class]');
    if (a.closest('.section-metadata')) {
      a.dataset.mepLingoSectionSwap = 'true';
    } else if (swapBlock) {
      const [blockName] = swapBlock.classList;
      a.dataset.mepLingoBlockSwap = blockName;

      if (blockName === 'mep-lingo') {
        if (swapBlock.classList.contains('insert')) {
          a.dataset.mepLingoInsert = 'true';
        } else if (swapBlock.classList.contains('remove')) {
          a.dataset.mepLingoRemove = 'true';
        }
      }
    }
  }
}

export async function localizeLinkAsync(
  href,
  originHostName = window.location.hostname,
  overrideDomain = false,
  aTag = null,
) {
  if (!href) return href;

  detectMepLingoSwap(aTag);
  const effectiveHref = href.replace(/#_mep-lingo(-insert|-remove)?/g, '');
  const isMepLingoLink = aTag?.dataset?.mepLingo
    || aTag?.dataset?.mepLingoSectionSwap
    || aTag?.dataset?.mepLingoBlockSwap;

  const { locale } = getConfig() || {};
  const isBasePage = !!locale?.regions;
  const needsOverride = lingoActive()
    && (isMepLingoLink || isBasePage || locale?.base !== undefined);

  let prefix = null;
  let base = null;
  if (needsOverride) {
    const isFragment = effectiveHref.includes('/fragments/');
    if (isBasePage) {
      const isRegularFragment = isFragment && !isMepLingoLink;
      prefix = (aTag && !isRegularFragment) ? await getGeoLocalePrefix() : (locale?.prefix ?? '');
      base = locale?.prefix?.replace('/', '') ?? '';
    } else {
      const basePrefix = locale?.base === '' ? '' : `/${locale?.base}`;
      prefix = (isFragment || aTag) ? (locale?.prefix || null) : basePrefix;
      base = locale?.base ?? '';
    }
  }

  return localizeLinkCore(
    effectiveHref,
    originHostName,
    overrideDomain,
    true,
    { overridePrefix: prefix, overrideBase: base, aTag },
  );
}

// this method is deprecated - use localizeLinkAsync instead
export function localizeLink(
  href,
  originHostName = window.location.hostname,
  overrideDomain = false,
) {
  return localizeLinkCore(href, originHostName, overrideDomain, false, {});
}

export function loadLink(href, {
  id, as, callback, crossorigin, rel, fetchpriority,
} = {}) {
  let link = document.head.querySelector(`link[href="${href}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    if (id) link.setAttribute('id', id);
    if (as) link.setAttribute('as', as);
    if (crossorigin) link.setAttribute('crossorigin', crossorigin);
    if (fetchpriority) link.setAttribute('fetchpriority', fetchpriority);
    link.setAttribute('href', href);
    if (callback) {
      link.onload = (e) => callback(e.type);
      link.onerror = (e) => callback(e.type);
    }
    document.head.appendChild(link);
  } else if (callback) {
    callback('noop');
  }
  return link;
}

export function loadStyle(href, callback) {
  return loadLink(href, { rel: 'stylesheet', callback });
}

export function appendHtmlToCanonicalUrl() {
  const { useDotHtml } = getConfig();
  if (!useDotHtml) return;
  const canonEl = document.head.querySelector('link[rel="canonical"]');
  if (!canonEl) return;
  const canonUrl = new URL(canonEl.href);
  if (canonUrl.pathname.endsWith('/') || canonUrl.pathname.endsWith('.html')) return;
  const pagePath = PAGE_URL.pathname.replace('.html', '');
  if (pagePath !== canonUrl.pathname) return;
  canonEl.setAttribute('href', `${canonEl.href}.html`);
}

export function appendSuffixToTitles() {
  const appendage = getMetadata('title-append');
  if (!appendage) return;
  document.title = `${document.title} ${appendage}`;
  const ogTitleEl = document.querySelector('meta[property="og:title"]');
  if (ogTitleEl) ogTitleEl.setAttribute('content', document.title);
  const twitterTitleEl = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleEl) twitterTitleEl.setAttribute('content', document.title);
}

export function appendHtmlToLink(link) {
  const { useDotHtml } = getConfig();
  if (!useDotHtml) return;
  const href = link.getAttribute('href');
  if (!href?.length || href.includes('#_nohtml')) return;

  const { autoBlocks = [], htmlExclude = [] } = getConfig();

  const HAS_EXTENSION = /\..*$/;
  let url = { pathname: href };

  try { url = new URL(href, PAGE_URL); } catch (e) { /* do nothing */ }

  if (!(href.startsWith('/') || href.startsWith(PAGE_URL.origin))
    || url.pathname?.endsWith('/')
    || href === PAGE_URL.origin
    || HAS_EXTENSION.test(href.split('/').pop())
    || htmlExclude?.some((excludeRe) => excludeRe.test(href))) {
    return;
  }

  const relativeAutoBlocks = autoBlocks
    .map((b) => Object.values(b)[0])
    .filter((b) => b.startsWith('/'));
  const isAutoblockLink = relativeAutoBlocks.some((block) => href.includes(block));
  if (isAutoblockLink) return;

  try {
    const linkUrl = new URL(href.startsWith('http') ? href : `${PAGE_URL.origin}${href}`);
    if (linkUrl.pathname && !linkUrl.pathname.endsWith('.html')) {
      linkUrl.pathname = `${linkUrl.pathname}.html`;
      link.setAttribute('href', href.startsWith('/')
        ? `${linkUrl.pathname}${linkUrl.search}${linkUrl.hash}`
        : linkUrl.href);
    }
  } catch (e) {
    window.lana?.log(`Error while attempting to append '.html' to ${link}: ${e}`, {
      tags: 'utils',
      severity: 'error',
    });
  }
}

export const loadScript = (url, type, { mode, id } = {}) => new Promise((resolve, reject) => {
  let script = document.querySelector(`head > script[src="${url}"]`);
  if (!script) {
    const { head } = document;
    script = document.createElement('script');
    script.setAttribute('src', url);
    if (id) script.setAttribute('id', id);
    if (type) {
      script.setAttribute('type', type);
    }
    if (['async', 'defer'].includes(mode)) script.setAttribute(mode, true);
    head.append(script);
  }

  if (script.dataset.loaded) {
    resolve(script);
    return;
  }

  const onScript = (event) => {
    script.removeEventListener('load', onScript);
    script.removeEventListener('error', onScript);

    if (event.type === 'error') {
      reject(new Error(`error loading script: ${script.src}`));
    } else if (event.type === 'load') {
      script.dataset.loaded = true;
      resolve(script);
    }
  };

  script.addEventListener('load', onScript);
  script.addEventListener('error', onScript);
});

export async function loadTemplate() {
  const template = getMetadata('template');
  if (!template) return;
  const name = template.toLowerCase().replace(/[^0-9a-z]/gi, '-');
  document.body.classList.add(name);
  const { miloLibs, codeRoot } = getConfig();
  const base = miloLibs && MILO_TEMPLATES.includes(name) ? miloLibs : codeRoot;
  const styleLoaded = new Promise((resolve) => {
    loadStyle(`${base}/templates/${name}/${name}.css`, resolve);
  });
  const scriptLoaded = new Promise((resolve) => {
    (async () => {
      try {
        await import(`${base}/templates/${name}/${name}.js`);
      } catch (err) {
        console.log(`failed to load module for ${name}`, err);
      }
      resolve();
    })();
  });
  await Promise.all([styleLoaded, scriptLoaded]);
}

function getBlockData(block) {
  const name = block.classList[0];
  const { miloLibs, codeRoot, mep, externalLibs } = getConfig();
  const isC2Page = getMetadata('foundation') === 'c2';
  const isC1Block = C1_BLOCKS.includes(name);
  const isC2Block = C2_BLOCKS.includes(name);
  const isAutoBlock = AUTO_BLOCKS.some((autoBlock) => autoBlock[name]);

  const PAGE_AGNOSTIC_BLOCKS = ['preflight'];
  const isPageAgnostic = PAGE_AGNOSTIC_BLOCKS.includes(name);
  if (isC2Page && isC1Block && !isC2Block && !isAutoBlock && !isPageAgnostic) {
    return { name, isInvalid: true };
  }

  let base = codeRoot;
  if (externalLibs) {
    try {
      const list = Array.isArray(externalLibs) ? externalLibs : [externalLibs];
      const match = list.find((lib) => {
        if (!lib || typeof lib !== 'object') return false;
        if (!Array.isArray(lib.blocks)) return false;
        if (!lib.base || typeof lib.base !== 'string') return false;

        return lib.blocks.includes(name);
      });
      if (match?.base) base = match.base;
    } catch (error) {
      window.lana?.log(`Invalid externalLibs configuration: ${error.message || error}`, {
        tags: 'utils',
        severity: 'error',
      });
    }
  }

  if (miloLibs && isC1Block && (!isC2Page || isAutoBlock || isPageAgnostic)) base = miloLibs;
  if (isC2Page && isC2Block) base = `${miloLibs ?? base}/c2`;

  let path = `${base}/blocks/${name}`;
  if (mep?.blocks?.[name]) path = mep.blocks[name];
  const blockPath = `${path}/${name}`;
  const hasStyles = AUTO_BLOCKS.find((ab) => Object.keys(ab).includes(name))?.styles ?? true;

  return { blockPath, name, hasStyles };
}

export async function loadBlock(block) {
  if (block.classList.contains('hide-block')) {
    block.remove();
    return null;
  }
  const { name, blockPath, hasStyles, isInvalid } = getBlockData(block);
  if (isInvalid) {
    block.dataset.failed = 'true';
    block.dataset.reason = `${name} is a C1 block and cannot be used on C2 pages`;
    return block;
  }
  const styleLoaded = hasStyles && new Promise((resolve) => {
    loadStyle(`${blockPath}.css`, resolve);
  });
  const scriptLoaded = new Promise((resolve) => {
    (async () => {
      try {
        const { default: init } = await import(`${blockPath}.js`);
        await init(block);
        block.dataset.blockStatus = 'loaded';
      } catch (err) {
        console.log(`Failed loading ${name}`, err);
        const config = getConfig();
        if (config.env.name !== 'prod') {
          const { showError } = await import('../blocks/fallback/fallback.js');
          showError(block, name);
        }
      }
      resolve();
    })();
  });

  await Promise.all([styleLoaded, scriptLoaded]);
  return block;
}

export function decorateSVG(a) {
  const { textContent, href } = a;
  if (!(textContent.includes('.svg') || href.includes('.svg'))) return a;
  try {
    // Mine for URL and alt text
    const splitText = textContent.split('|');
    const authoredUrl = new URL(splitText.shift().trim());
    const altText = splitText.join('|').trim();

    // Relative link checking
    const hrefUrl = a.href.startsWith('/')
      ? new URL(`${window.location.origin}${a.href}`)
      : new URL(a.href);

    const src = (authoredUrl.hostname.includes('.hlx.') || authoredUrl.hostname.includes('.aem.'))
      ? authoredUrl.pathname
      : authoredUrl;

    const img = createTag('img', { loading: 'lazy', src, alt: altText || '' });
    const pic = createTag('picture', null, img);

    if (altText) {
      const parentHeading = a.parentElement.closest('h1, h2, h3, h4, h5, h6');
      parentHeading?.appendChild(createTag('span', { class: 'hidden' }, altText));
    }

    if (authoredUrl.pathname === hrefUrl.pathname) {
      a.parentElement.replaceChild(pic, a);
      return pic;
    }
    a.textContent = '';
    a.append(pic);
    return a;
  } catch (e) {
    console.log('Failed to create SVG.', e.message);
    return a;
  }
}

export const isValidHtmlUrl = (url) => {
  const regex = /^https:\/\/[^\s]+$/;
  return regex.test(url);
};

export function decorateImageLinks(el) {
  const images = el.querySelectorAll('img[alt*="|"]');
  if (!images.length) return;
  [...images].forEach((img) => {
    const [source, alt, icon] = img.alt.split('|');
    try {
      if (!isValidHtmlUrl(source.trim())) return;
      const url = new URL(source.trim());
      const href = (url.hostname.includes('.aem.') || url.hostname.includes('.hlx.')) ? `${url.pathname}${url.search}${url.hash}` : url.href;
      img.alt = alt?.trim() || '';
      const pic = img.closest('picture');
      const picParent = pic.parentElement;
      if (href.includes('.mp4')) {
        const a = createTag('a', { href: url, 'data-video-poster': pic.outerHTML });
        a.innerHTML = url;
        pic.replaceWith(a);
      } else {
        const aTag = createTag('a', { href, class: 'image-link' });
        picParent.insertBefore(aTag, pic);
        if (icon) {
          import('./image-video-link.js').then((mod) => mod.default(picParent, aTag, icon));
        } else {
          aTag.append(pic);
        }
      }
    } catch (e) {
      console.log('Error:', `${e.message} '${source.trim()}'`);
    }
  });
}

export function isTrustedAutoBlock(autoBlock, url) {
  if (!url.href.includes(autoBlock)) return false;
  const urlHostname = url.hostname.replace('www.', '');
  const locationHostname = window.location.hostname.replace('www.', '');
  return urlHostname === locationHostname
    || urlHostname.endsWith('.adobe.com')
    || urlHostname === 'adobe.com'
    || urlHostname === autoBlock
    || !!urlHostname.match(/\.(hlx|aem)\.(page|live)$/)
    || (autoBlock === '.pdf' && url.pathname.endsWith(autoBlock));
}

export function decorateAutoBlock(a) {
  const config = getConfig();
  let url;
  try {
    url = new URL(a.href);
  } catch (e) {
    window.lana?.log(`Cannot make URL from decorateAutoBlock - ${a?.href}: ${e.toString()}`, {
      tags: 'utils',
      severity: 'error',
    });
    return false;
  }

  return config.autoBlocks.find((candidate) => {
    const key = Object.keys(candidate)[0];
    if (!isTrustedAutoBlock(candidate[key], url)) return false;

    if (key === 'pdf-viewer' && !a.textContent.includes('.pdf')) {
      a.target = '_blank';
      return false;
    }

    const hasExtension = a.href.split('/').pop().includes('.');
    const mp4Match = a.textContent.match('media_.*.mp4');
    if (key === 'fragment' && (!hasExtension || mp4Match)) {
      if (a.href === window.location.href) {
        return false;
      }

      if (a.dataset.mepLingoSectionSwap || a.dataset.mepLingoBlockSwap) {
        a.dataset.mepLingo = 'true';
        a.className = `${key} link-block`;
        return true;
      }

      const isInlineFrag = url.hash.includes('#_inline');
      if (url.hash === '' || isInlineFrag) {
        const { parentElement } = a;
        const { nodeName, innerHTML } = parentElement;
        const noText = innerHTML === a.outerHTML;
        if (noText && nodeName === 'P') {
          const div = createTag('div', null, a);
          parentElement.parentElement.replaceChild(div, parentElement);
        }
      }

      // previewing a fragment page with mp4 video
      if (mp4Match) {
        a.className = 'video link-block';
        return false;
      }

      // Modals (exclude special fragment hashes)
      if (url.hash !== '' && !isInlineFrag && !url.hash.includes('#_replacecell')) {
        a.dataset.modalPath = url.pathname;
        a.dataset.modalHash = url.hash;
        a.href = url.hash;
        a.className = `modal link-block ${[...a.classList].join(' ')}`;
        return true;
      }
    }

    // slack uploaded mp4s
    if (key === 'video' && !a.textContent.match('media_.*.mp4')) {
      return false;
    }

    a.className = `${key} link-block`;
    return true;
  });
}

const decorateCopyLink = (a, evt) => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|iphone|mobile/.test(userAgent) && !/ipad/.test(userAgent);
  if (!isMobile || !navigator.share) {
    a.remove();
    return;
  }
  const link = a.href.replace(evt, '');
  const isConButton = ['EM', 'STRONG'].includes(a.parentElement.nodeName)
    || a.classList.contains('con-button');
  if (!isConButton) a.classList.add('static', 'copy-link');
  a.href = '';
  a.addEventListener('click', async (e) => {
    e.preventDefault();
    if (navigator.share) await navigator.share({ title: link, url: link });
  });
};

export function convertStageLinks({ anchors, config, hostname, href }) {
  const { env, stageDomainsMap, locale } = config;
  if (env?.name === 'prod' || !stageDomainsMap) return;
  const matchedRules = Object.entries(stageDomainsMap)
    .find(([domain]) => (new RegExp(domain)).test(href));
  if (!matchedRules) return;
  const [, domainsMap] = matchedRules;
  [...anchors].forEach((a) => {
    const hasLocalePrefix = a.pathname.startsWith(`${locale.prefix}/`);
    const noLocaleLink = hasLocalePrefix ? a.href.replace(`/${locale.prefix.replace(/^\//, '')}/`, '/') : a.href;
    const matchedDomain = Object.keys(domainsMap)
      .find((domain) => (new RegExp(domain)).test(noLocaleLink));
    if (!matchedDomain) return;
    const convertedLink = noLocaleLink.replace(
      new RegExp(matchedDomain),
      domainsMap[matchedDomain] === 'origin'
        ? `${matchedDomain.includes('https') ? 'https://' : ''}${hostname}`
        : domainsMap[matchedDomain],
    );
    const convertedUrl = new URL(convertedLink);
    convertedUrl.pathname = `${hasLocalePrefix ? locale.prefix : ''}${convertedUrl.pathname}`;
    a.href = convertedUrl.toString();
    if (/(\.page|\.live).*\.html(?=[?#]|$)/.test(a.href)) a.href = a.href.replace(/\.html(?=[?#]|$)/, '');
  });
}

function decorateLinkElement(a, config, hasDnt) {
  if (hasDnt) a.dataset.hasDnt = true;
  if (a.href.includes('http:')) a.setAttribute('data-http-link', 'true');
  decorateSVG(a);
  if (a.href.includes('#_blank')) {
    a.setAttribute('target', '_blank');
    a.href = a.href.replace('#_blank', '');
  }
  if (a.href.includes('#_alloy')) {
    import('../martech/alloy-links.js').then(({ default: processAlloyLink }) => {
      processAlloyLink(a);
    });
  }
  if (a.href.includes('#_nofollow')) {
    a.setAttribute('rel', 'nofollow');
    a.href = a.href.replace('#_nofollow', '');
  }
  if (a.href.includes('#_nohtml')) {
    a.href = a.href.replace('#_nohtml', '');
  }
  // Custom action links
  const loginEvent = '#_evt-login';
  if (a.href.includes(loginEvent)) {
    a.href = a.href.replace(loginEvent, '');
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const { signInContext } = config;
      window.adobeIMS?.signIn(signInContext);
    });
  }
  const copyEvent = '#_evt-copy';
  if (a.href.includes(copyEvent)) {
    decorateCopyLink(a, copyEvent);
  }
  const branchQuickLink = 'app.link';
  if (a.href.includes(branchQuickLink)) {
    (async () => {
      const { default: processQuickLink } = await import('../features/branch-quick-links/branch-quick-links.js');
      processQuickLink(a);
    })();
  }
  // Append aria-label
  const pipeRegex = /\s?\|([^|]*)$/;
  if (pipeRegex.test(a.textContent) && !/\.[a-z]+/i.test(a.textContent)) {
    const node = [...a.childNodes].reverse()[0];
    const ariaLabel = node.textContent.match(pipeRegex)?.[1];
    node.textContent = node.textContent.replace(pipeRegex, '');
    a.setAttribute('aria-label', (ariaLabel || '').trim());
  }
}

function processLinkDecoration(a, config, hasDnt) {
  decorateLinkElement(a, config, hasDnt);
  if (a.href.includes('#_dnb')) {
    a.href = a.href.replace('#_dnb', '');
    return null;
  }
  const autoBlock = decorateAutoBlock(a);
  return autoBlock ? a : null;
}

function setupLinksDecoration(el) {
  const config = getConfig();
  decorateImageLinks(el);
  const anchors = el.getElementsByTagName('a');
  const { hostname, href } = window.location;
  return { config, anchors, hostname, href };
}

const decoratedLinks = new WeakSet();

export async function decorateLinksAsync(el) {
  const { config, anchors, hostname, href } = setupLinksDecoration(el);

  const linksPromises = [...anchors].map(async (a) => {
    if (decoratedLinks.has(a)) {
      return a.classList.contains('link-block') ? a : null;
    }
    if (a.href.startsWith('https://#')) a.href = a.href.replace('https://', '');
    appendHtmlToLink(a);
    const hasDnt = a.href.includes('#_dnt');
    if (!a.dataset.hasDnt) {
      a.href = await localizeLinkAsync(
        a.href,
        window.location.hostname,
        false,
        a,
      );
    }
    decoratedLinks.add(a);
    return processLinkDecoration(a, config, hasDnt);
  });

  const links = (await Promise.all(linksPromises)).filter(Boolean);
  convertStageLinks({ anchors, config, hostname, href });
  return links;
}

// this method is deprecated - use decorateLinksAsync instead
export function decorateLinks(el) {
  const { config, anchors, hostname, href } = setupLinksDecoration(el);

  const links = [...anchors].reduce((rdx, a) => {
    if (a.href.startsWith('https://#')) a.href = a.href.replace('https://', '');
    appendHtmlToLink(a);
    const hasDnt = a.href.includes('#_dnt');
    if (!a.dataset?.hasDnt) a.href = localizeLink(a.href);
    const result = processLinkDecoration(a, config, hasDnt);
    if (result) rdx.push(result);
    return rdx;
  }, []);

  convertStageLinks({ anchors, config, hostname, href });
  return links;
}

function decorateContent(el) {
  const children = [el];
  let child = el;
  while (child) {
    child = child.nextElementSibling;
    if (child && child.nodeName !== 'DIV') {
      children.push(child);
    } else {
      break;
    }
  }
  const block = document.createElement('div');
  block.className = 'content';
  block.append(...children);
  block.dataset.block = '';
  return block;
}

function decorateDefaults(el) {
  const firstChild = ':scope > *:not(div):first-child';
  const afterBlock = ':scope > div + *:not(div)';
  const children = el.querySelectorAll(`${firstChild}, ${afterBlock}`);
  children.forEach((child) => {
    const prev = child.previousElementSibling;
    const content = decorateContent(child);
    if (prev) {
      prev.insertAdjacentElement('afterend', content);
    } else {
      el.insertAdjacentElement('afterbegin', content);
    }
  });
}

export async function getGnavSource() {
  const { locale, dynamicNavKey } = getConfig();
  let url = getMetadata('gnav-source') || `${locale?.contentRoot ?? window.location.origin}/gnav`;
  if (dynamicNavKey) {
    const { default: dynamicNav } = await import('../features/dynamic-navigation/dynamic-navigation.js');
    url = dynamicNav(url, dynamicNavKey);
  }
  return url;
}

export function isLocalNav() {
  const { locale = {} } = getConfig();
  const gnavSource = getMetadata('gnav-source') || `${locale?.contentRoot ?? window.location.origin}/gnav`;
  let newNavEnabled = new URLSearchParams(window.location.search).get('newNav');
  newNavEnabled = newNavEnabled ? newNavEnabled !== 'false' : getMetadata('mobile-gnav-v2') !== 'off';
  return gnavSource.split('/').pop().startsWith('localnav-') && newNavEnabled;
}

async function decorateHeader() {
  const breadcrumbs = document.querySelector('.breadcrumbs');
  breadcrumbs?.remove();
  const header = document.querySelector('header');
  if (!header) return;
  const headerMeta = getMetadata('header');
  if (headerMeta === 'off') {
    document.body.classList.add('nav-off');
    header.remove();
    return;
  }
  header.className = headerMeta || 'global-navigation';
  const metadataConfig = getMetadata('breadcrumbs')?.toLowerCase()
    || getConfig().breadcrumbs;
  if (metadataConfig === 'off') return;
  const baseBreadcrumbs = getMetadata('breadcrumbs-base')?.length;

  const autoBreadcrumbs = getMetadata('breadcrumbs-from-url') === 'on';
  const dynamicNavActive = getMetadata('dynamic-nav') === 'on'
    && window.sessionStorage.getItem('gnavSource') !== null;
  if (!dynamicNavActive && (baseBreadcrumbs || breadcrumbs || autoBreadcrumbs)) header.classList.add('has-breadcrumbs');
  if (isLocalNav()) {
    // Preserving space to avoid CLS issue
    const localNavWrapper = createTag('div', { class: 'feds-localnav' });
    header.after(localNavWrapper);
  }
  if (breadcrumbs) header.append(breadcrumbs);
  const promo = getMetadata('gnav-promo-source');
  if (promo?.length) {
    const fedsPromoWrapper = createTag('div', { class: 'feds-promo-aside-wrapper' });
    header.before(fedsPromoWrapper);
    header.classList.add('has-promo');
  }
}

async function decorateIcons(area, config) {
  let icons = area.querySelectorAll('span.icon');
  if (icons.length === 0) return;
  const { base, iconsExcludeBlocks } = config;
  if (iconsExcludeBlocks) {
    if (['doodlebug', 'max25'].includes(getMetadata('theme'))) {
      // TODO: Remove after correcting core logic
      const includeIcons = [...icons].filter((icon) => !iconsExcludeBlocks.some((block) => icon.closest(`div.${block}`)));
      if (!includeIcons.length) return;
      icons = includeIcons;
    } else {
      const excludedIconsCount = [...icons].filter((icon) => iconsExcludeBlocks.some((block) => icon.closest(`div.${block}`))).length;
      if (excludedIconsCount === icons.length) return;
    }
  }
  loadStyle(`${base}/features/icons/icons.css`);
  const { default: loadIcons } = await import('../features/icons/icons.js');
  await loadIcons(icons, config);
}

export async function customFetch({ resource, withCacheRules }) {
  const options = {};
  if (withCacheRules) {
    const params = new URLSearchParams(window.location.search);
    options.cache = params.get('cache') === 'off' ? 'reload' : 'default';
  }
  return fetch(resource, options);
}

const findReplaceableNodes = (area) => {
  const regex = /{{(.*?)}}|%7B%7B(.*?)%7D%7D/g;
  const walker = document.createTreeWalker(area, NodeFilter.SHOW_ALL);
  const nodes = [];
  let node = walker.nextNode();
  while (node !== null) {
    let matchFound = false;
    if (node.nodeType === Node.TEXT_NODE) {
      matchFound = regex.test(node.nodeValue);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const { attributes } = node;
      for (let i = 0; i < attributes.length; i += 1) {
        const { value: attrValue } = attributes[i];
        if (regex.test(attrValue)) {
          matchFound = true;
        }
      }
    }
    if (matchFound) {
      nodes.push(node);
      regex.lastIndex = 0;
    }
    node = walker.nextNode();
  }
  return nodes;
};

export function getPlaceholderPaths(config) {
  const root = `${config.locale?.contentRoot}/placeholders`;
  const paths = [`${root}.json`];
  if (config.env.name !== 'prod'
    && getMetadata('placeholders-stage') === 'on') paths.push(`${root}-stage.json`);
  return paths;
}

let placeholderRequest;
export async function decoratePlaceholders(area, config) {
  if (!area) return;
  const nodes = findReplaceableNodes(area);
  if (!nodes.length) return;
  area.dataset.hasPlaceholders = 'true';
  const phPaths = getPlaceholderPaths(config);
  placeholderRequest ||= Promise.all(
    phPaths.map((path) => customFetch({ resource: path, withCacheRules: true })),
  ).catch(() => ({}));
  const { decoratePlaceholderArea } = await import('../features/placeholders.js');
  await decoratePlaceholderArea({
    placeholderPath: phPaths[0],
    placeholderRequest,
    nodes,
  });
}

async function loadFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  const footerMeta = getMetadata('footer');
  if (footerMeta === 'off') {
    footer.remove();
    return;
  }
  footer.className = footerMeta || 'global-footer';
  await loadBlock(footer);
}

export function filterDuplicatedLinkBlocks(blocks) {
  if (!blocks?.length) return [];
  const uniqueModalKeys = new Set();
  const uniqueBlocks = [];
  for (const obj of blocks) {
    if (obj.className.includes('modal')) {
      const key = `${obj.dataset.modalHash}-${obj.dataset.modalPath}`;
      if (!uniqueModalKeys.has(key)) {
        uniqueModalKeys.add(key);
        uniqueBlocks.push(obj);
      }
    } else {
      uniqueBlocks.push(obj);
    }
  }
  return uniqueBlocks;
}

async function decorateSection(section, idx) {
  section.dataset.status = 'pending';
  section.dataset.idx = idx;
  let links = await decorateLinksAsync(section);
  decorateDefaults(section);
  const blocks = section.querySelectorAll(':scope > div[class]:not(.content)');

  const { doNotInline } = getConfig();
  const blockLinks = [...blocks].reduce((blkLinks, block) => {
    const blockName = block.classList[0];
    const blocksList = getMetadata('foundation') === 'c2' ? C2_BLOCKS : C1_BLOCKS;
    links.filter((link) => block.contains(link))
      .forEach((link) => {
        if (link.classList.contains('fragment') && link.href.includes('#_replacecell')) {
          link.href = link.href.replace('#_replacecell', '');
        } else if (link.classList.contains('fragment')
          && blocksList.includes(blockName) // do not inline consumer blocks (for now)
          && !doNotInline.includes(blockName)
          && link.dataset.mepLingo !== 'true') {
          if (!link.href.includes('#_inline')) {
            link.href = `${link.href}#_inline`;
          }
          blkLinks.inlineFrags.push(link);
        } else if (link.classList.contains('link-block')) {
          blkLinks.autoBlocks.push(link);
        }
      });
    return blkLinks;
  }, 