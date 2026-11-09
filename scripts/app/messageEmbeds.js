const { EmbedBuilder } = require("discord.js");

function buildHelpEmbed() {
  return new EmbedBuilder()
    .setColor('#FFD700')
    .setTitle('🤖 Comandos do Nana 🍌')
    .setDescription('Aqui está a lista de tudo que eu posso fazer por você no servidor!\nExplore os comandos por categoria abaixo.')
    .addFields(
      { name: '📈 Nível & XP (Progressão)', value: [
        '`!xp` / `!nivel` `[@user]` - ⚡ Veja seu cartão de nível, XP e progresso visual.',
        '`!rankxp` / `!topxp` - 🏆 Mostra o Hall da Fama com os membros de maior nível!'
      ].join('\n') },
      { name: '💰 Economia, Mercado & Forja', value: [
        '`!daily` / `!diario` - 🎁 Gire a roleta diária para prêmios!',
        '`!saldo` - 💵 Verifica quanto dinheiro virtual você tem.',
        '`!rank` - 🏆 Mostra os mais ricos do servidor.',
        '`!doar <@user> <valor>` - 💸 Transfere Nanacoins simples.',
        '`!loja` - 🏪 Loja Oficial com **Proteção Parrudo**, **estoque virtual** e **Lootboxes**.',
        '`!menu` / `!hub` / `!painel` - 🍌 **Painel Central** com botões interativos para todas as áreas!'
      ].join('\n') },
      { name: '⚔️ Crime & Duelo', value: [
        '`!roubar <@user>` - 🥷 Tenta furtar Nanacoins de alguém.',
        '`!parrudo <horas>h` - 🛡️ Imunidade a roubos (também comprável na `!loja`).',
        '`!timeout` - 🚓 Verifica tempo de prisão.',
        '`!fianca [@user]` - 💸 Paga fiança para sair ou soltar amigo.',
        '`!beijarmuro` - 💋 Beija o muro e testa sua sorte.'
      ].join('\n') },
      { name: '🎮 Games, Boss & RPG', value: [
        '`!games` - 🎰 Hub central de jogos: Forca, Trivia/RPG e Duelo!'
      ].join('\n') },
      { name: '🧠 IA & Utilidades', value: [
        '`!img <prompt>` - 🖼️ Gera imagem realista pelo Forge.',
        '`!anime <prompt>` - 🌸 Gera imagem em estilo anime pelo Forge.',
        '`!reels` - 🎬 Abre o painel para reel aleatório, link manual ou apagar o último reel do painel.',
        '`!f <texto>` - 🔊 Fala no canal de voz onde você está.',
        '`!clear [cmd] <num>` - 🧹 Apaga mensagens do bot ou comandos de usuários.'
      ].join('\n') }
    )
    .setFooter({ text: 'Dica: Eu também respondo se você me mencionar ou me chamar pelo nome no chat livre!' });
}

function buildNewEmbed() {
  return new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('🌟 ATUALIZAÇÃO: PAINÉIS, FORJA & REELS 🌟')
    .setDescription('O BotTTs ganhou atalhos mais práticos para reduzir spam de comando e deixar os fluxos importantes em interface.')
    .addFields(
      { name: '🎬 Painel de Reels', value: 'Use `!reels` para abrir uma interface com **Reel Aleatório** pelo banco, envio por **link do Instagram** e botão para **apagar o último reel** enviado pelo painel no chat.' },
      { name: '⚙️ Atalho de Armas', value: '`!armas` agora abre direto a UI de **Craftar Arma** da Forja, a mesma que existe dentro do `!inv`.' },
      { name: '📈 Bolsa de Valores & Loja Viva', value: 'Esqueça os preços fixos! A `!loja` agora possui **Estoque Virtual** que limita a demanda e oscila o preço. Use a `!bolsa` para vender seus itens a preços personalizados para a comunidade, lucrando com a especulação!' },
      { name: '⚒️ A Grande Forja e Crafting', value: 'Entre no seu `!inv` e visite a **Forja**. Você pode usar os materiais coletados (Pó Cósmico, Sucata, etc.) para **Reparar** armas, **Fortificar** atributos, ativar **Buffs** temporários ou até **Criar Armas** novas do zero! Cansado da habilidade de uma arma Lendária? Use o **Reroll**!' },
      { name: '⚔️ Raids entre Servidores', value: 'Use `!raid` para engajar em **guerras econômicas interservidores**. Reúna seus aliados, compre *Estandartes de Guerra* ou *Escudos do Servidor* e invada a economia de outra comunidade para roubar até 8% dos seus fundos!' },
      { name: '🐉 Bosses dropam Materiais', value: 'Derrotar o World Boss e o Mini Boss não te dá mais apenas dinheiro: eles agora dropam **Materiais de Forja e Núcleos Lendários**. Caçá-los se tornou essencial para quem quer fortificar as melhores armas.' },
      { name: '🎒 Empilhamento de Itens', value: 'Consumíveis e Materiais agora são perfeitamente empilháveis no seu inventário, permitindo estocar recursos massivos e vender lotes completos na Bolsa.' }
    )
    .setImage('https://media.tenor.com/XqT7hS_m4_kAAAAC/hype-train.gif')
    .setFooter({ text: 'Bem-vindos a nova era da Economia! Usem !help para ver os comandos.' });
}

module.exports = { buildHelpEmbed, buildNewEmbed };
