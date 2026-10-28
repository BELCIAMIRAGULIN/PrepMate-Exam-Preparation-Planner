import React, { useEffect, useState } from 'react';
import './App.css';

const API_URL = 'http://localhost:5000/api/tasks';

const subjects = ['HTML', 'CSS', 'JavaScript', 'React.js', 'Node.js', 'MongoDB'];

const quizQuestions = [
  {
    subject: 'HTML',
    question: 'What does HTML stand for?',
    options: ['Hyper Text Markup Language', 'High Text Machine Language', 'Hyper Tool Multi Language', 'Home Text Markup Language'],
    answer: 0
  },
  {
    subject: 'CSS',
    question: 'Which language is used to style a webpage?',
    options: ['HTML', 'CSS', 'SQL', 'Python'],
    answer: 1
  },
  {
    subject: 'JavaScript',
    question: 'Which keyword declares a variable in JavaScript?',
    options: ['int', 'string', 'let', 'define'],
    answer: 2
  },
  {
    subject: 'React.js',
    question: 'Which hook is used to manage state in a React function component?',
    options: ['useState', 'useStyle', 'useClass', 'useHTML'],
    answer: 0
  },
  {
    subject: 'Node.js',
    question: 'Node.js is mainly used to run JavaScript where?',
    options: ['Only in CSS', 'On the server', 'Only in HTML', 'Inside SQL'],
    answer: 1
  },
  {
    subject: 'MongoDB',
    question: 'MongoDB stores data mainly as what?',
    options: ['Documents', 'Slides', 'Images only', 'CSS files'],
    answer: 0
  }
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [page, setPage] = useState('Dashboard');
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem('prepmate-theme') === 'dark'
  );
  const [profileName, setProfileName] = useState(
    () => localStorage.getItem('prepmate-profile-name') || 'Student'
  );
  const [nameInput, setNameInput] = useState(
    () => localStorage.getItem('prepmate-profile-name') || 'Student'
  );

  const [tasks, setTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskSubject, setTaskSubject] = useState('HTML');
  const [taskDate, setTaskDate] = useState('');
  const [taskError, setTaskError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(false);

  const [notes, setNotes] = useState(() =>
    readStorage('prepmate-notes', [])
  );
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('HTML');
  const [noteContent, setNoteContent] = useState('');
  const [noteSearch, setNoteSearch] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);

  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizFinished, setQuizFinished] = useState(false);

  const [schedule, setSchedule] = useState(() =>
    readStorage('prepmate-schedule', [])
  );
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const [seconds, setSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [breakMode, setBreakMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('prepmate-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('prepmate-notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('prepmate-schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    if (!timerRunning) return undefined;

    const timer = setInterval(() => {
      setSeconds(current => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setLoadingTasks(true);
    setTaskError('');

    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Could not load tasks.');
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch {
      setTaskError('Backend connect aagala. Backend server running-a irukka nu check pannu.');
    } finally {
      setLoadingTasks(false);
    }
  }

  async function addTask(event) {
    event.preventDefault();
    if (!taskTitle.trim()) {
      setTaskError('Task name enter pannu.');
      return;
    }

    const newTask = {
      title: taskTitle.trim(),
      subject: taskSubject,
      dueDate: taskDate,
      completed: false
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });

      if (!response.ok) throw new Error();
      const createdTask = await response.json();

      setTasks(previous => [
        ...previous,
        createdTask.task || createdTask
      ]);
      setTaskTitle('');
      setTaskDate('');
      setTaskError('');
    } catch {
      setTaskError('Task save aagala. Backend/API check pannu.');
    }
  }

  
async function toggleTask(task) {
  const id = task._id || task.id;
  const updatedCompleted = !task.completed;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        completed: updatedCompleted
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Task update failed');
    }

    const savedTask = await response.json();

    setTasks(previous =>
      previous.map(item =>
        (item._id || item.id) === id ? savedTask : item
      )
    );

    setTaskError('');
  } catch (error) {
    console.error('Task update error:', error);
    setTaskError('Task update aagala. Please try again.');
  }
}


  async function deleteTask(task) {
    const id = task._id || task.id;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error();
      setTasks(previous =>
        previous.filter(item => (item._id || item.id) !== id)
      );
      setTaskError('');
    } catch {
      setTaskError('Task delete aagala. Backend route check pannu.');
    }
  }

  function saveNote(event) {
    event.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    if (editingNoteId !== null) {
      setNotes(previous =>
        previous.map(note =>
          note.id === editingNoteId
            ? { ...note, title: noteTitle, subject: noteSubject, content: noteContent }
            : note
        )
      );
      setEditingNoteId(null);
    } else {
      setNotes(previous => [
        {
          id: Date.now(),
          title: noteTitle.trim(),
          subject: noteSubject,
          content: noteContent.trim(),
          createdAt: new Date().toLocaleDateString()
        },
        ...previous
      ]);
    }

    setNoteTitle('');
    setNoteSubject('HTML');
    setNoteContent('');
  }

  function editNote(note) {
    setEditingNoteId(note.id);
    setNoteTitle(note.title);
    setNoteSubject(note.subject);
    setNoteContent(note.content);
  }

  function saveProfile(event) {
    event.preventDefault();
    const name = nameInput.trim() || 'Student';
    setProfileName(name);
    setNameInput(name);
    localStorage.setItem('prepmate-profile-name', name);
    alert('Profile saved!');
  }

  function addSchedule(event) {
    event.preventDefault();
    if (!scheduleTitle.trim() || !scheduleDate || !scheduleTime) return;

    setSchedule(previous => [
      ...previous,
      {
        id: Date.now(),
        title: scheduleTitle.trim(),
        date: scheduleDate,
        time: scheduleTime,
        completed: false
      }
    ]);

    setScheduleTitle('');
    setScheduleDate('');
    setScheduleTime('');
  }

  function resetQuiz() {
    setQuizIndex(0);
    setQuizAnswers({});
    setQuizFinished(false);
  }

  function formatTime(value) {
    const minutes = Math.floor(value / 60).toString().padStart(2, '0');
    const secs = (value % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  }

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;

  const quizScore = quizQuestions.reduce(
    (score, question, index) =>
      score + (quizAnswers[index] === question.answer ? 1 : 0),
    0
  );

  const visibleNotes = notes.filter(note =>
    `${note.title} ${note.subject} ${note.content}`
      .toLowerCase()
      .includes(noteSearch.toLowerCase())
  );

  const menuItems = [
    ['Dashboard', '⌂'],
    ['My Subjects', '▤'],
    ['Study Tasks', '✓'],
    ['Timetable', '▦'],
    ['Progress', '▥'],
    ['Focus Timer', '◷'],
    ['Practice Quiz', '✎'],
    ['Study Notes', '▧'],
    ['Profile Settings', '⚙']
  ];

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <aside className="sidebar">
        <div className="logo">
          <span className="logo-icon">P</span>
          <div>
            <h2>PrepMate</h2>
            <small>STUDY SMARTER</small>
          </div>
        </div>

        <p className="menu-heading">MENU</p>
        <nav className="menu-list">
          {menuItems.map(([item, icon]) => (
            <button
              key={item}
              className={`menu-item ${page === item ? 'active' : ''}`}
              onClick={() => setPage(item)}
            >
              <span>{icon}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-card">
            <span>🎯</span>
            <strong>Keep going!</strong>
            <p>Small steps make big progress.</p>
          </div>
          <p className="sidebar-footer">PrepMate © 2026</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL STUDY SPACE</p>
            <h1>{page}</h1>
          </div>
          <div className="topbar-actions">
            <button
              className="theme-button"
              onClick={() => setDarkMode(value => !value)}
            >
              {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </button>
            <div className="profile-chip">
              <div className="avatar">{profileName.charAt(0).toUpperCase()}</div>
              <span>{profileName}</span>
            </div>
          </div>
        </header>

        {page === 'Dashboard' && (
          <>
            <section className="welcome-banner">
              <div>
                <p className="eyebrow">WELCOME BACK!</p>
                <h2>Ready to achieve your goals, {profileName}?</h2>
                <p>Plan your day, learn something new, and keep moving forward.</p>
                <button className="primary-button" onClick={() => setPage('Study Tasks')}>
                  View My Tasks →
                </button>
              </div>
              <div className="banner-art">📚</div>
            </section>

            <section className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon purple">📚</span>
                <p>Total Subjects</p>
                <h2>{subjects.length}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon blue">📝</span>
                <p>Total Tasks</p>
                <h2>{tasks.length}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon green">✓</span>
                <p>Completed Tasks</p>
                <h2>{completedTasks}</h2>
              </div>
              <div className="stat-card">
                <span className="stat-icon orange">📈</span>
                <p>Progress</p>
                <h2>{progress}%</h2>
              </div>
            </section>

            <section className="content-grid">
              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h2>My Subjects</h2>
                    <p>Your learning journey starts here.</p>
                  </div>
                  <button className="text-button" onClick={() => setPage('My Subjects')}>
                    View all
                  </button>
                </div>
                <div className="subject-grid">
                  {subjects.slice(0, 4).map((subject, index) => (
                    <div className="subject-card" key={subject}>
                      <span className={`subject-icon color-${index}`}>📘</span>
                      <h3>{subject}</h3>
                      <p>Keep learning</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="panel">
                <div className="section-heading">
                  <div>
                    <h2>Task Progress</h2>
                    <p>Your completed study tasks.</p>
                  </div>
                </div>
                <div className="progress-circle" style={{ '--progress': `${progress}%` }}>
                  <div>
                    <strong>{progress}%</strong>
                    <span>Completed</span>
                  </div>
                </div>
                <p className="center-text">{completedTasks} of {tasks.length} tasks completed</p>
                <button className="secondary-button full-button" onClick={() => setPage('Progress')}>
                  See Progress
                </button>
              </div>
            </section>
          </>
        )}

        {page === 'My Subjects' && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Your Subjects</h2>
                <p>Choose a subject and focus on your learning.</p>
              </div>
            </div>
            <div className="subject-grid large-grid">
              {subjects.map((subject, index) => (
                <div className="subject-card" key={subject}>
                  <span className={`subject-icon color-${index % 4}`}>📘</span>
                  <h3>{subject}</h3>
                  <p>Study, practise, and improve.</p>
                  <button className="secondary-button" onClick={() => {
                    setTaskSubject(subject);
                    setPage('Study Tasks');
                  }}>
                    Add a task
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === 'Study Tasks' && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Manage Study Tasks</h2>
                <p>Add tasks and mark them as completed.</p>
              </div>
              <button className="secondary-button" onClick={loadTasks}>↻ Refresh</button>
            </div>

            <form className="form-grid" onSubmit={addTask}>
              <label>
                Task name
                <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Revise HTML tags" />
              </label>
              <label>
                Subject
                <select value={taskSubject} onChange={e => setTaskSubject(e.target.value)}>
                  {subjects.map(subject => <option key={subject}>{subject}</option>)}
                </select>
              </label>
              <label>
                Due date
                <input type="date" value={taskDate} onChange={e => setTaskDate(e.target.value)} />
              </label>
              <button className="primary-button form-button" type="submit">+ Add Task</button>
            </form>

            {taskError && <p className="notice">{taskError}</p>}
            {loadingTasks && <p>Loading tasks...</p>}

            <div className="task-list">
              {tasks.length === 0 && !loadingTasks ? (
                <p className="empty-state">No tasks yet. Add your first study task above!</p>
              ) : tasks.map(task => (
                <div className="task-row" key={task._id || task.id || task.title}>
                  <label className="task-check">
                    <input type="checkbox" checked={Boolean(task.completed)} onChange={() => toggleTask(task)} />
                    <span className={task.completed ? 'completed-text' : ''}>
                      <strong>{task.title || task.taskName || 'Untitled task'}</strong>
                      <small>{task.subject || 'General'} {task.dueDate ? `• Due ${task.dueDate}` : ''}</small>
                    </span>
                  </label>
                  <button className="delete-button" onClick={() => deleteTask(task)}>Delete</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === 'Timetable' && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Study Timetable</h2>
                <p>Plan your study sessions. Your timetable is saved in this browser.</p>
              </div>
            </div>

            <form className="form-grid" onSubmit={addSchedule}>
              <label>
                Session
                <input value={scheduleTitle} onChange={e => setScheduleTitle(e.target.value)} placeholder="e.g. Java practice" required />
              </label>
              <label>
                Date
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} required />
              </label>
              <label>
                Time
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} required />
              </label>
              <button className="primary-button form-button" type="submit">+ Add Session</button>
            </form>

            <div className="task-list">
              {schedule.length === 0 ? <p className="empty-state">No sessions planned yet.</p> :
                [...schedule].sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)).map(item => (
                  <div className="task-row" key={item.id}>
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.date} • {item.time}</small>
                    </div>
                    <button className="delete-button" onClick={() => setSchedule(previous => previous.filter(s => s.id !== item.id))}>Delete</button>
                  </div>
                ))
              }
            </div>
          </section>
        )}

        {page === 'Progress' && (
          <section className="panel progress-panel">
            <h2>Your Study Progress</h2>
            <p>Every task you complete is a step forward.</p>
            <div className="progress-bar"><span style={{ width: `${progress}%` }} /></div>
            <h2>{progress}% completed</h2>
            <p>{completedTasks} completed out of {tasks.length} tasks.</p>
            <div className="stats-grid">
              <div className="stat-card"><p>Pending Tasks</p><h2>{tasks.length - completedTasks}</h2></div>
              <div className="stat-card"><p>Saved Notes</p><h2>{notes.length}</h2></div>
              <div className="stat-card"><p>Study Sessions</p><h2>{schedule.length}</h2></div>
            </div>
            <button className="secondary-button" onClick={() => setPage('Study Tasks')}>Manage Tasks</button>
          </section>
        )}

        {page === 'Focus Timer' && (
          <section className="panel timer-panel">
            <span className="timer-emoji">{breakMode ? '☕' : '🎯'}</span>
            <h2>{breakMode ? 'Break Time' : 'Focus Session'}</h2>
            <p>{breakMode ? 'Relax for a while and recharge.' : 'Stay focused on one task at a time.'}</p>
            <div className="timer-display">{formatTime(seconds)}</div>
            <div className="timer-buttons">
              <button className="primary-button" onClick={() => setTimerRunning(value => !value)}>
                {timerRunning ? 'Pause' : 'Start'}
              </button>
              <button className="secondary-button" onClick={() => {
                setTimerRunning(false);
                setSeconds(breakMode ? 5 * 60 : 25 * 60);
              }}>Reset</button>
              <button className="secondary-button" onClick={() => {
                const nextMode = !breakMode;
                setBreakMode(nextMode);
                setTimerRunning(false);
                setSeconds(nextMode ? 5 * 60 : 25 * 60);
              }}>{breakMode ? 'Study Mode' : 'Break Mode'}</button>
            </div>
            <p className="muted-text">Study: 25 minutes • Break: 5 minutes</p>
          </section>
        )}

        {page === 'Practice Quiz' && (
          <section className="panel quiz-panel">
            <div className="section-heading">
              <div>
                <h2>Practice Quiz</h2>
                <p>Test your knowledge with these beginner questions.</p>
              </div>
              <span className="quiz-count">{quizFinished ? 'Quiz completed' : `${quizIndex + 1} / ${quizQuestions.length}`}</span>
            </div>

            {!quizFinished ? (
              <>
                <div className="quiz-progress"><span style={{ width: `${((quizIndex + 1) / quizQuestions.length) * 100}%` }} /></div>
                <span className="subject-tag">{quizQuestions[quizIndex].subject}</span>
                <h3 className="quiz-question">{quizQuestions[quizIndex].question}</h3>
                <div className="options-list">
                  {quizQuestions[quizIndex].options.map((option, index) => (
                    <button
                      key={option}
                      className={`quiz-option ${quizAnswers[quizIndex] === index ? 'selected' : ''}`}
                      onClick={() => setQuizAnswers(previous => ({ ...previous, [quizIndex]: index }))}
                    >
                      <span>{String.fromCharCode(65 + index)}</span>{option}
                    </button>
                  ))}
                </div>
                <div className="quiz-actions">
                  <button className="secondary-button" disabled={quizIndex === 0} onClick={() => setQuizIndex(index => index - 1)}>← Previous</button>
                  <button className="primary-button" onClick={() => {
                    if (quizIndex === quizQuestions.length - 1) setQuizFinished(true);
                    else setQuizIndex(index => index + 1);
                  }}>
                    {quizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                </div>
              </>
            ) : (
              <div className="quiz-result">
                <span className="result-emoji">{quizScore >= 4 ? '🎉' : '💪'}</span>
                <h2>Your Score: {quizScore} / {quizQuestions.length}</h2>
                <p>{quizScore >= 4 ? 'Great job! Keep up the good work.' : 'Good try! Review your subjects and try again.'}</p>
                <button className="primary-button" onClick={resetQuiz}>Try Again</button>
                <div className="answer-review">
                  {quizQuestions.map((question, index) => (
                    <p key={question.question}>
                      <strong>{index + 1}. {question.question}</strong><br />
                      Your answer: {quizAnswers[index] === undefined ? 'Not answered' : question.options[quizAnswers[index]]}<br />
                      Correct answer: {question.options[question.answer]}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {page === 'Study Notes' && (
          <section className="panel">
            <div className="section-heading">
              <div>
                <h2>Study Notes</h2>
                <p>Create and keep your notes in this browser.</p>
              </div>
            </div>

            <form className="notes-form" onSubmit={saveNote}>
              <label>
                Note title
                <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="e.g. HTML Basics" required />
              </label>
              <label>
                Subject
                <select value={noteSubject} onChange={e => setNoteSubject(e.target.value)}>
                  {subjects.map(subject => <option key={subject}>{subject}</option>)}
                </select>
              </label>
              <label>
                Note content
                <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your study notes here..." rows="5" required />
              </label>
              <div className="notes-actions">
                <button className="primary-button" type="submit">{editingNoteId !== null ? 'Update Note' : '+ Save Note'}</button>
                {editingNoteId !== null && (
                  <button className="secondary-button" type="button" onClick={() => {
                    setEditingNoteId(null);
                    setNoteTitle('');
                    setNoteSubject('HTML');
                    setNoteContent('');
                  }}>Cancel</button>
                )}
              </div>
            </form>

            <div className="notes-heading">
              <h2>Saved Notes ({notes.length})</h2>
              <input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="Search notes..." />
            </div>

            <div className="notes-grid">
              {visibleNotes.length === 0 ? (
                <p className="empty-state">No notes found. Create a note above!</p>
              ) : visibleNotes.map(note => (
                <article className="note-card" key={note.id}>
                  <span className="subject-tag">{note.subject}</span>
                  <h3>{note.title}</h3>
                  <p className="note-content">{note.content}</p>
                  <small>{note.createdAt || 'Saved note'}</small>
                  <div className="note-buttons">
                    <button className="secondary-button" onClick={() => editNote(note)}>Edit</button>
                    <button className="delete-button" onClick={() => {
                      setNotes(previous => previous.filter(item => item.id !== note.id));
                      if (editingNoteId === note.id) {
                        setEditingNoteId(null);
                        setNoteTitle('');
                        setNoteContent('');
                      }
                    }}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {page === 'Profile Settings' && (
          <section className="panel profile-settings">
            <div className="section-heading">
              <div>
                <h2>Profile Settings</h2>
                <p>Personalise your PrepMate workspace.</p>
              </div>
              <div className="big-avatar">{profileName.charAt(0).toUpperCase()}</div>
            </div>
            <form className="profile-form" onSubmit={saveProfile}>
              <label>
                Your display name
                <input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Enter your name" />
              </label>
              <button className="primary-button" type="submit">Save Profile</button>
            </form>
            <div className="settings-row">
              <div>
                <strong>Appearance</strong>
                <p>Switch between light and dark mode.</p>
              </div>
              <button className="secondary-button" onClick={() => setDarkMode(value => !value)}>
                {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
            <div className="settings-row">
              <div>
                <strong>Study Notes</strong>
                <p>{notes.length} notes saved in this browser.</p>
              </div>
              <button className="secondary-button" onClick={() => setPage('Study Notes')}>Open Notes</button>
            </div>
          </section>
        )}

        <footer className="main-footer">
          Made with 💜 for your learning journey • PrepMate
        </footer>
      </main>
    </div>
  );
}