import { DateTime } from 'luxon';
import axios from 'axios';
import { parse } from 'node-html-parser';
import {
    error,
    fail,
    JSendFailureObject,
    JSendObject,
    success,
} from 'typescript-jsend';

const dateClass = '.m-r-1';

const rubbishClass = 'icon-rubbish';
const recyclingClass = 'icon-recycle';

interface CollectionData {
    date: string;
    rubbish: boolean;
    recycling: boolean;
}

interface addressData {
    address: string;
    id: string;
}

interface RubbishResponse extends CollectionData, addressData {}

class InvalidAddressError extends Error {}

export const fetchData = async (
    queryAddress: string,
): Promise<
    JSendObject<RubbishResponse> | JSendFailureObject<{ address: string }>
> => {
    try {
        const addressData = await getAddressData(queryAddress);
        const collectionData = await scrapeSite('12343749528');

        return success({
            ...collectionData,
            ...addressData,
        });
    } catch (err) {
        if (err instanceof InvalidAddressError) {
            return fail({
                address: 'Invalid address search. Try adjusting your query.',
            });
        }

        return error('Error fetching data.');
    }
};

const getAddressData = async (addressString: string): Promise<addressData> => {
    try {
        const result = (
            await axios.post(
                'https://www.aucklandcouncil.govt.nz/_vti_bin/ACWeb/ACservices.svc/GetMatchingPropertyAddresses',
                {
                    ResultCount: 1,
                    SearchText: addressString,
                    RateKeyRequired: true,
                },
            )
        ).data[0];

        return {
            address: result.Address,
            id: result.ACRateAccountKey,
        };
    } catch (err) {
        throw new InvalidAddressError();
    }
};

const scrapeSite = async (addressId: string): Promise<CollectionData> => {
    const res = await axios.get(
        `https://www.aucklandcouncil.govt.nz/rubbish-recycling/rubbish-recycling-collections/Pages/collection-day-detail.aspx?an=${addressId}`,
    );

    const parsed = parse(res.data);

    const nextCollectionElement = parsed.querySelectorAll(dateClass)[0];

    const dateFormatString = 'EEEE d MMMM'; // https://moment.github.io/luxon/#/parsing?id=table-of-tokens
    const formattedDate = DateTime.fromFormat(
        nextCollectionElement.text,
        dateFormatString,
    ).toLocaleString();

    const firstIconElement = nextCollectionElement.nextElementSibling;
    const secondIconElement = firstIconElement.nextElementSibling;

    let rubbish = false;
    let recycling = false;

    if (firstIconElement.classList.contains(rubbishClass)) {
        rubbish = true;

        if (
            secondIconElement &&
            secondIconElement.classList.contains(recyclingClass)
        ) {
            recycling = true;
        }
    } else if (firstIconElement.classList.contains(recyclingClass)) {
        recycling = true;

        // In theory we shouldn't neeed this, because the whenever there's recyling there is usually rubbish.
        // But just in case the council decides to swap the icons 🤷
        if (
            secondIconElement &&
            secondIconElement.classList.contains(rubbishClass)
        ) {
            rubbish = true;
        }
    }

    return {
        date: formattedDate,
        rubbish,
        recycling,
    };
};
