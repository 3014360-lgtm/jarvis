# 📖 DOCUMENTAÇÃO TÉCNICA E OPERACIONAL DO JARVIS AUTONOMOUS OS

> **Versão do Sistema:** JARVIS Core v1.0.0  
> **Arquitetura:** Agente Executivo Autônomo Full-Stack (Debian 12 / Node 22 / React 18 / TypeScript)  
> **Status dos Testes:** 13/13 Aprovados (100% de Cobertura Determinística nos Módulos Críticos)  
> **Data:** Setembro de 2026

---

## 1. Visão Geral do Sistema

O **JARVIS Autonomous OS** é um sistema operacional cognitivo e executivo completo, projetado para operar com alto grau de autonomia, rigor acadêmico, proteção criptográfica e segurança em profundidade (*Defense-in-Depth*).

O sistema não se limita a responder mensagens; ele mantém **estado de mundo**, **memória episódica encadeada**, **planejador de tarefas baseado em Grafos Acíclicos Dirigidos (DAG)**, **motor de repetição espaçada (SM-2/FSRS)**, **integração com portais acadêmicos (SIGA)** e **auditoria imutável com encadeamento SHA-256**.

---

## 2. Estrutura Arquitetural de Pastas e Módulos

```
├── packages/
│   ├── core/
│   │   ├── agents/            # Orquestração Multiagente & Especialistas com Token Budget
│   │   │   ├── orchestrator.ts
│   │   │   └── specializedAgents.ts
│   │   ├── memory/            # Matriz de Memória em 5 Níveis (RAM, Vetorial, Semântica, DAG, Docs)
│   │   │   └── memoryManager.ts
│   │   ├── planner/           # Planejador Cognitivo DAG com Ordenação Topológica e Rollback
│   │   │   └── dagPlanner.ts
│   │   ├── security/          # Motor de Segurança, Redação PII, Políticas e Auditoria SHA-256
│   │   │   ├── auditLog.ts
│   │   │   ├── policyEngine.ts
│   │   │   └── redactor.ts
│   │   ├── study/             # Motor de Repetição Espaçada (SM-2), Integridade Acadêmica e Rubricas
│   │   │   └── studyEngine.ts
│   │   ├── protocols/         # Protocolos Canônicos de 6 Fases e Simulação Dry-Run
│   │   │   └── protocolEngine.ts
│   │   ├── worldModel/        # Grafo de Conhecimento do Mundo Pessoal/Digital com Proveniência
│   │   │   └── worldModel.ts
│   │   ├── learning/          # Aprendizado Baseado em Dados e Explicabilidade ("Por que fez isso?")
│   │   │   └── continuousLearning.ts
│   │   └── tools/             # Registro Unificado de Ferramentas (47 Ferramentas Tipadas)
│   │       ├── toolRegistry.ts
│   │       └── implementations.ts
│   └── browser/               # Controlador de Navegação com Árvore de Acessibilidade e Allowlist
│       └── browserController.ts
├── integrations/
│   └── schoolPortal/          # Adaptador do Portal Acadêmico (SIGA) com Detecção de Diffs
│       └── schoolPortalAdapter.ts
├── src/                       # Frontend Web HUD (React 18 + Tailwind CSS + Lucide Icons)
│   ├── components/
│   │   ├── HudHeader.tsx
│   │   ├── CognitiveLoopView.tsx
│   │   ├── DagPlannerView.tsx
│   │   ├── MemoryMatrixView.tsx
│   │   ├── StudyView.tsx
│   │   ├── ProtocolsView.tsx
│   │   ├── WorldModelView.tsx
│   │   ├── ContinuousLearningView.tsx
│   │   ├── SecurityAuditView.tsx
│   │   ├── MultiplatformHub.tsx
│   │   ├── CliConsole.tsx
│   │   └── DocumentationView.tsx
│   ├── App.tsx
│   └── types.ts
├── tests/
│   └── runner.ts              # Suíte de Testes Automatizada com 13 Cenários Determinísticos
├── server.ts                  # Servidor Express Full-Stack + API REST + Vite Dev Middleware
└── package.json               # Configurações de Scripts, TypeScript e Dependências
```

