# Pokédex Dinâmica - Projeto Front-End Avançado

Este projeto é uma Pokédex interativa desenvolvida como trabalho final para a disciplina de Front-End, utilizando apenas tecnologias web puras. A aplicação consome a API pública da Pokémon (PokeAPI) para buscar e exibir dados de personagens dinamicamente.

# Funcionalidades

A Pokédex oferece um conjunto de funcionalidades robustas, demonstrando o consumo e manipulação avançada de dados:

**Geração Dinâmica de Cards:** Todos os cards de Pokémon são criados com JavaScript (DOM Manipulation) a partir do JSON recebido da API. O HTML serve apenas como container inicial.

**Motor de Busca e Filtro Avançado:** Filtro por Tipo (Ex: "Fire", "Water").

**Busca por Nome ou Habilidade em tempo real.**

**Paginação Eficiente:** A lista é organizada em páginas de 18 Pokémons por vez, com controles de navegação para um catálogo de mais de 500 Pokémons em cache.

**Modal de Detalhes:** Ao clicar em qualquer Card, um modal é exibido contendo informações avançadas obtidas por meio de requisições encadeadas, incluindo:

**Habilidades e Fraquezas** (calculadas através da consulta do endpoint /type/ da API).

**Responsividade:** O layout é totalmente responsivo e otimizado para visualização em dispositivos móveis e desktops, utilizando Flexbox e CSS Media Queries.

# Tecnologias Utilizadas (Requisitos do Projeto)

**HTML5:** Estrutura base da aplicação.

**CSS3:** Estilização, layout e responsividade (CSS Puro, sem frameworks como Bootstrap ou Tailwind).

**JavaScript (ES6+):** Lógica, consumo da API e manipulação do DOM.

**fetch e async/await:** Utilizados para requisições assíncronas de dados.

**document.createElement e appendChild:** Utilizados para a criação dinâmica dos elementos.

# Fonte de Dados (API)

O projeto utiliza a API pública PokeAPI, que não requer chaves de autenticação (API Key ou token) para o consumo de dados de leitura, permitindo o foco total na lógica Front-End.

**URL da API:** https://pokeapi.co/

# Como Executar o Projeto

É muito simples executar este projeto localmente, pois ele não requer build tools ou servidores de back-end.

**Clone o Repositório:**

git clone https://github.com/hawkzs0x01/pokedex-dinamica.git


**Navegue até a Pasta:**

cd /pokedex-dinamica/


**Abra no Navegador:**

Simplesmente abra o arquivo index.html em qualquer navegador moderno (Chrome, Firefox, Edge, etc.).

O JavaScript fará o restante, buscando os dados da API e renderizando a Pokédex.

Feito por: Guilherme Rodrigues de Oliveira (Aluno de ADS)