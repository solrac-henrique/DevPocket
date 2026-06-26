let cardContainer = document.querySelector(".card-container");
let campoBusca = document.querySelector("header input");

let dados = [];

async function iniciarBusca() {
    const termoBusca = campoBusca.value.trim().toLowerCase(); // trim() remove espaços em branco extras

    // 1. CENÁRIO ENGRAÇADO: O usuário não digitou nada
    if (termoBusca === "") {
        acionarModoPanico();
        return; // Para a execução aqui
    }

    // Se os dados ainda não foram carregados, busca do JSON.
    if (dados.length === 0) {
        try {
            let resposta = await fetch("data.json");
            dados = await resposta.json();
        } catch (error) {
            console.error("Falha ao buscar dados:", error);
            cardContainer.innerHTML = "<p style='color:red'>Erro ao conectar com o mainframe...</p>";
            return;
        }
    }
    const dadosFiltrados = dados.filter(dado =>
        dado.termo.toLowerCase().includes(termoBusca)
    );

    // Se digitou algo, mas não achou nada no banco
    if (dadosFiltrados.length === 0) {
        cardContainer.innerHTML = `
            <article class="card error-card">
                <h2>404: DADO NÃO ENCONTRADO</h2>
                <p>O termo "<strong>${campoBusca.value}</strong>" não existe neste universo.</p>
            </article>
        `;
        return;
    }

    renderizarCards(dadosFiltrados);
}

// Carrega alguns cards de exemplo assim que a página abre.
// Precisa do "await" aqui dentro porque iniciarBusca() é assíncrona
// (ela faz um fetch por dentro) — sem isso, a linha que limpa o campo
// rodava antes da busca terminar de fato.
(async () => {
    campoBusca.value = 'a';
    await iniciarBusca();
    campoBusca.value = '';
})();

// Função que cria a tela de erro engraçada
function acionarModoPanico() {
    // Faz o input tremer (adiciona a classe CSS e remove depois)
    campoBusca.classList.add("shake-input");
    setTimeout(() => campoBusca.classList.remove("shake-input"), 500);

    // Limpa a tela e mostra mensagem de "Hacker"
    cardContainer.innerHTML = `
        <div class="system-error">
            <div class="error-icon">&#128206;</div>
            <h3>ERRO CRÍTICO: VÁCUO DETECTADO</h3>
            <p>> O USUÁRIO TENTOU BUSCAR O NADA.</p>
            <p>> O SISTEMA NÃO LÊ MENTES (AINDA).</p>
            <p class="blinking">> POR FAVOR, DIGITE ALGO ANTES DA AUTODESTRUIÇÃO...</p>
        </div>
    `;
}

// Permite buscar apertando ENTER no teclado
campoBusca.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        iniciarBusca();
    }
});

/* --- Função de Busca Aleatória --- */
async function buscaAleatoria() {
    // Garante que os dados foram carregados
    if (dados.length === 0) {
        try {
            let resposta = await fetch("data.json");
            dados = await resposta.json();
        } catch (error) {
            console.error("Erro ao buscar dados");
            return;
        }
    }

    // Sorteia um número
    const indiceAleatorio = Math.floor(Math.random() * dados.length);
    const termoSorteado = dados[indiceAleatorio];

    // Preenche o input e pisca ele
    campoBusca.value = termoSorteado.termo;
    campoBusca.classList.add("shake-input"); // Reutiliza sua animação de tremor
    setTimeout(() => campoBusca.classList.remove("shake-input"), 500);

    // Mostra o card
    renderizarCards([termoSorteado]);
}