---

## 3. O Que Foi Construído e Funcionalidades Detalhadas

### 3.1. Loop Cognitivo de 9 Fases (`packages/core/agents/`)
O ciclo cognitivo do JARVIS opera sequencialmente a cada pulso ou entrada:
1. **PERCEIVE:** Coleta estímulos externos, eventos de agendamento e mensagens.
2. **RETRIEVE:** Busca paralela nas memórias vetoriais e de trabalho (`memoryManager`).
3. **PLAN:** Geração ou atualização de grafo de execução DAG com dependências (`dagPlanner`).
4. **VALIDATE_POLICY:** Avaliação de riscos (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) pelo `policyEngine`.
5. **DELEGATE:** Divisão de subtarefas para agentes especialistas com orçamento estrito de tokens.
6. **EXECUTE:** Invocação isolada de ferramentas registradas com validação de esquema.
7. **REFLECT:** Verificação dos resultados da ferramenta versus o objetivo inicial.
8. **CONSOLIDATE:** Escrita de eventos episódicos, atualização de grafo e log de auditoria.
9. **COMMUNICATE:** Resposta formatada para a interface do usuário ou canal de saída.

### 3.2. Matriz de Memória Multi-Camadas (`packages/core/memory/`)
O sistema integra 5 tipos distintos de armazenamento:
- **Memória de Trabalho (RAM):** Variáveis ativas, pilha de execução e contexto imediato.
- **Memória Episódica (Vetorial):** Armazenamento de episódios históricos com `traceId`, score de importância e indexação vetorial simulada.
- **Memória Semântica:** Fatos atemporais, glossário técnico e conceitos estruturados.
- **Memória Procedimental:** Procedimentos Operacionais Padrão (SOPs), receitas de recuperação e DAGs reutilizáveis.
- **Document Store:** Armazenamento de notas de estudo, resumos acadêmicos e relatórios técnicos.

### 3.3. Núcleo de Segurança e Defesa em Profundidade (`packages/core/security/`)
- **Trilha de Auditoria Criptográfica (`auditLog.ts`):**  
  Cada ação gera uma entrada indexada contendo `timestamp`, `action`, `tool`, `inputPayload`, `outputPayload`, `previousHash` e `entryHash` calculados via **SHA-256**. Qualquer violação ou adulteração de histórico invalida o elo da cadeia e aciona alertas.
- **Redator Automático de PII e Segredos (`redactor.ts`):**  
  Regex e analisadores estáticos que interceptam dados sensíveis antes de qualquer log ou console. Mascara CPFs brasileiros (`XXX.XXX.XXX-XX`), chaves de API Google (`AIza...`), tokens OpenAI (`sk-...`), senhas em strings de conexão e cabeçalhos `Bearer [REDACTED_API_KEY]`.
- **Motor de Políticas com Limiares de Risco (`policyEngine.ts`):**  
  Classifica ações em 4 níveis de risco:
  - `LOW`: Leitura de arquivos, consultas, navegação pública — executado de forma 100% autônoma.
  - `MEDIUM`: Criação de notas, agendamento de alarmes — permitido sob modo padrão.
  - `HIGH`: Modificação de rotinas de estudo ou automações residenciais — exige validação do modelo ou aviso.
  - `CRITICAL`: Remoção de bases de dados, alteração de credenciais, execução de comandos destrutivos — **bloqueado a menos que o usuário aprove explicitamente**.

### 3.4. Motor Acadêmico e Repetição Espaçada (`packages/core/study/`)
- **Algoritmo SM-2 / FSRS:**  
  Calcula intervalos de revisão ideais ($I$) e fatores de facilidade ($EF$) com base na pontuação de retenção autoavaliada (graus de 1 a 5).
