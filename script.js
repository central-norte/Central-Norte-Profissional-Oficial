// ==========================================
// 1. CONEXÃO COM SUPABASE E CONTROLE DO FLUXO
// ==========================================
const supabaseUrl = 'https://vpflaaopuvwpasxhwmmp.supabase.co';
const supabaseKey = 'sb_publishable_riWtq43s4LnemyjPbDPxhw_K5CxRAGy';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

let pesquisaAtualId = null;
let fluxoAtual = null;
let pesquisasRealizadas = [];
let iniciandoFluxo = false;


// ==========================================
// INICIAR UM NOVO FLUXO DE PESQUISA
// ==========================================
async function iniciarFluxo(opcao) {

    // Impede começar outro fluxo antes de finalizar o atual
    if (iniciandoFluxo) {
        return false;
    }

    if (opcao !== 'emprego' && opcao !== 'profissional') {
        return false;
    }

    iniciandoFluxo = true;
    fluxoAtual = opcao;
    pesquisasRealizadas = [];

    const tipo = opcao === 'emprego'
        ? 'busca_emprego'
        : 'busca_profissional';

    const { data, error } = await supabaseClient
        .from('Pesquisas')
        .insert([{
            tipo: tipo,
            opcao: opcao,
            pesquisa: '',
            usou_tradutor: 'não',
            texto_tradutor: ''
        }])
        .select('id')
        .single();

    iniciandoFluxo = false;

    if (error) {
        console.error('Erro ao iniciar fluxo no Supabase:', error);

        pesquisaAtualId = null;
        fluxoAtual = null;
        pesquisasRealizadas = [];

        alert('Não foi possível iniciar a pesquisa. Tente novamente.');

        return false;
    }

    pesquisaAtualId = data.id;

    return true;
}


// ==========================================
// ATUALIZAR A PESQUISA ATUAL
// ==========================================
async function atualizarPesquisa(dados) {

    if (!pesquisaAtualId) {
        return false;
    }

    const { error } = await supabaseClient
        .from('Pesquisas')
        .update(dados)
        .eq('id', pesquisaAtualId);

    if (error) {
        console.error('Erro ao atualizar pesquisa no Supabase:', error);
        return false;
    }

    return true;
}


// ==========================================
// REGISTRAR PESQUISA REALIZADA
// ==========================================
async function registrarPesquisa(texto) {

    if (!texto || !pesquisaAtualId) {
        return;
    }

    const termo = texto.trim();

    if (!termo) {
        return;
    }

    pesquisasRealizadas.push(termo);

    await atualizarPesquisa({
        pesquisa: pesquisasRealizadas.join('; ')
    });
}


// ==========================================
// REGISTRAR RESULTADO ESCOLHIDO
// ==========================================
async function registrarResultado(resultado) {

    if (!resultado || !pesquisaAtualId) {
        return;
    }

    await atualizarPesquisa({
        resultado_escolhido: resultado
    });
}


// ==========================================
// REGISTRAR AÇÃO REALIZADA
// ==========================================
async function registrarAcao(acao) {

    if (!acao || !pesquisaAtualId) {
        return;
    }

    await atualizarPesquisa({
        acao_realizada: acao
    });
}


// ==========================================
// REGISTRAR USO DO TRADUTOR
// ==========================================
async function registrarTradutor(texto) {

    if (!pesquisaAtualId) {
        return;
    }

    await atualizarPesquisa({
        usou_tradutor: 'sim',
        texto_tradutor: texto || ''
    });
}


// ==========================================
// FINALIZAR FLUXO
// ==========================================
function finalizarFluxo() {

    pesquisaAtualId = null;
    fluxoAtual = null;
    pesquisasRealizadas = [];
}


