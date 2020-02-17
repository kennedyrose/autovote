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
	headless: true,
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
	await timer(100)
	await page.click(`#PDI_answer48605260`)

	console.log(`Clicking submit button...`)
	await page.click(`#pd-vote-button10507350`)

	console.log(`Waiting for results...`)
	await page.waitForSelector(`.pds-feedback-group`)

	const score = await page.evaluate(() => {
		const str = []
		const els = document.querySelectorAll(`.pds-feedback-group`)
		els.forEach(el => {
			const name = el.querySelector(`.pds-answer-text`)
				.textContent
				.split(`,`)[0]
			const votes = el.querySelector(`.pds-feedback-votes`)
				.textContent
				.split(`(`)[1]
				.split(`)`)[0]
			str.push(`${name}: ${votes}`)
		})
		return str.join(`\n`)
	})

	const result = [
		`Voted ${total} times`,
		score,
	]

	total++
	console.log(`\n${result.join(`\n`)}\n`)
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