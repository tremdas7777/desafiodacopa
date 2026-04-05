/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

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
    <Preview>🚨 {name || 'Seu'} PIX vai expirar — copie o código e pague agora!</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🚨 SEU PIX ESTÁ EXPIRANDO</Heading>
        </Section>

        <Section style={content}>
          <Text style={greeting}>{name ? `${name}, ` : ''}seus prêmios estão reservados por poucos minutos.</Text>

          <Text style={listItem}>🎽 Camisa Oficial Seleção 2026 {shirtColor ? `(${shirtColor})` : ''} {shirtSize ? `tam. ${shirtSize}` : ''}</Text>
          <Text style={listItem}>📖 Álbum Copa do Mundo 2026</Text>
          <Text style={listItem}>🎟️ 2 Ingressos VIP + Passagem + Hotel (sorteio)</Text>
          <Text style={priceTag}>Tudo GRÁTIS — você paga só R$ {amount || '44,90'} de frete</Text>

          {pixCode && (
            <>
              <Section style={pixBox}>
                <Text style={pixLabel}>👇 COPIE O CÓDIGO ABAIXO E PAGUE NO SEU BANCO:</Text>
                <Section style={codeContainer}>
                  <Text style={codeText}>{pixCode}</Text>
                </Section>
                <Text style={steps}>Abra seu banco → Pix → Copia e Cola → Cole → Confirme ✅</Text>
              </Section>
            </>
          )}

          <Section style={warningBox}>
            <Text style={warningText}>⏰ Se não pagar nos próximos minutos, o código expira e seus prêmios vão para o próximo da fila.</Text>
          </Section>

          <Text style={trustLine}>🔒 Seguro · 📦 SEDEX · 🏆 Oficial</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PixNotificationEmail,
  subject: (data: Record<string, any>) =>
    `🚨 ${data.name || 'Seu'} PIX expira em minutos — copie e pague agora!`,
  displayName: 'Notificação de PIX gerado',
  previewData: {
    name: 'João',
    pixCode: '00020126580014br.gov.bcb.pix0136a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    amount: '44,90',
    shirtColor: 'Amarela',
    shirtSize: 'G',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { maxWidth: '520px', margin: '0 auto' }
const header = { backgroundColor: '#B91C1C', padding: '18px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const h1 = { fontSize: '18px', fontWeight: '900', color: '#fff', margin: '0', letterSpacing: '0.5px' }
const content = { padding: '20px 22px 16px' }
const greeting = { fontSize: '15px', color: '#222', margin: '0 0 14px', lineHeight: '1.5' }
const listItem = { fontSize: '14px', color: '#333', margin: '0', lineHeight: '1.8' }
const priceTag = { fontSize: '14px', fontWeight: '700', color: '#15803d', margin: '8px 0 18px', padding: '8px 12px', backgroundColor: '#f0fdf4', borderRadius: '6px', borderLeft: '3px solid #22c55e' }
const pixBox = { backgroundColor: '#FFF7ED', border: '2px solid #F59E0B', borderRadius: '8px', padding: '16px', margin: '0 0 14px' }
const pixLabel = { fontSize: '13px', fontWeight: '800', color: '#92400E', margin: '0 0 10px' }
const codeContainer = { backgroundColor: '#ffffff', border: '1px dashed #D97706', borderRadius: '6px', padding: '12px', margin: '0 0 10px' }
const codeText = { fontSize: '12px', color: '#1E293B', fontFamily: 'Courier New, monospace', wordBreak: 'break-all' as const, margin: '0', lineHeight: '1.5', letterSpacing: '0.3px' }
const steps = { fontSize: '12px', color: '#B45309', margin: '0', fontWeight: '600' }
const warningBox = { backgroundColor: '#FEF2F2', borderLeft: '4px solid #DC2626', borderRadius: '0 6px 6px 0', padding: '10px 14px', margin: '0 0 14px' }
const warningText = { fontSize: '13px', color: '#991B1B', margin: '0', fontWeight: '600', lineHeight: '1.5' }
const trustLine = { fontSize: '11px', color: '#9CA3AF', margin: '0', textAlign: 'center' as const }