// ==========================================
// 2. BANCO DE DADOS LOCAL
// VAGAS - 20 ÁREAS X 3 OPÇÕES
// ==========================================
const listaEmpregos = [

    // 1. Administração
    {
        id: 1,
        cargo: "Auxiliar Administrativo",
        empresa: "Grupo Carajás",
        local: "Parauapebas - PA",
        modalidade: "Presencial",
        area: "admin",
        descricao: "Suporte em rotinas de escritório, controle de documentos e atendimento.",
        requisitos: "Ensino Médio completo e Pacote Office."
    },

    {
        id: 2,
        cargo: "Assistente Administrativo",
        empresa: "AgroGuarabira",
        local: "Guarabira - PB",
        modalidade: "Híbrido",
        area: "admin",
        descricao: "Apoio à diretoria, relatórios gerenciais e organização de reuniões.",
        requisitos: "Experiência em rotinas administrativas."
    },

    {
        id: 3,
        cargo: "Recepcionista Administrativa",
        empresa: "Paulista Consult",
        local: "São Paulo - SP",
        modalidade: "Presencial",
        area: "admin",
        descricao: "Atendimento presencial e telefônico, recepção de clientes e correspondências.",
        requisitos: "Boa comunicação e organização."
    },


    // 2. Financeiro
    {
        id: 4,
        cargo: "Assistente Financeiro",
        empresa: "Vale do Zêzere",
        local: "Marabá - PA",
        modalidade: "Presencial",
        area: "finan",
        descricao: "Contas a pagar e receber, conciliação bancária e emissão de notas.",
        requisitos: "Conhecimento em Excel intermediário."
    },

    {
        id: 5,
        cargo: "Auxiliar de Contas a Pagar",
        empresa: "Paraíba Grãos",
        local: "Pilõezinhos - PB",
        modalidade: "Híbrido",
        area: "finan",
        descricao: "Lançamentos financeiros, conferência de faturas e pagamentos.",
        requisitos: "Ensino Médio completo ou cursando Ciências Contábeis."
    },

    {
        id: 6,
        cargo: "Analista Financeiro Jr",
        empresa: "Rio Capital",
        local: "Rio de Janeiro - RJ",
        modalidade: "Remoto",
        area: "finan",
        descricao: "Análise de fluxo de caixa, relatórios de desempenho e projeções.",
        requisitos: "Superior em Finanças, Economia ou Contábeis."
    },


    // 3. Marketing
    {
        id: 7,
        cargo: "Auxiliar de Marketing",
        empresa: "Carajás Digital",
        local: "Canaã dos Carajás - PA",
        modalidade: "Remoto",
        area: "market",
        descricao: "Apoio em campanhas publicitárias e pesquisas de mercado.",
        requisitos: "Cursando Marketing ou Comunicação."
    },

    {
        id: 8,
        cargo: "Social Media",
        empresa: "Brejo Criativo",
        local: "Bananeiras - PB",
        modalidade: "Remoto",
        area: "market",
        descricao: "Criação de conteúdo, gestão de redes sociais e relatórios de métricas.",
        requisitos: "Domínio de Canva/Photoshop e redes sociais."
    },

    {
        id: 9,
        cargo: "Analista de Marketing",
        empresa: "BH Mídia",
        local: "Belo Horizonte - MG",
        modalidade: "Híbrido",
        area: "market",
        descricao: "Gestão de tráfego pago, e-mail marketing e estratégias digitais.",
        requisitos: "Experiência prévia em marketing digital."
    },


    // 4. Mecânica
    {
        id: 10,
        cargo: "Mecânico Diesel",
        empresa: "Oficina Eldorado",
        local: "Eldorado dos Carajás - PA",
        modalidade: "Presencial",
        area: "mec",
        descricao: "Manutenção preventiva e corretiva em frota pesada e motores diesel.",
        requisitos: "Curso técnico em mecânica e CNH."
    },

    {
        id: 11,
        cargo: "Mecânico Automotivo",
        empresa: "Nordeste Auto",
        local: "Cuitegi - PB",
        modalidade: "Presencial",
        area: "mec",
        descricao: "Diagnóstico e reparo de sistemas mecânicos de veículos leves.",
        requisitos: "Experiência em oficina automotiva."
    },

    {
        id: 12,
        cargo: "Auxiliar de Mecânico",
        empresa: "Catarina Motors",
        local: "Joinville - SC",
        modalidade: "Presencial",
        area: "mec",
        descricao: "Auxílio na montagem/desmontagem de peças e organização de ferramentas.",
        requisitos: "Desejo de aprender mecânica automotiva."
    },


    // 5. Elétrica
    {
        id: 13,
        cargo: "Eletricista Predial",
        empresa: "Tucuruí Energia",
        local: "Tucuruí - PA",
        modalidade: "Presencial",
        area: "eletr",
        descricao: "Instalações elétricas residenciais e comerciais, manutenção de quadros.",
        requisitos: "Curso técnico de Eletricista com NR10."
    },

    {
        id: 14,
        cargo: "Eletricista Industrial",
        empresa: "Sapé Volts",
        local: "Sapé - PB",
        modalidade: "Presencial",
        area: "eletr",
        descricao: "Manutenção de motores elétricos, comandos e painéis industriais.",
        requisitos: "Experiência em ambiente industrial e NR10/NR35."
    },

    {
        id: 15,
        cargo: "Técnico Eletricista",
        empresa: "Paraná Eletro",
        local: "Curitiba - PR",
        modalidade: "Presencial",
        area: "eletr",
        descricao: "Inspeção e reparo de redes elétricas de baixa e média tensão.",
        requisitos: "Formação técnica completa."
    },


    // 6. Construção Civil / Pedreiro
    {
        id: 16,
        cargo: "Pedreiro",
        empresa: "Mineração & Obras",
        local: "Curionópolis - PA",
        modalidade: "Presencial",
        area: "pedreiro",
        descricao: "Execução de alvenaria, estruturas, reboco e assentamento de pisos.",
        requisitos: "Experiência comprovada na função."
    },

    {
        id: 17,
        cargo: "Servente de Pedreiro",
        empresa: "Brejo Construtora",
        local: "Alagoa Grande - PB",
        modalidade: "Presencial",
        area: "pedreiro",
        descricao: "Preparo de massas, transporte de materiais e auxílio geral na obra.",
        requisitos: "Disposição para trabalho braçal."
    },

    {
        id: 18,
        cargo: "Pedreiro de Acabamento",
        empresa: "Ceará Obras",
        local: "Fortaleza - CE",
        modalidade: "Presencial",
        area: "pedreiro",
        descricao: "Assentamento de porcelanato, revestimentos finos e detalhes de fachada.",
        requisitos: "Experiência com acabamentos de alto padrão."
    },


    // 7. Motorista
    {
        id: 19,
        cargo: "Motorista de Caminhão",
        empresa: "Agro Redenção",
        local: "Redenção - PA",
        modalidade: "Presencial",
        area: "motor",
        descricao: "Transporte de cargas agrícolas e viagens intermunicipais.",
        requisitos: "CNH categoria E e experiência em estradas."
    },

    {
        id: 20,
        cargo: "Motorista Entregador",
        empresa: "Paraíba Logística",
        local: "Araçagi - PB",
        modalidade: "Presencial",
        area: "motor",
        descricao: "Entregas urbanas de mercadorias para clientes locais.",
        requisitos: "CNH B ou C e conhecimento da região."
    },

    {
        id: 21,
        cargo: "Motorista Categoria D",
        empresa: "Goiás Transportes",
        local: "Goiânia - GO",
        modalidade: "Presencial",
        area: "motor",
        descricao: "Transporte de passageiros e equipes operacionais.",
        requisitos: "CNH D com curso EAR aprovado."
    },


    // 8. Vendas
    {
        id: 22,
        cargo: "Vendedor Interno",
        empresa: "Araguaia Varejo",
        local: "Xinguara - PA",
        modalidade: "Presencial",
        area: "vended",
        descricao: "Atendimento ao cliente em loja, negociação e fechamento de vendas.",
        requisitos: "Boa comunicação e experiência em vendas."
    },

    {
        id: 23,
        cargo: "Vendedora de Loja",
        empresa: "Guarabira Moda",
        local: "Guarabira - PB",
        modalidade: "Presencial",
        area: "vended",
        descricao: "Atendimento no setor do vestuário e organização de vitrines.",
        requisitos: "Gosto por atendimento ao público."
    },

    {
        id: 24,
        cargo: "Vendedor Externo",
        empresa: "Campinas Distribuidora",
        local: "Campinas - SP",
        modalidade: "Híbrido",
        area: "vended",
        descricao: "Prospecção de novos clientes e visitas comerciais na região.",
        requisitos: "Veículo próprio e disponibilidade para viagens."
    },


    // 9. Recepção
    {
        id: 25,
        cargo: "Recepcionista",
        empresa: "Belém Saúde",
        local: "Belém - PA",
        modalidade: "Presencial",
        area: "recep",
        descricao: "Recepção de pacientes, confirmação de consultas e atendimento telefônico.",
        requisitos: "Ensino Médio completo e simpatia."
    },

    {
        id: 26,
        cargo: "Recepcionista Bilíngue",
        empresa: "João Pessoa Hotéis",
        local: "João Pessoa - PB",
        modalidade: "Presencial",
        area: "recep",
        descricao: "Check-in e check-out de hóspedes nacionais e internacionais.",
        requisitos: "Inglês intermediário/avançado."
    },

    {
        id: 27,
        cargo: "Recepcionista de Consultório",
        empresa: "Uberlândia Clínica",
        local: "Uberlândia - MG",
        modalidade: "Presencial",
        area: "recep",
        descricao: "Organização de prontuários e agendamentos médicos.",
        requisitos: "Conhecimento de informática básica."
    },


    // 10. Serviços Domésticos / Diarista
    {
        id: 28,
        cargo: "Diarista",
        empresa: "Residência Tapajós",
        local: "Santarém - PA",
        modalidade: "Presencial",
        area: "domest",
        descricao: "Limpeza residencial completa, higienização e organização.",
        requisitos: "Referências de trabalhos anteriores."
    },

    {
        id: 29,
        cargo: "Doméstica",
        empresa: "Casa Brejeira",
        local: "Pirpirituba - PB",
        modalidade: "Presencial",
        area: "domest",
        descricao: "Cuidar dos afazeres da casa, lavar, passar e cozinhar o trivial.",
        requisitos: "Experiência em carteira."
    },

    {
        id: 30,
        cargo: "Diarista / Passadeira",
        empresa: "Floripa Serviços",
        local: "Florianópolis - SC",
        modalidade: "Presencial",
        area: "domest",
        descricao: "Serviço de limpeza semanal e cuidado com roupas finas.",
        requisitos: "Pontualidade e zelo."
    },


    // 11. Cozinha
    {
        id: 31,
        cargo: "Cozinheiro",
        empresa: "Sabor de Marabá",
        local: "Marabá - PA",
        modalidade: "Presencial",
        area: "cozin",
        descricao: "Preparo de pratos à la carte e controle do estoque da cozinha.",
        requisitos: "Experiência em cozinha profissional."
    },

    {
        id: 32,
        cargo: "Auxiliar de Cozinha",
        empresa: "Restaurante Rainha",
        local: "Rainha - PB",
        modalidade: "Presencial",
        area: "cozin",
        descricao: "Higienização de alimentos, corte de insumos e organização do espaço.",
        requisitos: "Desejo de atuar na área gastronômica."
    },

    {
        id: 33,
        cargo: "Cozinheira Geral",
        empresa: "Ceará Gastronomia",
        local: "Juazeiro do Norte - CE",
        modalidade: "Presencial",
        area: "cozin",
        descricao: "Preparo de refeições coletivas e comida regional.",
        requisitos: "Experiência em restaurantes regionais."
    },


    // 12. Garçom / Atendimento Restaurante
    {
        id: 34,
        cargo: "Garçom",
        empresa: "Churrascaria Carajás",
        local: "Parauapebas - PA",
        modalidade: "Presencial",
        area: "garç",
        descricao: "Atendimento a mesas, anotação de pedidos e servimento de pratos.",
        requisitos: "Experiência no setor de alimentos e bebidas."
    },

    {
        id: 35,
        cargo: "Garçonete",
        empresa: "Bar do Brejo",
        local: "Guarabira - PB",
        modalidade: "Presencial",
        area: "garç",
        descricao: "Atendimento rápido em lanchonete e bar de centro.",
        requisitos: "Simpatia e agilidade."
    },

    {
        id: 36,
        cargo: "Garçom / Atendente",
        empresa: "Niterói Bistrô",
        local: "Niterói - RJ",
        modalidade: "Presencial",
        area: "garç",
        descricao: "Servir cafés especiais, lanches e atendimento no balcão.",
        requisitos: "Interesse por café e boa comunicação."
    },


    // 13. Segurança / Vigilância
    {
        id: 37,
        cargo: "Vigilante",
        empresa: "Norte Proteção",
        local: "Tucuruí - PA",
        modalidade: "Presencial",
        area: "segur",
        descricao: "Ronda patrimonial e controle de acesso a instalações.",
        requisitos: "Curso de Formação de Vigilante atualizado."
    },

    {
        id: 38,
        cargo: "Segurança Patrimonial",
        empresa: "Paraíba Alertas",
        local: "Sapé - PB",
        modalidade: "Presencial",
        area: "segur",
        descricao: "Monitoramento presencial e fiscalização de entrada e saída.",
        requisitos: "Experiência na área de segurança privada."
    },

    {
        id: 39,
        cargo: "Vigia Noturno",
        empresa: "Paulista Segurança",
        local: "Ribeirão Preto - SP",
        modalidade: "Presencial",
        area: "segur",
        descricao: "Inspeção de dependências durante o período noturno.",
        requisitos: "Disponibilidade para escala 12x36."
    },


    // 14. Operação de Caixa
    {
        id: 40,
        cargo: "Operador de Caixa",
        empresa: "Supermercado Sul do Pará",
        local: "Redenção - PA",
        modalidade: "Presencial",
        area: "caixa",
        descricao: "Passagem de mercadorias no PDV, recebimento de pagamentos e sangria.",
        requisitos: "Ensino Médio completo."
    },

    {
        id: 41,
        cargo: "Operadora de Caixa",
        empresa: "Guarabira Market",
        local: "Guarabira - PB",
        modalidade: "Presencial",
        area: "caixa",
        descricao: "Abertura e fechamento de caixa em supermercado de médio porte.",
        requisitos: "Atenção a números e boa digitação."
    },

    {
        id: 42,
        cargo: "Caixa / Atendente",
        empresa: "Contagem Checkout",
        local: "Contagem - MG",
        modalidade: "Presencial",
        area: "caixa",
        descricao: "Registro de produtos e apoio ao cliente no checkout.",
        requisitos: "Experiência prévia na função."
    },


    // 15. Estoque / Logística
    {
        id: 43,
        cargo: "Estoquista",
        empresa: "Logística Carajás",
        local: "Canaã dos Carajás - PA",
        modalidade: "Presencial",
        area: "estoq",
        descricao: "Conferência, organização e estocagem de produtos recebidos.",
        requisitos: "Agilidade física e organização."
    },

    {
        id: 44,
        cargo: "Almoxarife",
        empresa: "Alagoa Distribuição",
        local: "Alagoa Grande - PB",
        modalidade: "Presencial",
        area: "estoq",
        descricao: "Controle de entrada e saída de peças através de sistema interno.",
        requisitos: "Conhecimento em informática básica."
    },

    {
        id: 45,
        cargo: "Auxiliar de Estoque",
        empresa: "Maringá Log",
        local: "Maringá - PR",
        modalidade: "Presencial",
        area: "estoq",
        descricao: "Separação de pedidos (picking) e embalagem para despacho.",
        requisitos: "Ensino Médio completo."
    },


    // 16. Serviços Gerais / Limpeza
    {
        id: 46,
        cargo: "Auxiliar de Limpeza",
        empresa: "Eldorado Clean",
        local: "Eldorado dos Carajás - PA",
        modalidade: "Presencial",
        area: "limpeza",
        descricao: "Limpeza de prédios comerciais, escritórios e sanitários.",
        requisitos: "Disposição para trabalho em equipe."
    },

    {
        id: 47,
        cargo: "Serviços Gerais",
        empresa: "Paraíba Facilities",
        local: "Cuitegi - PB",
        modalidade: "Presencial",
        area: "limpeza",
        descricao: "Manutenção da limpeza, pequenos reparos e apoio operacional.",
        requisitos: "Experiência em limpeza predial."
    },

    {
        id: 48,
        cargo: "Auxiliar de Limpeza Hospitalar",
        empresa: "Blumenau Saúde",
        local: "Blumenau - SC",
        modalidade: "Presencial",
        area: "limpeza",
        descricao: "Higienização e desinfecção de ambientes de saúde.",
        requisitos: "Curso ou experiência em higienização hospitalar."
    },


    // 17. TI e Informática
    {
        id: 49,
        cargo: "Técnico em Informática",
        empresa: "Santarém Tech",
        local: "Santarém - PA",
        modalidade: "Presencial",
        area: "inform",
        descricao: "Manutenção de microcomputadores, formatação e instalação de redes.",
        requisitos: "Curso técnico em TI ou equivalente."
    },

    {
        id: 50,
        cargo: "Suporte Técnico",
        empresa: "Brejo Informática",
        local: "Bananeiras - PB",
        modalidade: "Híbrido",
        area: "inform",
        descricao: "Atendimento Helpdesk nível 1 para resolução de problemas de software.",
        requisitos: "Conhecimento em Windows e redes."
    },

    {
        id: 51,
        cargo: "Técnico de TI Jr",
        empresa: "Santos Digital",
        local: "Santos - SP",
        modalidade: "Remoto",
        area: "inform",
        descricao: "Configuração de roteadores, backups e suporte aos usuários.",
        requisitos: "Lógica de sistemas e redes básicas."
    },


    // 18. Beleza e Cabelo
    {
        id: 52,
        cargo: "Cabeleireiro",
        empresa: "Studio Belém",
        local: "Belém - PA",
        modalidade: "Presencial",
        area: "cabel",
        descricao: "Cortes masculinos/femininos, escovas e tratamentos capilares.",
        requisitos: "Curso profissionalizante e prática."
    },

    {
        id: 53,
        cargo: "Barbeiro",
        empresa: "Barbearia Guarabira",
        local: "Guarabira - PB",
        modalidade: "Presencial",
        area: "cabel",
        descricao: "Cortes modernos na tesoura/máquina e modelagem de barba.",
        requisitos: "Domínio de técnicas de degradê."
    },

    {
        id: 54,
        cargo: "Cabeleireira / Escovista",
        empresa: "Anápolis Beauty",
        local: "Anápolis - GO",
        modalidade: "Presencial",
        area: "cabel",
        descricao: "Lavagem, escovação e aplicação de produtos em salão de beleza.",
        requisitos: "Experiência como assistente de salão."
    },


    // 19. Cuidados / Babá
    {
        id: 55,
        cargo: "Babá",
        empresa: "Família Xinguara",
        local: "Xinguara - PA",
        modalidade: "Presencial",
        area: "bab",
        descricao: "Cuidados com rotina infantil, alimentação e atividades recreativas.",
        requisitos: "Experiência comprovada com crianças."
    },

    {
        id: 56,
        cargo: "Cuidadora de Idosos",
        empresa: "Cuidado Paraibano",
        local: "João Pessoa - PB",
        modalidade: "Presencial",
        area: "bab",
        descricao: "Acompanhamento diário, administração de medicamentos e higiene.",
        requisitos: "Curso de Cuidador de Idosos."
    },

    {
        id: 57,
        cargo: "Babá / Cuidadora",
        empresa: "Sobral Famílias",
        local: "Sobral - CE",
        modalidade: "Presencial",
        area: "bab",
        descricao: "Auxílio no cuidado de crianças no período vespertino.",
        requisitos: "Paciência e boas referências."
    },


    // 20. Atendimento Comercial
    {
        id: 58,
        cargo: "Atendente de Loja",
        empresa: "Marabá Shopping",
        local: "Marabá - PA",
        modalidade: "Presencial",
        area: "atend",
        descricao: "Recepção de clientes em loja de shopping, dúvidas e vendas.",
        requisitos: "Disponibilidade para escala 6x1."
    },

    {
        id: 59,
        cargo: "Atendente Comercial",
        empresa: "Central Guarabira",
        local: "Guarabira - PB",
        modalidade: "Presencial",
        area: "atend",
        descricao: "Atendimento telefônico e presencial para balcão de serviços.",
        requisitos: "Ensino Médio completo."
    },

    {
        id: 60,
        cargo: "Atendente de Telemarketing",
        empresa: "Juiz de Fora Call",
        local: "Juiz de Fora - MG",
        modalidade: "Remoto",
        area: "atend",
        descricao: "Atendimento receptivo a clientes de empresa de telefonia.",
        requisitos: "Boa dicção e computador próprio."
    }
];


