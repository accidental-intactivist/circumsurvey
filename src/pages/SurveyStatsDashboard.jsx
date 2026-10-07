import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Activity, Users, FileText, PieChart as PieChartIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import ThinkingSpirograph from '../components/ThinkingSpirograph';

const COLORS = ['#d4a030', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#f97316', '#64748b'];

export default function SurveyStatsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/survey-stats')
      .then(async res => {
        const data = await res.json();
        if (!res.ok || data.error) {
          throw new Error(data.error || 'Failed to fetch');
        }
        return data;
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch stats", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--c-dim)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
        <ThinkingSpirograph />
        Loading statistics from the Global Survey Database...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '6rem', textAlign: 'center', color: 'var(--c-red)' }}>
        Error loading statistics: {error}
      </div>
    );
  }


  if (!stats) return null;

  return (
    <div style={{ background: 'var(--c-bg)', minHeight: '100vh', padding: '4rem 2rem', color: 'var(--c-text)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        <header style={{ marginBottom: '3rem', borderBottom: '1px solid var(--c-ghost)', paddingBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
            <Activity size={32} color="var(--c-gold)" />
            <h1 style={{ margin: 0, fontSize: '2.5rem', fontFamily: 'var(--f-display)', color: 'var(--c-textBright)' }}>
              Live Survey Statistics
            </h1>
          </div>
          <p style={{ fontSize: '1.2rem', color: 'var(--c-muted)', maxWidth: '800px', lineHeight: 1.6 }}>
            Real-time demographic and experiential data aggregated from the Intactivist Guide's ongoing global survey. This dataset forms the ground truth for our AI archivist.
          </p>
          <div style={{ marginTop: '1.5rem', background: 'rgba(212, 160, 48, 0.1)', padding: '1.2rem', borderRadius: '8px', borderLeft: '4px solid var(--c-goldBright)' }}>
            <p style={{ margin: 0, fontSize: '1rem', color: 'var(--c-textBright)', lineHeight: 1.5 }}>
              <strong>The survey is still open!</strong> You can still contribute your experience. 
              Looking for our initial analysis? <a href="/report" style={{ color: 'var(--c-blue)', textDecoration: 'none', fontWeight: 'bold' }}>Read the Phase 1 Report</a> of the first 500 respondents.
            </p>
          </div>
          <div style={{ marginTop: '2rem', display: 'flex', gap: '2rem' }}>
            <div style={{ background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Users size={24} color="var(--c-blue)" />
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--c-dim)', fontWeight: 'bold' }}>Total Respondents</div>
                <div style={{ fontSize: '2rem', color: 'var(--c-textBright)', fontWeight: 'bold', fontFamily: 'var(--f-mono)' }}>
                  {stats.total.toLocaleString()}
                </div>
              </div>
            </div>
            <div style={{ background: 'var(--c-bgSoft)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--c-ghost)', flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <FileText size={24} color="var(--c-green)" />
              <div>
                <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--c-dim)', fontWeight: 'bold' }}>Data Points Collected</div>
                <div style={{ fontSize: '2rem', color: 'var(--c-textBright)', fontWeight: 'bold', fontFamily: 'var(--f-mono)' }}>
                  {(stats.total * 360).toLocaleString()}+
                </div>
              </div>
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem' }}>
          
          {/* Pathways Chart */}
          <div style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-textBright)' }}>
              <PieChartIcon size={18} /> Respondents by Pathway
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--c-dim)', lineHeight: 1.5 }}>
              The primary motivation or life event that brought the respondent into the intactivist movement (e.g., discovering their own medical trauma, having a child, or researching human rights).
            </p>
            <div style={{ height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pathways}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.pathways.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '0.85rem', color: 'var(--c-textBright)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Generations Chart */}
          <div style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-textBright)' }}>
              <Activity size={18} /> Generational Demographics
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--c-dim)', lineHeight: 1.5 }}>
              The breakdown of survey respondents by generation, showing how advocacy and awareness span across different age groups.
            </p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.generations} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-ghost)" horizontal={false} />
                  <XAxis type="number" stroke="var(--c-dim)" />
                  <YAxis dataKey="name" type="category" width={120} stroke="var(--c-text)" />
                  <RechartsTooltip contentStyle={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)' }} />
                  <Bar dataKey="value" fill="var(--c-blue)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Politics Chart */}
          <div style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-textBright)' }}>
              <Activity size={18} /> Political Leanings
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--c-dim)', lineHeight: 1.5 }}>
              The self-reported political alignment of respondents, demonstrating the ideological diversity within the community.
            </p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.politics} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-ghost)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--c-text)" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="var(--c-dim)" />
                  <RechartsTooltip contentStyle={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)' }} />
                  <Bar dataKey="value" fill="var(--c-gold)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Religion Chart */}
          <div style={{ background: 'var(--c-bgCard)', padding: '2rem', borderRadius: '12px', border: '1px solid var(--c-ghost)' }}>
            <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--c-textBright)' }}>
              <Activity size={18} /> Religious Traditions
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.9rem', color: 'var(--c-dim)', lineHeight: 1.5 }}>
              The religious backgrounds or traditions of respondents, highlighting the varied cultural origins of those involved.
            </p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.religion} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--c-ghost)" horizontal={false} />
                  <XAxis type="number" stroke="var(--c-dim)" />
                  <YAxis dataKey="name" type="category" width={100} stroke="var(--c-text)" />
                  <RechartsTooltip contentStyle={{ background: 'var(--c-bgDeep)', border: '1px solid var(--c-ghost)' }} />
                  <Bar dataKey="value" fill="var(--c-green)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
