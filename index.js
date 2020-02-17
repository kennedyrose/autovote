const puppeteer = require(`puppeteer`)
const { getRandom } = require(`random-useragent`)

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
const block = [
	`image`,
	`font`,
	// `stylesheet`,
]

async function tick(){

	// Launch browser
	if(!browser){
		console.log(`Launching browser...`)
		browser = await puppeteer.launch(options)
		page = await browser.newPage()
		await page.setRequestInterception(true)
		page.on('request', request => {
			const type = request.resourceType()

			if (block.indexOf(type) > -1) {
				request.abort()
			}
			else {
				request.continue()
			}
		});
	}

	console.log(`Generating random user agent...`)
	await page.setUserAgent(getRandom())

	console.log(`Loading page...`)
	page.goto('https://www.courierpress.com/story/sports/high-school/polls/2020/02/17/who-your-turonis-high-school-athlete-week/4785043002/')


	console.log(`Looking for input...`)
	await page.waitForSelector(`input#PDI_answer48605260`)

	await timer(3000)
	console.log(`Clicking input...`)
	await page.click(`input#PDI_answer48605260`)

	console.log(`Clicking submit button...`)
	await page.click(`#pd-vote-button10507350`)

	console.log(`Waiting for results...`)
	await page.waitForSelector(`.pds-feedback-group`)

	const score = await page.evaluate(() => {
		const str = []
		const els = document.querySelectorAll(`.pds-feedback-group`)
		const msg = document.querySelector(`.pds-question-top`).textContent
		str.push(msg)
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

	total++
	const result = [
		`Voted ${total} times`,
		score,
	]

	console.log(`\n${result.join(`\n`)}\n`)
	await timer(3000)
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