// ==========================================
// 3. BANCO DE DADOS LOCAL
// PROFISSIONAIS - 20 ÁREAS X 3 OPÇÕES
// ==========================================
const listaProfissionais = [

    // 1. Advocacia
    {
        id: 101,
        nome: "Juliana Torres",
        profissao: "Advogada",
        especialidades: "Trabalhista, Cível",
        local: "Parauapebas - PA",
        disponibilidade: "PJ / Autônomo",
        biografia: "6 anos de experiência em direito trabalhista e consultoria preventiva para PMEs.",
        contato: "juliana.torres@email.com"
    },

    {
        id: 102,
        nome: "Dr. Henrique Lopes",
        profissao: "Advogado",
        especialidades: "Empresarial, Tributário",
        local: "Guarabira - PB",
        disponibilidade: "PJ",
        biografia: "Especialista em planejamento tributário e reestruturação contratual.",
        contato: "henrique.lopes@email.com"
    },

    {
        id: 103,
        nome: "Amanda Vieira",
        profissao: "Advogada",
        especialidades: "Família, Consumidor",
        local: "São Paulo - SP",
        disponibilidade: "PJ / Autônomo",
        biografia: "Atuação voltada para mediação de conflitos familiares e causas cíveis.",
        contato: "amanda.vieira@email.com"
    },


    // 2. Vendas
    {
        id: 104,
        nome: "Thiago Cunha",
        profissao: "Vendedor",
        especialidades: "Varejo, Metas, Abordagem",
        local: "Marabá - PA",
        disponibilidade: "CLT",
        biografia: "Profissional focado no alcance de metas de vendas presenciais e pós-venda.",
        contato: "thiago.cunha@email.com"
    },

    {
        id: 105,
        nome: "Leticia Prado",
        profissao: "Vendedora",
        especialidades: "Representação Comercial, Atacado",
        local: "Sapé - PB",
        disponibilidade: "CLT / PJ",
        biografia: "Representante comercial com ampla carteira de clientes no setor de vestuário.",
        contato: "leticia.prado@email.com"
    },

    {
        id: 106,
        nome: "Diego Fernandes",
        profissao: "Vendedor",
        especialidades: "Loja, E-commerce",
        local: "Belo Horizonte - MG",
        disponibilidade: "CLT",
        biografia: "Experiência em vendas multicanais e atendimento ao cliente.",
        contato: "diego.fernandes@email.com"
    },


    // 3. Motorista
    {
        id: 107,
        nome: "Wagner Souza",
        profissao: "Motorista",
        especialidades: "Categoria D, Entregas",
        local: "Belém - PA",
        disponibilidade: "CLT / Autônomo",
        biografia: "Motorista responsável com vasta experiência em frotas urbanas e rodoviárias.",
        contato: "wagner.souza@email.com"
    },

    {
        id: 108,
        nome: "Carlos Alberto",
        profissao: "Motorista",
        especialidades: "Categoria E, Cargas",
        local: "Guarabira - PB",
        disponibilidade: "CLT",
        biografia: "Experiência com transporte de cargas e viagens de longa distância.",
        contato: "carlos.alberto@email.com"
    },

    {
        id: 109,
        nome: "Roberto Lima",
        profissao: "Motorista",
        especialidades: "Executivo, Categoria B",
        local: "Campinas - SP",
        disponibilidade: "Autônomo",
        biografia: "Atuação com transporte executivo e atendimento personalizado.",
        contato: "roberto.lima@email.com"
    },


    // 4. Elétrica
    {
        id: 110,
        nome: "João Eletricista",
        profissao: "Eletricista",
        especialidades: "Predial, Residencial",
        local: "Tucuruí - PA",
        disponibilidade: "Autônomo",
        biografia: "Instalações e manutenções elétricas residenciais e comerciais.",
        contato: "joao.eletricista@email.com"
    },

    {
        id: 111,
        nome: "Marcos Silva",
        profissao: "Eletricista Industrial",
        especialidades: "Painéis, Motores",
        local: "Sapé - PB",
        disponibilidade: "CLT / PJ",
        biografia: "Manutenção industrial e montagem de painéis elétricos.",
        contato: "marcos.silva@email.com"
    },

    {
        id: 112,
        nome: "Paulo Henrique",
        profissao: "Eletricista",
        especialidades: "Baixa Tensão, Instalações",
        local: "Curitiba - PR",
        disponibilidade: "Autônomo",
        biografia: "Profissional especializado em instalações elétricas e manutenção.",
        contato: "paulo.henrique@email.com"
    },


    // 5. Construção
    {
        id: 113,
        nome: "José Carlos",
        profissao: "Pedreiro",
        especialidades: "Alvenaria, Acabamento",
        local: "Curionópolis - PA",
        disponibilidade: "Autônomo",
        biografia: "Experiência em construção residencial, alvenaria e acabamento.",
        contato: "jose.carlos@email.com"
    },

    {
        id: 114,
        nome: "Antônio Silva",
        profissao: "Pedreiro",
        especialidades: "Reformas, Pisos",
        local: "Alagoa Grande - PB",
        disponibilidade: "Autônomo / PJ",
        biografia: "Atuação em reformas residenciais e comerciais.",
        contato: "antonio.silva@email.com"
    },

    {
        id: 115,
        nome: "Rafael Gomes",
        profissao: "Pedreiro",
        especialidades: "Acabamento, Porcelanato",
        local: "Fortaleza - CE",
        disponibilidade: "Autônomo",
        biografia: "Especialista em acabamentos e revestimentos de alto padrão.",
        contato: "rafael.gomes@email.com"
    },


    // 6. Recepção
    {
        id: 116,
        nome: "Fernanda Alves",
        profissao: "Recepcionista",
        especialidades: "Atendimento, Organização",
        local: "Belém - PA",
        disponibilidade: "CLT",
        biografia: "Experiência em recepção, atendimento telefônico e organização.",
        contato: "fernanda.alves@email.com"
    },

    {
        id: 117,
        nome: "Camila Santos",
        profissao: "Recepcionista",
        especialidades: "Hotelaria, Atendimento",
        local: "João Pessoa - PB",
        disponibilidade: "CLT",
        biografia: "Experiência em hotelaria e atendimento ao público.",
        contato: "camila.santos@email.com"
    },

    {
        id: 118,
        nome: "Marina Oliveira",
        profissao: "Recepcionista",
        especialidades: "Clínicas, Agendamento",
        local: "Uberlândia - MG",
        disponibilidade: "CLT / PJ",
        biografia: "Atuação em clínicas médicas e organização de agendas.",
        contato: "marina.oliveira@email.com"
    },


    // 7. Serviços Domésticos
    {
        id: 119,
        nome: "Maria José",
        profissao: "Diarista",
        especialidades: "Limpeza, Organização",
        local: "Santarém - PA",
        disponibilidade: "Autônomo",
        biografia: "Experiência com limpeza e organização residencial.",
        contato: "maria.jose@email.com"
    },

    {
        id: 120,
        nome: "Ana Paula",
        profissao: "Doméstica",
        especialidades: "Casa Completa, Cozinha",
        local: "Pirpirituba - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Experiência com rotina completa de residências familiares.",
        contato: "ana.paula@email.com"
    },

    {
        id: 121,
        nome: "Cláudia Mendes",
        profissao: "Diarista",
        especialidades: "Limpeza Pós-Obra, Organização",
        local: "Florianópolis - SC",
        disponibilidade: "Autônomo",
        biografia: "Especializada em limpeza pesada e organização de imóveis.",
        contato: "claudia.mendes@email.com"
    },


    // 8. Estoque / Logística
    {
        id: 122,
        nome: "Leandro Pinto",
        profissao: "Estoquista",
        especialidades: "Estoque, Separação",
        local: "Canaã dos Carajás - PA",
        disponibilidade: "CLT",
        biografia: "Experiência em armazenagem e organização de prateleiras.",
        contato: "leandro.pinto@email.com"
    },

    {
        id: 123,
        nome: "Marcelo Freitas",
        profissao: "Almoxarife",
        especialidades: "Controle de Estoque, Logística",
        local: "Araçagi - PB",
        disponibilidade: "CLT / PJ",
        biografia: "Gestão do fluxo de insumos industriais com uso de coletor de dados.",
        contato: "marcelo.freitas@email.com"
    },

    {
        id: 124,
        nome: "Rodrigo Santos",
        profissao: "Estoquista",
        especialidades: "Carga e Descarga",
        local: "Joinville - SC",
        disponibilidade: "CLT",
        biografia: "Movimentação física de materiais e arrumação de depósitos.",
        contato: "rodrigo.santos@email.com"
    },


    // 9. Informática / TI
    {
        id: 125,
        nome: "Felipe Andrade",
        profissao: "Técnico em Informática",
        especialidades: "Formatação, Redes, Hardware",
        local: "Xinguara - PA",
        disponibilidade: "CLT / PJ / Autônomo",
        biografia: "Montagem, limpeza e diagnóstico de falhas técnicas em microcomputadores.",
        contato: "felipe.andrade@email.com"
    },

    {
        id: 126,
        nome: "Alex Junior",
        profissao: "Suporte Técnico",
        especialidades: "Help Desk, Manutenção",
        local: "Bananeiras - PB",
        disponibilidade: "CLT / PJ",
        biografia: "Atendimento a usuários para correção de erros em sistemas operacionais.",
        contato: "alex.junior@email.com"
    },

    {
        id: 127,
        nome: "Douglas Nunes",
        profissao: "Técnico em Informática",
        especialidades: "Impressoras, Cabeamento",
        local: "Uberlândia - MG",
        disponibilidade: "Autônomo",
        biografia: "Instalação de redes cabeadas e manutenção em periféricos.",
        contato: "douglas.nunes@email.com"
    },


    // 10. Design
    {
        id: 128,
        nome: "Isabela Melo",
        profissao: "Designer Gráfica",
        especialidades: "Logo, Social Media, Canva",
        local: "Curionópolis - PA",
        disponibilidade: "PJ / Autônomo",
        biografia: "Criação de marcas, artes para redes sociais e materiais gráficos impressos.",
        contato: "isabela.melo@email.com"
    },

    {
        id: 129,
        nome: "Victor Hugo",
        profissao: "Designer",
        especialidades: "Embalagens, Identidade Visual",
        local: "Guarabira - PB",
        disponibilidade: "PJ",
        biografia: "Projetos de identidade corporativa e design focado no posicionamento.",
        contato: "victor.hugo@email.com"
    },

    {
        id: 130,
        nome: "Luana Cardoso",
        profissao: "Designer Gráfica",
        especialidades: "Posts, Banners",
        local: "Santos - SP",
        disponibilidade: "Autônomo / PJ",
        biografia: "Desenvolvimento rápido de peças visuais promocionais para e-commerce.",
        contato: "luana.cardoso@email.com"
    },


    // 11. Marketing Digital / Social Media
    {
        id: 131,
        nome: "Natália Ferreira",
        profissao: "Social Media",
        especialidades: "Tráfego, Conteúdo",
        local: "Parauapebas - PA",
        disponibilidade: "PJ / CLT",
        biografia: "Planejamento editorial de conteúdos para engajamento e conversão no Instagram.",
        contato: "natalia.ferreira@email.com"
    },

    {
        id: 132,
        nome: "Caio Oliveira",
        profissao: "Analista de Marketing",
        especialidades: "Tráfego Pago, Google Ads",
        local: "João Pessoa - PB",
        disponibilidade: "PJ",
        biografia: "Gestão de anúncios pagos voltados para captação de novos leads.",
        contato: "caio.oliveira@email.com"
    },

    {
        id: 133,
        nome: "Debora Luz",
        profissao: "Social Media",
        especialidades: "Copywriting, Reels",
        local: "Florianópolis - SC",
        disponibilidade: "PJ / Autônomo",
        biografia: "Especialista em vídeos curtos e redação persuasiva para pequenas empresas.",
        contato: "debora.luz@email.com"
    },


    // 12. Psicologia
    {
        id: 134,
        nome: "Dra. Renata Bastos",
        profissao: "Psicóloga",
        especialidades: "Ansiedade, TCC",
        local: "Belém - PA",
        disponibilidade: "PJ / Autônomo",
        biografia: "Atendimento clínico cognitivo-comportamental para jovens e adultos.",
        contato: "renata.bastos@email.com"
    },

    {
        id: 135,
        nome: "Paula Mendes",
        profissao: "Psicóloga",
        especialidades: "Terapia Online, Casal",
        local: "Pirpirituba - PB",
        disponibilidade: "PJ",
        biografia: "Acompanhamento psicológico remoto com foco em relacionamentos e estresse.",
        contato: "paula.mendes@email.com"
    },

    {
        id: 136,
        nome: "Dr. Luiz Carvalho",
        profissao: "Psicólogo",
        especialidades: "Infantil, Orientação",
        local: "Juiz de Fora - MG",
        disponibilidade: "PJ / Autônomo",
        biografia: "Avaliação comportamental e acompanhamento psicopedagógico infantil.",
        contato: "luiz.carvalho@email.com"
    },


    // 13. Limpeza / Diarista
    {
        id: 137,
        nome: "Rosa Maria",
        profissao: "Diarista",
        especialidades: "Faxina Pesada, Organização",
        local: "Marabá - PA",
        disponibilidade: "Autônomo",
        biografia: "Limpeza profunda de ambientes residenciais com agilidade e dedicação.",
        contato: "rosa.maria@email.com"
    },

    {
        id: 138,
        nome: "Conceição Silva",
        profissao: "Doméstica",
        especialidades: "Casa Completa, Passar Roupa",
        local: "Guarabira - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Manutenção e rotina diária para residências familiares.",
        contato: "conceicao.silva@email.com"
    },

    {
        id: 139,
        nome: "Fatima Santos",
        profissao: "Diarista",
        especialidades: "Limpeza Pós-Obra, Cozinha",
        local: "Niterói - RJ",
        disponibilidade: "Autônomo",
        biografia: "Remoção de resíduos leves e organização geral de imóveis novos.",
        contato: "fatima.santos@email.com"
    },


    // 14. Gastronomia / Cozinha
    {
        id: 140,
        nome: "Chef Marcos",
        profissao: "Cozinheiro",
        especialidades: "Comida Brasileira, Churrasco",
        local: "Redenção - PA",
        disponibilidade: "CLT / PJ",
        biografia: "Preparo de pratos típicos, grelhados e liderança de praças de cozinha.",
        contato: "chef.marcos@email.com"
    },

    {
        id: 141,
        nome: "Lúcia Andrade",
        profissao: "Cozinheira",
        especialidades: "Caseira, Marmitas",
        local: "Sapé - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Cozinheira experiente na produção de refeições diárias e marmiteiros.",
        contato: "lucia.andrade@email.com"
    },

    {
        id: 142,
        nome: "Antônio Neto",
        profissao: "Cozinheiro",
        especialidades: "Restaurante, Massas",
        local: "Juazeiro do Norte - CE",
        disponibilidade: "CLT",
        biografia: "Agilidade na montagem de pratos quentes em horários de pico.",
        contato: "antonio.neto@email.com"
    },


    // 15. Serviço de Salão / Garçom
    {
        id: 143,
        nome: "Ricardo Lima",
        profissao: "Garçom",
        especialidades: "Eventos, Bar, Atendimento",
        local: "Canaã dos Carajás - PA",
        disponibilidade: "CLT / Autônomo / Freelancer",
        biografia: "Atendimento de banquetes, festas e restaurantes de grande movimento.",
        contato: "ricardo.lima@email.com"
    },

    {
        id: 144,
        nome: "Sueli Costa",
        profissao: "Garçonete",
        especialidades: "Restaurante, Buffet",
        local: "Alagoa Grande - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Serviço de mesa cuidadoso e acolhimento dos clientes.",
        contato: "sueli.costa@email.com"
    },

    {
        id: 145,
        nome: "Maicon Douglas",
        profissao: "Garçom",
        especialidades: "Barman, Drinks",
        local: "Ribeirão Preto - SP",
        disponibilidade: "Autônomo",
        biografia: "Preparo de coquetéis básicos e serviço de bar em eventos.",
        contato: "maicon.douglas@email.com"
    },


    // 16. Barbearia / Cabelo
    {
        id: 146,
        nome: "Rodrigo Cortes",
        profissao: "Barbeiro",
        especialidades: "Degradê, Barba, Tesoura",
        local: "Tucuruí - PA",
        disponibilidade: "Autônomo / PJ",
        biografia: "Cortes masculinos modernos, alinhamento de barba e toalha quente.",
        contato: "rodrigo.cortes@email.com"
    },

    {
        id: 147,
        nome: "Viviane Lopes",
        profissao: "Cabeleireira",
        especialidades: "Coloração, Cortes Femininos",
        local: "Guarabira - PB",
        disponibilidade: "Autônomo",
        biografia: "Transformação capilar, mechas, luzes e hidratação.",
        contato: "viviane.lopes@email.com"
    },

    {
        id: 148,
        nome: "Diego Barber",
        profissao: "Barbeiro",
        especialidades: "Visagismo, Pigmentação",
        local: "Anápolis - GO",
        disponibilidade: "Autônomo / PJ",
        biografia: "Atendimento personalizado e técnicas atualizadas de barbearia.",
        contato: "diego.barber@email.com"
    },


    // 17. Estética / Manicure
    {
        id: 149,
        nome: "Patrícia Unhas",
        profissao: "Manicure",
        especialidades: "Alongamento, Gel",
        local: "Santarém - PA",
        disponibilidade: "Autônomo",
        biografia: "Especialista na aplicação e manutenção de unhas de gel e fibra de vidro.",
        contato: "patricia.unhas@email.com"
    },

    {
        id: 150,
        nome: "Joyce Kelly",
        profissao: "Manicure e Pedicure",
        especialidades: "Esmaltação, Spa dos Pés",
        local: "Pirpirituba - PB",
        disponibilidade: "Autônomo",
        biografia: "Cuidado e higienização das unhas com materiais esterilizados.",
        contato: "joyce.kelly@email.com"
    },

    {
        id: 151,
        nome: "Daiane Santos",
        profissao: "Manicure",
        especialidades: "Blindagem, Nail Art",
        local: "Blumenau - SC",
        disponibilidade: "Autônomo",
        biografia: "Decorações manuais e fortalecimento para unhas naturais.",
        contato: "daiane.santos@email.com"
    },


    // 18. Cuidado de Pessoas / Babá
    {
        id: 152,
        nome: "Elisabete Ramos",
        profissao: "Cuidadora de Idosos",
        especialidades: "Acamados, Medicação",
        local: "Xinguara - PA",
        disponibilidade: "CLT / Autônomo",
        biografia: "Acompanhamento de idosos com restrições de mobilidade ou Alzheimer.",
        contato: "elisabete.ramos@email.com"
    },

    {
        id: 153,
        nome: "Neide Oliveira",
        profissao: "Babá",
        especialidades: "Cuidados Infantis, Período Noturno",
        local: "Cuitegi - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Cuidado com recém-nascidos e crianças pequenas com atenção total.",
        contato: "neide.oliveira@email.com"
    },

    {
        id: 154,
        nome: "Marlene Dias",
        profissao: "Cuidadora de Idosos",
        especialidades: "Acompanhamento, Higiene",
        local: "Sobral - CE",
        disponibilidade: "CLT / Autônomo",
        biografia: "Atenciosa com alimentação, passeios e rotinas de medicação de idosos.",
        contato: "marlene.dias@email.com"
    },


    // 19. Serviços Gerais
    {
        id: 155,
        nome: "José Francisco",
        profissao: "Auxiliar de Limpeza",
        especialidades: "Predial, Industrial",
        local: "Curionópolis - PA",
        disponibilidade: "CLT",
        biografia: "Operação de lavadoras industriais e manutenção de pátios.",
        contato: "jose.francisco@email.com"
    },

    {
        id: 156,
        nome: "Cleide Santos",
        profissao: "Serviços Gerais",
        especialidades: "Conservação, Copa",
        local: "Araçagi - PB",
        disponibilidade: "CLT / Autônomo",
        biografia: "Organização de escritórios, serviços de copa e higienização diária.",
        contato: "cleide.santos@email.com"
    },

    {
        id: 157,
        nome: "Valdir Pereira",
        profissao: "Auxiliar de Serviços Gerais",
        especialidades: "Condomínio, Área Externa",
        local: "Maringá - PR",
        disponibilidade: "CLT",
        biografia: "Cuidado de áreas comuns residenciais, recolhimento de lixo e varrição.",
        contato: "valdir.pereira@email.com"
    },


    // 20. Construção e Reformas / Pintor / Encanador
    {
        id: 158,
        nome: "Seu Jorge",
        profissao: "Encanador",
        especialidades: "Vazamentos, Caixas d'Água",
        local: "Eldorado dos Carajás - PA",
        disponibilidade: "Autônomo",
        biografia: "Localização de vazamentos ocultos e manutenção hidráulica predial.",
        contato: "seu.jorge@email.com"
    },

    {
        id: 159,
        nome: "Claudio Pintor",
        profissao: "Pintor",
        especialidades: "Grafiato, Textura, Pva",
        local: "Guarabira - PB",
        disponibilidade: "Autônomo / PJ",
        biografia: "Pintura residencial interna e externa com acabamento de precisão.",
        contato: "claudio.pintor@email.com"
    },

    {
        id: 160,
        nome: "Ronaldo Gesso",
        profissao: "Gesseiro",
        especialidades: "Drywall, Sancas, Forros",
        local: "Campinas - SP",
        disponibilidade: "Autônomo / PJ",
        biografia: "Montagem de divisórias em drywall e rebaixamento de teto.",
        contato: "ronaldo.gesso@email.com"
    }
];


