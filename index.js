require('dotenv').config()
const axios = require('axios')
const Discord = require('discord.js');
const client = new Discord.Client();
const numeral = require('numeral');
const { Propsal } = require('./proposal')

const channels = JSON.parse(process.env.DISCORD_CHANNEL)

client.on('ready', () => {
  client.user.setActivity('The Fox and the Hound', {type: 'WATCHING'});
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
  const progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
  const emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

  const progressText = '▇'.repeat(progress); // Repeat is creating a string with progress * caracters in it
  const emptyProgressText = '—'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
  const percentageText = (percentage * 100).toFixed(2) + '%'; // Displaying the percentage of the bar

  const bar = '```[' + progressText + emptyProgressText + ']' + percentageText + '```'; // Creating the bar
  return bar;
};

const calculateTotal = data => {
  const total = 0;
  data.forEach(item => total + item.total)
  console.log(total)
  return total;
}

function truncateWords(sentence, amount, tail) {
  const words = sentence.split(' ');

  if (amount >= words.length) {
    return sentence;
  }

  const truncated = words.slice(0, amount);
  return `${truncated.join(' ')}${tail}`;
}

client.on('message', message => {
  //if (!channels.includes(message.channel.id)) return
  if (message.content === '!airdrop') {
    const exampleEmbed = {
      color: 0x0099ff,
      title: 'Airdrop Resources',
      url: 'https://shapeshift.com/shapeshift-decentralize-airdrop',
      description: 'Collection of helpful links for the ShapeShift DAO Airdrop.',
      fields: [
        {
          name: 'Links',
          value: '[1) How to Claim ⭢](https://shapeshift.zendesk.com/hc/en-us/articles/4403645992077-FOX-Airdrop-How-it-Works)\n[2) How long to Claim? ⭢](https://shapeshift.zendesk.com/hc/en-us/articles/4405404486285-How-Long-do-I-Have-to-Claim-My-FOX-)\n[3) Who is Eligible? ⭢](https://shapeshift.zendesk.com/hc/en-us/articles/4403645953037-Who-is-Eligible-to-Receive-Airdropped-FOX-)',
          inline: true,
        }
      ],
      image: {
        url: 'https://assets.website-files.com/5cec55545d0f47cfe2a39a8e/60ee705019111828cd4ecf0e_ship-announcement-hero.jpg',
      },
    };
    message.channel.send({ embed: exampleEmbed });
  }
  if (message.content === '!prop-template') {
    message.channel.send('https://forum.shapeshift.com/t/shapeshift-proposal-template/54')
  }
  if (message.content === '!proposals') {
    const resp = axios.get('https://api.boardroom.info/v1/protocols/shapeshift/proposals?limit=50').then(resp => {
      const data = resp.data.data
      data.forEach((propData) => {
        const { title, choices, results, currentState, refId, proposer, total, content } = propData
        if (currentState !== 'active') return
        const color = currentState === 'active' ? '#4235E1' : '#757575';
        const totalVotes = results.reduce( function(tot, record) {
          return tot + record.total;
        },0);
        const exampleEmbed = new Discord.MessageEmbed()
        .setColor(color)
        .setTitle(title)
        .setDescription(truncateWords(content, 25, '...'))
        .setURL(`https://app.boardroom.info/shapeshift/proposal/${refId}`)
        .addFields(
          results.map(result => {
            const percentage = result.total / totalVotes * 100
            console.log(result.total, totalVotes, percentage)
            return {
              name: `${choices[result.choice]} - ${numeral(result.total).format('0,0')}`,
              value: `${progressBar(percentage, 100, 20)}`, 
            }
          })
        )
        .setTimestamp()
        .setFooter("Boardroom", "https://app.boardroom.info/favicons/apple-icon-57x57.png")
        message.channel.send(exampleEmbed)
      })
    })
  }
});

client.login(process.env.BOT_TOKEN);