
export interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  content: string;
}

export const contractTemplates: ContractTemplate[] = [
  {
    id: 'audiovisual-producao',
    name: 'Produção Audiovisual',
    category: 'Audiovisual',
    description: 'Contrato para serviços de produção audiovisual, filmagem e edição',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE PRODUÇÃO AUDIOVISUAL

CONTRATANTE: [Nome do Cliente]
CNPJ/CPF: [Documento]
Endereço: [Endereço completo]

CONTRATADO: [Sua Empresa]
CNPJ: [Seu CNPJ]
Endereço: [Seu endereço]

1. OBJETO DO CONTRATO
O presente contrato tem por objeto a prestação de serviços de produção audiovisual, incluindo:
- Pré-produção (planejamento, roteiro, storyboard)
- Produção (filmagem, direção, captação de áudio)
- Pós-produção (edição, colorização, finalização)

2. ESPECIFICAÇÕES DO PROJETO
- Duração final: [X minutos]
- Formato de entrega: [Formato]
- Número de revisões incluídas: [X revisões]
- Prazo de entrega: [Data]

3. VALOR E FORMA DE PAGAMENTO
Valor total: R$ [Valor]
Forma de pagamento:
- 50% na assinatura do contrato
- 50% na entrega final

4. DIREITOS AUTORAIS
Os direitos patrimoniais da obra audiovisual pertencem ao CONTRATANTE após o pagamento integral.
O CONTRATADO mantém os direitos morais como autor da obra.

5. ENTREGAS
- Arquivo master em alta qualidade
- Versões otimizadas para redes sociais
- Making of (se aplicável)

6. PRAZO
O prazo de execução é de [X] dias úteis a partir da aprovação do briefing.

7. RESPONSABILIDADES
CONTRATADO: Executar os serviços com qualidade técnica e artística
CONTRATANTE: Fornecer briefing detalhado e materiais necessários

Local e Data: _______________

_________________________          _________________________
    CONTRATANTE                         CONTRATADO`
  },
  {
    id: 'criacao-conteudo',
    name: 'Criação de Conteúdo Digital',
    category: 'Criação de Conteúdo',
    description: 'Contrato para criação de conteúdo para redes sociais e marketing digital',
    content: `CONTRATO DE CRIAÇÃO DE CONTEÚDO DIGITAL

CONTRATANTE: [Nome do Cliente]
CNPJ/CPF: [Documento]
Endereço: [Endereço completo]

CONTRATADO: [Sua Empresa/Nome]
CNPJ/CPF: [Seu documento]
Endereço: [Seu endereço]

1. OBJETO DO CONTRATO
Criação de conteúdo digital para redes sociais e plataformas digitais, incluindo:
- Posts para Instagram/Facebook
- Stories interativos
- Reels/TikToks
- Conteúdo para blog (se aplicável)
- Copywriting e legendas

2. ESCOPO DOS SERVIÇOS
- Quantidade de posts por mês: [X posts]
- Quantidade de stories por semana: [X stories]
- Reels/vídeos por mês: [X vídeos]
- Planejamento de conteúdo mensal
- Hashtags estratégicas

3. PROCESSO CRIATIVO
- Briefing inicial e alinhamento de estratégia
- Criação de calendário editorial
- Produção de artes e textos
- 2 revisões por peça criada
- Aprovação antes da publicação

4. VALOR E PAGAMENTO
Valor mensal: R$ [Valor]
Pagamento: Todo dia [X] de cada mês
Forma: [PIX/Transferência/Boleto]

5. DIREITOS DE USO
O CONTRATANTE terá direito de uso comercial de todo conteúdo criado.
O CONTRATADO pode usar as peças em portfólio, salvo solicitação contrária.

6. PRAZO E VIGÊNCIA
Vigência: [X] meses
Início: [Data]
Renovação: Automática, salvo manifestação contrária com 30 dias de antecedência

7. ENTREGA E APROVAÇÃO
- Apresentação de artes até o dia [X] de cada mês
- Prazo de aprovação: 3 dias úteis
- Publicação conforme cronograma aprovado

Local e Data: _______________

_________________________          _________________________
    CONTRATANTE                         CONTRATADO`
  },
  {
    id: 'marketing-digital',
    name: 'Marketing Digital e Gestão de Redes',
    category: 'Marketing Digital',
    description: 'Contrato completo para gestão de marketing digital e redes sociais',
    content: `CONTRATO DE GESTÃO DE MARKETING DIGITAL

CONTRATANTE: [Nome do Cliente]
CNPJ/CPF: [Documento]
Endereço: [Endereço completo]
Segmento: [Área de atuação]

CONTRATADO: [Sua Empresa]
CNPJ: [Seu CNPJ]
Endereço: [Seu endereço]

1. OBJETO DO CONTRATO
Gestão completa de marketing digital, incluindo:
- Gestão de redes sociais (Instagram, Facebook, LinkedIn)
- Criação de conteúdo estratégico
- Gestão de tráfego pago (Google Ads, Meta Ads)
- Relatórios mensais de performance
- Consultoria estratégica

2. SERVIÇOS INCLUÍDOS
GESTÃO DE REDES SOCIAIS:
- [X] posts por semana no feed
- [X] stories por semana
- Resposta a comentários e DMs
- Monitoramento de menções

TRÁFEGO PAGO:
- Configuração de campanhas
- Otimização contínua
- Relatórios de performance
- Valor mínimo de investimento: R$ [valor]

CRIAÇÃO DE CONTEÚDO:
- Artes para posts e stories
- Copywriting especializado
- Vídeos para reels (se aplicável)
- Calendário editorial mensal

3. INVESTIMENTO
Taxa de gestão mensal: R$ [Valor]
Investimento em mídia paga: Por conta do CONTRATANTE
Pagamento: Todo dia [X] do mês

4. METAS E OBJETIVOS
- Aumentar engajamento em [X]%
- Crescimento de seguidores: [X] por mês
- Geração de leads: [X] por mês
- Aumento de vendas/conversões

5. RELATÓRIOS
Entrega de relatório mensal até o dia [X] contendo:
- Métricas de alcance e engajamento
- Performance das campanhas pagas
- ROI e conversões
- Sugestões para próximo mês

6. VIGÊNCIA E RESCISÃO
Vigência: [X] meses
Fidelidade mínima: 3 meses
Rescisão: 30 dias de antecedência

7. RESPONSABILIDADES
CONTRATADO: Executar estratégias conforme briefing aprovado
CONTRATANTE: Fornecer informações e materiais necessários

Local e Data: _______________

_________________________          _________________________
    CONTRATANTE                         CONTRATADO`
  },
  {
    id: 'fotografia-evento',
    name: 'Fotografia de Eventos',
    category: 'Audiovisual',
    description: 'Contrato para cobertura fotográfica de eventos',
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS FOTOGRÁFICOS

CONTRATANTE: [Nome do Cliente]
CNPJ/CPF: [Documento]
Telefone: [Telefone]
E-mail: [Email]

CONTRATADO: [Seu Nome]
CPF/CNPJ: [Seu documento]
Telefone: [Seu telefone]

1. DADOS DO EVENTO
Nome do evento: [Nome]
Data: [Data e horário]
Local: [Endereço completo]
Tipo de evento: [Casamento/Corporativo/Social]
Duração da cobertura: [X] horas

2. SERVIÇOS INCLUÍDOS
- Cobertura fotográfica do evento
- Edição e tratamento das imagens
- Entrega de [X] fotos editadas
- Galeria online para download
- [X] fotos impressas (se aplicável)

3. EQUIPAMENTOS
O CONTRATADO utilizará equipamento profissional e backup para garantir a qualidade e segurança das imagens.

4. VALOR E PAGAMENTO
Valor total: R$ [Valor]
Forma de pagamento:
- 50% na assinatura (R$ [valor])
- 50% no dia do evento (R$ [valor])

5. ENTREGA
Prazo de entrega: [X] dias úteis após o evento
Formato de entrega: Galeria online e/ou pendrive

6. DIREITOS DE IMAGEM
O CONTRATADO poderá utilizar as imagens para divulgação do trabalho em portfólio e redes sociais, exceto se solicitado contrário por escrito.

7. CANCELAMENTO
- Até 30 dias antes: devolução de 70% do valor pago
- Entre 15-30 dias: devolução de 50%
- Menos de 15 dias: não há devolução

8. FORÇA MAIOR
Em caso de impossibilidade por motivos de força maior, será remarcado sem custos adicionais.

Local e Data: _______________

_________________________          _________________________
    CONTRATANTE                         CONTRATADO`
  },
  {
    id: 'influencer-partnership',
    name: 'Parceria com Influenciador',
    category: 'Marketing Digital',
    description: 'Contrato para parcerias e colaborações com influenciadores digitais',
    content: `CONTRATO DE PARCERIA COM INFLUENCIADOR DIGITAL

CONTRATANTE: [Nome da Marca/Empresa]
CNPJ: [CNPJ]
Endereço: [Endereço completo]

CONTRATADO: [Nome do Influenciador]
CPF: [CPF]
Rede social principal: [Instagram/TikTok/YouTube]
Número de seguidores: [Quantidade]

1. OBJETO DO CONTRATO
Prestação de serviços de marketing de influência através de:
- Posts no feed do Instagram
- Stories patrocinados
- Reels promocionais
- Participação em campanhas da marca

2. ENTREGAS ACORDADAS
- [X] posts no feed
- [X] stories
- [X] reels
- Período da campanha: [Data início] a [Data fim]
- Hashtags obrigatórias: [Lista de hashtags]

3. DIRETRIZES DE CONTEÚDO
- Mencionar a marca de forma natural
- Usar produtos/serviços conforme briefing
- Manter tom de comunicação autêntico
- Seguir diretrizes da marca fornecidas

4. VALOR E PAGAMENTO
Valor total: R$ [Valor]
Forma de pagamento: [Forma]
Prazo: [Prazo de pagamento]

5. MÉTRICAS E PERFORMANCE
Métricas mínimas esperadas:
- Alcance: [X] pessoas
- Engajamento: [X]%
- Impressões: [X]

6. EXCLUSIVIDADE
Durante o período de campanha, o CONTRATADO não poderá promover concorrentes diretos da marca.

7. DIREITOS DE USO
A CONTRATANTE poderá utilizar o conteúdo criado em suas próprias redes sociais e materiais de marketing.

8. COMPLIANCE
O CONTRATADO deve seguir as diretrizes de publicidade do CONAR e marcar adequadamente o conteúdo patrocinado.

Local e Data: _______________

_________________________          _________________________
    CONTRATANTE                         CONTRATADO`
  }
];

export const getTemplatesByCategory = (category: string) => {
  return contractTemplates.filter(template => template.category === category);
};

export const getAllCategories = () => {
  return [...new Set(contractTemplates.map(template => template.category))];
};