// ==========================================
// 4. LÓGICA DE BUSCA COM SINÔNIMOS
// ==========================================
function normalizarBusca(termo) {

    if (
        termo.includes("admin") ||
        termo.includes("gestao") ||
        termo.includes("gestão")
    ) {
        return "admin";
    }

    if (
        termo.includes("finan") ||
        termo.includes("contab")
    ) {
        return "finan";
    }

    if (
        termo.includes("market") ||
        termo.includes("propaganda") ||
        termo.includes("social")
    ) {
        return "market";
    }

    if (termo.includes("mec")) {
        return "mec";
    }

    if (termo.includes("eletr")) {
        return "eletr";
    }

    if (
        termo.includes("pedreiro") ||
        termo.includes("constru") ||
        termo.includes("obra")
    ) {
        return "pedreiro";
    }

    if (termo.includes("motor")) {
        return "motor";
    }

    if (termo.includes("vended")) {
        return "vended";
    }

    if (termo.includes("recep")) {
        return "recep";
    }

    if (
        termo.includes("domest") ||
        termo.includes("diar")
    ) {
        return "domest";
    }

    if (termo.includes("cozin")) {
        return "cozin";
    }

    if (
        termo.includes("garç") ||
        termo.includes("garcom")
    ) {
        return "garç";
    }

    if (
        termo.includes("segur") ||
        termo.includes("vigil")
    ) {
        return "segur";
    }

    if (termo.includes("caixa")) {
        return "caixa";
    }

    if (
        termo.includes("estoq") ||
        termo.includes("almox")
    ) {
        return "estoq";
    }

    if (
        termo.includes("limpeza") ||
        termo.includes("gerais") ||
        termo.includes("servi")
    ) {
        return "limpeza";
    }

    if (
        termo.includes("inform") ||
        termo.includes("suporte") ||
        termo.includes("tecnico") ||
        termo.includes("ti")
    ) {
        return "inform";
    }

    if (
        termo.includes("cabel") ||
        termo.includes("barb")
    ) {
        return "cabel";
    }

    if (
        termo.includes("bab") ||
        termo.includes("cuida")
    ) {
        return "bab";
    }

    if (termo.includes("atend")) {
        return "atend";
    }

    return termo;
}


