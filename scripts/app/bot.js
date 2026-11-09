const { Client, GatewayIntentBits, EmbedBuilder, MessageFlags } = require("discord.js");
const config = require("../core/config");
const { handleMessage } = require("./messageHandler");
const { buildHelpEmbed } = require("./messageEmbeds");
const { handleRpgInteraction } = require("../games/rpg");
const { handleButtonInteraction } = require("../games/duel");
const { handleBoostInteraction } = require("../economy/boosts");
const { handleMarketInteraction } = require("../economy/market");
const { handleRaidInteraction, scheduleExistingRaids } = require("../economy/raids");
const { handleReelsInteraction } = require("../features/reels");
const { handleMemberJoin } = require("../features/welcome");
const { handleMenuInteraction } = require("../features/menuHub");
const { handleForcaThemeInteraction, handleEventInteraction } = require("../games/forca");
const { grantXpToUser } = require("../features/xp");
const { addVoiceTime } = require("../features/autoRoles");
const { startVideoScheduler } = require("../core/videoScheduler");
const { logError, interceptConsole, setupGlobalErrorLogging } = require("../core/logger");

interceptConsole();
setupGlobalErrorLogging();

function createClient() {
  const intents = [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ];

  if (config.ENABLE_GUILD_MEMBERS_INTENT) {
    intents.push(GatewayIntentBits.GuildMembers);
  }

  return new Client({ intents });
}

