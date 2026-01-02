/**
 * Public Chat API for Embedded Widgets
 * This endpoint handles chat messages from embedded widgets
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Call Groq API directly via fetch
 */
async function callGroqAPI(messages: { role: string; content: string }[]) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages,
            temperature: 0.7,
            max_tokens: 500
        })
    });

    if (!response.ok) {
        throw new Error(`Groq API error: ${response.status}`);
    }

    return response.json();
}

/**
 * POST /api/chat/embed - Handle chat message
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { widgetApiKey, sessionId, message, conversationHistory = [] } = body;

        if (!widgetApiKey || !message) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        // Fetch widget by API key
        const { data: widget, error: widgetError } = await supabase
            .from('chatbot_widgets')
            .select('*')
            .eq('api_key', widgetApiKey)
            .eq('is_active', true)
            .single();

        if (widgetError || !widget) {
            return NextResponse.json({ error: 'Widget non trouvé ou inactif' }, { status: 404 });
        }

        // Build messages array for the AI
        const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
            {
                role: 'system',
                content: widget.system_prompt || `Tu es un assistant IA pour ${widget.company_name || 'notre entreprise'}. Réponds de manière professionnelle et helpful.`
            }
        ];

        // Add conversation history
        conversationHistory.forEach((msg: { role: 'user' | 'assistant'; content: string }) => {
            messages.push(msg);
        });

        // Add current message
        messages.push({ role: 'user', content: message });

        // Check if we should suggest appointment (after 2+ user messages for 'accueil' preset)
        const userMessageCount = messages.filter(m => m.role === 'user').length;
        let shouldSuggestAppointment = false;

        if (widget.function_preset === 'accueil' && userMessageCount >= 3) {
            // Check if appointment not already suggested in this conversation
            const hasAppointmentMention = conversationHistory.some(
                (msg: { content: string }) => msg.content.toLowerCase().includes('rendez-vous')
            );
            if (!hasAppointmentMention) {
                shouldSuggestAppointment = true;
            }
        }

        // Call Groq API
        const completion = await callGroqAPI(messages);
        const assistantMessage = completion.choices?.[0]?.message?.content || "Désolé, je n'ai pas pu générer de réponse.";

        // Save or update conversation in database
        const currentSessionId = sessionId || `session_${Date.now()}`;

        // Check if conversation exists
        const { data: existingConvo } = await supabase
            .from('chatbot_conversations')
            .select('id, messages')
            .eq('widget_id', widget.id)
            .eq('session_id', currentSessionId)
            .single();

        const newMessages = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: assistantMessage }
        ];

        if (existingConvo) {
            await supabase
                .from('chatbot_conversations')
                .update({
                    messages: newMessages,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existingConvo.id);
        } else {
            await supabase
                .from('chatbot_conversations')
                .insert({
                    widget_id: widget.id,
                    session_id: currentSessionId,
                    messages: newMessages
                });
        }

        return NextResponse.json({
            message: assistantMessage,
            sessionId: currentSessionId,
            shouldSuggestAppointment
        });

    } catch (error) {
        console.error('Chat error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

/**
 * OPTIONS for CORS
 */
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        }
    });
}
