// ==========================================
// FORMULÁRIO E FLUXO DA CENTRAL NORTE PROFISSIONAL
// ==========================================

const secaoFormulario = document.getElementById("secao-formulario-final");
const perguntasCandidato = document.getElementById("perguntas-candidato");
const perguntasContratante = document.getElementById("perguntas-contratante");
const tradutor = document.getElementById("traduzir-necessidade");
const formulario = document.getElementById("form-pesquisa");
const btnEnviar = document.getElementById("btn-enviar-pesquisa");
const secaoBuscaEmprego = document.getElementById("procurar-emprego");
const secaoBuscaProfissional = document.getElementById("contratar-profissional");

let perfilFormulario = null;


// ==========================================
// ESCONDER FORMULÁRIO NO INÍCIO
// ==========================================

function esconderFormularioCompleto() {
    if (secaoFormulario) {
        secaoFormulario.style.display = "none";
    }

    if (perguntasCandidato) {
        perguntasCandidato.style.display = "none";
    }

    if (perguntasContratante) {
        perguntasContratante.style.display = "none";
    }

    if (tradutor) {
        tradutor.style.display = "none";
    }
}


// ==========================================
// MOSTRAR FORMULÁRIO DE ACORDO COM A OPÇÃO
// ==========================================

function mostrarFormulario(tipo) {

    perfilFormulario = tipo;

    if (!secaoFormulario) return;

    secaoFormulario.style.display = "block";

    if (tipo === "emprego") {

        if (secaoBuscaEmprego) {
            secaoBuscaEmprego.style.display = "block";
        }

        if (secaoBuscaProfissional) {
            secaoBuscaProfissional.style.display = "none";
        }

        if (perguntasCandidato) {
            perguntasCandidato.style.display = "block";
        }

        if (perguntasContratante) {
            perguntasContratante.style.display = "none";
        }

        if (tradutor) {
            tradutor.style.display = "none";
        }

    } else {

        if (secaoBuscaEmprego) {
            secaoBuscaEmprego.style.display = "none";
        }

        if (secaoBuscaProfissional) {
            secaoBuscaProfissional.style.display = "block";
        }

        if (perguntasCandidato) {
            perguntasCandidato.style.display = "none";
        }

        if (perguntasContratante) {
            perguntasContratante.style.display = "block";
        }

        if (tradutor) {
            tradutor.style.display = "block";
        }
    }
}


// ==========================================
// BOTÃO PROCURAR EMPREGO
// ==========================================

const botaoEmpregoFormulario = document.getElementById("emprego");

if (botaoEmpregoFormulario) {

    botaoEmpregoFormulario.addEventListener("click", async function () {

        mostrarFormulario("emprego");

        if (typeof iniciarFluxo === "function") {
            await iniciarFluxo("emprego");
        }

    });
}


// ==========================================
// BOTÃO CONTRATAR PROFISSIONAL
// ==========================================

const botaoProfissionalFormulario =
    document.getElementById("profissional");

if (botaoProfissionalFormulario) {

    botaoProfissionalFormulario.addEventListener("click", async function () {

        mostrarFormulario("profissional");

        if (typeof iniciarFluxo === "function") {
            await iniciarFluxo("profissional");
        }

    });
}


// ==========================================
// TRADUTOR DE NECESSIDADE
// ==========================================

const btnGerarDiagnostico =
    document.getElementById("btn-gerar-traducao");

const campoNecessidade =
    document.getElementById("texto-necessidade");

const resultadoDiagnostico =
    document.getElementById("resultado-traducao");


if (btnGerarDiagnostico) {

    btnGerarDiagnostico.addEventListener("click", async function () {

        const texto = campoNecessidade
            ? campoNecessidade.value.trim()
            : "";

        if (!texto) {

            alert(
                "Digite sua necessidade antes de gerar o diagnóstico."
            );

            return;
        }


        // Salva o texto do tradutor na MESMA linha do fluxo

        if (typeof registrarTradutor === "function") {

            await registrarTradutor(texto);

        }


        // Informa como desbloquear o diagnóstico

        if (resultadoDiagnostico) {

            resultadoDiagnostico.innerHTML = `

                <div class="diagnostico-gerado">

                    <p>Para desbloquear a tradução gratuita e ainda ter acesso a um pacote com várias ferramentas para o seu negócio, responda à pesquisa abaixo.</p>

                </div>

            `;
        }


        // Mostra o formulário

        if (secaoFormulario) {

            secaoFormulario.style.display = "block";

            resultadoDiagnostico.scrollIntoView({
                behavior: "smooth",
                block: "nearest"
            });

        }

    });

}


// ==========================================
// FUNÇÕES AUXILIARES
// ==========================================

function valorCampo(id) {

    const campo = document.getElementById(id);

    return campo
        ? campo.value.trim()
        : "";
}


function valorRadio(name) {

    const selecionado =
        document.querySelector(
            `input[name="${name}"]:checked`
        );

    return selecionado
        ? selecionado.value
        : "";
}


// ==========================================
// COLETAR DADOS DO FORMULÁRIO
// ==========================================

