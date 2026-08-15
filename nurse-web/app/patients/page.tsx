'use client'
import { useState, useEffect } from 'react'
import LayoutWrapper from '@/components/dashboard/layout-wrapper'

const MOCK_PATIENTS = [
  { id: 'PT-1042', name: 'Aminata Kamara', age: 34, gender: 'F', triage: 'Critical', time: '5 min' },
  { id: 'PT-1043', name: 'Mohamed Bangura', age: 45, gender: 'M', triage: 'Urgent', time: '15 min' },
  { id: 'PT-1044', name: 'Zainab Sesay', age: 28, gender: 'F', triage: 'Urgent', time: '25 min' },
  { id: 'PT-1045', name: 'Ibrahim Conteh', age: 52, gender: 'M', triage: 'Routine', time: '45 min' },
  { id: 'PT-1046', name: 'Fatima Kamara', age: 19, gender: 'F', triage: 'Routine', time: '50 min' },
  { id: 'PT-1047', name: 'Osman Turay', age: 61, gender: 'M', triage: 'Urgent', time: '1 hr' },
  { id: 'PT-1048', name: 'Isatu Mansaray', age: 8, gender: 'F', triage: 'Routine', time: '1.2 hr' },
  { id: 'PT-1049', name: 'Hassan Koroma', age: 39, gender: 'M', triage: 'Routine', time: '1.5 hr' },
]

export default function PatientsList() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800)
    return () => clearTimeout(timer)
  }, [])
  
  const filtered = MOCK_PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
  
  return (
    <LayoutWrapper>
      <div className="page-header">
        <h1 className="page-title">Patients Queue</h1>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>'}}/>
            <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-outline">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>'}}/>
            Filter
          </button>
          <button className="btn btn-outline">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>'}}/>
            Sort
          </button>
          
          <div className="view-toggle">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>'}}/>
            </button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>'}}/>
            </button>
          </div>
          
          <button className="btn btn-primary">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'}}/>
            New intake
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className={view === 'grid' ? "grid grid-4" : ""}>
          {view === 'grid' 
            ? [1,2,3,4,5,6,7,8].map(i => <div key={i} className="mc-skeleton" style={{ height: 180 }}></div>)
            : <div className="mc-skeleton" style={{ height: 400 }}></div>}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mc-empty">
          <svg width={48} height={48} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--gray-300)'}} dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/>'}}/>
          <h3>No patients found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-4">
          {filtered.map(p => (
            <div key={p.id} className="patient-card">
              <div className="top">
                <div className="avatar" style={{width:42,height:42,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:'bold'}}>
                  {p.name.split(' ').map(n=>n[0]).join('')}
                </div>
                <button className="icon-btn ghost" style={{width:32,height:32}}><svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{__html: '<circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>'}}/></button>
              </div>
              <div className="idrow">
                <span className="id">{p.id}</span>
                <span className="name">{p.name}</span>
              </div>
              <div className="prow">
                <span className="k">Age / Gender</span>
                <span className="v">{p.age} y.o / {p.gender}</span>
              </div>
              <div className="prow">
                <span className="k">Wait Time</span>
                <span className="v">{p.time}</span>
              </div>
              <div className="tags">
                <span className={`badge ${p.triage === 'Critical' ? 'badge-red' : p.triage === 'Urgent' ? 'badge-amber' : 'badge-green'}`}>
                  <span className="dot"></span>{p.triage}
                </span>
                <span className="badge badge-ink">Triage</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="dtable">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Name</th>
                  <th>Age/Gender</th>
                  <th>Triage Level</th>
                  <th>Wait Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{color: 'var(--brand)', fontWeight: 700}}>{p.id}</td>
                    <td>
                      <div className="cell-user">
                        <div className="avatar" style={{width:32,height:32,background:'var(--brand-light)',color:'var(--brand-dark)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>
                          {p.name.split(' ').map(n=>n[0]).join('')}
                        </div>
                        {p.name}
                      </div>
                    </td>
                    <td>{p.age} / {p.gender}</td>
                    <td>
                      <span className={`badge ${p.triage === 'Critical' ? 'badge-red' : p.triage === 'Urgent' ? 'badge-amber' : 'badge-green'}`}>
                        <span className="dot"></span>{p.triage}
                      </span>
                    </td>
                    <td><span className="num">{p.time}</span></td>
                    <td>
                      <button className="btn btn-soft" style={{minHeight:32, padding: '4px 12px', fontSize: 12}}>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </LayoutWrapper>
  )
}
