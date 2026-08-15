import React, { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DataContext } from '../context/DataContext';
import { ArrowRight, CheckCircle2, FileText, Info, Award, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';

export default function InternshipTaskOverview() {
  const { id } = useParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const { internships } = useContext(DataContext);
  const [expandedTasks, setExpandedTasks] = useState({});

  useEffect(() => {
    // Fetch from context
    const data = internships.find(i => i.id === id) || internships[0];
    setDetails(data);
    setLoading(false);
  }, [id, internships]);

  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
  };

  if (loading) {
    return <div className="container" style={{ padding: '40px 0' }}><h3>Loading overview...</h3></div>;
  }

  return (
    <div className="container fade-in" style={{ padding: '40px 0', maxWidth: '800px', margin: '0 auto' }}>
      <div className="section-title-wrapper" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '1.8rem', lineHeight: '1.3' }}>{details.title} <br /> <span style={{ color: 'var(--primary)' }}>Internship Overview</span></h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Removed Overview Section */}

        {/* Perks Section */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <Award size={20} color="var(--primary)" /> Internship Perks
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              "Internship Offer Letter",
              "Completion Certificate",
              "Unique Certificate ID",
              "Letter of Recommendation (based on performance)",
              "Resume Building Support",
              "Access to Latest Job & Internship Openings"
            ].map((perk, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                <CheckCircle2 size={18} color="var(--accent-success)" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions Section */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
            <FileText size={20} color="var(--primary)" /> Instructions for Interns
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>1.</span>
              <span>Share your internship status on <strong style={{ color: 'var(--text-main)' }}>LinkedIn</strong>, tagging @Skillora.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>2.</span>
              <span>Complete the assigned tasks within the given time frame.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>3.</span>
              <span>Upload your completed tasks to a public GitHub repository named exactly: <br /><code style={{ background: 'var(--bg-hover)', padding: '4px 8px', borderRadius: '4px', marginTop: '6px', display: 'inline-block', fontSize: '0.85rem' }}>Skillora-Internship-Tasks</code>.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>4.</span>
              <span>Post a short video walkthrough of your project on LinkedIn with the link included.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>5.</span>
              <span>Submit your completed task using the official Submission Form.</span>
            </li>
          </ul>
        </div>

        {/* Tasks Section */}
        {details.tasks && details.tasks.length > 0 && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '32px', boxShadow: 'var(--shadow-sm)' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-main)' }}>
              <CheckSquare size={20} color="var(--primary)" /> Internship Tasks
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {details.tasks.map((task, idx) => {
                const isExpanded = expandedTasks[task.id || idx];
                const previewText = task.description?.length > 60 ? task.description.substring(0, 60) + '...' : task.description;

                return (
                  <div key={task.id || idx} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', background: 'var(--bg-primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                          {task.title || `Task ${idx + 1}`}
                        </h4>
                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
                          {isExpanded ? task.description : previewText}
                        </p>
                      </div>
                      {task.description?.length > 60 && (
                        <button
                          onClick={() => toggleTask(task.id || idx)}
                          className="btn btn-outline"
                          style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}
                        >
                          {isExpanded ? (
                            <>See Less <ChevronUp size={14} /></>
                          ) : (
                            <>See More <ChevronDown size={14} /></>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Call to Action */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
          <Link to={`/tasks?internshipId=${id}`} className="btn btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--shadow-md)' }}>
            View Task <ArrowRight size={20} />
          </Link>
        </div>

      </div>
    </div>
  );
}
