import "./style/dashboard.css";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import clockIcon from "../assets/Icon-1.svg";
import sunIcon from "../assets/Icon-2.svg";
import windIcon from "../assets/Icon-3.svg";
import humidityIcon from "../assets/Icon-4.svg";
import searchIcon from "../assets/Icon-6.svg";
import sparkleIcon from "../assets/Icon-8.svg";
import checkIcon from "../assets/Icon-11.svg";
import moonIcon from "../assets/Icon-13.svg";
import locationIcon from "../assets/Icon-14.svg";
import logoIcon from "../assets/Frame.svg";

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
const LAST_WEATHER_KEY = "dripcheck:last-weather";

function valueOrUnavailable(value, suffix = "") {
	return value == null || value === "" ? "Unavailable" : `${value}${suffix}`;
}

function Logo() {
	return <Link to="/" className="dashboard-logo"><img src={logoIcon} alt="" /><span>Drip<span>Check</span></span></Link>;
}

function WeatherIcon({ source }) {
	return (
		<div className="dashboard-weather-image-container">
			{source ? <img className="dashboard-weather-image" src={source} alt="Current weather" /> : <div className="dashboard-weather-icon"><i /><b /></div>}
		</div>
	);
}

function Dashboard() {
	const routeLocation = useLocation();
	const navigate = useNavigate();
	const routeCity = new URLSearchParams(routeLocation.search).get("city");
	const [city, setCity] = useState(routeCity || "Valenzuela, Philippines");
	const [weather, setWeather] = useState(routeLocation.state?.weather || null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!routeCity || routeLocation.state?.weather) {
			return;
		}

		let cancelled = false;

		async function loadWeather() {
			setLoading(true);
			setError("");

			try {
				const response = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(routeCity)}`);
				const result = await response.json();

				if (!response.ok || !result.success) {
					throw new Error(result.message || "Unable to find that location.");
				}

				if (!cancelled) {
					setWeather(result.data);
					window.localStorage.setItem(LAST_WEATHER_KEY, JSON.stringify(result.data));
				}
			} catch (requestError) {
				if (!cancelled) {
					setError(requestError.message || "Unable to search for weather.");
				}
			} finally {
				if (!cancelled) {
					setLoading(false);
				}
			}
		}

		loadWeather();

		return () => {
			cancelled = true;
		};
	}, [routeCity, routeLocation.state]);
	const location = weather?.location;
	const current = weather?.current;
	const locationName = location ? `${location.name}, ${location.country}` : "Search for a location";
	const description = current?.weather_descriptions?.[0] || "Unavailable";
	const localDate = location?.localtime?.split(" ")[0] || "Unavailable";
	const timezone = location?.timezone_id || "Unavailable";
	const sunlight = [
		["Sunrise", weather?.astro?.sunrise, sunIcon, "sunrise"],
		["Sunset", weather?.astro?.sunset, sunIcon, "sunset"],
		["Moonrise", weather?.astro?.moonrise, moonIcon, "moon"],
		["Moonset", weather?.astro?.moonset, moonIcon, "moon"],
	];
	const airQuality = current?.air_quality || {};
	const airIndex = airQuality["us-epa-index"] || airQuality["us-epa-index"]?.value;
	const airReadings = [
		["PM2.5", airQuality.pm2_5],
		["PM10", airQuality.pm10],
		["O₃", airQuality.o3],
		["NO₂", airQuality.no2],
		["CO", airQuality.co],
		["SO₂", airQuality.so2],
	];
	const observations = [
		["Precipitation", valueOrUnavailable(current?.precip, " mm")],
		["Cloud cover", valueOrUnavailable(current?.cloudcover, "%")],
		["Visibility", valueOrUnavailable(current?.visibility, " km")],
		["Wind direction", current?.wind_dir && current?.wind_degree != null ? `${current.wind_dir} - ${current.wind_degree}°` : "Unavailable"],
		["Local time", location?.localtime?.split(" ")[1] || "Unavailable"],
		["Observation time", current?.observation_time],
		["Weather code", current?.weather_code],
		["Day or night", current?.is_day === true ? "Daytime" : current?.is_day === false ? "Nighttime" : "Unavailable"],
	];
	const metrics = [
		["Humidity", valueOrUnavailable(current?.humidity, "%"), humidityIcon, "Current"],
		["Wind speed", valueOrUnavailable(current?.wind_speed, " km/h"), windIcon, current?.wind_dir || "Current"],
		["Pressure", valueOrUnavailable(current?.pressure, " hPa"), windIcon, "Current"],
		["UV index", valueOrUnavailable(current?.uv_index), sunIcon, "Current"],
	];

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
			const response = await fetch(`${API_URL}/api/weather?city=${encodeURIComponent(searchedCity)}`);
			const result = await response.json();
			if (!response.ok || !result.success) {
				throw new Error(result.message || "Unable to find that location.");
			}
			setWeather(result.data);
			window.localStorage.setItem(LAST_WEATHER_KEY, JSON.stringify(result.data));
			navigate(`/dashboard?city=${encodeURIComponent(searchedCity)}`, {
				replace: true,
				state: { weather: result.data },
			});
		} catch (requestError) {
			setError(requestError.message || "Unable to search for weather.");
		} finally {
			setLoading(false);
		}
	}

	return (
		<main className="dashboard-page">
			<header className="dashboard-header"><Logo /></header>
			<section className="dashboard-content">
				<div className="dashboard-title-row">
					<div><p className="dashboard-date">{localDate} · {timezone}</p><h1>Weather Data</h1><p>Latest weather data observation for this location.</p></div>
					<form className="dashboard-search" onSubmit={searchWeather}><img src={searchIcon} alt="" /><input value={city} onChange={(event) => setCity(event.target.value)} aria-label="Search location" /><button type="submit" disabled={loading}>{loading ? "Searching..." : "Search"} <span>→</span></button></form>
				</div>
				{error && <p className="dashboard-search-error" role="alert">{error}</p>}
				<div className="top-panels">
					<section className="current-panel"><div className="panel-kicker"><span>⌾</span> CURRENT LOCATION <b>● {loading ? "Updating" : weather ? "Live observation" : "Awaiting search"}</b></div><h2>{locationName}</h2><div className="current-reading"><div><strong>{valueOrUnavailable(current?.temperature, "°")}</strong><span>{description}</span><small>{valueOrUnavailable(current?.feelslike, "°") === "Unavailable" ? "Feels like Unavailable" : `Feels like ${current.feelslike}°`}</small></div><WeatherIcon source={current?.weather_icons?.[0]} /></div><div className="current-times"><span>Observed {valueOrUnavailable(current?.observation_time)}</span><span>Sunrise {valueOrUnavailable(weather?.astro?.sunrise)}</span><span>Sunset {valueOrUnavailable(weather?.astro?.sunset)}</span></div></section>
					<section className="observation-panel panel"><div className="panel-heading"><div><small>WEATHERSTACK CURRENT</small><h2>Latest observation</h2></div><img src={clockIcon} alt="" /></div><div className="observation-grid">{observations.map(([label, value]) => <div key={label}><small>{label}</small><b>{value}</b></div>)}</div><p className="observation-note"><img src={checkIcon} alt="" /> Current conditions only—no forecast or historical data is requested.</p></section>
				</div>
				<section className="metric-grid">{metrics.map(([label, value, icon, tag]) => <article className="metric-card" key={label}><div className="metric-top"><span><img src={icon} alt="" /></span><small>{tag}</small></div><label>{label}</label><strong>{value}</strong></article>)}</section>
				<section className="sun-panel panel"><div className="panel-heading"><div><small>SOURCE: WEATHER API</small><h2>Sun and moon</h2></div><span className="moon-badge"><img src={moonIcon} alt="" /></span></div><div className="sunrise-grid">{sunlight.map(([label, value, icon, type]) => <div className={`astro-item ${type}`} key={label}><img src={icon} alt="" /><span><small>{label}</small><b>{valueOrUnavailable(value)}</b></span></div>)}</div><div className="astro-bottom"><div className="moon-phase"><i /><span><small>Moon Phase</small><b>{valueOrUnavailable(weather?.astro?.moon_phase)}</b></span></div><div><small>Moon illumination</small><b>{valueOrUnavailable(weather?.astro?.moon_illumination, "%")}</b></div></div></section>
				<div className="bottom-panels"><section className="location-panel panel"><div className="panel-heading"><div><small>RESOLVED LOCATION</small><h2>Location details</h2></div><img src={locationIcon} alt="" /></div><div className="location-grid">{[["City", location?.name], ["Region", location?.region], ["Country", location?.country], ["Timezone", location?.timezone_id], ["Latitude", location?.lat], ["Longitude", location?.lon]].map(([label, value]) => <div key={label}><small>{label}</small><b>{valueOrUnavailable(value)}</b></div>)}</div><p className="request-note">Request: {city} · Units: metric · {timezone}</p></section><section className="air-panel"><div className="air-icon"><img src={sparkleIcon} alt="" /></div><small>CURRENT AIR QUALITY</small><h2>{airIndex ? `US EPA index ${airIndex} · Good` : "Air quality unavailable"}</h2><p>Live pollutant concentrations included with this current weather observation.</p><div className="air-grid">{airReadings.map(([label, value]) => <div key={label}><small>{label}</small><b>{valueOrUnavailable(value)}</b></div>)}</div><small>{airIndex ? `US EPA index: ${airIndex}` : "No air-quality data returned"}</small></section></div>
			</section>
		</main>
	);
}

export default Dashboard;