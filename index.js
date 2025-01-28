async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function openPageAndFindMatch(regex, driver, until, By) {
  // Refresh page
  await driver.navigate().refresh()
  await sleep(500)

  // Click on show more
  const showMoreButton = await driver.wait(until.elementLocated(By.css('.bOOTXZ')), 5000)
  await showMoreButton.click()

  // Find component includes NumberCollection__StyledRow-zgucn8-0 
  const numbersContainer = await driver.wait(until.elementLocated(By.css('.NumberCollection__StyledRow-zgucn8-0')), 5000)

  // Find all children of the component
  const numbersList = await numbersContainer.findElements(By.css('.jyPbvj'))
  let isMatched = false
  let text = ''
  for (const number of numbersList) {
    await number.click()
    text = await number.getText()

    const args = process.argv.slice(2)
    const isTest = args.includes('--test') && args[args.indexOf('--test') + 1] === 'true'
    if (
      isTest &&
      text.startsWith('8')
    ) {
      return true;
    }
    // console.log('Checking:', text)
    const match = regex.test(text)

    if (!match) {
      continue
    }

    console.log('Found superficial match:', text)

    // Count each number, ensure it doesn't appear more than 2 times
    const counter = new Map();
    isMatched = true;
    for (const char of text) {
      if (counter.has(char)) {
        counter.set(char, counter.get(char) + 1);
      } else {
        counter.set(char, 1);
      }

      if (counter.get(char) > 2) {
        isMatched = false;
        break;
      }
    }

    if (!isMatched) {
      continue;
    }

    break;
  }

  isMatched && console.log('Matched:', text)

  return isMatched
}

async function start() {
  console.log('Starting driver')

  const { Browser, Builder, until, By } = require('selenium-webdriver')
  const Edge = require('selenium-webdriver/edge')
  const options = new Edge.Options()
    options.addArguments('--window-size=800,600')
    // options.addArguments('--selenium-manager true')

  // Path is at current executable path + chrome-win/chrome.exe
  // const path = require('path')
  // const chromePath = path.join(__dirname, 'chrome-win', 'chrome.exe')

  const driver = new Builder()
    .forBrowser(Browser.EDGE)
    .setChromeOptions(options)
    // .setChromeService(new Chrome.ServiceBuilder(chromePath).build())
    .build()

  driver.get('https://buy.gomo.sg/select-number/?promocode=4GSAVERLITE&_gl=1*1il3lqw*_gcl_aw*R0NMLjE3MzMwNDU0NzAuRUFJYUlRb2JDaE1JZ1Blc3VLR0dpZ01Wb2FWbUFoMUVDaDc3RUFBWUF5QUFFZ0lhdWZEX0J3RQ..*_gcl_dc*R0NMLjE3MzMwNDU0NzAuRUFJYUlRb2JDaE1JZ1Blc3VLR0dpZ01Wb2FWbUFoMUVDaDc3RUFBWUF5QUFFZ0lhdWZEX0J3RQ..*_gcl_au*MjAyNTA3ODE1Mi4xNzMzMDQ1NDY5*_ga*MTY2MzMzMjg2Ny4xNzMzMDQ1NDY5*_ga_PVSCWPTQ2V*MTczMzE1MTI2Ni4xMS4xLjE3MzMxNTI1ODkuMjMuMC4w')

  const regex = /^9[13459]*$/g
  let isNumberFound = false
  while (!isNumberFound) {
    try {
      isNumberFound = await openPageAndFindMatch(regex, driver, until, By)
    } catch (e) {
      console.error(e)
    }
  }

  console.log('Number found')
}

start()