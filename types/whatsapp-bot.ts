/**
 * Types for WhatsApp Bot application
 */

export type BotStatus =
  | 'created'
  | 'connecting'
  | 'waiting_qr'
  | 'connected'
  | 'disconnected'
  | 'logged_out'
  | 'error';

export type BotType = 'invoice' | 'support' | 'appointment' | 'custom';

export const BOT_TYPE_LABELS: Record<BotType, string> = {
  invoice: '📄 Facturation',
  support: '💬 Support Client',
  appointment: '📅 Prise de RDV',
  custom: '⚙️ Personnalisé',
};

export interface WhatsAppBot {
  id: string;
  name: string;
  status: BotStatus;
  enabled: boolean;
  phoneNumber?: string;
  hasQR: boolean;
  botType?: BotType;
}

export interface BotConfig {
  id: string;
  name: string;
  botType?: BotType;
  status: BotStatus;
  enabled: boolean;
  autoStart: boolean;
  language?: string;
  welcomeMessage?: string;
  createdAt: string;
  settings: BotSettings;
}

export interface BotSettings {
  groqApiKey?: string;
  companyName?: string;
  companyEmail?: string;
  invoicePrefix?: string;
  emailUser?: string;
  emailPassword?: string;
  emailRecipients?: string[];
  confirmationRecipients?: string[];
}

export interface BotPrompt {
  system: string;
  botType?: BotType;
  language?: string;
  createdAt: string;
  lastUpdated?: string;
}

export interface BotKnowledge {
  entries: KnowledgeEntry[];
  lastUpdated: string | null;
}

export interface KnowledgeEntry {
  id: string;
  question?: string;
  answer?: string;
  content?: string;
  category?: string;
  createdAt: string;
}

export interface BotEmails {
  invoice: EmailTemplate;
  confirmation: EmailTemplate;
}

export interface EmailTemplate {
  subject: string;
  html: string;
}

export interface BotFullConfig {
  config: BotConfig;
  prompt: BotPrompt;
  knowledge: BotKnowledge;
  emails: BotEmails;
  status?: {
    id: string;
    name: string;
    status: BotStatus;
    enabled: boolean;
    phoneNumber?: string;
    hasQR: boolean;
  };
}

export interface CreateBotOptions {
  botType?: BotType;
  customPrompt?: string;
  knowledge?: Array<{ question: string; answer: string; category?: string } | string>;
  welcomeMessage?: string;
  language?: string;
}

export interface CreateBotRequest {
  name: string;
  settings?: Partial<BotSettings>;
  options?: CreateBotOptions;
}

export interface EnableBotRequest {
  enabled: boolean;
}

export interface UpdateBotRequest {
  config?: Partial<BotConfig>;
  prompt?: BotPrompt;
  knowledge?: BotKnowledge;
  emails?: BotEmails;
}

