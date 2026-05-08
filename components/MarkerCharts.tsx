'use client'

import { useState } from 'react'
import { TreatmentRecord, MARKER_REFS } from '@/lib/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend, Area, AreaChart,
} from 'recharts'

interface Props { records: TreatmentRecord[] }

const MARKER_COLORS: Record<string, string> = {
  CEA: '#38bdf8',
  CA199: '#fb7185',
  CA125: '#a78bfa',
  CA153: '#fbbf24',
  CA724: '#34d399',
  AFP: '#f97316',
  WBC: '#60a5fa',
  HGB: '#e879f9',
  PLT: '#2dd4bf',
}

function getColor(name: string, idx: number): string {
  if (MARKER_COLORS[name.toUpperCase()]) return MARKER_COLORS[name.toUpperCase()]
  const fallbacks = ['#38bdf8', '#fb7185', '#a78bfa', '#fbbf24', '#34d399', '#f97316', '#60a5fa', '#e879f9']
  return fallbacks[idx % fallbacks.length]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-accent)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
      minWidth: 160,
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
        {label}
      </div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 4 }}>
          <span style={{ color: p.color }}>● {p.name}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export default function MarkerCharts({ records }: Props) {
  const [chartType, setChartType] = useState<'line' | 'area'>('area')
  const [selectedMarkers, setSelectedMarkers] = useState<Set<string>>(new Set(['CEA', 'CA199', 'CA125']))

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <p style={{ color: 'var(--text-muted)' }}>暂无数据，请先添加治疗记录</p>
      </div>
    )
  }

  // Collect all marker names
  const allMarkers = [...new Set(records.flatMap(r => r.markers.map(m => m.name)))]

  // Build chart data (tumor markers)
  const markerData = records.map(r => {
    const point: Record<string, any> = { date: r.date }
    r.markers.forEach(m => { point[m.name] = m.value })
    return point
  })

  // Build blood chart data
  const bloodData = records
    .filter(r => r.blood && Object.values(r.blood).some(v => v != null))
    .map(r => ({
      date: r.date,
      WBC: r.blood?.wbc,
      HGB: r.blood?.hgb,
      PLT: r.blood?.plt,
      Neutrophil: r.blood?.neutrophil,
    }))

  const toggleMarker = (name: string) => {
    const next = new Set(selectedMarkers)
    if (next.has(name)) {
      if (next.size > 1) next.delete(name)
    } else {
      next.add(name)
    }
    setSelectedMarkers(next)
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['area', 'line'] as const).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              style={{
                padding: '6px 14px',
                fontSize: 12,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                border: 'none',
                background: chartType === t ? 'var(--accent-teal-dim)' : 'var(--bg-card)',
                color: chartType === t ? 'var(--accent-teal)' : 'var(--text-muted)',
                fontWeight: chartType === t ? 600 : 400,
              }}
            >
              {t === 'area' ? '面积图' : '折线图'}
            </button>
          ))}
        </div>
      </div>

      {/* Tumor markers chart */}
      <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            肿瘤标志物趋势
          </h3>
          <div className="flex flex-wrap gap-2">
            {allMarkers.map((name, i) => {
              const color = getColor(name, i)
              const active = selectedMarkers.has(name)
              return (
                <button
                  key={name}
                  onClick={() => toggleMarker(name)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: `1px solid ${color}44`,
                    background: active ? `${color}18` : 'var(--bg-card)',
                    color: active ? color : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : 'var(--text-muted)' }} />
                  {name}
                </button>
              )
            })}
          </div>
        </div>

        <ResponsiveContainer width="100%" height={320}>
          <ChartComponent data={markerData}>
            <defs>
              {allMarkers.filter(n => selectedMarkers.has(n)).map((name, i) => (
                <linearGradient key={name} id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor(name, i)} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={getColor(name, i)} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,48,72,0.5)" />
            <XAxis
              dataKey="date"
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={{ stroke: 'var(--border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />

            {allMarkers.filter(n => selectedMarkers.has(n)).map((name, i) => {
              const color = getColor(name, i)
              const ref = MARKER_REFS[name.toUpperCase()]
              return (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, stroke: color, strokeWidth: 2, fill: 'var(--bg-card)' }}
                  connectNulls
                />
              )
            })}

            {/* Reference lines for normal ranges */}
            {[...selectedMarkers].map(name => {
              const ref = MARKER_REFS[name.toUpperCase()]
              if (!ref) return null
              const color = getColor(name, allMarkers.indexOf(name))
              return (
                <ReferenceLine
                  key={`ref-${name}`}
                  y={ref.max}
                  stroke={color}
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                  label={{ value: `${name} 上限`, position: 'right', fill: color, fontSize: 10, opacity: 0.6 }}
                />
              )
            })}
          </ChartComponent>
        </ResponsiveContainer>
      </div>

      {/* Blood test chart */}
      {bloodData.length > 1 && (
        <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            血常规趋势
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WBC + Neutrophil */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                白细胞 / 中性粒细胞 (×10⁹/L)
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bloodData}>
                  <defs>
                    <linearGradient id="wbc-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,48,72,0.5)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={3.5} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.4} />
                  <ReferenceLine y={9.5} stroke="#60a5fa" strokeDasharray="3 3" strokeOpacity={0.4} />
                  <Area type="monotone" dataKey="WBC" stroke="#60a5fa" fill="url(#wbc-grad)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="Neutrophil" stroke="#38bdf8" strokeWidth={1.5} strokeDasharray="5 3" dot={{ r: 2 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* HGB + PLT */}
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                血红蛋白 (g/L) / 血小板 (×10⁹/L)
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={bloodData}>
                  <defs>
                    <linearGradient id="hgb-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e879f9" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#e879f9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,48,72,0.5)" />
                  <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="HGB" stroke="#e879f9" fill="url(#hgb-grad)" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                  <Line type="monotone" dataKey="PLT" stroke="#2dd4bf" strokeWidth={1.5} dot={{ r: 3 }} connectNulls />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* No blood data message */}
      {bloodData.length === 0 && (
        <div className="glass rounded-xl p-5 text-center" style={{ border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>暂无血常规数据</p>
        </div>
      )}
    </div>
  )
}
