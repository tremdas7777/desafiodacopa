/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr, Button, Img,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "Desafio da Copa"

interface PixNotificationProps {
  name?: string
  pixCode?: string
  amount?: string
  items?: string
  shirtColor?: string
  shirtSize?: string
}

const PixNotificationEmail = ({ name, pixCode, amount, items, shirtColor, shirtSize }: PixNotificationProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>⚠️ {name ? `${name}, seu` : 'Seu'} PIX foi gerado! Pague agora e garanta seus prêmios da Copa 2026</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header vermelho Centauro */}
        <Section style={headerSection}>
          <Heading style={headerTitle}>🏆 PEDIDO GERADO COM SUCESSO!</Heading>
          <Text style={headerSub}>Falta pouco para garantir seus prêmios</Text>
        </Section>

        {/* Saudação */}
        <Section style={contentSection}>
          <Text style={greeting}>
            {name ? `Olá, ${name}!` : 'Olá!'}
          </Text>

          <Text style={text}>
            Seu pedido foi registrado e o <strong>PIX já está pronto</strong> para pagamento. 
            Complete o pagamento agora para garantir seus prêmios exclusivos! ⏰
          </Text>

          {/* Urgência */}
          <Section style={urgencyBox}>
            <Text style={urgencyTitle}>⚡ ATENÇÃO: PIX EXPIRA EM BREVE!</Text>
            <Text style={urgencyText}>
              O código PIX tem validade limitada. Se não pagar a tempo, 
              <strong> você perderá sua vaga no sorteio</strong> e os prêmios serão liberados para outra pessoa.
            </Text>
          </Section>

          {/* Itens do pedido */}
          <Section style={orderBox}>
            <Text style={orderTitle}>📦 SEU PEDIDO:</Text>
            <Text style={orderItem}>✅ Camisa Oficial Seleção Brasileira 2026 {shirtColor ? `(${shirtColor})` : ''} {shirtSize ? `- Tam. ${shirtSize}` : ''}</Text>
            <Text style={orderItem}>✅ Álbum Oficial Copa do Mundo 2026</Text>
            <Text style={orderItem}>🎟️ Participação no Sorteio: 2 Ingressos VIP + Passagem + Hotel</Text>
            <Hr style={orderDivider} />
            <Text style={orderTotal}>💰 Total: R$ {amount || '44,90'} (apenas frete SEDEX)</Text>
            <Text style={orderFree}>🎁 Todos os itens são <strong>100% GRATUITOS</strong> — você paga apenas o envio!</Text>
          </Section>

          {/* Código PIX */}
          {pixCode && (
            <Section style={pixSection}>
              <Text style={pixTitle}>📋 SEU CÓDIGO PIX (COPIA E COLA):</Text>
              <Section style={pixCodeBox}>
                <Text style={pixCodeText}>{pixCode}</Text>
              </Section>
              <Text style={pixInstruction}>
                Copie o código acima → Abra o app do seu banco → Pix → Copia e Cola → Cole e pague!
              </Text>
            </Section>
          )}

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaText}>
              <strong>Não perca essa oportunidade!</strong> Milhares de pessoas já garantiram seus prêmios. 
              As vagas para o sorteio dos ingressos VIP são <strong>LIMITADAS</strong>.
            </Text>
          </Section>

          {/* Garantias */}
          <Hr style={hr} />
          <Section style={trustSection}>
            <Text style={trustItem}>🔒 Pagamento 100% seguro via PIX</Text>
            <Text style={trustItem}>📦 Entrega garantida via SEDEX</Text>
            <Text style={trustItem}>🏆 Sorteio oficial com auditoria independente</Text>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Este e-mail foi enviado porque você iniciou um pedido no {SITE_NAME}. 
            Se não reconhece esta ação, ignore este e-mail.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: PixNotificationEmail,
  subject: (data: Record<string, any>) => 
    `⚠️ ${data.name ? `${data.name}, pague` : 'Pague'} seu PIX agora e garanta seus prêmios da Copa!`,
  displayName: 'Notificação de PIX gerado',
  previewData: { 
    name: 'João', 
    pixCode: '00020126580014br.gov.bcb.pix0136exemplo-pix-code-aqui', 
    amount: '44,90',
    shirtColor: 'Amarela',
    shirtSize: 'G',
  },
} satisfies TemplateEntry

