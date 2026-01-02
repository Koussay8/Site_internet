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

export interface WhatsAppBot {
  id: string;
  name: string;
  status: BotStatus;
  enabled: boolean;
  phoneNumber?: string;
  hasQR: boolean;
}

export interface BotConfig {
  id: string;
  name: string;
  status: BotStatus;
  enabled: boolean;
  autoStart: boolean;
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
  createdAt: string;
}

export interface BotKnowledge {
  entries: KnowledgeEntry[];
  lastUpdated: string | null;
}

export interface KnowledgeEntry {
  id: string;
  content: string;
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

export interface CreateBotRequest {
  name: string;
  settings?: Partial<BotSettings>;
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