// ==========================================
// 5. BUSCA DE VAGAS
// ==========================================
const botaoBuscarEmprego = document.getElementById("buscar-emprego");
const campoArea = document.getElementById("area");
const resultadosEmprego = document.getElementById("resultados-emprego");

if (campoArea) {

    campoArea.addEventListener("input", function() {

        if (campoArea.value.trim() === "") {
            resultadosEmprego.innerHTML = "";
        }

    });
}


if (botaoBuscarEmprego) {

    botaoBuscarEmprego.addEventListener("click", async function() {

        const termoBruto = campoArea.value
            .toLowerCase()
            .trim();

        if (!termoBruto) {
            return;
        }

        // Guarda a pesquisa no registro atual
        await registrarPesquisa(termoBruto);

        const chave = normalizarBusca(termoBruto);

        const filtrados = listaEmpregos.filter(vaga =>
            vaga.cargo.toLowerCase().includes(termoBruto) ||
            vaga.area.toLowerCase() === chave
        );


        if (filtrados.length > 0) {

            resultadosEmprego.innerHTML =
                "<h3>Oportunidades encontradas (Clique para ver detalhes):</h3>";

            filtrados.forEach(vaga => {

                resultadosEmprego.innerHTML += `
                    <div
                        class="card-item"
                        onclick="abrirDetalhesEmprego(${vaga.id})"
                        style="
                            border: 1px solid #ccc;
                            padding: 10px;
                            margin: 8px 0;
                            cursor: pointer;
                            border-radius: 6px;
                        "
                    >

                        <p style="margin: 0;">
                            <strong>${vaga.cargo}</strong>
                        </p>

                        <p style="margin: 4px 0 0 0; color: #555;">
                            ${vaga.empresa} — ${vaga.local} (${vaga.modalidade})
                        </p>

                    </div>
                `;

            });

        } else {

            resultadosEmprego.innerHTML =
                "<h3>Nenhuma oportunidade encontrada.</h3>";

        }

    });

}


