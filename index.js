const { MessengerBot } = require('bottender');
const { createServer } = require('bottender/express');

const bot = new MessengerBot({
  accessToken: 'EAAYzaWcruX0BAAeQGxcZBZAyMV18eOeCsRlqWIJA47oQzDtwUq9GNZAVA5cgNn6V0GhMTmkovDGggy2uUYnZAOWN0RJguaDeVsTcwem1LahaPuw6Cp9qWPIGweVwGNZA16ZCrYLvcilR6q4Hamn8PVvtEKCrQzFjAV6sneWiki6wqZAoz7hDvg6',
  appSecret: 'bd48b3ead8fcaa9d4e08200ecca3b5cc',
});

bot.onEvent(async context => {
  await context.sendText('Hello World');
});

const server = createServer(bot);

server.listen(5000, () => {
  console.log('server is running on 5000 port...');
});


server.get('/webhook/', function (req, res) {
	  if (req.query['hub.verify_token'] === '3191') {
		  res.send(req.query['hub.challenge'])
	  }
	  res.send('Error, wrong token')
})