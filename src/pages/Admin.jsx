import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db, auth } from '../services/firebase';
import {
  collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp,
  query, limit, orderBy,
} from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const TABS = {
  MEMORIES: 'memories',
  LETTER: 'letter',
  SETTINGS: 'settings',
};

export default function Admin() {
  const [activeTab, setActiveTab] = useState(TABS.MEMORIES);
  const navigate = useNavigate();

  // Shared state
  const [memories, setMemories] = useState([]);
  const [letterContent, setLetterContent] = useState('');
  const [birthdayDate, setBirthdayDate] = useState('');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroSubtitle, setHeroSubtitle] = useState('');
  const [editingMessageIndex, setEditingMessageIndex] = useState(null);
  const [editingMessageValue, setEditingMessageValue] = useState('');

  // Form state
  const [newMemory, setNewMemory] = useState({ description: '', imageUrl: '', date: '' });
  const [editingMemory, setEditingMemory] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Lazily load data per active tab — only attach listeners for the tab in use
  useEffect(() => {
    if (activeTab !== TABS.MEMORIES) return;
    const q = query(collection(db, 'memories'), orderBy('date', 'desc'), limit(100));
    const unsub = onSnapshot(q, (snap) => {
      setMemories(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== TABS.LETTER) return;
    getDoc(doc(db, 'settings', 'letter')).then((snap) => {
      if (snap.exists()) setLetterContent(snap.data().content || '');
    });
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== TABS.SETTINGS) return;
    getDoc(doc(db, 'settings', 'birthday')).then((snap) => {
      if (snap.exists()) {
        const d = snap.data().date?.toDate?.() || new Date(snap.data().date);
        setBirthdayDate(d.toISOString().split('T')[0]);
      }
    });
    getDoc(doc(db, 'settings', 'messages')).then((snap) => {
      if (snap.exists() && snap.data().list) {
        setMessages(snap.data().list);
      } else {
        setMessages([]);
      }
    });
    getDoc(doc(db, 'settings', 'hero')).then((snap) => {
      if (snap.exists()) {
        setHeroTitle(snap.data().title || '');
        setHeroSubtitle(snap.data().subtitle || '');
      }
    });
  }, [activeTab]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  // --- Memories ---
  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newMemory.description.trim()) return;
    try {
      await addDoc(collection(db, 'memories'), {
        description: newMemory.description,
        imageUrl: newMemory.imageUrl || '',
        date: newMemory.date ? new Date(newMemory.date) : serverTimestamp(),
      });
      setNewMemory({ description: '', imageUrl: '', date: '' });
      showMessage('success', 'បន្ថែមអនុស្សាវរីយ៍ដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការបន្ថែមអនុស្សាវរីយ៍');
    }
  };

  const handleUpdateMemory = async (e) => {
    e.preventDefault();
    if (!editingMemory) return;
    try {
      await updateDoc(doc(db, 'memories', editingMemory.id), {
        description: editingMemory.description,
        imageUrl: editingMemory.imageUrl,
        date: editingMemory.date ? new Date(editingMemory.date) : serverTimestamp(),
      });
      setEditingMemory(null);
      showMessage('success', 'កែប្រែអនុស្សាវរីយ៍ដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការកែប្រែ');
    }
  };

  const handleDeleteMemory = async (id) => {
    if (!window.confirm('តើអ្នកប្រាកដថាចង់លុបអនុស្សាវរីយ៍នេះទេ?')) return;
    try {
      await deleteDoc(doc(db, 'memories', id));
      showMessage('success', 'លុបអនុស្សាវរីយ៍ដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការលុប');
    }
  };

  const startEditing = (memory) => {
    setEditingMemory({
      ...memory,
      date: memory.date?.toDate?.()?.toISOString().split('T')[0] || memory.date || '',
    });
  };

  // --- Letter ---
  const handleSaveLetter = async () => {
    try {
      await setDoc(doc(db, 'settings', 'letter'), { content: letterContent }, { merge: true });
      showMessage('success', 'រក្សាទុកសំបុត្រដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការរក្សាទុក');
    }
  };

  // --- Messages ---
  const handleAddMessage = async () => {
    if (!newMessage.trim()) return;
    const updated = [...messages, newMessage.trim()];
    try {
      await setDoc(doc(db, 'settings', 'messages'), { list: updated }, { merge: true });
      setNewMessage('');
      showMessage('success', 'បន្ថែមសារដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការបន្ថែម');
    }
  };

  const handleDeleteMessage = async (index) => {
    const updated = messages.filter((_, i) => i !== index);
    try {
      await setDoc(doc(db, 'settings', 'messages'), { list: updated }, { merge: true });
      showMessage('success', 'លុបសារដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការលុប');
    }
  };

  const handleStartEditMessage = (index) => {
    setEditingMessageIndex(index);
    setEditingMessageValue(messages[index]);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageValue.trim() || editingMessageIndex === null) return;
    const updated = [...messages];
    updated[editingMessageIndex] = editingMessageValue.trim();
    try {
      await setDoc(doc(db, 'settings', 'messages'), { list: updated }, { merge: true });
      setEditingMessageIndex(null);
      setEditingMessageValue('');
      showMessage('success', 'កែប្រែសារដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការកែប្រែ');
    }
  };

  // --- Hero ---
  const handleSaveHero = async () => {
    try {
      await setDoc(doc(db, 'settings', 'hero'), { title: heroTitle, subtitle: heroSubtitle }, { merge: true });
      showMessage('success', 'រក្សាទុកពាក្យស្វាគមន៍ដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការរក្សាទុក');
    }
  };

  // --- Settings ---
  const handleSaveBirthday = async () => {
    if (!birthdayDate) return;
    try {
      await setDoc(doc(db, 'settings', 'birthday'), { date: new Date(birthdayDate) }, { merge: true });
      showMessage('success', 'រក្សាទុកការកំណត់ដោយជោគជ័យ!');
    } catch (err) {
      showMessage('error', 'បរាជ័យក្នុងការរក្សាទុក');
    }
  };

  const tabs = [
    { key: TABS.MEMORIES, label: 'Memories', icon: 'photo_library' },
    { key: TABS.LETTER, label: 'Letter', icon: 'mail' },
    { key: TABS.SETTINGS, label: 'Settings', icon: 'settings' },
  ];

  return (
    <div className="page admin-page">
      <div className="admin-container">
        {/* Admin Header */}
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <button className="admin-logout-btn btn btn--secondary" onClick={handleLogout}>
            <span className="icon">logout</span>
            ចាកចេញ
          </button>
        </div>

        {/* Message toast */}
        {message.text && (
          <motion.div
            className={`admin-toast ${message.type}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {message.text}
          </motion.div>
        )}

        {/* Tabs */}
        <div className="admin-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="admin-content">
          {/* MEMORIES TAB */}
          {activeTab === TABS.MEMORIES && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="admin-section-title">បន្ថែមអនុស្សាវរីយ៍ថ្មី</h2>

              {/* Add new memory */}
              <form onSubmit={handleAddMemory} className="admin-form">
                <div className="form-group">
                  <label className="form-label">រូបភាព URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={newMemory.imageUrl}
                    onChange={(e) => setNewMemory({ ...newMemory, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ការពិពណ៌នា *</label>
                  <textarea
                    className="form-textarea"
                    value={newMemory.description}
                    onChange={(e) => setNewMemory({ ...newMemory, description: e.target.value })}
                    placeholder="Describe this memory..."
                    rows={3}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">កាលបរិច្ឆេទ</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newMemory.date}
                    onChange={(e) => setNewMemory({ ...newMemory, date: e.target.value })}
                  />
                </div>
                <button type="submit" className="admin-submit-btn">
                  <span className="icon">add</span>
                  បន្ថែម
                </button>
              </form>

              {/* Edit memory modal */}
              {editingMemory && (
                <div className="admin-modal-overlay" onClick={() => setEditingMemory(null)}>
                  <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
                    <h3>កែប្រែអនុស្សាវរីយ៍</h3>
                    <form onSubmit={handleUpdateMemory} className="admin-form">
                      <div className="form-group">
                        <label className="form-label">រូបភាព URL</label>
                        <input
                          type="url"
                          className="form-input"
                          value={editingMemory.imageUrl}
                          onChange={(e) => setEditingMemory({ ...editingMemory, imageUrl: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">ការពិពណ៌នា</label>
                        <textarea
                          className="form-textarea"
                          value={editingMemory.description}
                          onChange={(e) => setEditingMemory({ ...editingMemory, description: e.target.value })}
                          rows={3}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">កាលបរិច្ឆេទ</label>
                        <input
                          type="date"
                          className="form-input"
                          value={editingMemory.date}
                          onChange={(e) => setEditingMemory({ ...editingMemory, date: e.target.value })}
                        />
                      </div>
                      <div className="admin-modal-actions" style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button type="submit" className="admin-submit-btn">
                          <span className="icon">save</span>
                          រក្សាទុក
                        </button>
                        <button type="button" className="admin-cancel-btn" onClick={() => setEditingMemory(null)}>
                          បោះបង់
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Existing memories */}
              <h2 className="admin-section-title">អនុស្សាវរីយ៍ដែលមានស្រាប់</h2>
              <div className="admin-list">
                {memories.map((memory) => (
                  <div key={memory.id} className="admin-list-item">
                    <div className="admin-list-info">
                      <p className="admin-list-desc">{memory.description}</p>
                      <small className="admin-list-date">
                        {memory.date?.toDate?.().toLocaleDateString() || memory.date}
                      </small>
                    </div>
                    <div className="admin-list-actions">
                      <button className="admin-edit-btn" onClick={() => startEditing(memory)}>
                        <span className="icon">edit</span>
                      </button>
                      <button className="admin-delete-btn" onClick={() => handleDeleteMemory(memory.id)}>
                        <span className="icon">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                {memories.length === 0 && <p className="admin-empty">មិនទាន់មានទិន្នន័យនៅឡើយទេ</p>}
              </div>
            </motion.div>
          )}

          {/* LETTER TAB */}
          {activeTab === TABS.LETTER && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="admin-section-title">កែប្រែសំបុត្រស្នេហ៍</h2>
              <p className="admin-section-desc">Edit the love letter displayed on the home page</p>
              <div className="form-group">
                <label className="form-label">ខ្លឹមសារសំបុត្រ</label>
                <textarea
                  className="form-textarea letter-editor"
                  value={letterContent}
                  onChange={(e) => setLetterContent(e.target.value)}
                  placeholder="Write your love letter here..."
                  rows={12}
                />
              </div>
              <button className="admin-submit-btn" onClick={handleSaveLetter}>
                <span className="icon">save</span>
                រក្សាទុក
              </button>
            </motion.div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === TABS.SETTINGS && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="admin-section-title">អត្ថបទស្វាគមន៍</h2>
              <p className="admin-section-desc">Title and subtitle shown on the home page hero</p>
              <div className="form-group">
                <label className="form-label">ចំណងជើង / Title (Khmer)</label>
                <input
                  type="text"
                  className="form-input"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  placeholder="រីករាយថ្ងៃកំណើត!"
                />
              </div>
              <div className="form-group">
                <label className="form-label">អត្ថបទរង / Subtitle (English)</label>
                <input
                  type="text"
                  className="form-input"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  placeholder="Happy Birthday!"
                />
              </div>
              <button className="admin-submit-btn" onClick={handleSaveHero}>
                <span className="icon">save</span>
                រក្សាទុក
              </button>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

              <h2 className="admin-section-title">សារពិសេស</h2>
              <p className="admin-section-desc">Rotating love messages on the home page</p>

              {/* Add new message */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <input
                  type="text"
                  className="form-input"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a new message..."
                  onKeyDown={(e) => e.key === 'Enter' && handleAddMessage()}
                  style={{ flex: 1 }}
                />
                <button className="admin-submit-btn" onClick={handleAddMessage} style={{ marginTop: 0, whiteSpace: 'nowrap' }}>
                  <span className="icon">add</span>
                  បន្ថែម
                </button>
              </div>

              {/* Messages list */}
              <div className="admin-list">
                {messages.length === 0 && <p className="admin-empty">មិនទាន់មានសារនៅឡើយទេ</p>}
                {messages.map((msg, i) => (
                  <div key={i} className="admin-list-item">
                    {editingMessageIndex === i ? (
                      <>
                        <div className="admin-list-info" style={{ flex: 1 }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editingMessageValue}
                            onChange={(e) => setEditingMessageValue(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateMessage()}
                            autoFocus
                          />
                        </div>
                        <button className="admin-submit-btn" onClick={handleUpdateMessage} style={{ marginTop: 0, padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          <span className="icon" style={{ fontSize: '1rem' }}>check</span>
                        </button>
                        <button className="admin-cancel-btn" onClick={() => setEditingMessageIndex(null)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          <span className="icon" style={{ fontSize: '1rem' }}>close</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="admin-list-info">
                          <p className="admin-list-desc">{msg}</p>
                        </div>
                        <div className="admin-list-actions">
                          <button className="admin-edit-btn" onClick={() => handleStartEditMessage(i)}>
                            <span className="icon">edit</span>
                          </button>
                          <button className="admin-delete-btn" onClick={() => handleDeleteMessage(i)}>
                            <span className="icon">delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.5rem 0' }} />

              <h2 className="admin-section-title">កំណត់កាលបរិច្ឆេទកំណើត</h2>
              <p className="admin-section-desc">Set the birthday date for the countdown</p>
              <div className="form-group">
                <label className="form-label">ថ្ងៃខែឆ្នាំកំណើត</label>
                <input
                  type="date"
                  className="form-input"
                  value={birthdayDate}
                  onChange={(e) => setBirthdayDate(e.target.value)}
                />
              </div>
              <button className="admin-submit-btn" onClick={handleSaveBirthday}>
                <span className="icon">save</span>
                រក្សាទុក
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}