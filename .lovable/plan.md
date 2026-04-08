
## Cloaker Última Geração — Plano Completo

### Princípio: ZERO impacto nas vendas
- Todas as verificações são **não-bloqueantes** para usuários reais
- Behavioral analysis roda **em paralelo** (não atrasa carregamento)
- Usuário real nunca é bloqueado por falso positivo — score precisa ser alto

### 1. 🧠 Análise Comportamental (Client-side)
- Rastrear: movimento do mouse, scroll, cliques e tempo na página
- Bots não movem mouse nem scrollam naturalmente
- Coleta por **3 segundos** em background, depois envia score ao servidor
- **Não bloqueia** — apenas complementa a decisão server-side
- Se comportamento humano detectado → libera mesmo com score médio

### 2. 📊 Logging de Bloqueios (Banco de dados)
- Nova tabela `cloaker_logs` com: IP, user_agent, motivo, confiança, timestamp
- Salvos tanto bloqueios quanto liberações suspeitas
- Visível na aba Cloaker do admin com estatísticas

### 3. 🔵 Toggle Facebook Ads
- Separar detecção de `facebookexternalhit` com toggle próprio
- Adicionar coluna `facebook_enabled` no `cloaker_config`
- Card na aba Cloaker igual ao Google/TikTok

### 4. 🔒 JS Challenge (Honey Pot)
- Injetar um micro-desafio JavaScript invisível (resolver hash simples)
- Bots headless básicos falham nesse teste
- **Transparente** para o usuário — executa em <100ms sem UI visível

### 5. ⚡ Rate Limiting (Server-side)
- Detectar >5 acessos do mesmo IP em 60 segundos
- Apenas marca como suspeito, **não bloqueia** sozinho
- Combinado com outros sinais para decisão final

### ⚠️ Proteções anti falso-positivo:
- Score mínimo de 50 para bloquear (múltiplos sinais necessários)
- Behavioral analysis só **adiciona** confiança, nunca bloqueia sozinho
- Rate limit é apenas +20 no score, não bloqueio direto
- Logging permite auditar e ajustar thresholds