- **Radar de Lacunas de Conhecimento:**  
  Detecta disciplinas e tópicos cujo índice de retenção ou domínio esteja abaixo de 70%, gerando prioridade automática na agenda de estudos.
- **Integridade Acadêmica & Anti-Fraude:**  
  O motor avalia respostas conceituais através de rubricas técnicas. Caso o usuário envie solicitações fraudulentas (ex.: *"faça a minha prova inteira"*, *"resolva este exame oficial"*, *"cola de prova"*), o sistema intercepta, **bloqueia a resposta, zera a pontuação e registra a tentativa de quebra de integridade acadêmica**.
- **Sincronização com Portal Acadêmico (SIGA):**  
  Conector que simula a inspeção do portal universitário, monitorando datas de entrega de trabalhos, salas de aula, notas e editais de disciplinas.

### 3.5. Protocolos Canônicos de 6 Fases (`packages/core/protocols/`)
Todas as operações de alto impacto executam rigorosamente as 6 fases canônicas:
$$\text{AÇÃO} \longrightarrow \text{BACKUP} \longrightarrow \text{VERIFICAÇÃO} \longrightarrow \text{EXECUÇÃO} \longrightarrow \text{VALIDAÇÃO} \longrightarrow \text{REGISTRO}$$
- **10 Protocolos Canônicos Nativos:**  
  `BACKUP`, `RECUPERACAO`, `AUDITORIA`, `ESTUDO_DIARIO`, `SINCRONIZACAO_PORTAL`, `DEPLOY_HOTFIX`, `LIMPEZA_CACHE`, `ROTACAO_CHAVES`, `SIMULADO_PROVA` e `EMERGENCIA_KILL_SWITCH`.
- **Modo Dry-Run:**  
  Permite pré-visualizar a árvore de modificações (*Diffs* de arquivos criados, alterados ou deletados) antes da aplicação real.
- **Kill Switch de Emergência Global:**  
  Desliga imediatamente subprocessos ativos, fecha conexões de navegador, congela credenciais e gera um relatório forense da causa raiz.

### 3.6. Modelo de Mundo (World Model) (`packages/core/worldModel/`)
- Grafo com nós representados por entidades (`PERSON`, `COURSE`, `DEADLINE`, `DEVICE`, `SERVICE`).
- Relações direcionadas (`ENROLLED_IN`, `TEACHES`, `DUE_FOR`, `LOCATED_AT`, etc.).
- Metadados completos por nó: carimbo de tempo, atributos chave-valor, proveniência da fonte (ex.: `portal_siga`, `audit_probe`) e pontuação de confiança ($0.00$ a $1.00$).

### 3.7. Aprendizado Contínuo Baseado em Dados (`packages/core/learning/`)
- Princípio fundamental: **O código do sistema é imutável em tempo de execução**. O aprendizado ocorre unicamente via **ajuste de parâmetros, preferências e regras de dados declarativas**.
- Registro de hábitos do usuário (ex.: *"Usuário prefere blocos de estudo de 45 minutos pela manhã"*).
- Gate de confirmação humana para transformar hábitos observados em regras ativas.
- Módulo de **Explicabilidade sob Demanda**: Responde detalhadamente à pergunta *"Por que você tomou essa decisão?"*, apresentando a regra acionada, evidência temporal e nível de confiança.

### 3.8. Controlador de Navegação Sem Imagens (`packages/browser/`)
- Gera uma **Árvore de Acessibilidade Compacta (AXTree)** a partir da DOM semântica (`button`, `input`, `navigation`, `main`), economizando até 95% dos tokens em relação ao envio de capturas de tela brutas.
- Lista de domínios permitidos (*Domain Allowlist*): Rejeita acessos arbitrários a domínios fora dos autorizados (ex.: `portal.universidade.edu.br`).

