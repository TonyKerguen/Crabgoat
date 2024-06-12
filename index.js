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

const buildChamp = new SlashCommandBuilder()
    .setName('buildChamp')
    .setDescription('Meilleur build pour ce champion')
    .addStringOption(nomChamp =>
        nomChamp.setName('nomchamp')
            .setDescription('le nom du champion')
            .setRequired(true)
    )

const commands = [nblpside.toJSON(), buildChamp.toJSON()];

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
                    console.log(api_url_game)
                    console.log(reponseG.data);
                    const participants = reponseG.data["participants"];
                    let [nblpBlue,nblpRed] = [0,0];
                    if (reponseG.data) {
                        console.log(participants);
                        const dicoTier = { "IRON": 0, "BRONZE": 400, "SILVER": 800, "GOLD": 1200, "PLATINUM": 1600, "EMERALD": 2000 , "DIAMOND": 2400, "MASTER": 2500, "GRANDMASTER": 2500, "CHALLENGER": 2500};
                        for (let joueur of participants) {
                            let templp = 0;
                            const summonerId = joueur["summonerId"];
                            const api_url_joueurB = `https://euw1.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}?api_key=${config.token_api_lol}`;
                            const reponseB = await axios.get(api_url_joueurB);
                            for (const element of reponseB.data) {
                                if (element["queueType"] === "RANKED_SOLO_5x5") {
                                    switch (element["rank"]) {
                                        case "III":
                                            templp += 100;
                                            break;
                                        case "II":
                                            templp += 200;
                                            break;
                                        case "I":
                                            templp += 300;
                                            break;
                                    }
                                    templp += dicoTier[element["tier"]];
                                    templp += element["leaguePoints"];
                                }
                                let couleur
                                if (joueur["teamId"] === 100) {
                                    nblpBlue += templp;
                                    couleur = "blue";
                                }
                                else {
                                    nblpRed += templp;
                                    couleur = "red";
                                }
                                console.log(couleur+" "+joueur["riotId"] + " rank : " + element["tier"] + " " + element["rank"] + " nblp : " + element["leaguePoints"]);
                            }
                        }
                    }
                    interaction.reply("Lp blue side : " + nblpBlue + " |  Lp red side : " + nblpRed);
                }
                catch (error) {
                    console.error(error);
                    interaction.reply('Il joue pas là');
                }
            }
            else {
                interaction.reply('caca boudin');
            }
        } catch (error) {
            console.error(error);
            interaction.reply('Une erreur s\'est produite lors de la récupération des données du joueur.');
        }
    }
    if(interaction.commandName === 'buildChamp'){
      const formattedChampionName = interaction.options.getString('nomchamp').toLowerCase().replace("'","").split(' ')[0]
      console.log(formattedChampionName)
    }
});
console.log("YOLO");

client.login(config.token);