// ==========================================
// 6. BUSCA DE PROFISSIONAIS
// ==========================================
const botaoBuscarProfissional =
    document.getElementById("buscar-profissional");

const campoProfissao =
    document.getElementById("profissao");

const resultadosProfissionais =
    document.getElementById("resultados-profissionais");


if (campoProfissao) {

    campoProfissao.addEventListener("input", function() {

        if (campoProfissao.value.trim() === "") {
            resultadosProfissionais.innerHTML = "";
        }

    });

}


if (botaoBuscarProfissional) {

    botaoBuscarProfissional.addEventListener("click", async function() {

        const termoBruto = campoProfissao.value
            .toLowerCase()
            .trim();

        if (!termoBruto) {
            return;
        }

        // Guarda a pesquisa no registro atual
        await registrarPesquisa(termoBruto);

        const chave = normalizarBusca(termoBruto);

        const filtrados = listaProfissionais.filter(prof =>
            prof.profissao.toLowerCase().includes(termoBruto) ||
            prof.especialidades.toLowerCase().includes(termoBruto) ||
            normalizarBusca(prof.profissao.toLowerCase()) === chave
        );


        if (filtrados.length > 0) {

            resultadosProfissionais.innerHTML =
                "<h3>Profissionais encontrados (Clique para ver detalhes):</h3>";

            filtrados.forEach(prof => {

                resultadosProfissionais.innerHTML += `
                    <div
                        class="card-item"
                        onclick="abrirDetalhesProfissional(${prof.id})"
                        style="
                            border: 1px solid #ccc;
                            padding: 10px;
                            margin: 8px 0;
                            cursor: pointer;
                            border-radius: 6px;
                        "
                    >

                        <p style="margin: 0;">
                            <strong>${prof.nome}</strong> - ${prof.profissao}
                        </p>

                        <p style="margin: 4px 0 0 0; color: #555;">
                            Especialidades: ${prof.especialidades} | ${prof.local}
                        </p>

                    </div>
                `;

            });

        } else {

            resultadosProfissionais.innerHTML =
                "<p>Nenhum profissional encontrado.</p>";

        }

    });

}