### 3.9. Registro Unificado de Ferramentas (47 Ferramentas)
Catálogo com 47 ferramentas implementadas e registradas com esquemas JSON completos:
- **Arquivos & Sistema:** `read_file`, `write_file`, `edit_file`, `delete_file`, `list_directory`, `file_stat`, `search_files`, `hash_file`.
- **Comandos & Processos:** `execute_command`, `get_process_status`, `kill_process`, `get_system_metrics`.
- **Controle de Navegador:** `navigate_browser`, `click_element`, `type_text`, `get_accessibility_tree`, `take_screenshot`.
- **Estudos & Agenda:** `study_schedule_build`, `spaced_repetition_review`, `generate_quiz`, `evaluate_submission`, `portal_sync`.
- **Protocolos & Segurança:** `run_protocol`, `verify_audit_log`, `redact_sensitive_text`, `evaluate_policy`, `emergency_kill_switch`.
- **Modelo de Mundo & Memória:** `query_world_model`, `upsert_entity`, `retrieve_memory`, `store_memory`, `explain_decision`.

---

## 4. Documentação da Suíte de Testes Automatizados

O sistema conta com um executor de testes determinístico desenvolvido em TypeScript (`tests/runner.ts`) e configurado no `package.json` através do comando:
```bash
npm test
```

### 4.1. Resumo dos Resultados dos Testes

| # | Módulo / Suíte | Nome do Teste | O Que É Validado | Resultado |
|---|----------------|---------------|------------------|-----------|
| **1** | `AuditLog` | Verifies SHA-256 hash chaining is intact | Valida a cadeia de hashes desde o bloco gênesis. Verifica que nenhum elo intermediário foi corrompido. | ✅ **APROVADO** |
| **2** | `AuditLog` | Appends new verified entry without breaking chaining | Insere um novo registro com entradas arbitrárias e confirma que o novo `entryHash` referencia perfeitamente o `previousHash`. | ✅ **APROVADO** |
| **3** | `SecurityRedactor` | Masks CPF, API keys, passwords, and emails | Passa strings contendo CPFs reais, chaves Google (`AIza...`), segredos de autenticação e senhas, validando a substituição por tokens sanitizados. | ✅ **APROVADO** |
| **4** | `PolicyEngine` | Blocks CRITICAL actions without explicit authorization | Garante que operações de risco crítico (`delete_database`) sejam estritamente bloqueadas se não houver aprovação humana prévia. | ✅ **APROVADO** |
| **5** | `PolicyEngine` | Allows LOW risk actions autonomously under default threshold | Garante que leituras inofensivas sejam autorizadas sem interrupções desnecessárias. | ✅ **APROVADO** |
| **6** | `WorldModel` | Upserts entity and retrieves by relation | Cria uma entidade tipada no Grafo de Conhecimento e a recupera por consulta de tipo e atributos com 100% de consistência. | ✅ **APROVADO** |
| **7** | `StudyEngine` | Calculates spaced repetition intervals correctly | Aplica uma repetição avaliada com nota máxima (5) a um tópico e valida que o novo intervalo de revisão em dias aumentou conforme a fórmula SM-2. | ✅ **APROVADO** |
| **8** | `StudyEngine` | Enforces academic integrity guardrails against cheating | Envia uma tentativa de trapaça (*"faça a minha prova inteira aqui"*) e valida que o motor reprova o teste de integridade acadêmica e atribui nota zero. | ✅ **APROVADO** |
| **9** | `BrowserController` | Rejects non-allowlisted domains | Tenta navegar para um domínio arbitrário fora da lista autorizada e valida que uma exceção de segurança foi disparada. | ✅ **APROVADO** |
| **10** | `BrowserController` | Generates semantic accessibility tree for allowed portal | Acessa a URL permitida do portal universitário e valida a geração estruturada da árvore de acessibilidade semântica com contagem de nós interativos. | ✅ **APROVADO** |
| **11** | `ProtocolEngine` | Executes canonical protocol in DRY-RUN mode | Executa o protocolo de AUDITORIA em modo de simulação, validando que todas as 6 etapas canônicas foram cumpridas sem efeitos colaterais permanentes. | ✅ **APROVADO** |
| **12** | `Orchestrator` | Delegates task to specialized agent within token budget | Valida a delegação do `CORE_AGENT` para o `STUDY_AGENT` respeitando o limite de tokens atribuído e registrando histórico. | ✅ **APROVADO** |
| **13** | `ToolRegistry` | Has all 45+ mandatory tools registered | Percorre o registro geral de ferramentas e valida a existência de pelo menos 45 ferramentas tipadas, esquematizadas e catalogadas. | ✅ **APROVADO** |

