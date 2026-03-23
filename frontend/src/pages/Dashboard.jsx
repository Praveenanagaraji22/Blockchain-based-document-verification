import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  const [docs, setDocs] = useState([]);
  const [uploadMsg, setUploadMsg] = useState('');
  const [verifyMsg, setVerifyMsg] = useState(null);
  const [verifyFile, setVerifyFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const token = localStorage.getItem('token');

  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => { fetchDocs(); }, []);

  const fetchDocs = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/documents/my', authHeader);
      setDocs(data);
    } catch (err) { console.error(err); }
  };

  const generateHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleFileChange = async (e) => {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);
    setUploadMsg('');
    setHash(await generateHash(selected));
  };

  const handleUpload = async () => {
    if (!file) return setUploadMsg('Please select a file first');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', file);
      const { data } = await axios.post('http://localhost:5000/api/documents/upload', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setUploadMsg({ success: true, text: `✅ Uploaded & stored on blockchain!\nTx: ${data.txHash}` });
      setFile(null);
      setHash('');
      fetchDocs();
    } catch (err) {
      setUploadMsg({ success: false, text: '❌ ' + (err.response?.data?.message || err.message) });
    }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!verifyFile) return setVerifyMsg({ success: false, text: 'Please select a file to verify' });
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('document', verifyFile);
      const { data } = await axios.post('http://localhost:5000/api/documents/verify', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      setVerifyMsg({
        success: data.verified,
        text: data.message,
        hash: data.hash,
        uploadedBy: data.uploadedBy,
        timestamp: data.timestamp,
      });
    } catch (err) {
      setVerifyMsg({ success: false, text: '❌ ' + (err.response?.data?.message || err.message) });
    }
    setLoading(false);
  };

  const logout = () => { localStorage.clear(); navigate('/login'); };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2>📄 Document Verification System</h2>
        <div>
          <span style={styles.welcome}>Welcome, {name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button style={tab === 'upload' ? styles.activeTab : styles.tab} onClick={() => setTab('upload')}>⬆️ Upload</button>
        <button style={tab === 'verify' ? styles.activeTab : styles.tab} onClick={() => setTab('verify')}>🔍 Verify</button>
        <button style={tab === 'docs' ? styles.activeTab : styles.tab} onClick={() => setTab('docs')}>📁 My Documents</button>
      </div>

      {/* Upload Tab */}
      {tab === 'upload' && (
        <div style={styles.card}>
          <h3>Upload Document</h3>
          <p style={styles.hint}>Select a PDF or image — its hash will be stored on the blockchain.</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} style={styles.fileInput} />
          {hash && (
            <div style={styles.hashBox}>
              <strong>SHA-256 Hash:</strong>
              <p style={styles.hashText}>{hash}</p>
            </div>
          )}
          <button style={styles.uploadBtn} onClick={handleUpload} disabled={loading}>
            {loading ? '⏳ Uploading...' : '⬆️ Upload & Store on Blockchain'}
          </button>
          {uploadMsg && (
            <div style={{ ...styles.resultBox, background: uploadMsg.success ? '#f0fdf4' : '#fef2f2', borderColor: uploadMsg.success ? '#86efac' : '#fca5a5' }}>
              <p style={{ color: uploadMsg.success ? '#166534' : '#991b1b', whiteSpace: 'pre-line' }}>{uploadMsg.text}</p>
            </div>
          )}
        </div>
      )}

      {/* Verify Tab */}
      {tab === 'verify' && (
        <div style={styles.card}>
          <h3>Verify Document</h3>
          <p style={styles.hint}>Upload a document to check if it exists on the blockchain and hasn't been tampered with.</p>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png"
            onChange={e => { setVerifyFile(e.target.files[0]); setVerifyMsg(null); }}
            style={styles.fileInput} />
          <button style={styles.verifyBtn} onClick={handleVerify} disabled={loading}>
            {loading ? '⏳ Verifying...' : '🔍 Verify Document'}
          </button>
          {verifyMsg && (
            <div style={{ ...styles.resultBox, background: verifyMsg.success ? '#f0fdf4' : '#fef2f2', borderColor: verifyMsg.success ? '#86efac' : '#fca5a5' }}>
              <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: verifyMsg.success ? '#166534' : '#991b1b' }}>{verifyMsg.text}</p>
              {verifyMsg.hash && <p style={styles.hashText}><strong>Hash:</strong> {verifyMsg.hash}</p>}
              {verifyMsg.uploadedBy && <p style={styles.hashText}><strong>Uploaded By:</strong> {verifyMsg.uploadedBy}</p>}
              {verifyMsg.timestamp && <p style={styles.hashText}><strong>Timestamp:</strong> {verifyMsg.timestamp}</p>}
            </div>
          )}
        </div>
      )}

      {/* My Documents Tab */}
      {tab === 'docs' && (
        <div style={styles.card}>
          <h3>My Documents</h3>
          {docs.length === 0 ? <p>No documents uploaded yet.</p> : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Filename</th>
                  <th style={styles.th}>Hash</th>
                  <th style={styles.th}>Tx Hash</th>
                  <th style={styles.th}>Date</th>
                </tr>
              </thead>
              <tbody>
                {docs.map(doc => (
                  <tr key={doc._id}>
                    <td style={styles.td}>{doc.filename}</td>
                    <td style={styles.td}><span style={styles.hashSmall}>{doc.hash.slice(0, 20)}...</span></td>
                    <td style={styles.td}><span style={styles.hashSmall}>{doc.txHash ? doc.txHash.slice(0, 20) + '...' : 'N/A'}</span></td>
                    <td style={styles.td}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  welcome: { marginRight: '1rem', fontWeight: 'bold' },
  logoutBtn: { padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem' },
  tab: { padding: '10px 20px', background: '#e5e7eb', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  activeTab: { padding: '10px 20px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.08)' },
  hint: { color: '#6b7280', fontSize: '14px', marginBottom: '1rem' },
  fileInput: { display: 'block', margin: '1rem 0' },
  hashBox: { background: '#f8f9fa', padding: '1rem', borderRadius: '4px', marginBottom: '1rem', wordBreak: 'break-all' },
  hashText: { fontSize: '12px', color: '#555', margin: '4px 0' },
  uploadBtn: { padding: '10px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  verifyBtn: { padding: '10px 24px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  resultBox: { marginTop: '1rem', padding: '1rem', borderRadius: '6px', border: '1px solid' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '10px', borderBottom: '2px solid #eee', background: '#f8f9fa' },
  td: { padding: '10px', borderBottom: '1px solid #eee' },
  hashSmall: { fontFamily: 'monospace', fontSize: '12px', color: '#666' },
};
