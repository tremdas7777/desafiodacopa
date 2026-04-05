/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Desafio da Copa"

interface PixNotificationProps {
  name?: string
  pixCode?: string
  amount?: string
  shirtColor?: string
  shirtSize?: string
}

const PixNotificationEmail = ({ name, pixCode, amount, shirtColor, shirtSize }: PixNotificationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>⏰ {name || 'Seu'} PIX expira em minutos — pague agora!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={headerEmoji}>⏰</Text>
          <Heading style={h1}>PIX PENDENTE</Heading>
        </Section>

        <Section style={content}>
          <Text style={greeting}>
            {name ? `${name}, ` : ''}seu pedido está reservado.
          </Text>

          <Text style={bold}>Pague agora ou perca sua vaga:</Text>

          <Text style={item}>🎽 Camisa Seleção 2026 {shirtColor ? `(${shirtColor})` : ''} {shirtSize ? `• ${shirtSize}` : ''}</Text>
          <Text style={item}>📖 Álbum Copa 2026</Text>
          <Text style={item}>🎟️ Sorteio: Ingressos VIP + Passagem + Hotel</Text>
          <Text style={price}>R$ {amount || '44,90'} — só o frete. Prêmios grátis.</Text>

          {pixCode && (
            <Section style={pixBox}>
              <Text style={pixLabel}>COPIE E PAGUE:</Text>
              <Text style={pixCode_style}>{pixCode}</Text>
            </Section>
          )}

          <Text style={urgency}>⚠️ Código expira em minutos. Após isso, seus prêmios vão para o próximo da fila.</Text>
        </Section>

        <Section style={footerSection}>
          <Text style={footer}>🔒 PIX seguro · 📦 SEDEX · 🏆 Sorteio oficial</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PixNotificationEmail,
  subject: (data: Record<string, any>) =>
    `⏰ ${data.name || 'Seu'} PIX expira em minutos — pague agora!`,
  displayName: 'Notificação de PIX gerado',
  previewData: {
    name: 'João',
    pixCode: '00020126580014br.gov.bcb.pix0136exemplo-pix-code',
    amount: '44,90',
    shirtColor: 'Amarela',
    shirtSize: 'G',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { maxWidth: '520px', margin: '0 auto' }
const header = { backgroundColor: '#E60000', padding: '20px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const headerEmoji = { fontSize: '32px', margin: '0 0 4px' }
const h1 = { fontSize: '20px', fontWeight: '900', color: '#fff', margin: '0', letterSpacing: '1px' }
const content = { padding: '20px 24px' }
const greeting = { fontSize: '16px', color: '#222', margin: '0 0 12px', lineHeight: '1.5' }
const bold = { fontSize: '14px', fontWeight: '700', color: '#222', margin: '0 0 8px' }
const item = { fontSize: '14px', color: '#333', margin: '0 0 2px', lineHeight: '1.7' }
const price = { fontSize: '15px', fontWeight: '700', color: '#1a7a1a', margin: '10px 0 16px', padding: '8px 12px', backgroundColor: '#f0fff0', borderRadius: '6px' }
const pixBox = { backgroundColor: '#EFF6FF', border: '2px solid #3B82F6', borderRadius: '8px', padding: '14px', margin: '0 0 16px' }
const pixLabel = { fontSize: '12px', fontWeight: '800', color: '#1E40AF', margin: '0 0 6px', letterSpacing: '0.5px' }
const pixCode_style = { fontSize: '11px', color: '#1E40AF', fontFamily: 'monospace', wordBreak: 'break-all' as const, margin: '0', lineHeight: '1.4' }
const urgency = { fontSize: '13px', fontWeight: '600', color: '#B91C1C', margin: '0', lineHeight: '1.5' }
const footerSection = { padding: '12px 24px', backgroundColor: '#F9FAFB', borderRadius: '0 0 8px 8px' }
const footer = { fontSize: '11px', color: '#888', margin: '0', textAlign: 'center' as const }
