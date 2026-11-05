export type Category = 'bancos' | 'gobierno' | 'servicios' | 'educacion' | 'noticias' | 'apps';

export interface Service {
  slug: string;
  name: string;
  url: string;
  category: Category;
  /** Nombre completo, si el corto es una sigla. */
  full?: string;
}

export const CATEGORIES: Record<Category, string> = {
  bancos: 'Bancos',
  gobierno: 'Gobierno',
  servicios: 'Telefonía y luz',
  educacion: 'Universidades',
  noticias: 'Noticias',
  apps: 'Apps y redes sociales',
};

export const SERVICES: Service[] = [
  // Bancos
  { slug: 'banrural', name: 'Banrural', url: 'https://www.banrural.com.gt', category: 'bancos' },
  { slug: 'banco-industrial', name: 'Banco Industrial', url: 'https://www.corporacionbi.com', category: 'bancos' },
  { slug: 'bam', name: 'BAM', url: 'https://www.bam.com.gt', category: 'bancos', full: 'Banco Agromercantil' },
  { slug: 'gyt-continental', name: 'G&T Continental', url: 'https://www.gyt.com.gt', category: 'bancos' },
  { slug: 'cuscatlan', name: 'Banco Cuscatlán', url: 'https://www.bancocuscatlan.com.gt', category: 'bancos' },
  { slug: 'promerica', name: 'Banco Promerica', url: 'https://www.bancopromerica.com.gt', category: 'bancos' },
  { slug: 'banco-azteca', name: 'Banco Azteca', url: 'https://www.bancoazteca.com.gt', category: 'bancos' },
  { slug: 'interbanco', name: 'Interbanco', url: 'https://www.interbanco.com.gt', category: 'bancos' },
  { slug: 'banguat', name: 'Banguat', url: 'https://www.banguat.gob.gt', category: 'bancos', full: 'Banco de Guatemala' },

  // Gobierno
  { slug: 'sat', name: 'SAT', url: 'https://portal.sat.gob.gt', category: 'gobierno', full: 'Superintendencia de Administración Tributaria' },
  { slug: 'igss', name: 'IGSS', url: 'https://www.igssgt.org', category: 'gobierno', full: 'Instituto Guatemalteco de Seguridad Social' },
  { slug: 'renap', name: 'RENAP', url: 'https://www.renap.gob.gt', category: 'gobierno', full: 'Registro Nacional de las Personas' },
  { slug: 'tse', name: 'TSE', url: 'https://www.tse.org.gt', category: 'gobierno', full: 'Tribunal Supremo Electoral' },
  { slug: 'ministerio-publico', name: 'Ministerio Público', url: 'https://www.mp.gob.gt', category: 'gobierno' },
  { slug: 'organismo-judicial', name: 'Organismo Judicial', url: 'https://www.oj.gob.gt', category: 'gobierno' },
  { slug: 'mineduc', name: 'MINEDUC', url: 'https://www.mineduc.gob.gt', category: 'gobierno', full: 'Ministerio de Educación' },
  { slug: 'mspas', name: 'MSPAS', url: 'https://www.mspas.gob.gt', category: 'gobierno', full: 'Ministerio de Salud Pública' },
  { slug: 'mintrab', name: 'Ministerio de Trabajo', url: 'https://www.mintrabajo.gob.gt', category: 'gobierno' },
  { slug: 'guatecompras', name: 'Guatecompras', url: 'https://www.guatecompras.gt', category: 'gobierno' },
  { slug: 'muni-guatemala', name: 'Municipalidad de Guatemala', url: 'https://www.muniguate.com', category: 'gobierno' },
  { slug: 'provial', name: 'PROVIAL', url: 'https://www.provial.gob.gt', category: 'gobierno' },

  // Telefonía y luz
  { slug: 'tigo', name: 'Tigo', url: 'https://www.tigo.com.gt', category: 'servicios' },
  { slug: 'claro', name: 'Claro', url: 'https://www.claro.com.gt', category: 'servicios' },
  { slug: 'eegsa', name: 'EEGSA', url: 'https://www.eegsa.com', category: 'servicios', full: 'Empresa Eléctrica de Guatemala' },
  { slug: 'energuate', name: 'Energuate', url: 'https://www.energuate.com', category: 'servicios' },

  // Universidades
  { slug: 'usac', name: 'USAC', url: 'https://www.usac.edu.gt', category: 'educacion', full: 'Universidad de San Carlos' },
  { slug: 'umg', name: 'Universidad Mariano Gálvez', url: 'https://www.umg.edu.gt', category: 'educacion' },
  { slug: 'uvg', name: 'Universidad del Valle', url: 'https://www.uvg.edu.gt', category: 'educacion' },

  // Noticias
  { slug: 'prensa-libre', name: 'Prensa Libre', url: 'https://www.prensalibre.com', category: 'noticias' },
  { slug: 'soy502', name: 'Soy502', url: 'https://www.soy502.com', category: 'noticias' },

  // Apps y redes sociales
  { slug: 'whatsapp', name: 'WhatsApp Web', url: 'https://web.whatsapp.com', category: 'apps' },
  { slug: 'facebook', name: 'Facebook', url: 'https://www.facebook.com', category: 'apps' },
  { slug: 'instagram', name: 'Instagram', url: 'https://www.instagram.com', category: 'apps' },
  { slug: 'youtube', name: 'YouTube', url: 'https://www.youtube.com', category: 'apps' },
  { slug: 'gmail', name: 'Gmail', url: 'https://mail.google.com', category: 'apps' },
  { slug: 'tiktok', name: 'TikTok', url: 'https://www.tiktok.com', category: 'apps' },
  { slug: 'x-twitter', name: 'X (Twitter)', url: 'https://x.com', category: 'apps' },
  { slug: 'chatgpt', name: 'ChatGPT', url: 'https://chatgpt.com', category: 'apps' },
  { slug: 'claude', name: 'Claude', url: 'https://claude.ai', category: 'apps' },
  { slug: 'google', name: 'Google', url: 'https://www.google.com', category: 'apps' },
  { slug: 'outlook', name: 'Outlook', url: 'https://outlook.live.com', category: 'apps' },
  { slug: 'netflix', name: 'Netflix', url: 'https://www.netflix.com', category: 'apps' },
  { slug: 'spotify', name: 'Spotify', url: 'https://www.spotify.com', category: 'apps' },
  { slug: 'discord', name: 'Discord', url: 'https://discord.com', category: 'apps' },
  { slug: 'roblox', name: 'Roblox', url: 'https://www.roblox.com', category: 'apps' },
  { slug: 'paypal', name: 'PayPal', url: 'https://www.paypal.com', category: 'apps' },
  { slug: 'amazon', name: 'Amazon', url: 'https://www.amazon.com', category: 'apps' },
  { slug: 'temu', name: 'Temu', url: 'https://www.temu.com', category: 'apps' },
];

const BY_SLUG = new Map(SERVICES.map((s) => [s.slug, s]));
export const bySlug = (slug: string) => BY_SLUG.get(slug);
export const hostOf = (s: Service) => new URL(s.url).hostname;

/** Cuántos grupos rotan en el cron de cada minuto: cada servicio se revisa cada SHARDS minutos. */
export const SHARDS = 5;
export const shardOf = (minute: number) => SERVICES.filter((_, i) => i % SHARDS === minute % SHARDS);
