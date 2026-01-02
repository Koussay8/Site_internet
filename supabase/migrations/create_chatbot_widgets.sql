-- Chatbot Widgets Table
-- Execute this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS chatbot_widgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    company_name TEXT,
    welcome_message TEXT DEFAULT 'Bonjour ! Comment puis-je vous aider ?',
    system_prompt TEXT,
    knowledge_base JSONB DEFAULT '[]'::jsonb,
    function_preset TEXT DEFAULT 'custom' CHECK (function_preset IN ('accueil', 'support', 'vente', 'custom')),
    settings JSONB DEFAULT '{
        "primaryColor": "#8B5CF6",
        "position": "bottom-right",
        "buttonSize": 60
    }'::jsonb,
    api_key TEXT UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
    is_active BOOLEAN DEFAULT true,
    
    -- Integration settings (optional - for RDV booking & email)
    -- Email configuration
    owner_email TEXT,                          -- Email du propriétaire pour réception des RDV
    smtp_host TEXT,                            -- Serveur SMTP (optionnel, ex: smtp.gmail.com)
    smtp_port INTEGER DEFAULT 587,
    smtp_user TEXT,
    smtp_password_encrypted BYTEA,             -- Mot de passe SMTP chiffré avec pgcrypto
    
    -- Google Calendar integration (optionnel)
    google_calendar_id TEXT,
    google_credentials_encrypted BYTEA,        -- Credentials Google chiffrés
    
    -- Google Sheets integration (optionnel)
    google_sheet_id TEXT,
    
    -- Flags for enabled integrations
    email_enabled BOOLEAN DEFAULT false,
    calendar_enabled BOOLEAN DEFAULT false,
    sheets_enabled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_widgets_user_id ON chatbot_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_widgets_api_key ON chatbot_widgets(api_key);

-- RLS Policies
ALTER TABLE chatbot_widgets ENABLE ROW LEVEL SECURITY;

-- Users can only see their own widgets
CREATE POLICY "Users can view own widgets" ON chatbot_widgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own widgets" ON chatbot_widgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own widgets" ON chatbot_widgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own widgets" ON chatbot_widgets
    FOR DELETE USING (auth.uid() = user_id);

-- Chat conversations table for tracking
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    widget_id UUID REFERENCES chatbot_widgets(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    messages JSONB DEFAULT '[]'::jsonb,
    visitor_info JSONB DEFAULT '{}'::jsonb,
    appointment_booked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_widget_id ON chatbot_conversations(widget_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_session_id ON chatbot_conversations(session_id);

-- Appointments table
CREATE TABLE IF NOT EXISTS chatbot_appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    widget_id UUID REFERENCES chatbot_widgets(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES chatbot_conversations(id),
    visitor_name TEXT,
    visitor_email TEXT,
    visitor_phone TEXT,
    appointment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chatbot_appointments_widget_id ON chatbot_appointments(widget_id);
