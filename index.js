require("dotenv").config();
const axios = require("axios");
const Discord = require("discord.js");
const client = new Discord.Client();
const numeral = require("numeral");
const { Propsal } = require("./proposal");

const channels = JSON.parse(process.env.DISCORD_CHANNEL);

client.on("ready", () => {
  console.info("running bot");
  client.user.setActivity("The Fox and the Hound", { type: "WATCHING" });
});

/**
 * Create a text progress bar
 * @param {Number} value - The value to fill the bar
 * @param {Number} maxValue - The max value of the bar
 * @param {Number} size - The bar size (in letters)
 * @return {String} - The bar
 */
global.progressBar = (value, maxValue, size) => {
  const percentage = value / maxValue; // Calculate the percentage of the bar
  const progress = Math.round(size * percentage); // Calculate the number of square caracters to fill the progress side.
  const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

  const progressText = "▇".repeat(progress); // Repeat is creating a string with progress * caracters in it
  const emptyProgressText = "—".repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
  const percentageText = (percentage * 100).toFixed(2) + "%"; // Displaying the percentage of the bar

  const bar =
    "```[" + progressText + emptyProgressText + "]" + percentageText + "```"; // Creating the bar
  return bar;
};

const calculateTotal = (data) => {
  const total = 0;
  data.forEach((item) => total + item.total);
  console.log(total);
  return total;
};

function truncateWords(sentence, amount, tail) {
  const words = sentence.split(" ");

  if (amount >= words.length) {
    return sentence;
  }

  const truncated = words.slice(0, amount);
  return `${truncated.join(" ")}${tail}`;
}

client.on("message", (message) => {
  if (message.content === "!prop-template") {
    message.channel.send(process.env.PROP_TEMPLATE);
  }
  if (message.content === "!proposals") {
    const resp = axios
      .get(
        `https://api.boardroom.info/v1/protocols/${process.env.DAO}/proposals?limit=50&key=${process.env.API_KEY}`
      )
      .then((resp) => {
        const data = resp.data.data;
        const proposals = data.filter((item) => item.currentState === "active");
        if (proposals.length === 0) {
          message.channel.send(
            `${message.author.username}, you trigger-happy lunatic! There arent any active proposals!`
          );
        }
        data.forEach((propData) => {
          const {
            title,
            choices,
            results,
            currentState,
            refId,
            proposer,
            total,
            content,
          } = propData;
          if (currentState !== "active") return;
          const color = currentState === "active" ? "#4235E1" : "#757575";
          const totalVotes = results.reduce(function (tot, record) {
            return tot + record.total;
          }, 0);
          const exampleEmbed = new Discord.MessageEmbed()
            .setColor(color)
            .setTitle(title)
            .setDescription(truncateWords(content, 25, "..."))
            .setURL(`https://boardroom.io/${process.env.DAO}/proposal/${refId}`)
            .addFields(
              results.map((result) => {
                const percentage = (result.total / totalVotes) * 100;
                console.log(result.total, totalVotes, percentage);
                return {
                  name: `${choices[result.choice]} - ${numeral(
                    result.total
                  ).format("0,0")}`,
                  value: `${progressBar(percentage, 100, 20)}`,
                };
              })
            )
            .setTimestamp()
            .setFooter(
              "Boardroom",
              "https://boardroom.io/favicons/apple-icon-57x57.png"
            );
          message.channel.send(exampleEmbed);
        });
      });
  }
});

client.login(process.env.BOT_TOKEN);
