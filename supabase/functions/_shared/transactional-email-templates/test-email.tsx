/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Section, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "desafiodacopa"

interface TestEmailProps {
  name?: string
}

const TestEmail = ({ name }: TestEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>E-mail de teste - {SITE_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={headerSection}>
          <Heading style={h1}>🏆 Teste de E-mail</Heading>
        </Section>
        <Text style={text}>
          {name ? `Olá, ${name}!` : 'Olá!'}
        </Text>
        <Text style={text}>
          Este é um e-mail de teste enviado pelo <strong>{SITE_NAME}</strong>. 
          Se você recebeu este e-mail, a infraestrutura de envio está funcionando corretamente! ✅
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          {SITE_NAME} — Teste de envio de e-mails
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: TestEmail,
  subject: `Teste de E-mail - ${SITE_NAME}`,
  displayName: 'E-mail de teste',
  previewData: { name: 'Usuário Teste' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Inter, Arial, sans-serif' }
const container = { padding: '20px 25px', maxWidth: '560px', margin: '0 auto' }
const headerSection = { backgroundColor: '#E60000', padding: '20px', borderRadius: '8px 8px 0 0', textAlign: 'center' as const }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#ffffff', margin: '0' }
const text = { fontSize: '15px', color: '#222222', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { borderColor: '#e5e5e5', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#737373', margin: '0' }