function coletarRespostas() {

    const respostas = {

        nome: valorCampo("f-nome"),

        email: valorCampo("f-email"),

        whatsapp: valorCampo("f-whatsapp"),

        cidade_estado: valorCampo("f-cidade"),

        profissao_cargo: valorCampo("f-profissao"),

    comentarios: valorCampo("f-faltou")

    };


    // ======================================
    // FORMULÁRIO DE QUEM PROCURA EMPREGO
    // ======================================

    if (perfilFormulario === "emprego") {

        respostas.resposta_pergunta_1 =
            valorRadio("f-cand-navegacao");

        respostas.resposta_pergunta_2 =
            valorRadio("f-cand-vagas");

        respostas.resposta_pergunta_3 =
            valorRadio("f-cand-ferramenta");

        respostas.resposta_pergunta_4 =
            valorRadio("f-cand-usaria");

        respostas.resposta_pergunta_5 =
            valorRadio("f-cand-valor");

    }


    // ======================================
    // FORMULÁRIO DE QUEM CONTRATA
    // ======================================

    else {

        respostas.resposta_pergunta_1 =
            valorRadio("f-emp-facilidade");

        respostas.resposta_pergunta_2 =
            valorRadio("f-emp-resultados");

        respostas.resposta_pergunta_3 =
            valorRadio("f-emp-ferramenta");

        respostas.resposta_pergunta_4 =
            valorRadio("f-emp-contrataria");

    }


    return respostas;
}


// ==========================================
// VALIDAR FORMULÁRIO
// ==========================================

function validarRespostas(dados) {

    const obrigatorios = [

        "nome",

        "email",

        "whatsapp",

        "cidade_estado",

        "profissao_cargo"

    ];


    for (const campo of obrigatorios) {

        if (!dados[campo]) {

            alert(
                "Preencha todos os campos de identificação antes de enviar."
            );

            const ids = {

                nome: "f-nome",

                email: "f-email",

                whatsapp: "f-whatsapp",

                cidade_estado: "f-cidade",

                profissao_cargo: "f-profissao"

            };

            const elemento =
                document.getElementById(ids[campo]);

            if (elemento) {

                elemento.focus();

            }

            return false;
        }

    }


    const quantidadePerguntas =
        perfilFormulario === "emprego"
            ? 5
            : 4;


    for (
        let i = 1;
        i <= quantidadePerguntas;
        i++
    ) {

        if (
            !dados[
                `resposta_pergunta_${i}`
            ]
        ) {

            alert(
                "Responda todas as perguntas antes de enviar."
            );

            return false;
        }

    }


    return true;
}


// ==========================================
// ENVIAR FORMULÁRIO
// ==========================================

if (formulario) {

    formulario.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            if (!perfilFormulario) {

                alert(
                    "Escolha primeiro uma opção."
                );

                return;
            }


            if (
                typeof pesquisaAtualId === "undefined" ||
                !pesquisaAtualId
            ) {

                alert(
                    "Não foi possível identificar esta pesquisa. Escolha a opção novamente."
                );

                return;
            }


            const dados =
                coletarRespostas();


            if (!validarRespostas(dados)) {

                return;

            }


            const tipo =
                perfilFormulario === "emprego"
                    ? "busca_emprego"
                    : "busca_profissional";


            const dadosBanco = {

                tipo: tipo,

                opcao: perfilFormulario,

                nome: dados.nome,

                email: dados.email,

                whatsapp: dados.whatsapp,

                cidade_estado: dados.cidade_estado,

                profissao_cargo:
                    dados.profissao_cargo,

                resposta_pergunta_1:
                    dados.resposta_pergunta_1,

                resposta_pergunta_2:
                    dados.resposta_pergunta_2,

                resposta_pergunta_3:
                    dados.resposta_pergunta_3,

                resposta_pergunta_4:
                    dados.resposta_pergunta_4,

                resposta_pergunta_5:
                    dados.resposta_pergunta_5 || "",

                comentarios:
                    dados.comentarios

            };


            btnEnviar.disabled = true;

            btnEnviar.textContent =
                "ENVIANDO...";


            // IMPORTANTE:
            // Atualiza a mesma linha criada
            // quando a pessoa escolheu a opção.

            const { error } =
                await supabaseClient

                    .from("Pesquisas")

                    .update(dadosBanco)

                    .eq("id", pesquisaAtualId);


            if (error) {

                console.error(
                    "Erro ao salvar formulário:",
                    error
                );

                alert(
                    "Não foi possível enviar a pesquisa. Verifique a conexão e tente novamente."
                );

                btnEnviar.disabled = false;

                btnEnviar.textContent =
                    perfilFormulario === "emprego"
                        ? "ENVIAR E GARANTIR DESTAQUE"
                        : "ENVIAR PESQUISA E LIBERAR CONTATOS";

                return;
            }


            alert(
                "Sua pesquisa foi enviada, em breve receberá atualizações no seu e-mail."
            );


            btnEnviar.disabled = false;

            btnEnviar.textContent =
                perfilFormulario === "emprego"
                    ? "ENVIAR E GARANTIR DESTAQUE"
                    : "ENVIAR PESQUISA E LIBERAR CONTATOS";


            // O fluxo terminou.
            // O próximo botão escolhido poderá
            // criar uma NOVA linha.

            if (
                typeof finalizarFluxo === "function"
            ) {

                finalizarFluxo();

            }

        }
    );

}


// ==========================================
// ESTADO INICIAL
// ==========================================

esconderFormularioCompleto();