// ==========================================
// 7. JANELA DE DETALHES (MODAL)
// ==========================================
document.body.insertAdjacentHTML('beforeend', `

    <div
        id="modal-detalhes"
        style="
            display:none;
            position:fixed;
            top:0;
            left:0;
            width:100%;
            height:100%;
            background:rgba(0,0,0,0.7);
            justify-content:center;
            align-items:center;
            z-index:1000;
        "
    >

        <div
            style="
                background:#fff;
                color:#333;
                padding:25px;
                border-radius:8px;
                max-width:450px;
                width:90%;
                position:relative;
                box-shadow:0 4px 10px rgba(0,0,0,0.3);
            "
        >

            <button
                onclick="fecharModal()"
                style="
                    position:absolute;
                    top:12px;
                    right:12px;
                    cursor:pointer;
                    font-weight:bold;
                    border:none;
                    background:none;
                    font-size:16px;
                "
            >
                ✕
            </button>

            <div id="conteudo-modal"></div>

        </div>

    </div>

`);


// ==========================================
// DETALHES DA VAGA
// ==========================================
async function abrirDetalhesEmprego(id) {

    const vaga = listaEmpregos.find(
        e => e.id === id
    );

    if (!vaga) {
        return;
    }

    // Guarda qual vaga foi escolhida
    await registrarResultado(
        `${vaga.cargo} — ${vaga.empresa}`
    );


    document.getElementById("conteudo-modal").innerHTML = `

        <h2 style="margin-top:0;">
            ${vaga.cargo}
        </h2>

        <p>
            <strong>Empresa:</strong>
            ${vaga.empresa}
        </p>

        <p>
            <strong>Local:</strong>
            ${vaga.local} (${vaga.modalidade})
        </p>

        <hr
            style="
                border:0;
                border-top:1px solid #eee;
                margin:15px 0;
            "
        >

        <p>
            <strong>Descrição:</strong><br>
            ${vaga.descricao}
        </p>

        <p>
            <strong>Requisitos:</strong><br>
            ${vaga.requisitos}
        </p>

        <button
            onclick="
                registrarAcao('candidatar-se');
                alert('Candidatura enviada para o teste!')
            "
            style="
                margin-top:15px;
                padding:10px 18px;
                cursor:pointer;
                background:#28a745;
                color:#fff;
                border:none;
                border-radius:4px;
                font-weight:bold;
                width:100%;
            "
        >
            Candidatar-se
        </button>

    `;

    document.getElementById("modal-detalhes").style.display = "flex";
}


