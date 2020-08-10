import Head from 'next/head';
import styles from '../styles/Home.module.css';
import { useQuery, usePaginatedQuery } from 'react-query';
import { useState } from 'react';
import Card from '../components/Card';
import { GenresList } from '../components/GenresList';
import Filters from '../components/Filters';

const config = {
	API_KEY: '5c36791d98d96dc9af65af5475e4d14e',
};

// &with_genres=16
const endpoint = `https://api.themoviedb.org/3/discover/movie?api_key=${config.API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&`;

const fetchMovies = async (__key, page, genre, minR) => {
	let info = '';
	if (genre) info += '&with_genres=' + genre;
	if (minR) info += '&vote_average.gte=' + minR;
	const res = await fetch(`${endpoint}&page=${page}${info}`);
	return res.json();
};

// export async function getServerSideProps() {
// 	// const data = await fetchMovies();

// 	// return {
// 	// 	props: {
// 	// 		data,
// 	// 	},
// 	// };
// 	return { props: {} };
// }
interface Genre {
	name: string;
	id: string;
}
export default function Home() {
	const [page, setPage] = useState(1);
	const [genre, setGenre] = useState<Genre>({ id: '16', name: 'Animation' });
	const [rating, setRating] = useState('5');
	const { resolvedData, latestData, status } = usePaginatedQuery(
		['movies', page, genre.id, rating],
		fetchMovies,
	);
	let results = [];

	if (status === 'success') {
		results = resolvedData.results;
	}
	const handleGenreChange = (genre: Genre) => {
		setGenre(genre);
		setPage(1);
	};
	const handleNext = () => {
		setPage(current => current + 1);
	};
	const handlePrevious = () => {
		if (page == 1) {
			return;
		}
		setPage(current => current - 1);
	};
	return (
		<div className={styles.container}>
			<Head>
				<title>Movies</title>
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>Welcome to Movies</h1>
				<GenresList onChange={handleGenreChange} active={genre.id} />
				<Filters {...{ rating, setRating }} />
				<p className={styles.description}>{`${
					genre.name ? genre.name : 'Popular'
				} Movies`}</p>
				<div>
					<button onClick={handlePrevious} disabled={page == 1}>
						Previous
					</button>
					<span> -{page}- </span>
					<button onClick={handleNext}>next</button>
				</div>

				<div className='grid'>
					{resolvedData != latestData && (
						<div className='loading'>
							<span></span>
						</div>
					)}
					{resolvedData &&
						results.map((movie, i) => {
							const { id, title, poster_path } = movie;

							return <Card key={i} movie={movie} />;
						})}
				</div>
			</main>

			<footer className={styles.footer}>Browse Movies</footer>
		</div>
	);
}
