const Discord = require("discord.js");

function Propsal(props) {
  const { title, choices, results, currentStatus, refId } = props;
  console.log(title);
  const exampleEmbed = new Discord.MessageEmbed()
    .setColor("#0099ff")
    .setTitle(title)
    .setURL(`https://boardroom.io/shapeshift/proposal/${refId}`)
    .setAuthor(proposer)
    .addFields(
      results.map((result) => {
        return {
          name: choices[result.coice],
          value: total,
          inline: true,
        };
      }),
      { name: "Status", value: currentStatus }
    )
    .setTimestamp()
    .setFooter(
      "Boardroom",
      "https://boardroom.io/favicons/apple-icon-57x57.png"
    );
  return exampleEmbed;
}

module.exports = {
  Propsal,
};