function start(options = {}) {
  const testMode = options.testMode === true;
  const testChannelId = config.static.app.test?.channelId;
  const client = createClient();
  client.botTtsTestMode = testMode;
  client.botTtsTestChannelId = testChannelId;

  client.once("clientReady", () => {
    console.log("=========================================");
    console.log(`✅ Bot conectado ao Discord: ${client.user.tag}`);
    console.log("=========================================");
    if (testMode) {
      console.log(`🧪 [AVISO] MODO DE TESTE ATIVO! Escutando apenas no canal ID: ${testChannelId}`);
    }
    
    console.log("⚙️  Inicializando Ecossistema e Módulos...");
    console.log(" ├─ 📦 Loja e Estoque Virtual: OK");
    console.log(" ├─ 📈 Bolsa de Valores (Market): OK");
    console.log(" ├─ 🔨 Forja, Buffs e Crafting: OK");
    console.log(" ├─ 🐉 Eventos de World Boss: OK");
    console.log(" └─ ⚔️  Raids entre Servidores: OK");
    
    const { getActiveOrders } = require("../economy/market");
    const marketCount = getActiveOrders().length;
    console.log(`\n📊 Status Atual: ${marketCount} ordens na Bolsa.`);
    
    console.log("⏳ Agendando eventos e Raids ativas...");
    scheduleExistingRaids(client);
    startVideoScheduler(client);
    
    if (!testMode) {
      const { sendStartupAnnouncement } = require("../admin/admin");
      sendStartupAnnouncement(client).catch(() => null);
    }

    console.log("✨ Tudo pronto! O BotTTs já está escutando comandos.");
  });

  client.on("messageCreate", (message) => {
    if (testMode && message.channelId !== testChannelId) return;
    handleMessage(message).catch((err) => {
      console.error("🔥 Erro inesperado no messageCreate:", err);
    });
  });

  client.on("guildMemberAdd", (member) => {
    handleMemberJoin(member).catch((err) => {
      console.error("🔥 Erro inesperado no guildMemberAdd:", err);
    });
  });

  const voiceSessions = new Map();
  client.on("voiceStateUpdate", (oldState, newState) => {
    try {
      const member = newState.member || oldState.member;
      if (!member || member.user.bot) return;

      const userId = member.id;
      const now = Date.now();

      // Entrou num canal de voz (ou estava sem entrar e conectou)
      if (!oldState.channelId && newState.channelId) {
        voiceSessions.set(userId, now);
      }
      // Saiu de um canal de voz
      else if (oldState.channelId && !newState.channelId) {
        if (voiceSessions.has(userId)) {
          const startTime = voiceSessions.get(userId);
          voiceSessions.delete(userId);
          const duration = now - startTime;
          addVoiceTime(userId, member, duration).catch(() => null);
        }
      }
    } catch (err) {
      console.error("🔥 Erro inesperado no voiceStateUpdate:", err);
    }
  });

  client.on("interactionCreate", async (interaction) => {
    try {
      if (interaction.user && !interaction.user.bot) {
        grantXpToUser(
          interaction.user.id,
          interaction.member,
          interaction.guild,
          (payload) => interaction.followUp?.(payload) || interaction.reply?.(payload)
        ).catch(() => null);
      }

      if (testMode && interaction.channelId !== testChannelId) {
        if (interaction.isRepliable?.()) {
          await interaction.reply({ content: "🧪 Este bot de teste só responde no canal de testes.", flags: MessageFlags.Ephemeral }).catch(() => null);
        }
        return;
      }

      if (interaction.isChatInputCommand()) {
        const { commandName } = interaction;
        
        // Simular um objeto message básico para reaproveitar funções existentes
        const mockMessage = {
          client: interaction.client,
          author: interaction.user,
          guild: interaction.guild,
          channel: interaction.channel,
          reply: async (content) => {
            if (interaction.replied || interaction.deferred) {
              return interaction.followUp(content);
            }
            return interaction.reply(content);
          },
          channelId: interaction.channelId,
          content: `!${commandName}`
        };

        if (commandName === 'ajuda') {
          return interaction.reply({ embeds: [buildHelpEmbed()] });
        }
        
        if (commandName === 'setup_regras') {
          const { handleSetupRegrasCommand } = require("../admin/admin");
          return handleSetupRegrasCommand(mockMessage);
        }

        if (commandName === 'setup_cargos_info') {
          const { handleSetupCargosInfoCommand } = require("../admin/admin");
          return handleSetupCargosInfoCommand(mockMessage);
        }

        if (commandName === 'setup_avisos') {
          const { handleSetupAvisosCommand } = require("../admin/admin");
          return handleSetupAvisosCommand(mockMessage);
        }

        if (commandName === 'setup_caixa_info') {
          const { handleSetupCaixaInfoCommand } = require("../admin/admin");
          return handleSetupCaixaInfoCommand(mockMessage);
        }

        if (commandName === 'setup_cabere') {
          const { handleSetupCabereCommand } = require("../admin/setup_server");
          return handleSetupCabereCommand(interaction);
        }

        if (commandName === 'setup_familia') {
          const { handleSetupFamiliaCommand } = require("../features/familia");
          return handleSetupFamiliaCommand(mockMessage);
        }

        if (commandName === 'setup_publi') {
          const { handleSetupPubliCommand } = require("../admin/admin");
          return handleSetupPubliCommand(mockMessage);
        }

        if (commandName === 'setup_competicoes') {
          const { handleSetupCompeticoesCommand } = require("../admin/admin");
          return handleSetupCompeticoesCommand(mockMessage);
        }

        if (commandName === 'setup_reviews') {
          const { handleSetupReviewsCommand } = require("../admin/admin");
          return handleSetupReviewsCommand(mockMessage);
        }

        if (commandName === 'saldo') {
          const { getCoins, getTopPlayers, formatCoins } = require("../economy/economy");
          const coins = getCoins(interaction.user.id);
          const topPlayers = getTopPlayers(100);
          const myRank = topPlayers.findIndex(p => p.id === interaction.user.id) + 1;
          const rankStr = myRank > 0 ? `#${myRank}` : 'Não rankeado';

          const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('💳 BANCO NANACOIN')
            .setDescription(`Extrato bancário de **${interaction.user.username}**`)
            .addFields(
              { name: '💵 Saldo Disponível', value: `\`🪙 ${formatCoins(coins)} Nanacoins\``, inline: true },
              { name: '🏆 Posição no Rank', value: `\`${rankStr}\``, inline: true }
            )
            .setFooter({ text: 'Dica: Use a loja para gastar ou roubar para tentar a sorte.' });

          return interaction.reply({ embeds: [embed] });
        }
        
        if (commandName === 'diario') {
          const { handleDailyCommand } = require("../economy/inventory");
          return handleDailyCommand(mockMessage);
        }
      }

      const { handleFamiliaButtonInteraction } = require("../features/familia");
      const { handlePubliButtonInteraction } = require("../admin/setupPanels");
      if (await handleFamiliaButtonInteraction(interaction)) return;
      if (await handlePubliButtonInteraction(interaction)) return;
      if (await handleMenuInteraction(interaction)) return;

      if (await handleEventInteraction(interaction)) return;
      if (await handleForcaThemeInteraction(interaction)) return;
      
      if (await handleMarketInteraction(interaction)) return;
      if (await handleRaidInteraction(interaction)) return;
      if (await handleReelsInteraction(interaction)) return;

      if (
        interaction.customId?.startsWith('boost_select_')
        || interaction.customId?.startsWith('shop_cat_')
        || interaction.customId?.startsWith('weapon_select_')
      ) {
        await handleBoostInteraction(interaction);
        return;
      }

      const { handleInventoryInteraction } = require("../economy/weapons");
      if (await handleInventoryInteraction(interaction)) return;

      const { handleForgeInteraction } = require("../economy/forge");
      if (await handleForgeInteraction(interaction)) return;

      const { handleBossInteraction } = require("../games/boss");
      if (await handleBossInteraction(interaction)) return;

      const { handleGamesInteraction } = require("../games/menu");
      if (await handleGamesInteraction(interaction)) return;

      const { handleFliperamaInteraction } = require("../economy/fliperama");
      if (await handleFliperamaInteraction(interaction)) return;

      // Existing handlers at the end
      handleButtonInteraction(interaction).catch((err) => {
        if (err.code !== 10062) console.error("🔥 Erro inesperado no duelo interactionCreate:", err);
      });
      handleRpgInteraction(interaction).catch((err) => {
        if (err.code !== 10062) console.error("🔥 Erro inesperado no rpg interactionCreate:", err);
      });

    } catch (err) {
      if (err.code !== 10062) {
        logError("INTERACTION_CREATE", err, {
          userId: interaction.user?.id,
          username: interaction.user?.username,
          customId: interaction.customId,
          channelId: interaction.channelId
        });
      }
    }
  });

  if (!config.DISCORD_TOKEN || typeof config.DISCORD_TOKEN !== 'string' || !config.DISCORD_TOKEN.trim()) {
    console.error("\n=======================================================");
    console.error("❌ [ERRO DISCLOUD / AMBIENTE] TOKEN NÃO ENCONTRADO!");
    console.error("=======================================================");
    console.error("👉 O 'DISCORD_TOKEN' está vazio ou o arquivo .env não foi enviado no .zip.");
    console.error("👉 Verifique se o .env está na raiz do .zip ou defina a variável na DisCloud.\n");
    process.exit(1);
  }

  return client.login(config.DISCORD_TOKEN);
}

module.exports = {
  start
};
