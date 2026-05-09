'use client'

import { useState } from 'react'
import { TreatmentRecord, MARKER_REFS } from '@/lib/types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from 'recharts'

interface Props { records: TreatmentRecord[] }

const MARKER_COLORS: Record<string, string> = {
  CEA: '#2563eb',
  CA199: '#dc2626',
  CA125: '#7c3aed',
  CA153: '#d97706',
  CA724: '#059669',
  AFP: '#db2777',
}

const BLOOD_COLORS = [
  '#2563eb', '#dc2626', '#059669', '#d97706', '#7c3aed',
  '#db2777', '#0891b2', '#65a30d', '#ea580c', '#9333ea',
]

function getMarkerColor(name: string, idx: number): string {
  return MARKER_COLORS[name.toUpperCase()] || BLOOD_COLORS[idx % BLOOD_COLORS.length]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 12,
      minWidth: 180,
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
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
  const [selectedMarkers, setSelectedMarkers] = useState<Set<string>>(new Set())
  const [selectedBlood, setSelectedBlood] = useState<Set<string>>(new Set())

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div style={{ fontSize: 48, marginBottom: 12 }}>📈</div>
        <p style={{ color: 'var(--text-muted)' }}>暂无数据，请先添加治疗记录</p>
      </div>
    )
  }

  // Collect all tumor marker names
  const allMarkers = [...new Set(records.flatMap(r => r.markers.map(m => m.name)))]

  // Collect all blood test keys dynamically
  const allBloodKeys = [...new Set(
    records.flatMap(r => r.blood ? Object.keys(r.blood).filter(k => r.blood![k] != null) : [])
  )]

  // Init selected markers on first render
  if (selectedMarkers.size === 0 && allMarkers.length > 0) {
    allMarkers.slice(0, 3).forEach(m => selectedMarkers.add(m))
  }
  if (selectedBlood.size === 0 && allBloodKeys.length > 0) {
    allBloodKeys.slice(0, 4).forEach(k => selectedBlood.add(k))
  }

  // Build tumor marker chart data
  const markerData = records.map(r => {
    const point: Record<string, any> = { date: r.date }
    r.markers.forEach(m => { point[m.name] = m.value })
    return point
  })

  // Build blood chart data dynamically
  const bloodData = records
    .filter(r => r.blood && Object.values(r.blood).some(v => v != null))
    .map(r => {
      const point: Record<string, any> = { date: r.date }
      if (r.blood) {
        Object.entries(r.blood).forEach(([k, v]) => {
          if (v != null) point[k] = v
        })
      }
      return point
    })

  const toggleMarker = (name: string, set: Set<string>, setter: (s: Set<string>) => void) => {
    const next = new Set(set)
    if (next.has(name)) {
      if (next.size > 1) next.delete(name)
    } else {
      next.add(name)
    }
    setter(next)
  }

  const ChartComponent = chartType === 'area' ? AreaChart : LineChart

  return (
    <div className="space-y-6">
      {/* Chart type toggle */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', width: 'fit-content' }}>
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

      {/* Tumor markers chart */}
      {allMarkers.length > 0 && (
        <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              肿瘤标志物趋势
            </h3>
            <div className="flex flex-wrap gap-2">
              {allMarkers.map((name, i) => {
                const color = getMarkerColor(name, i)
                const active = selectedMarkers.has(name)
                return (
                  <button
                    key={name}
                    onClick={() => toggleMarker(name, selectedMarkers, setSelectedMarkers)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${color}44`,
                      background: active ? `${color}15` : 'var(--bg-card)',
                      color: active ? color : 'var(--text-muted)',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : 'var(--text-muted)' }} />
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={markerData}>
              <defs>
                {allMarkers.filter(n => selectedMarkers.has(n)).map((name, i) => (
                  <linearGradient key={name} id={`grad-${name}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMarkerColor(name, i)} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={getMarkerColor(name, i)} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              {allMarkers.filter(n => selectedMarkers.has(n)).map((name, i) => {
                const color = getMarkerColor(name, i)
                return chartType === 'area' ? (
                  <Area key={name} type="monotone" dataKey={name} stroke={color} fill={`url(#grad-${name})`} strokeWidth={2} dot={{ fill: color, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                ) : (
                  <Line key={name} type="monotone" dataKey={name} stroke={color} strokeWidth={2} dot={{ fill: color, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                )
              })}
              {[...selectedMarkers].map(name => {
                const ref = MARKER_REFS[name.toUpperCase()]
                if (!ref) return null
                const color = getMarkerColor(name, allMarkers.indexOf(name))
                return (
                  <ReferenceLine key={`ref-${name}`} y={ref.max} stroke={color} strokeDasharray="4 4" strokeOpacity={0.4}
                    label={{ value: `${name}上限`, position: 'right', fill: color, fontSize: 10, opacity: 0.6 }} />
                )
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      )}

      {/* Dynamic blood test charts */}
      {bloodData.length > 1 && allBloodKeys.length > 0 && (
        <div className="glass rounded-xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
              检验指标趋势
            </h3>
            <div className="flex flex-wrap gap-2" style={{ maxWidth: '70%' }}>
              {allBloodKeys.map((key, i) => {
                const color = BLOOD_COLORS[i % BLOOD_COLORS.length]
                const active = selectedBlood.has(key)
                const shortKey = key.match(/^[A-Za-z0-9\-\/]+/)?.[0] || key
                return (
                  <button
                    key={key}
                    onClick={() => toggleMarker(key, selectedBlood, setSelectedBlood)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px',
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: `1px solid ${color}44`,
                      background: active ? `${color}15` : 'var(--bg-card)',
                      color: active ? color : 'var(--text-muted)',
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: active ? color : 'var(--text-muted)' }} />
                    {shortKey}
                  </button>
                )
              })}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <ChartComponent data={bloodData}>
              <defs>
                {allBloodKeys.filter(k => selectedBlood.has(k)).map((key, i) => (
                  <linearGradient key={key} id={`blood-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={BLOOD_COLORS[i % BLOOD_COLORS.length]} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={BLOOD_COLORS[i % BLOOD_COLORS.length]} stopOpacity={0.02} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
              <Tooltip content={<CustomTooltip />} />
              {allBloodKeys.filter(k => selectedBlood.has(k)).map((key, i) => {
                const color = BLOOD_COLORS[i % BLOOD_COLORS.length]
                const shortKey = key.match(/^[A-Za-z0-9\-\/]+/)?.[0] || key
                return chartType === 'area' ? (
                  <Area key={key} type="monotone" dataKey={key} name={shortKey} stroke={color} fill={`url(#blood-grad-${i})`} strokeWidth={2} dot={{ fill: color, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                ) : (
                  <Line key={key} type="monotone" dataKey={key} name={shortKey} stroke={color} strokeWidth={2} dot={{ fill: color, r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} connectNulls />
                )
              })}
            </ChartComponent>
          </ResponsiveContainer>
        </div>
      )}

      {bloodData.length <= 1 && (
        <div className="glass rounded-xl p-5 text-center" style={{ border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>需要至少2条记录才能显示趋势图</p>
        </div>
      )}
    </div>
  )
}
