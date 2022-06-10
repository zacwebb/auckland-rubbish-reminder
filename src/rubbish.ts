import puppeteer from "puppeteer";
import { DateTime } from "luxon";

const dateClass = '.m-r-1';

interface RubbishResponse {
    date: string,
    rubbish: boolean,
    recycling: boolean,
}

export const scrapeSite = async (): Promise<RubbishResponse|{}> => {
    const browser = await puppeteer.launch({
        headless: process.env.PUPPETEER_HEADLESS === 'true',
        args: ['--no-sandbox','--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(process.env.COUNCIL_URL as string);

    const dateElement = await page.waitForSelector(dateClass);

    if (!dateElement) {
        console.error('Target element not found on page.');
        return {};
    }
    
    const rawDateValue = await getElementText(dateElement);
    const dateFormatString = 'EEEE d MMMM'; // https://moment.github.io/luxon/#/parsing?id=table-of-tokens
    const formattedDate = DateTime.fromFormat(rawDateValue, dateFormatString).toLocaleString();

    const collectionTypeFirstElement = await getCollectionType(dateElement);

    if (!collectionTypeFirstElement) {
        console.error('Unable to find collection type icon.');
        return {};
    }

    const rubbish = (await getElementText(collectionTypeFirstElement)) === 'Rubbish';

    const collectionTypeSecondElement = await getCollectionType(collectionTypeFirstElement);

    const recycling = collectionTypeSecondElement && (await getElementText(collectionTypeSecondElement) === 'Recycle');

    return {
        date: formattedDate,
        rubbish,
        recycling,
    }
}

const getCollectionType = async (element: puppeteer.ElementHandle): Promise<puppeteer.ElementHandle|null> => {
    return await (await element.getProperty('nextElementSibling')).asElement();
}

const getElementText = async (element: puppeteer.ElementHandle): Promise<string> => {
    return (await element.evaluate(el => el.textContent)) ?? '';
}