// ==========================================
// DETALHES DO PROFISSIONAL
// ==========================================
async function abrirDetalhesProfissional(id) {

    const prof = listaProfissionais.find(
        p => p.id === id
    );

    if (!prof) {
        return;
    }

    // Guarda qual profissional foi escolhido
    await registrarResultado(
        `${prof.nome} — ${prof.profissao}`
    );


    document.getElementById("conteudo-modal").innerHTML = `

        <h2 style="margin-top:0;">
            ${prof.nome}
        </h2>

        <p>
            <strong>Profissão:</strong>
            ${prof.profissao}
        </p>

        <p>
            <strong>Especialidades:</strong>
            ${prof.especialidades}
        </p>

        <p>
            <strong>Local:</strong>
            ${prof.local}
        </p>

        <p>
            <strong>Contratação:</strong>
            ${prof.disponibilidade}
        </p>

        <hr
            style="
                border:0;
                border-top:1px solid #eee;
                margin:15px 0;
            "
        >

        <p>
            <strong>Sobre:</strong><br>
            ${prof.biografia}
        </p>

        <p>
            <strong>Contato:</strong>
            ${prof.contato}
        </p>

        <button
            onclick="
                registrarAcao('contatar');
                alert('Solicitação de contato enviada para o teste!')
            "
            style="
                margin-top:15px;
                padding:10px 18px;
                cursor:pointer;
                background:#007bff;
                color:#fff;
                border:none;
                border-radius:4px;
                font-weight:bold;
                width:100%;
            "
        >
            Entrar em Contato
        </button>

    `;

    document.getElementById("modal-detalhes").style.display = "flex";
}


// ==========================================
// FECHAR MODAL
// ==========================================
function fecharModal() {

    document.getElementById("modal-detalhes").style.display = "none";

}