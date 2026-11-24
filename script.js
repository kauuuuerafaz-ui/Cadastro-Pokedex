const form = document.querySelector('#pokemon');
const feedback = document.querySelector('#feedback');
const imgPokemon = document.querySelector('#imgPokemon');
const nomeInput = document.querySelector('#nome');
const treinadorInput = document.querySelector('#treinador');
const poderInput = document.querySelector('#poder');
const tipoInput = document.querySelector('#tipo');
const btnReset = document.querySelector('#btn-reset');
const container = document.querySelector('#container');

const URL_POKEAPI = 'https://pokeapi.co/api/v2/pokemon';
const URL_API = '/api/baralho';

let debounceBusca;
let pokemonsCadastrados = [];

const tipoCor = [
    { tipo: "normal", borda: "#7f8c8d", fundo: "#ececec" },
    { tipo: "water", borda: "#2980d9", fundo: "#dcecff" },
    { tipo: "grass", borda: "#3a9d3a", fundo: "#e0f6dc" },
    { tipo: "electric", borda: "#d4a800", fundo: "#fff7c2" },
    { tipo: "poison", borda: "#8e44ad", fundo: "#eddcf5" },
    { tipo: "fire", borda: "#e25822", fundo: "#ffe3d6" }
];

async function buscarDadosPokemon(nome) {
    const nomeFormatado = nome.toLowerCase().trim();
    try {
        const resposta = await fetch(`${URL_POKEAPI}/${nomeFormatado}`);
        if (!resposta.ok) {
            throw new Error('Pokémon não encontrado na PokeAPI');
        }
        return await resposta.json();
    } catch (error) {
        return null;
    }
}

function extrairImagemPokemon(dadosPokemon) {
    if (!dadosPokemon) return null;
    return dadosPokemon.sprites?.other?.['official-artwork']?.front_default;
}

function extrairTipoPokemon(dadosPokemon) {
    if (!dadosPokemon.types) return [];
    return dadosPokemon.types.map(item => item.type.name);
}

function mostrarPokemon(dadosPokemon) {
    const imagem = extrairImagemPokemon(dadosPokemon);
    const tipos = extrairTipoPokemon(dadosPokemon);
    const poder = dadosPokemon.base_experience || 0;

    if (!dadosPokemon) {
        imgPokemon.innerHTML = `<h3 class="txtBranco">ERROR: POKÉMON NÃO ENCONTRADO... </h3>`;
        tipoInput.value = '';
        poderInput.value = '';
        return;
    }

    if (imagem) {
        imgPokemon.innerHTML = '';
        const imgPreview = document.createElement('img');
        imgPreview.src = imagem;
        imgPreview.alt = dadosPokemon.name;
        imgPreview.width = 150;
        imgPokemon.appendChild(imgPreview);
    }

    tipoInput.value = tipos.join(', ');
    poderInput.value = poder;
}

function mostrarMensagem(texto, ok) {
    feedback.textContent = texto;
    feedback.style.color = ok ? 'green' : 'red';
}