// Styles
const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, Helvetica, sans-serif' }
const container = { maxWidth: '580px', margin: '0 auto' }

const headerSection = { 
  backgroundColor: '#E60000', 
  padding: '28px 24px', 
  textAlign: 'center' as const,
  borderRadius: '8px 8px 0 0',
}
const headerTitle = { fontSize: '22px', fontWeight: '900', color: '#ffffff', margin: '0 0 6px', letterSpacing: '0.5px' }
const headerSub = { fontSize: '14px', color: '#ffcccc', margin: '0' }

const contentSection = { padding: '24px' }

const greeting = { fontSize: '18px', fontWeight: '700', color: '#222222', margin: '0 0 12px' }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6', margin: '0 0 20px' }

const urgencyBox = { 
  backgroundColor: '#FFF3CD', 
  border: '2px solid #FFC107', 
  borderRadius: '8px', 
  padding: '16px 18px', 
  margin: '0 0 20px',
}
const urgencyTitle = { fontSize: '16px', fontWeight: '800', color: '#856404', margin: '0 0 6px' }
const urgencyText = { fontSize: '14px', color: '#856404', lineHeight: '1.5', margin: '0' }

const orderBox = { 
  backgroundColor: '#F0FFF0', 
  border: '1px solid #C3E6C3', 
  borderRadius: '8px', 
  padding: '18px', 
  margin: '0 0 20px',
}
const orderTitle = { fontSize: '16px', fontWeight: '800', color: '#1a5c1a', margin: '0 0 12px' }
const orderItem = { fontSize: '14px', color: '#2d6a2d', lineHeight: '1.8', margin: '0' }
const orderDivider = { borderColor: '#C3E6C3', margin: '12px 0' }
const orderTotal = { fontSize: '16px', fontWeight: '700', color: '#1a5c1a', margin: '0 0 4px' }
const orderFree = { fontSize: '13px', color: '#2d8a2d', margin: '0' }

const pixSection = { 
  backgroundColor: '#F0F7FF', 
  border: '2px solid #3B82F6', 
  borderRadius: '8px', 
  padding: '18px', 
  margin: '0 0 20px',
}
const pixTitle = { fontSize: '14px', fontWeight: '800', color: '#1E40AF', margin: '0 0 10px' }
const pixCodeBox = { 
  backgroundColor: '#ffffff', 
  border: '1px dashed #93C5FD', 
  borderRadius: '6px', 
  padding: '12px',
  margin: '0 0 10px',
}
const pixCodeText = { 
  fontSize: '11px', 
  color: '#1E40AF', 
  wordBreak: 'break-all' as const, 
  fontFamily: 'monospace', 
  margin: '0',
  lineHeight: '1.4',
}
const pixInstruction = { fontSize: '13px', color: '#3B82F6', margin: '0', lineHeight: '1.5' }

const ctaSection = { 
  backgroundColor: '#FEF2F2', 
  borderRadius: '8px', 
  padding: '16px 18px', 
  margin: '0 0 20px',
  borderLeft: '4px solid #E60000',
}
const ctaText = { fontSize: '14px', color: '#991B1B', lineHeight: '1.6', margin: '0' }

const trustSection = { padding: '0' }
const trustItem = { fontSize: '13px', color: '#555555', margin: '0 0 4px' }

const hr = { borderColor: '#e5e5e5', margin: '20px 0' }
const footer = { fontSize: '11px', color: '#999999', lineHeight: '1.5', margin: '0' }