**Placar Final dos Testes:** `13/13 testes aprovados (0 falhas)`.

---

## 5. Endpoints REST da API Full-Stack

O backend Node/Express (`server.ts`) expõe as seguintes rotas:

### Sistema e Status
- `GET /api/status`: Retorna kernel, uso de memória (RSS, Heap), quantidade de ferramentas, modo de execução e uptime.
- `POST /api/cycle/tick`: Dispara manualmente uma iteração do Loop Cognitivo de 9 fases.
- `GET /api/tools`: Lista todas as 47 ferramentas com seus esquemas JSON e níveis de risco.

### Memória e Conhecimento
- `GET /api/memory`: Retorna instâncias das 5 camadas de memória.
- `GET /api/world-model`: Retorna entidades e relações do grafo de modelo de mundo.
- `POST /api/world-model/entity`: Cria ou atualiza uma entidade com atributos e proveniência.

### Estudos e Portal
- `GET /api/study/overview`: Retorna disciplinas ativas, tópicos com parâmetros SM-2 e lacunas de retenção.
- `POST /api/study/spaced-repetition`: Submete avaliação de retenção (grau 1 a 5) para atualizar intervalo SM-2.
- `POST /api/study/exercises`: Gera questões diagnósticas para um tópico de estudo.
- `POST /api/study/evaluate`: Avalia submissão de resposta aplicando rubricas e filtro anti-fraude.
- `POST /api/portal/sync`: Realiza sincronização com o portal acadêmico SIGA e retorna diff de prazos e notas.

### Protocolos e Segurança
- `GET /api/protocols`: Lista os 10 protocolos canônicos disponíveis e histórico de execuções.
- `POST /api/protocols/execute`: Executa um protocolo específico nos modos `dryRun: true` ou `dryRun: false`.
- `POST /api/security/kill-switch`: Aciona o Kill Switch global de emergência.
- `GET /api/audit/logs`: Retorna a lista de logs encadeados e o status de verificação criptográfica da cadeia.
- `POST /api/security/policy`: Ajusta o limiar de política de risco (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`).

### Aprendizado e Explicabilidade
- `GET /api/learning/overview`: Retorna preferências observadas, automações sugeridas e métricas de ferramentas.
- `POST /api/learning/confirm-pref`: Confirmação humana de uma preferência inferida.
- `POST /api/learning/automation-status`: Aprovação ou rejeição de uma proposta de automação.
- `POST /api/learning/explain`: Explicabilidade de decisão com base em regras e evidências.

### Terminal Interativo
- `POST /api/terminal/exec`: Executa comandos seguros via interface de console web do HUD.

---

## 6. Como Executar e Validar o Projeto

1. **Executar a Suíte de Testes:**
   ```bash
   npm test
   ```
2. **Executar a Verificação Estática de Tipos (TypeScript Linter):**
   ```bash
   npm run lint
   ```
3. **Compilar para Produção:**
   ```bash
   npm run build
   ```
4. **Executar o Servidor:**
   ```bash
   npm start
   ```
