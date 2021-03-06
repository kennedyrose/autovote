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
]

const options = {
	args,
	headless: true,
	// ignoreHTTPSErrors: true,
	// userDataDir: './tmp'
}
const timeout = 4500
const watch = `Chandler Moore`

let browser
let page
let total = 0
let previousVotes = 0
const block = [
	`image`,
	`font`,
	// `stylesheet`,
]

async function tick(){

	try {

		// Launch browser
		if (!browser) {
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
		await page.waitForSelector(`input#PDI_answer48605260`, {
			timeout: 6000,
		})

		console.log(`Clicking input...`)
		await page.click(`input#PDI_answer48605260`)

		console.log(`Clicking submit button...`)
		await page.click(`#pd-vote-button10507350`)

		console.log(`Waiting for results...`)
		await page.waitForSelector(`.pds-feedback-group`, {
			timeout: 2000,
		})

		const res = await page.evaluate(() => {
			const scores = []
			const els = document.querySelectorAll(`.pds-feedback-group`)
			const msg = document.querySelector(`.pds-question-top`).textContent.trim()
			els.forEach(el => {
				const name = el.querySelector(`.pds-answer-text`)
					.textContent
					.split(`,`)[0]
					.trim()
				let votes = el.querySelector(`.pds-feedback-votes`)
					.textContent
					.split(`(`)[1]
					.split(`)`)[0]
					.split(` `)[0]
				votes = parseInt(votes.replace(/,/g, ``))
				if (name) {
					scores.push({
						name,
						votes,
					})
				}
			})
			return {
				msg,
				scores,
			}
		})

		console.log(`Result: ${res.msg}`)

		let str = []
		res.scores.forEach(({ name, votes }) => {
			if(name == watch){
				if (previousVotes == votes){
					console.log(`\nNO CHANGE!\n`)
				}
				previousVotes = votes
			}
			str.push(`${name}: ${votes}`)
		})
		str = str.join(`\n`)

		total++

		const toTop = res.scores[0].votes - previousVotes
		let msg
		if (!toTop) {
			msg = `Votes to second spot: ${previousVotes - res.scores[1].votes}`
		}
		else {
			msg = `Votes to top spot: ${toTop}`
		}

		const result = [
			`Voted ${total} times`,
			str,
			msg,
		]

		console.log(`\n${result.join(`\n`)}\n`)
	}
	catch(err){
		console.error(err)
		await browser.close()
		browser = false
		page = false
	}

	if (timeout){
		console.log(`Waiting for ${timeout / 1000} seconds...`)
		await timer(timeout)
	}
	tick()
}
function timer(n) {
	return new Promise(resolve => {
		setTimeout(resolve, n)
	})
}


tick()