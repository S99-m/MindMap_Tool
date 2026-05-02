import { memo } from 'react'
import { useMindMap } from '../context/MindMapContext'
import { useWeather } from '../hooks'

const WeatherWidget = memo(function WeatherWidget() {
  const { weather, weatherLoading, weatherError, lastFetched } = useMindMap()
  const { fetchWeather } = useWeather(60000) // auto-refresh every 60s

  const formatTime = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          Live Weather
        </span>
        <button
          onClick={fetchWeather}
          disabled={weatherLoading}
          title="Refresh weather"
          className="text-xs px-2 py-1 rounded-md transition-all"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-secondary)',
            cursor: weatherLoading ? 'not-allowed' : 'pointer',
          }}
        >
          <span className={weatherLoading ? 'animate-spin-slow inline-block' : ''}>↻</span>
          {' '}Refresh
        </button>
      </div>

      {weatherLoading && !weather && (
        <div className="flex items-center gap-2 py-2">
          <div
            className="animate-spin-slow"
            style={{
              width: 16, height: 16,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--accent)',
              borderRadius: '50%',
            }}
          />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Fetching weather…</span>
        </div>
      )}

      {weatherError && !weather && (
        <p className="text-xs" style={{ color: '#dc2626' }}>{weatherError}</p>
      )}

      {weather && (
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <span style={{ fontSize: 28 }}>{weather.emoji}</span>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Syne, sans-serif' }}>
                  {weather.temp}{weather.unit}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  feels {weather.feelsLike}{weather.unit}
                </span>
              </div>
              <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
                {weather.city}
              </p>
            </div>
          </div>

          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>
            {weather.description}
          </p>

          <div className="flex gap-3">
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              💧 {weather.humidity}%
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              🌬️ {weather.windSpeed} km/h
            </span>
          </div>

          {lastFetched && (
            <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
              Updated {formatTime(lastFetched)}
            </p>
          )}
        </div>
      )}
    </div>
  )
})

export default WeatherWidget