// Chama a API do servidor (que grava no banco). Lança Error com a mensagem do servidor.
async function chamarApi(url, opcoes = {}) {
    let resposta;
    try {
        resposta = await fetch(url, {
            ...opcoes,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (erro) {
        throw new Error('Não foi possível falar com o servidor.');
    }

    let dados = null;
    try {
        dados = await resposta.json();
    } catch (erro) { /* resposta sem JSON */ }

    if (!resposta.ok) {
        const detalhe = dados && dados.erro ? dados.erro : `Erro ${resposta.status} no servidor.`;
        throw new Error(detalhe);
    }
    return dados;
}

function criarLinha(rotulo, valor) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${rotulo}: `;
    p.appendChild(strong);
    p.appendChild(document.createTextNode(valor));
    return p;
}

function renderizarPokemons() {
    container.innerHTML = '';

    pokemonsCadastrados.sort((a, b) => b.poder - a.poder);

    pokemonsCadastrados.forEach((poke) => {
        const corEncontrada = tipoCor.find(c => poke.tipos.includes(c.tipo));
        const cor = corEncontrada ? corEncontrada : tipoCor[0];

        const card = document.createElement('div');
        card.className = 'card-pokemon';
        card.style.border = `3px solid ${cor.borda}`;
        card.style.background = cor.fundo;
        card.style.color = '#000';

        const botao = document.createElement('button');
        botao.className = 'btn-excluir';
        botao.textContent = 'X';
        botao.addEventListener('click', () => removerPokemon(poke.id));

        const areaImg = document.createElement('div');
        areaImg.className = 'imgPokemon';
        const img = document.createElement('img');
        img.src = poke.imagem || '';
        img.alt = poke.nome;
        areaImg.appendChild(img);

        card.append(
            botao,
            areaImg,
            criarLinha('Nome', poke.nome),
            criarLinha('Tipo', poke.tipos.join(', ')),
            criarLinha('Treinador', poke.treinador || 'Sem Treinador'),
            criarLinha('Poder', String(poke.poder))
        );

        container.appendChild(card);
    });
}

async function carregarBaralho() {
    try {
        pokemonsCadastrados = await chamarApi(URL_API);
        renderizarPokemons();
    } catch (erro) {
        mostrarMensagem(`❌ ${erro.message}`, false);
    }
}

async function removerPokemon(id) {
    try {
        await chamarApi(`${URL_API}/${id}`, { method: 'DELETE' });
        pokemonsCadastrados = pokemonsCadastrados.filter(poke => poke.id !== id);
        renderizarPokemons();
        mostrarMensagem('✅ Pokémon removido do baralho.', true);
    } catch (erro) {
        mostrarMensagem(`❌ ${erro.message}`, false);
    }
}

form.addEventListener('submit', async function (event) {
    event.preventDefault();

    const nome = nomeInput.value.trim();
    const treinador = treinadorInput.value.trim();
    const poder = Number(poderInput.value);

    feedback.textContent = '';

    if (nome.length < 3) {
        mostrarMensagem('❌ Nome deve conter ao menos 3 caracteres.', false);
        return;
    }

    if (poder < 100) {
        mostrarMensagem('❌ O poder do Pokémon precisa ser maior ou igual a 100.', false);
        return;
    }

    const jaCadastrado = pokemonsCadastrados.some(p => p.nome.toLowerCase() === nome.toLowerCase());
    if (jaCadastrado) {
        mostrarMensagem('❌ Este Pokémon já foi cadastrado!', false);
        return;
    }

    const dadosApi = await buscarDadosPokemon(nome);

    if (!dadosApi) {
        mostrarMensagem('❌ Pokémon não encontrado.', false);
        return;
    }

    try {
        const salvo = await chamarApi(URL_API, {
            method: 'POST',
            body: JSON.stringify({
                nome: dadosApi.name,
                treinador: treinador,
                poder: poder,
                tipos: extrairTipoPokemon(dadosApi),
                imagem: extrairImagemPokemon(dadosApi) || ''
            })
        });

        pokemonsCadastrados.push(salvo);
        mostrarMensagem('✅ Pokémon cadastrado com sucesso!', true);

        form.reset();
        imgPokemon.innerHTML = '';
        renderizarPokemons();
    } catch (erro) {
        mostrarMensagem(`❌ ${erro.message}`, false);
    }
});

nomeInput.addEventListener('input', function () {
    const nome = nomeInput.value.trim();
    clearTimeout(debounceBusca);

    if (nome.length < 3) {
        feedback.textContent = '❌ Digite pelo menos 3 caracteres.';
        feedback.style.color = 'red';
        imgPokemon.innerHTML = '';
        tipoInput.value = '';
        poderInput.value = '';
        return;
    }

    debounceBusca = setTimeout(async function () {
        const dadosApi = await buscarDadosPokemon(nome);
        if (!dadosApi) {
            feedback.textContent = '❌ Pokémon não encontrado.';
            feedback.style.color = 'red';
            imgPokemon.innerHTML = '';
            tipoInput.value = '';
            poderInput.value = '';
            return;
        }

        mostrarPokemon(dadosApi);
        feedback.textContent = `✅ Pokemon encontrado!`;
        feedback.style.color = 'green';
    }, 700);
});

carregarBaralho();
