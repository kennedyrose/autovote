const puppeteer = require(`puppeteer`)

const args = [
	'--no-sandbox',
	'--disable-setuid-sandbox',
	'--disable-infobars',
	'--window-position=0,0',
	'--ignore-certifcate-errors',
	'--ignore-certifcate-errors-spki-list',
	'--user-agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3312.0 Safari/537.36"'
];

const options = {
	args,
	headless: false,
	// ignoreHTTPSErrors: true,
	// userDataDir: './tmp'
};

let browser
let page
let total = 0

async function tick(){
	if(!browser){
		console.log(`Launching browser...`)
		browser = await puppeteer.launch(options)
		page = await browser.newPage();
	}
	console.log(`Loading page...`)
	await page.goto('https://www.courierpress.com/story/sports/high-school/polls/2020/02/17/who-your-turonis-high-school-athlete-week/4785043002/', {
		waitUntil: 'networkidle2',
	})

	console.log(`Looking for input...`)
	await page.waitForSelector(`#PDI_answer48605260`)

	console.log(`Clicking input...`)
	await page.click(`#PDI_answer48605260`)

	console.log(`Clicking submit button...`)
	await page.click(`#pd-vote-button10507350`)

	console.log(`Waiting for results...`)
	await page.waitForSelector(`.pds-feedback-group`)

	total++
	console.log(`Voted ${total} times`)
	tick()
}
function timer(n) {
	return new Promise(resolve => {
		setTimeout(resolve, n)
	})
}

try {
	tick()
}
catch(err){
	console.error(err)
	tick()
}