// Única versão de renderizarCards (a duplicada simples foi removida —
// ela nunca era usada de fato, já que esta era declarada depois e
// sobrescrevia a outra silenciosamente).
function renderizarCards(listaDados) {
    cardContainer.innerHTML = "";

    const favoritos = JSON.parse(localStorage.getItem('devPocketFavs')) || [];

    for (let dado of listaDados) {
        let article = document.createElement("article");
        article.classList.add("card");

        const isFavorito = favoritos.some(fav => fav.termo === dado.termo);
        const classeEstrela = isFavorito ? 'saved' : '';

        // 1. Versão para o botão de copiar (Escapa as aspas simples para não quebrar o JS)
        const textoParaCopiar = dado.exemplo.replace(/'/g, "\\'");

        // 2. Versão para aparecer na tela (Transforma <tags> em texto visível)
        const textoParaExibir = escaparHTML(dado.exemplo);

        // ---------------------

        article.innerHTML = `
            <h2>${dado.termo}</h2>
            <p><strong>Definição:</strong> ${dado.definicao}</p>
            
            <p><strong>Exemplo:</strong> 
                <!-- Aqui usamos 'textoParaExibir' para ver e 'textoParaCopiar' no clique -->
                <code class="copy-code" onclick="copiarTexto('${textoParaCopiar}')" title="Clique para copiar">
                    ${textoParaExibir}
                </code>
            </p>
            
            <p><strong>Use quando:</strong> ${dado.usar_em}</p>
            <p><strong>Evite quando:</strong> ${dado.evitar}</p>
            <a href="${dado.link}" target="_blank">Saiba mais</a>
        `;
        cardContainer.appendChild(article);
    }
}

// Função auxiliar para copiar com Notificação Hacker
function copiarTexto(texto) {
    navigator.clipboard.writeText(texto).then(() => {
        mostrarNotificacao("CTRL+C DETECTADO: CÓDIGO COPIADO");
    });
}

// Função que controla a animação da notificação
function mostrarNotificacao(mensagem) {
    const toast = document.getElementById("toast-notification");
    const msgElement = document.getElementById("toast-msg");

    // Define a mensagem
    msgElement.innerText = mensagem;

    // Adiciona a classe que faz o card deslizar para a tela
    toast.classList.add("show");

    // Espera 3 segundos e remove a notificação
    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}

// Lógica do Botão Topo
const btnTopo = document.getElementById("btn-topo");

window.onscroll = function () {
    // Se rolar mais que 300px, mostra o botão
    if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        btnTopo.style.display = "flex"; // Usa flex para centralizar a setinha
    } else {
        btnTopo.style.display = "none";
    }
};

function subirTela() {
    window.scrollTo({
        top: 0,
        behavior: "smooth" // Rolagem suave
    });
}

/* --- FUNÇÕES DO MODAL SOBRE --- */

function abrirModal() {
    const modal = document.getElementById('modal-sobre');
    modal.style.display = 'flex'; // Mostra a janela
}

function fecharModal() {
    const modal = document.getElementById('modal-sobre');
    modal.style.display = 'none'; // Esconde a janela
}

// Fecha o modal se clicar fora da caixinha (no fundo escuro)
document.getElementById('modal-sobre').addEventListener('click', function (event) {
    if (event.target === this) {
        fecharModal();
    }
});

// Fecha se apertar a tecla ESC
document.addEventListener('keydown', function (event) {
    if (event.key === "Escape") {
        fecharModal();
    }
});

// Função para transformar símbolos de código em texto seguro
function escaparHTML(texto) {
    if (!texto) return "";
    return texto
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* --- EFEITO MATRIX RAIN (full screen) --- */
const canvas = document.getElementById('matrix-rain');

// Proteção: se por algum motivo o canvas não existir no HTML,
// o restante do script (busca, modal, som) continua funcionando
// em vez de travar tudo com um erro fatal aqui.
if (canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789';
    const fontSize = 14;
    let columns = canvas.width / fontSize;
    let drops = Array(Math.floor(columns)).fill(1);

    function draw() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0F0';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < drops.length; i++) {
            const text = chars[Math.floor(Math.random() * chars.length)];
            ctx.fillText(text, i * fontSize, drops[i] * fontSize);
            if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
            drops[i]++;
        }
    }

    setInterval(draw, 33);

    // Redimensionar ao mudar tamanho da janela.
    // Recalcula também as colunas, senão a chuva fica desalinhada
    // (mais "buraco" ou sobreposição) depois de redimensionar.
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        columns = canvas.width / fontSize;
        drops = Array(Math.floor(columns)).fill(1);
    });
}

/* --- SOM DE TECLA --- */
const teclaSom = document.getElementById('tecla-som');

// Proteção: navegadores podem bloquear play() antes de qualquer
// interação do usuário, e isso joga um erro "rejected" no console
// se não for tratado. O .catch() silencioso evita isso sem quebrar nada.
if (teclaSom) {
    document.addEventListener('keydown', () => {
        teclaSom.currentTime = 0;
        teclaSom.play().catch(() => {
            // Reprodução bloqueada pelo navegador — sem problema,
            // o som é só um efeito extra, não algo essencial.
        });
    });
}
