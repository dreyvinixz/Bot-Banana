const { EmbedBuilder } = require("discord.js");
const { buildHelpEmbed, buildNewEmbed } = require("./messageEmbeds");
const { isCommand, getCommandText } = require("../core/utils");
const { handleVoiceCommand } = require("../voice/voice");
const { handleImageCommand } = require("../ai/image");
const { coletarGifs, cachearMensagem } = require("../ai/chat");
const {
  checkForcaGuess,
  checkAndSpawnEvent
} = require("../games/forca");
const { getCoins, getTopPlayers, handleDoarCommand, formatCoins } = require("../economy/economy");
const {
  handleRoubarCommand,
  handleTimeoutCommand,
  handleFiancaCommand,
  handleParrudoCommand,
  isPrisioneiro,
  handleBeijarMuroCommand
} = require("../games/duel");
const { handleBoostCommand } = require("../economy/boosts");
const { handleMarketCommand } = require("../economy/market");
const { handleRaidCommand } = require("../economy/raids");
const { handleInventoryCommand, handleEquipWeaponCommand } = require("../economy/weapons");
const { checkAndSendTip } = require("../features/tips");
const { handleReelsCommand } = require("../features/reels");
const { handleAdminCommand } = require("../admin/admin");
const { handleFaqMessage } = require("../features/faq");
const { addXpFromMessage, handleXpCommand, handleRankXpCommand } = require("../features/xp");
const { handleWelcomeTestCommand } = require("../features/welcome");
const { handleMenuCommand } = require("../features/menuHub");
const { recordActivityMessage } = require("../features/autoRoles");

async function handleClearCommand(message, text) {
  let amount = 100;
  let mode = "bot";

  if (text) {
    for (const arg of text.toLowerCase().trim().split(/\s+/)) {
      if (arg === "cmd" || arg === "cmds") {
        mode = "cmd";
        continue;
      }
      const parsed = parseInt(arg, 10);
      if (!isNaN(parsed) && parsed > 0) amount = Math.min(parsed, 100);
    }
  }

  try {
    const fetched = await message.channel.messages.fetch({ limit: amount });
    const targetMessages = fetched.filter((item) => mode === "bot"
      ? item.author.id === message.client.user.id
      : item.content.startsWith("!"));

    if (targetMessages.size > 0) {
      try {
        await message.channel.bulkDelete(targetMessages, true);
      } catch (error) {
        for (const item of targetMessages.values()) await item.delete().catch(() => {});
      }
      const type = mode === "bot" ? "minhas" : "de comandos";
      const reply = await message.channel.send(`🧹 Limpei ${targetMessages.size} mensagens ${type}!`);
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    } else {
      const reply = await message.reply("Não encontrei nenhuma mensagem para limpar nessas últimas mensagens.");
      setTimeout(() => reply.delete().catch(() => {}), 5000);
    }

    message.delete().catch(() => {});
  } catch (error) {
    console.error("🔥 Erro no comando !clear:", error);
    message.reply("⚠️ Erro ao limpar mensagens.");
  }
}

