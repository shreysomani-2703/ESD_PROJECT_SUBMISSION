import { useEffect, useState } from 'react'
import { editStudent, getStudentDetails, getDomains, type Student, type Domain, getDomainDisplay } from '../controller/studentController'
import { login, logout, getUserInfo } from '../controller/auth'
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';

function MainPage() {
  const [user, setUser] = useState<any | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [editingStudent, setEditingStudent] = useState<any | null>(null) // tolerant of different field names
  const [saving, setSaving] = useState<boolean>(false)
  const [domains, setDomains] = useState<Domain[]>([])
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null)
  const [isDomainModalOpen, setIsDomainModalOpen] = useState(false)

  // Load students from backend
  const loadStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await getStudentDetails()
      setStudents(list ?? [])
    } catch (err) {
      if (err instanceof Error) setError(err.message)
      else setError(String(err))
      console.error('loadStudents error', err)
    } finally {
      setLoading(false)
    }
  }

  // Load domains from backend
  const loadDomains = async () => {
    try {
      const domainList = await getDomains()
      setDomains(domainList ?? [])
    } catch (err) {
      console.error('Failed to load domains:', err)
    }
  }

  // Initialize auth & data on mount
  useEffect(() => {
    let mounted = true
    const init = async () => {
      try {
        const u = await getUserInfo()
        if (!mounted) return
        setUser(u)
      } catch (err) {
        console.error('getUserInfo failed', err)
        setUser(null)
      } finally {
        await Promise.all([loadStudents(), loadDomains()])
      }
    }
    init()
    return () => { mounted = false }
  }, [])

  const handleEditClick = (student: Student) => {
    const studentToEdit: any = { ...student }

    if (studentToEdit.photograph_path && !studentToEdit.photographPath) {
      studentToEdit.photographPath = studentToEdit.photograph_path
    }
    if (!studentToEdit.photographPath) {
      studentToEdit.photographPath = studentToEdit.photographPath ?? ''
    }

    if (studentToEdit.domain) {
      if (typeof studentToEdit.domain === 'object' && studentToEdit.domain.domainId != null) {
        studentToEdit.domain = String(studentToEdit.domain.domainId)
      } else if (typeof studentToEdit.domain === 'number') {
        studentToEdit.domain = String(studentToEdit.domain)
      } else if (typeof studentToEdit.domain === 'string') {
        // already fine
      } else {
        const d = (studentToEdit.domain as any)
        const found = domains.find(dom => dom.program === d?.program && dom.batch === d?.batch)
        studentToEdit.domain = found ? String(found.domainId) : ''
      }
    } else {
      studentToEdit.domain = ''
    }

    studentToEdit.cgpa = studentToEdit.cgpa ?? ''
    studentToEdit.totalCredits = studentToEdit.totalCredits ?? ''
    studentToEdit.graduationYear = studentToEdit.graduationYear ?? ''

    setEditingStudent(studentToEdit);
  }

  const handleDomainClick = (domainName: string) => {
    const domain = domains.find(d => d.program === domainName)
    if (domain) {
      setSelectedDomain(domain)
      setIsDomainModalOpen(true)
    }
  }

  const handleEditChange = (field: string, value: string) => {
    setEditingStudent((prev: any) => {
      if (!prev) return prev

      let processed: any = value

      if (field === 'cgpa') {
        processed = value === '' ? undefined : parseFloat(value)
      } else if (field === 'totalCredits' || field === 'graduationYear') {
        processed = value === '' ? undefined : parseInt(value, 10)
      } else if (field === 'domain') {
        processed = value
      }

      return {
        ...prev,
        [field]: processed,
      }
    })
  }

  const handleEditSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!editingStudent) return
    try {
      setSaving(true)
      console.log('Saving student data:', editingStudent)

      const studentToSave: any = { ...editingStudent }

      if (studentToSave.photographPath != null) {
        studentToSave.photograph_path = studentToSave.photographPath
        delete studentToSave.photographPath
      }

      if (studentToSave.domain != null && studentToSave.domain !== '') {
        if (typeof studentToSave.domain === 'string') {
          const domainId = parseInt(studentToSave.domain, 10)
          if (!isNaN(domainId)) {
            const domainObj = domains.find(d => d.domainId === domainId)
            studentToSave.domain = domainObj ?? null
          } else {
            const domainObj = domains.find(d => d.program === studentToSave.domain)
            studentToSave.domain = domainObj ?? null
          }
        } else if (typeof studentToSave.domain === 'object') {
          const d = studentToSave.domain as any
          if (d && !d.domainId && d.program && d.batch) {
            const full = domains.find(dom => dom.program === d.program && dom.batch === d.batch)
            studentToSave.domain = full ?? studentToSave.domain
          }
        } else {
          studentToSave.domain = null
        }
      } else {
        studentToSave.domain = null
      }

      if (studentToSave.cgpa === '') studentToSave.cgpa = undefined
      if (studentToSave.totalCredits === '') studentToSave.totalCredits = undefined
      if (studentToSave.graduationYear === '') studentToSave.graduationYear = undefined

      // <-- FIX: call editStudent with a single argument
      const result = await editStudent(studentToSave);
      console.log('Server response:', result);
      await loadStudents();
      setEditingStudent(null);
    } catch (err) {
      console.error('Error saving student:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="app-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>Students</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {user ? (
            <>
              <span style={{ fontSize: 14 }}>{user.name ?? user.username ?? user.email}</span>
              <button className="auth-button" onClick={() => logout()}>Logout</button>
            </>
          ) : (
            <button className="auth-button" onClick={() => login('google')}>Login</button>
          )}
        </div>
      </div>

      {loading && <p>Loading students...</p>}
      {error && !loading && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && students.length === 0 && <p>No students found.</p>}
      {!loading && !error && students.length > 0 && (
        <table className="student-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Name</th>
              <th>Email</th>
              <th>Photograph</th>
              <th>Domain</th>
              <th>CGPA</th>
              <th>Total Credits</th>
              <th>Graduation Year</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student: any) => {
              const fullName = `${student.firstName}${student.lastName ? ` ${student.lastName}` : ''}`
              const photoPath = student.photograph_path ?? student.photographPath ?? ''
              return (
                <tr key={student.studentId ?? student.rollNo}>
                  <td>{student.rollNo}</td>
                  <td>{fullName}</td>
                  <td>{student.email}</td>
                  <td>
                    {photoPath ? (
                      <img
                        src={(() => {
                          if (typeof photoPath === 'string' && photoPath.startsWith('/home/')) {
                            const filename = String(photoPath).split('/').pop()
                            return `/profiles/${filename}`
                          }
                          return photoPath
                        })()}
                        alt={`${student.firstName}'s photo`}
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid #e0e0e0',
                          backgroundColor: '#f0f0f0'
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('/profiles/') && student.rollNo) {
                            target.src = `/profiles/${student.rollNo}.png`;
                            return;
                          }
                          target.onerror = null;
                          const name = student.firstName?.[0] || '?';
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=50`;
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: '#e0e0e0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#666',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        border: '2px solid #d0d0d0'
                      }}>
                        {student.firstName?.[0]?.toUpperCase() || '?'}
                      </div>
                    )}
                  </td>
                  <td>
                    {student.domain ? (
                      <button
                        className="domain-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          const domainText = typeof student.domain === 'string'
                            ? student.domain
                            : student.domain?.program || ''
                          handleDomainClick(domainText)
                        }}
                      >
                        {getDomainDisplay(student.domain)}
                      </button>
                    ) : '-'}
                  </td>
                  <td>{student.cgpa ?? '-'}</td>
                  <td>{student.totalCredits ?? '-'}</td>
                  <td>{student.graduationYear ?? '-'}</td>
                  <td>
                    <button
                      className="edit-button"
                      type="button"
                      onClick={() => handleEditClick(student)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      {editingStudent && (
        <form className="edit-form" onSubmit={handleEditSubmit}>
          <h2>Edit Student</h2>
          <div className="form-row">
            <label>
              Roll No
              <input
                type="text"
                value={editingStudent.rollNo ?? ''}
                onChange={(e) => handleEditChange('rollNo', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              First Name
              <input
                type="text"
                value={editingStudent.firstName ?? ''}
                onChange={(e) => handleEditChange('firstName', e.target.value)}
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                value={editingStudent.lastName ?? ''}
                onChange={(e) => handleEditChange('lastName', e.target.value)}
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Email
              <input
                type="email"
                value={editingStudent.email ?? ''}
                onChange={(e) => handleEditChange('email', e.target.value)}
              />
            </label>
            <label>
              Photograph URL
              <input
                type="text"
                value={editingStudent.photographPath ?? ''}
                onChange={(e) => handleEditChange('photographPath', e.target.value)}
                placeholder="Enter image URL"
              />
            </label>
          </div>
          <div className="form-row">
            <label>
              Domain
              <select
                value={
                  typeof editingStudent.domain === 'object'
                    ? String(editingStudent.domain.domainId ?? '')
                    : String(editingStudent.domain ?? '')
                }
                onChange={(e) => handleEditChange('domain', e.target.value)}
              >
                <option value="">Select Domain</option>
                {domains.map((domain) => (
                  <option key={domain.domainId} value={domain.domainId}>
                    {`${domain.program} (${domain.batch})`}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              CGPA
              <input
                type="number"
                step="0.01"
                value={editingStudent.cgpa ?? ''}
                onChange={(e) => handleEditChange('cgpa', e.target.value)}
              />
            </label>
            <label>
              Total Credits
              <input
                type="number"
                value={editingStudent.totalCredits ?? ''}
                onChange={(e) => handleEditChange('totalCredits', e.target.value)}
              />
            </label>
            <label>
              Graduation Year
              <input
                type="number"
                value={editingStudent.graduationYear ?? ''}
                onChange={(e) => handleEditChange('graduationYear', e.target.value)}
              />
            </label>
          </div>
          <div className="form-actions">
            <button className="edit-button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className="edit-button"
              type="button"
              disabled={saving}
              onClick={() => setEditingStudent(null)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
      <Modal 
        open={isDomainModalOpen} 
        onClose={() => setIsDomainModalOpen(false)}
        center
        classNames={{
          modal: 'domain-modal',
          overlay: 'domain-overlay',
          closeButton: 'domain-close-button'
        }}
      >
        <h2>Domain Details</h2>
        {selectedDomain && (
          <div className="domain-details">
            <p><strong>Program:</strong> {selectedDomain.program}</p>
            <p><strong>Batch:</strong> {selectedDomain.batch}</p>
            <p><strong>Qualification:</strong> {selectedDomain.qualification}</p>
            <p><strong>Capacity:</strong> {selectedDomain.capacity}</p>
          </div>
        )}
        <div className="modal-actions">
          <button 
            className="close-button" 
            onClick={() => setIsDomainModalOpen(false)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

export default MainPage
