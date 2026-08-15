/**
 * MediChain SL — Symptra React Component Wrappers
 * Full component set from Symptra design system, adapted for MediChain.
 * All components use CSS class names from symptra-components.css.
 */
'use client';

import type { ReactNode, CSSProperties } from 'react';
import { ICONS, type IconId } from './icon-sprite';

/* ============================================================
   ICON
   ============================================================ */
export function SymptraIcon({
  id,
  size = 19,
  className = '',
  style,
}: {
  id: IconId;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`symptra-icon ${className}`}
      style={style}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: ICONS[id] }}
    />
  );
}

/* ============================================================
   BRAND MARK
   ============================================================ */
export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      className="brand-mark"
      style={{
        width: size,
        height: size,
        borderRadius: 10,
        background: 'var(--brand)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <SymptraIcon id="plusMed" size={size * 0.53} />
    </span>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */
type BadgeTone = 'blue' | 'red' | 'ink' | 'green' | 'amber' | 'purple' | 'brand';

export function StatusBadge({
  tone = 'blue',
  children,
}: {
  tone?: BadgeTone;
  children: ReactNode;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      <i className="dot" />
      {children}
    </span>
  );
}

/* ============================================================
   DELTA
   ============================================================ */
export function Delta({ value, unit = '' }: { value: number; unit?: string }) {
  const up = value >= 0;
  return (
    <span className={`delta ${up ? 'delta-up' : 'delta-down'}`}>
      {up ? '+' : ''}{value}{unit}
    </span>
  );
}

/* ============================================================
   VERIFIED ON-CHAIN BADGE
   ============================================================ */
export function VerifiedOnChain({ lastSynced }: { lastSynced?: string }) {
  return (
    <span className="mc-chain-badge">
      <SymptraIcon id="shield" size={15} />
      <span>
        <strong>Verified on-chain</strong>
        {lastSynced && <small> · Last anchor {lastSynced}</small>}
      </span>
    </span>
  );
}

/* ============================================================
   AI SUGGESTED CHIP
   ============================================================ */
export function AiChip() {
  return (
    <span className="mc-ai-chip" title="AI-suggested — review before saving">
      <SymptraIcon id="sparkles" size={11} />
      AI-suggested
    </span>
  );
}

/* ============================================================
   SYNC STATUS
   ============================================================ */
type SyncState = 'live' | 'stale' | 'offline';

export function SyncStatus({
  state,
  lastUpdated,
}: {
  state: SyncState;
  lastUpdated?: string;
}) {
  const tone: BadgeTone = state === 'live' ? 'green' : state === 'offline' ? 'red' : 'amber';
  const label =
    state === 'live' ? 'Live data' : state === 'offline' ? 'Offline' : 'Stale data';
  const icon: IconId = state === 'offline' ? 'wifiOff' : 'wifi';
  return (
    <StatusBadge tone={tone}>
      <SymptraIcon id={icon} size={11} />
      {label}
      {lastUpdated && ` · ${lastUpdated}`}
    </StatusBadge>
  );
}

/* ============================================================
   OFFLINE BANNER
   ============================================================ */
export function OfflineBanner({
  state,
  lastUpdated,
}: {
  state: SyncState;
  lastUpdated?: string;
}) {
  if (state === 'live') return null;
  const isOffline = state === 'offline';
  return (
    <div className={isOffline ? 'mc-offline-bar' : 'mc-stale-bar'} role="status">
      <SymptraIcon id={isOffline ? 'wifiOff' : 'wifi'} size={16} />
      {isOffline
        ? 'You are offline. Showing cached data.'
        : 'Showing last-synced data.'}
      {lastUpdated && <span style={{ opacity: 0.8, fontWeight: 500 }}> Last updated {lastUpdated}</span>}
    </div>
  );
}

/* ============================================================
   NOTICE (error / warning / info)
   ============================================================ */
export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'warning' | 'danger';
  title: string;
  children?: ReactNode;
}) {
  const icon: IconId = tone === 'danger' ? 'alert' : tone === 'warning' ? 'alert' : 'info';
  return (
    <div className={`mc-notice ${tone}`} role={tone === 'danger' ? 'alert' : 'status'}>
      <SymptraIcon id={icon} size={18} />
      <div>
        <strong>{title}</strong>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon: IconId;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mc-empty">
      <div className="ic">
        <SymptraIcon id={icon} size={24} />
      </div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}

/* ============================================================
   LOADING SKELETON
   ============================================================ */
export function Skeleton({ height = 20, width = '100%', className = '' }: {
  height?: number | string;
  width?: number | string;
  className?: string;
}) {
  return (
    <div
      className={`mc-skeleton ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  );
}

/* ============================================================
   CARD
   ============================================================ */
export function Card({
  children,
  className = '',
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHead({
  icon,
  title,
  action,
}: {
  icon?: IconId;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="card-head">
      <div className="card-title">
        {icon && (
          <span className="ic">
            <SymptraIcon id={icon} size={16} />
          </span>
        )}
        {title}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   KPI CARD
   ============================================================ */
export function KpiCard({
  icon,
  title,
  value,
  delta,
  unit = '',
  legend,
  chart,
  onViewMore,
}: {
  icon: IconId;
  title: string;
  value: number | string;
  delta?: number;
  unit?: string;
  legend?: { color: string; label: string }[];
  chart: ReactNode;
  onViewMore?: () => void;
}) {
  return (
    <Card>
      <CardHead
        icon={icon}
        title={title}
        action={
          <button className="link-more" onClick={onViewMore}>
            View more
          </button>
        }
      />
      <div className="kpi-value">
        <span className="n num">{value}</span>
        {delta !== undefined && <Delta value={delta} unit={unit} />}
      </div>
      {legend && (
        <div className="chart-legend">
          {legend.map((l) => (
            <span key={l.label}>
              <i style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
      )}
      {chart}
    </Card>
  );
}

/* ============================================================
   BUBBLE CLUSTER
   ============================================================ */
export interface BubbleItem {
  value: number;
  color: string;
  textColor?: string;
  size: number;
}

export function BubbleCluster({ bubbles }: { bubbles: BubbleItem[] }) {
  return (
    <div className="bubble-cluster">
      {bubbles.map((b, i) => (
        <div
          key={i}
          className="bubble num"
          style={{
            width: b.size,
            height: b.size,
            background: b.color,
            color: b.textColor ?? '#fff',
            fontSize: Math.max(10, b.size * 0.18),
          }}
        >
          {b.value}
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   STACKED HORIZONTAL BAR
   ============================================================ */
export interface HStackSegment {
  value: number;
  total: number;
  color: string;
  label: string;
}

export function StackedBar({ segments }: { segments: HStackSegment[] }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  return (
    <>
      <div className="hstack-wrap">
        {segments.map((s) => (
          <span
            key={s.label}
            className="seg-label num"
            style={{ color: s.color }}
          >
            {s.value}
          </span>
        ))}
      </div>
      <div className="hstack">
        {segments.map((s) => (
          <span
            key={s.label}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
          />
        ))}
      </div>
    </>
  );
}

/* ============================================================
   VERTICAL BAR CHART
   ============================================================ */
export interface VBarItem {
  label: string;
  value: number;
  isHighlight?: boolean;
}

export function VBarChart({
  items,
  avgLine,
}: {
  items: VBarItem[];
  avgLine?: number;
}) {
  const max = Math.max(...items.map((i) => i.value));
  const avgPct = avgLine !== undefined ? (avgLine / max) * 100 : undefined;
  return (
    <>
      <div className="vbar-chart">
        {avgPct !== undefined && (
          <div className="avg-line" style={{ bottom: `${avgPct}%` }}>
            <span className="avg-tag">Avg</span>
          </div>
        )}
        {items.map((item) => (
          <div
            key={item.label}
            className={`bar${item.isHighlight ? ' hi' : ''}`}
            style={{ height: `${(item.value / max) * 100}%` }}
            title={String(item.value)}
          />
        ))}
      </div>
      <div className="chart-axis">
        {items.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </>
  );
}

/* ============================================================
   GAUGE RING (SVG)
   ============================================================ */
export function GaugeRing({
  pct,
  label,
  sublabel,
  size = 160,
  stroke = 16,
}: {
  pct: number;
  label: string;
  sublabel?: string;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const dashoffset = circumference * (1 - Math.min(pct, 1));
  const cx = size / 2;
  const cy = size / 2;
  return (
    <div className="gauge-ring-wrap" style={{ height: size * 0.55, position: 'relative', display: 'flex', justifyContent: 'center' }}>
      <svg
        width={size}
        height={size * 0.6}
        viewBox={`0 0 ${size} ${size}`}
        style={{ overflow: 'visible' }}
      >
        {/* Track */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--gray-100)"
          strokeWidth={stroke}
        />
        {/* Progress — only top half (fan shape) */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="var(--brand)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashoffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      <div className="gauge-center">
        <div className="n num">{Math.round(pct * 100)}%</div>
        {sublabel && <div className="lbl">{sublabel}</div>}
      </div>
      {/* Pct badge at top */}
      <div
        className="gauge-pct"
        style={{
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          color: 'var(--brand)',
        }}
      >
        {Math.round(pct * 100)}%
      </div>
    </div>
  );
}

/* ============================================================
   HEATMAP
   ============================================================ */
export function Heatmap({
  rows,
  cols,
  data,
}: {
  rows: string[];
  cols: string[];
  data: number[][];  // data[row][col] 0–1
}) {
  return (
    <div
      className="heatmap"
      style={{ gridTemplateColumns: `80px repeat(${cols.length}, 1fr)` }}
    >
      <div /> {/* empty corner */}
      {cols.map((c) => (
        <div key={c} className="clabel">{c}</div>
      ))}
      {rows.map((row, ri) => (
        <>
          <div key={`rl-${ri}`} className="rlabel">{row}</div>
          {cols.map((_, ci) => {
            const v = data[ri]?.[ci] ?? 0;
            const opacity = 0.15 + v * 0.85;
            return (
              <div
                key={ci}
                className="cell"
                style={{ background: `rgba(62,123,250,${opacity})` }}
                title={`${row} × ${cols[ci]}: ${Math.round(v * 100)}%`}
              />
            );
          })}
        </>
      ))}
    </div>
  );
}

/* ============================================================
   CHECKLIST STEPPER
   ============================================================ */
export interface ChecklistStepItem {
  id: string;
  label: string;
  sublabel?: string;
  taskCount?: number;
  completedCount?: number;
  status: 'done' | 'current' | 'pending';
  aiAssisted?: boolean;
}

export function ChecklistStepper({ steps }: { steps: ChecklistStepItem[] }) {
  return (
    <div>
      {steps.map((step, i) => (
        <div key={step.id} className="checklist-step">
          {i < steps.length - 1 && <div className="line" />}
          <div className={`step-dot ${step.status}`} />
          <div className="step-body" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <div>
                <div className="t">{step.label}</div>
                {step.sublabel && <div className="s">{step.sublabel}</div>}
                {step.taskCount !== undefined && (
                  <div className="s">Tasks: {step.completedCount ?? 0} of {step.taskCount} completed</div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {step.aiAssisted && <AiChip />}
                <span className={`step-status ${step.status}`}>
                  {step.status === 'done' ? '✓ Done' : step.status === 'current' ? 'In progress' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   ALERT LIST
   ============================================================ */
export interface AlertItem {
  id: string;
  severity: 'red' | 'purple' | 'blue' | 'amber' | 'brand';
  title: string;
  description?: string;
  time?: string;
}

export function AlertList({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div>
      {alerts.map((a) => (
        <div key={a.id} className="alert-item">
          <div className={`alert-ic ${a.severity}`}>
            <SymptraIcon
              id={a.severity === 'red' ? 'alert' : a.severity === 'amber' ? 'alert' : 'info'}
              size={16}
            />
          </div>
          <div className="txt">
            <b>{a.title}</b>
            {a.description && <div>{a.description}</div>}
            {a.time && <div className="time">{a.time}</div>}
          </div>
          <button className="icon-btn ghost" style={{ width: 32, height: 32 }} aria-label="More options">
            <SymptraIcon id="more" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   REQUEST LIST (appointment accept/decline)
   ============================================================ */
export interface RequestItem {
  id: string;
  name: string;
  subtitle?: string;
  avatarUrl?: string;
  metaLine?: string;
  onAccept?: () => void;
  onDecline?: () => void;
}

export function RequestList({ requests }: { requests: RequestItem[] }) {
  return (
    <div>
      {requests.map((r) => (
        <div key={r.id} className="req-item">
          {r.avatarUrl ? (
            <img src={r.avatarUrl} alt={r.name} />
          ) : (
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 12,
                background: 'var(--brand-light)',
                color: 'var(--brand)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {r.name[0]}
            </div>
          )}
          <div className="info">
            <div className="name">{r.name}</div>
            {r.subtitle && <div className="sub">{r.subtitle}</div>}
            {r.metaLine && (
              <span className="meta">
                <SymptraIcon id="calendar" size={12} />
                {r.metaLine}
              </span>
            )}
          </div>
          <div className="btns">
            <button className="round-action decline" onClick={r.onDecline} aria-label="Decline">
              <SymptraIcon id="x" size={14} />
            </button>
            <button className="round-action accept" onClick={r.onAccept} aria-label="Accept">
              <SymptraIcon id="check" size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ============================================================
   PATIENT CARD (grid view)
   ============================================================ */
export interface PatientCardData {
  id: string;
  name: string;
  avatarUrl?: string;
  procedure?: string;
  status: 'ready' | 'at-risk' | 'in-progress' | 'discharged';
  procedureDate?: string;
  assignedTo?: string;
  tags?: string[];
}

const STATUS_TONE: Record<PatientCardData['status'], BadgeTone> = {
  'ready': 'green',
  'at-risk': 'red',
  'in-progress': 'amber',
  'discharged': 'ink',
};
const STATUS_LABEL: Record<PatientCardData['status'], string> = {
  'ready': 'Ready',
  'at-risk': 'At-Risk',
  'in-progress': 'In Progress',
  'discharged': 'Discharged',
};

export function PatientCard({
  patient,
  onEdit,
  onDelete,
  onClick,
}: {
  patient: PatientCardData;
  onEdit?: () => void;
  onDelete?: () => void;
  onClick?: () => void;
}) {
  return (
    <div className="patient-card" style={{ cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      <div className="top">
        <input type="checkbox" style={{ width: 16, height: 16 }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="icon-btn ghost" style={{ width: 30, height: 30 }} onClick={onEdit} aria-label="Edit">
            <SymptraIcon id="edit" size={14} />
          </button>
          <button className="icon-btn ghost" style={{ width: 30, height: 30 }} onClick={onDelete} aria-label="Delete">
            <SymptraIcon id="trash" size={14} />
          </button>
        </div>
      </div>
      <div className="idrow">
        {patient.avatarUrl ? (
          <img src={patient.avatarUrl} alt={patient.name} />
        ) : (
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: 'var(--brand-light)',
              color: 'var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 18,
              flexShrink: 0,
            }}
          >
            {patient.name[0]}
          </div>
        )}
        <div>
          <div className="id">ID: {patient.id}</div>
          <div className="name">{patient.name}</div>
        </div>
      </div>
      {patient.procedure && (
        <div className="prow">
          <span className="k">Procedure:</span>
          <span className="v">{patient.procedure}</span>
        </div>
      )}
      <div className="prow">
        <span className="k">Status:</span>
        <StatusBadge tone={STATUS_TONE[patient.status]}>
          {STATUS_LABEL[patient.status]}
        </StatusBadge>
      </div>
      {patient.procedureDate && (
        <div className="prow">
          <span className="k">Date:</span>
          <span className="v">{patient.procedureDate}</span>
        </div>
      )}
      {patient.assignedTo && (
        <div className="prow">
          <span className="k">Assigned:</span>
          <span className="v">{patient.assignedTo}</span>
        </div>
      )}
      {patient.tags && patient.tags.length > 0 && (
        <div className="tags">
          {patient.tags.map((tag) => (
            <span key={tag} className="chip">{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   PATIENT PROFILE CARD (detail view left column)
   ============================================================ */
export function PatientProfileCard({
  name,
  id,
  gender,
  dob,
  location,
  avatarUrl,
  details,
  actions,
  verifiedAt,
}: {
  name: string;
  id: string;
  gender?: string;
  dob?: string;
  location?: string;
  avatarUrl?: string;
  details?: { label: string; value: string; status?: 'pending' | 'done' | 'risk' }[];
  actions?: ReactNode;
  verifiedAt?: string;
}) {
  return (
    <Card>
      {avatarUrl ? (
        <img className="hero" src={avatarUrl} alt={name} style={{ width: '100%', height: 140, borderRadius: 16, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 140, borderRadius: 16, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, fontWeight: 800, color: 'var(--brand)' }}>
          {name[0]}
        </div>
      )}
      <div className="profile-name">
        {name}
        <span className="idtag">ID {id}</span>
      </div>
      <div className="profile-tags">
        {gender && <span>{gender}</span>}
        {dob && <span>{dob}</span>}
        {location && <span>{location}</span>}
      </div>
      {verifiedAt && (
        <div style={{ marginTop: 10 }}>
          <VerifiedOnChain lastSynced={verifiedAt} />
        </div>
      )}
      {actions && <div className="profile-actions">{actions}</div>}
      {details && (
        <div style={{ marginTop: 14 }}>
          {details.map((d) => (
            <div key={d.label} className="profile-detail-row">
              <span className="k">{d.label}</span>
              <span className="v">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ============================================================
   DATE CAROUSEL
   ============================================================ */
export function DateCarousel({
  days,
  selectedDay,
  onSelect,
  onPrev,
  onNext,
}: {
  days: { day: number; available: boolean }[];
  selectedDay?: number;
  onSelect?: (day: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  return (
    <div className="date-carousel">
      <button className="arrow" onClick={onPrev} aria-label="Previous">
        <SymptraIcon id="chevronLeft" size={15} />
      </button>
      <div className="date-scroll">
        {days.map(({ day, available }) => {
          const isSelected = day === selectedDay;
          const cls = isSelected
            ? 'date-chip selected'
            : available
            ? 'date-chip available'
            : 'date-chip unavailable';
          return (
            <button key={day} className={cls} onClick={() => available && onSelect?.(day)}>
              {day}
            </button>
          );
        })}
      </div>
      <button className="arrow" onClick={onNext} aria-label="Next">
        <SymptraIcon id="chevronRight" size={15} />
      </button>
    </div>
  );
}

/* ============================================================
   AI ASSIST PANEL
   ============================================================ */
export interface AiField {
  id: string;
  label: string;
  value: string;
  isAiSuggested: boolean;
  confirmed: boolean;
}

export function AiAssistPanel({
  fields,
  onConfirm,
  onRevert,
  onConfirmAll,
  isLoading = false,
  unavailable = false,
}: {
  fields: AiField[];
  onConfirm: (id: string) => void;
  onRevert: (id: string) => void;
  onConfirmAll?: () => void;
  isLoading?: boolean;
  unavailable?: boolean;
}) {
  if (unavailable) {
    return (
      <div className="mc-ai-panel">
        <div className="mc-ai-panel-head">
          <SymptraIcon id="sparkles" size={18} />
          AI Report Assist — Unavailable
        </div>
        <Notice tone="warning" title="AI service offline">
          Complete the report manually. All fields work without AI assistance.
        </Notice>
      </div>
    );
  }

  return (
    <div className="mc-ai-panel">
      <div className="mc-ai-panel-head">
        <SymptraIcon id="sparkles" size={18} />
        AI Report Assist
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gray-500)', fontWeight: 500 }}>
          Review all suggestions before saving
        </span>
      </div>

      {isLoading ? (
        <>
          <Skeleton height={48} className="" style={{ marginBottom: 8 }} />
          <Skeleton height={48} />
        </>
      ) : (
        fields.map((field) => (
          <div key={field.id} className="mc-ai-field-wrap">
            {field.isAiSuggested && !field.confirmed && <AiChip />}
            <div className="kv-row" style={{ marginBottom: 0, background: field.confirmed ? 'var(--green-100)' : undefined }}>
              <div>
                <div style={{ fontSize: 11.5, color: 'var(--gray-500)', marginBottom: 2 }}>{field.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>{field.value || '—'}</div>
              </div>
              {field.isAiSuggested && !field.confirmed && (
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-soft" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => onRevert(field.id)}>
                    Revert
                  </button>
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => onConfirm(field.id)}>
                    Confirm
                  </button>
                </div>
              )}
              {field.confirmed && (
                <StatusBadge tone="green">Confirmed</StatusBadge>
              )}
            </div>
          </div>
        ))
      )}

      {onConfirmAll && !isLoading && (
        <div className="mc-ai-confirm-row">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onConfirmAll}>
            <SymptraIcon id="check" size={15} />
            Confirm all AI suggestions
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   NAVBAR COMPONENT
   ============================================================ */
export interface NavItem {
  href: string;
  label: string;
  active?: boolean;
}

export function Navbar({
  portalName,
  navItems,
  userName,
  userRole,
  userAvatar,
  syncState,
  lastUpdated,
  tenantName,
  tenantLogo,
  onBellClick,
  onSettingsClick,
}: {
  portalName: string;
  navItems: NavItem[];
  userName?: string;
  userRole?: string;
  userAvatar?: string;
  syncState?: SyncState;
  lastUpdated?: string;
  tenantName?: string;
  tenantLogo?: string;
  onBellClick?: () => void;
  onSettingsClick?: () => void;
}) {
  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <a href="/" className="brand">
        <BrandMark />
        MediChain
        {tenantName && (
          <span style={{ fontSize: 12, background: 'var(--brand-light)', color: 'var(--brand-dark)', padding: '3px 8px', borderRadius: 999, fontWeight: 700 }}>
            {tenantName}
          </span>
        )}
      </a>

      <div className="nav-pills" role="menubar">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className={`nav-pill${item.active ? ' active' : ''}`}
            role="menuitem"
          >
            {item.label}
          </a>
        ))}
      </div>

      <div className="nav-right">
        {syncState && <SyncStatus state={syncState} lastUpdated={lastUpdated} />}
        <button className="icon-btn" onClick={onBellClick} aria-label="Notifications">
          <SymptraIcon id="bell" size={18} />
          <span className="dot" />
        </button>
        <button className="icon-btn" onClick={onSettingsClick} aria-label="Settings">
          <SymptraIcon id="settings" size={18} />
        </button>
        {userName && (
          <div className="nav-profile">
            {userAvatar ? (
              <img className="avatar" width={38} height={38} src={userAvatar} alt={userName} />
            ) : (
              <div className="avatar" style={{ width: 38, height: 38, background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand)', fontWeight: 800, fontSize: 16 }}>
                {userName[0]}
              </div>
            )}
            <div className="who">
              <div className="name">{userName}</div>
              {userRole && <div className="role">{userRole}</div>}
            </div>
            <SymptraIcon id="chevronDown" size={14} style={{ color: 'var(--gray-400)' }} />
          </div>
        )}
      </div>
    </nav>
  );
}