async function handleMessage(message) {
  if (message.author.bot || !message.guild) return;

  if (message.channel.name?.includes("perguntas") && await handleFaqMessage(message)) return;

  coletarGifs(message);
  cachearMensagem(message);
  checkAndSpawnEvent(message);
  checkAndSendTip(message);
  addXpFromMessage(message);
  recordActivityMessage(message.author.id, message.member);

  if (isPrisioneiro(message.author.id) && isCommand(message, ["!roubar", "!games"])) {
    return message.reply("🚓 Você está na prisão! Presidiários não podem jogar, duelar ou roubar.");
  }
  if (checkForcaGuess(message)) return;
  if (isCommand(message, ["!xp", "!nivel", "!level"])) return handleXpCommand(message, getCommandText(message, ["!xp", "!nivel", "!level"]));
  if (isCommand(message, ["!rankxp", "!topxp", "!xprank"])) return handleRankXpCommand(message);
  if (isCommand(message, ["!boasvindas", "!welcome", "!simularboasvindas"])) return handleWelcomeTestCommand(message);
  if (isCommand(message, ["!menu", "!hub", "!painel", "!menuprincipal"])) return handleMenuCommand(message);
  if (isCommand(message, ["!help"])) return message.reply({ embeds: [buildHelpEmbed()], allowedMentions: { repliedUser: false, parse: [] } });
  if (isCommand(message, ["!new"])) return message.reply({ embeds: [buildNewEmbed()], allowedMentions: { repliedUser: false, parse: [] } });
  if (isCommand(message, ["!f"])) return handleVoiceCommand(message, getCommandText(message, ["!f"]));
  if (isCommand(message, ["!clear"])) return handleClearCommand(message, getCommandText(message, ["!clear"]));
  if (isCommand(message, ["!reels", "!reel"])) return handleReelsCommand(message);
  if (isCommand(message, ["!games"])) return require("../games/menu").handleGamesCommand(message);
  if (isCommand(message, ["!roubar"])) return handleRoubarCommand(message, getCommandText(message, ["!roubar"]));
  if (isCommand(message, ["!doar", "!pagar", "!pay", "!transferir", "!pix", "!dar"])) {
    return handleDoarCommand(message, getCommandText(message, ["!doar", "!pagar", "!pay", "!transferir", "!pix", "!dar"]));
  }
  if (isCommand(message, ["!trade", "!troca", "!trocar", "!bolsa"])) return handleMarketCommand(message);
  if (isCommand(message, ["!timeout"])) return handleTimeoutCommand(message);
  if (isCommand(message, ["!fianca", "!fiança", "!suborno"])) return handleFiancaCommand(message);
  if (isCommand(message, ["!parrudo"])) return handleParrudoCommand(message, getCommandText(message, ["!parrudo"]));
  if (isCommand(message, ["!loja", "!boost", "!boosts"])) return handleBoostCommand(message);
  if (isCommand(message, ["!raid"])) return handleRaidCommand(message, getCommandText(message, ["!raid"]));
  if (isCommand(message, ["!inventario", "!inv"])) return handleInventoryCommand(message);
  if (isCommand(message, ["!armas"])) return require("../economy/forge").handleCraftWeaponsCommand(message);
  if (isCommand(message, ["!equipar"])) return handleEquipWeaponCommand(message, getCommandText(message, ["!equipar"]));
  if (isCommand(message, ["!beijarmuro", "!bejarmuro"])) return handleBeijarMuroCommand(message);
  if (isCommand(message, ["!daily", "!diario"])) return require("../economy/inventory").handleDailyCommand(message);
  if (isCommand(message, ["!fliperama", "!lootbox"])) return require("../economy/fliperama").handleFliperamaCommand(message);
  if (await handleAdminCommand(message)) return;

  if (isCommand(message, ["!saldo", "!nanacoins", "!atm", "!dinheiro"])) {
    const coins = getCoins(message.author.id);
    const topPlayers = getTopPlayers(100);
    const rank = topPlayers.findIndex((player) => player.id === message.author.id) + 1;
    const rankLabel = rank > 0 ? `#${rank}` : "Não rankeado";
    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("💳 BANCO NANACOIN")
      .setDescription(`Extrato bancário de **${message.author.username}**`)
      .addFields(
        { name: "💵 Saldo Disponível", value: `\`🪙 ${formatCoins(coins)} Nanacoins\``, inline: true },
        { name: "🏆 Posição no Rank", value: `\`${rankLabel}\``, inline: true }
      )
      .setFooter({ text: "Dica: Use !loja para gastar ou !roubar para tentar a sorte." });
    return message.reply({ embeds: [embed] });
  }

  if (isCommand(message, ["!rank", "!top"])) {
    const topPlayers = getTopPlayers(10);
    if (topPlayers.length === 0) return message.reply("Ninguém tem dinheiro ainda. Abram `!games` e joguem alguma coisa!");

    const rankLines = [];
    for (let index = 0; index < topPlayers.length; index += 1) {
      const player = topPlayers[index];
      let username = "Desconhecido";
      try {
        const user = message.client.users.cache.get(player.id) || await message.client.users.fetch(player.id);
        username = user?.username || player.id;
      } catch (error) {
        username = `User-${player.id.slice(-4)}`;
      }
      const medal = ["🥇", "🥈", "🥉"][index] || "🔹";
      const formatted = index === 0 ? `👑 **${username.toUpperCase()}**` : index === 1 ? `**${username}**` : index === 2 ? `*${username}*` : username;
      rankLines.push(`${medal} **#${index + 1}** ${formatted} — \`${formatCoins(player.balance)} 🪙\``);
    }

    const embed = new EmbedBuilder()
      .setColor("#FFD700")
      .setTitle("🏆 RANKING GLOBAL - TOP 10 MAIS RICOS")
      .setDescription(rankLines.join("\n"))
      .setFooter({ text: "A corrida pelo dinheiro virtual está insana!" });
    return message.reply({ embeds: [embed] });
  }

  if (isCommand(message, ["!img", "!anime"])) {
    const isAnime = isCommand(message, ["!anime"]);
    const command = isAnime ? "!anime" : "!img";
    return handleImageCommand(message, { prompt: getCommandText(message, ["!img", "!anime"]), isAnime, cmd: command });
  }
}

module.exports = { handleMessage };
