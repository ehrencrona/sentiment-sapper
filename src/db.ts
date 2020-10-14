import * as Knex from 'knex';
import { formatDate } from './date';
import upsert from './routes/api/upsert';
import type { Day } from './routes/api/_types';
import knexfile from '../knexfile';

let connection: Knex;

export async function connectToDb() {
	connection = Knex.default(
		process.env.NODE_ENV === 'production'
			? knexfile.production
			: knexfile.development
	);
}

export function getConnection(): Knex {
	return connection;
}

export async function storeSentiment(score: number, date: Date, user: string) {
	return upsert(
		'sentiment',
		['user', 'date'],
		{
			date,
			score,
			user
		},
		await getConnection()
	);
}

export async function getSentimentHistory(user: string): Promise<Day[]> {
	return (
		await getConnection()
			.select('date', 'score')
			.from('sentiment')
			.where('user', user)
			.orderBy('date', 'desc')
	).map(({ date, score }) => ({
		date: formatDate(date),
		score
	}));
}
