import { Client, IntentsBitField, SlashCommandBuilder, REST, Routes } from 'discord.js';
const client = new Client({ intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.MessageContent, IntentsBitField.Flags.GuildMembers] });
import config from './config.json' assert { type: 'json' };
import axios from 'axios';

const nblpside = new SlashCommandBuilder()
  .setName('nblpside')
  .setDescription('Nombre de lp red et blue side')
  .addStringOption(pseudo =>
    pseudo.setName('pseudodujoueur')
      .setDescription('Le pseudo du joueur')
      .setRequired(true)
  )
  .addStringOption(tag =>
    tag.setName('tagdujoueur')
      .setDescription('Le # du joueur')
      .setRequired(true)
  )

const commands = [nblpside.toJSON()];

const rest = new REST({ version: '10' }).setToken(config.token);

try {
  console.log('Started refreshing application (/) commands.');
  rest.put(Routes.applicationCommands(config.client_id), { body: commands });
  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.error(error);
}

client.on('ready', () => {
  console.log("Crabgoat is online!")
})

client.on('interactionCreate', async interaction => {
  if (interaction.user.bot) return;
  if (interaction.commandName === 'nblpside') {
    const pseudosansespace = interaction.options.getString('pseudodujoueur').replace(" ", "%20");
    const tagdujoueur = interaction.options.getString('tagdujoueur');
    const api_url_joueur = `https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${pseudosansespace}/${tagdujoueur}?api_key=${config.token_api_lol}`;

    try {
      const responseJ = await axios.get(api_url_joueur);
      const puuid = responseJ.data["puuid"];
      if (responseJ.data) {
        try {
          const api_url_game = `https://euw1.api.riotgames.com/lol/spectator/v5/active-games/by-summoner/${puuid}?api_key=${config.token_api_lol}`;
          const reponseG = await axios.get(api_url_game);
          const participants = reponseG.data["participants"];
          if (reponseG.data) {
            console.log(participants);
            let nblpBlue = 0;
            console.log("");
            console.log("Blue side player:");
            for (let i = 0; i < 5; i++) {
              const summonerId = participants[i]["summonerId"];
              const api_url_joueurB = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${config.token_api_lol}`;
              const reponseB = await axios.get(api_url_joueurB);
              for (const element of reponseB.data) {
                if(element["queueType"] === "RANKED_SOLO_5x5"){
                  if(element["tier"] === "MASTER" || element["tier"] === "MASTER" || element["tier"] === "MASTER"){
                    nblpBlue += 2800 + element["leaguePoints"];
                  }
                  else{
                    if(element["rank"] === "III"){nblpBlue += 100}
                    if(element["rank"] === "II"){nblpBlue += 200}
                    if(element["rank"] === "I"){nblpBlue += 300}
                    if(element["tier"] === "DIAMOUND"){
                      nblpBlue += 2400 +element["leaguePoints"];
                    }
                    if(element["tier"] === "EMERALD"){
                      nblpBlue += 2000 + element["leaguePoints"];
                    }
                    if(element["tier"] === "PLATINUM"){
                      nblpBlue += 1600 + element["leaguePoints"];
                    }
                    if(element["tier"] === "GOLD"){
                      nblpBlue += 1200 + element["leaguePoints"];
                    }
                    if(element["tier"] === "SILVER"){
                      nblpBlue += 800 + element["leaguePoints"];
                    }
                    if(element["tier"] === "BRONZE"){
                      nblpBlue += 400 + element["leaguePoints"];
                    }
                    if(element["tier"] === "IRON"){
                      nblpBlue += element["leaguePoints"];
                    }
                  }
                  console.log(participants[i]["riotId"] + " rank : "+ element["tier"] + " " + element["rank"] + " nblp : " + element["leaguePoints"]);
                }
              }
            }
            let nblpRed = 0;
            console.log("");
            console.log("Red side player:");
            for (let i = 5; i < 10; i++) {
              const summonerId = participants[i]["summonerId"];
              const api_url_joueurR = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${config.token_api_lol}`;
              const reponseR = await axios.get(api_url_joueurR);
              for (const element of reponseR.data) {
                if(element["queueType"] === "RANKED_SOLO_5x5"){
                  console.log(participants[i]["riotId"]+" lp : "+element["leaguePoints"]);
                  nblpRed += element["leaguePoints"];
                }
              }
            }
            interaction.reply("Lp blue side : "+nblpBlue+" |  Lp red side : "+nblpRed);
          } 
          else {
            interaction.reply('caca boudin');
          }
        }
        catch (error) {
          console.error(error);
          interaction.reply('Il joue pas là');
        }
      } else {
        interaction.reply('Aucune donnée trouvée pour ce joueur.');
      }
    } catch (error) {
      console.error(error);
      interaction.reply('Une erreur s\'est produite lors de la récupération des données du joueur.');
    }
  }
});

client.login(config.token);