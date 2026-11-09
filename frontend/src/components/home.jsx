import "./style/home.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import arrowIcon from "../assets/Icon-5.svg";
import clockIcon from "../assets/Icon-1.svg";
import dropletIcon from "../assets/Icon-4.svg";
import locationIcon from "../assets/Icon.svg";
import searchIcon from "../assets/Icon-6.svg";
import sparkleIcon from "../assets/Icon-7.svg";
import sunIcon from "../assets/Icon-2.svg";
import windIcon from "../assets/Icon-3.svg";
import logoIcon from "../assets/Frame.svg";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
const LAST_WEATHER_KEY = "dripcheck:last-weather";

function getLastWeather() {
	try {
		const savedWeather = window.localStorage.getItem(LAST_WEATHER_KEY);
		return savedWeather ? JSON.parse(savedWeather) : null;
	} catch {
		return null;
	}
}

function Logo() {
	return (
		<Link to="/" className="logo">
			<img src={logoIcon} alt="" />
			<span>Drip<span>Check</span></span>
		</Link>
	);
}

function Home() {
	const navigate = useNavigate();
	const [weather, setWeather] = useState(getLastWeather);
	const [city, setCity] = useState(() => {
		const savedWeather = getLastWeather();
		return savedWeather?.location
			? `${savedWeather.location.name}, ${savedWeather.location.country}`
			: "Valenzuela, Philippines";
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function searchWeather(event) {
		event.preventDefault();

		const searchedCity = city.trim();
		if (!searchedCity) {
			setError("Enter a city or location to search.");
			return;
		}

		setLoading(true);
		setError("");

		try {
			const response = await fetch(
				`${API_URL}/api/weather?city=${encodeURIComponent(searchedCity)}`
			);
			const result = await response.json();

			if (!response.ok || !result.success) {
				throw new Error(result.message || "Unable to find that location.");
			}

			setWeather(result.data);
			window.localStorage.setItem(LAST_WEATHER_KEY, JSON.stringify(result.data));
			navigate(`/dashboard?city=${encodeURIComponent(searchedCity)}`, {
				state: { weather: result.data },
			});
		} catch (requestError) {
			setError(requestError.message || "Unable to search for weather.");
		} finally {
			setLoading(false);
		}
	}

	const location = weather?.location;
	const current = weather?.current;
	const locationName = location
		? `${location.name}, ${location.country}`
		: "Search for a location";
	const temperature = current?.temperature;
	const feelsLike = current?.feelslike;
	const description = current?.weather_descriptions?.[0] || "Weather details will appear here";
	const weatherIcon = current?.weather_icons?.[0];

	return (
		<main className="weather-page">
			<header className="site-header">
				<Logo />
			</header>

			<section className="hero-section">
				<div className="hero-copy">
					<div className="eyebrow"><span className="eyebrow-icon"><img src={sparkleIcon} alt="" /></span> Live Weather Search</div>
					<h1>Check the<br />weather <strong>first.</strong></h1>
					<p className="intro">Search for a location to see real-time temperature and current<br className="desktop-only" /> weather conditions in your area.</p>
					<form className="search-form" onSubmit={searchWeather}>
						<div className="search-input"><img src={searchIcon} alt="" /><input aria-label="Search location" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Search city or location" /></div>
						<button type="submit" disabled={loading}>{loading ? "Searching..." : "Search weather"} <img src={arrowIcon} alt="" /></button>
					</form>
					{error && <p className="search-message search-error" role="alert">{error}</p>}
					{loading && <p className="search-message">Getting the latest weather...</p>}
					<div className="popular"><span>Popular:</span><b>Valenzuela</b><b>Manila</b><b>Tokyo</b></div>
				</div>

				<div className="weather-visual">
					<div className="visual-backdrop" />
					<div className="orbit orbit-one" />
					<div className="orbit orbit-two" />
					<div className="floating-label live-label"><img src={clockIcon} alt="" /> Real-time weather</div>
					<div className="floating-label location-label"><img src={locationIcon} alt="" /> Search location</div>
					<article className="weather-card">
						<div className="card-header">
							<div><small>CURRENT WEATHER</small><h2>{locationName}</h2></div>
							<span className="live-pill"><i /> Live</span>
						</div>
						<div className="weather-summary">
							<div className={`weather-symbol ${weatherIcon ? "has-weather-icon" : ""}`}>
								{weatherIcon ? <img src={weatherIcon} alt={description} /> : <><span className="sun" /><span className="cloud" /></>}
							</div>
							<div className="temperature"><strong>{temperature == null ? "--" : `${temperature}°`}</strong><span>{description}</span><small>{feelsLike == null ? "Search to see feels like" : `Feels like ${feelsLike}°`}</small></div>
						</div>
						<div className="weather-stats">
							<div><img src={dropletIcon} alt="" /><span>Humidity<b>{current?.humidity == null ? "--" : `${current.humidity}%`}</b></span></div>
							<div><img src={windIcon} alt="" /><span>Wind<b>{current?.wind_speed == null ? "--" : `${current.wind_speed} km/h`}</b></span></div>
							<div><img src={sunIcon} alt="" /><span>UV index<b>{current?.uv_index == null ? "--" : current.uv_index}</b></span></div>
						</div>
					</article>
				</div>
			</section>

			<footer className="site-footer">
				<Logo />
				<span>Weather Search For Everyone</span>
				<small>© 2026 Drip Check</small>
			</footer>
		</main>
	);
}

export default Home;
