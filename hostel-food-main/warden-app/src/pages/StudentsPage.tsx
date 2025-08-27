import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, logger, getWardenHostelId, getWardenInfo } from '../config/config';
import './StudentsPage.css';

interface Student {
  id: number;
  name: string;
  roll_number: string;
  email: string;
  hostel_id: number;
  year?: string;
  degree?: string;
  status?: 'active' | 'paused';
  pause_until?: string;
  pause_meals?: string;
}

interface StudentsResponse {
  success: boolean;
  students: Student[];
  hostel: {
    hostel_name: string;
    warden_name: string;
  };
  total: number;
  active: number;
  paused: number;
}

const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'paused'>('all');
  const [yearFilter, setYearFilter] = useState<'all' | string>('all');
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [hostelInfo, setHostelInfo] = useState<{hostel_name: string, warden_name: string} | null>(null);
  const [stats, setStats] = useState<{total: number, active: number, paused: number} | null>(null);

  // Get hostel ID from logged-in warden
  const hostelId = getWardenHostelId();
  const wardenInfo = getWardenInfo();

  // Cache management
  const CACHE_KEY = `students_hostel_${hostelId}`;
  const CACHE_EXPIRY_KEY = `${CACHE_KEY}_expiry`;
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  useEffect(() => {
    fetchStudents();
  }, [hostelId]);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, statusFilter, yearFilter]);

  const isDataCached = (): boolean => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    const cacheExpiry = localStorage.getItem(CACHE_EXPIRY_KEY);
    
    if (!cachedData || !cacheExpiry) {
      return false;
    }
    
    const expiryTime = parseInt(cacheExpiry);
    return Date.now() < expiryTime;
  };

  const getCachedData = (): StudentsResponse | null => {
    try {
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData && isDataCached()) {
        return JSON.parse(cachedData);
      }
    } catch (error) {
      logger.error('Error parsing cached students data:', error);
    }
    return null;
  };

  const setCachedData = (data: StudentsResponse) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data));
      localStorage.setItem(CACHE_EXPIRY_KEY, (Date.now() + CACHE_DURATION).toString());
    } catch (error) {
      logger.error('Error caching students data:', error);
    }
  };

  const fetchStudents = async (forceRefresh: boolean = false) => {
    setLoading(true);
    setError('');
    
    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh) {
        const cachedData = getCachedData();
        if (cachedData) {
          logger.log('Using cached students data');
          setStudents(cachedData.students);
          setHostelInfo(cachedData.hostel);
          setStats({
            total: cachedData.total,
            active: cachedData.active,
            paused: cachedData.paused
          });
          
          // Extract available years from cached data
          const years = [...new Set(cachedData.students
            .map(student => student.year)
            .filter((year): year is string => year !== undefined && year.trim() !== '')
          )].sort();
          setAvailableYears(years);
          
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data from API
      logger.log(`Fetching students for hostel ${hostelId} from database`);
      const response = await axios.get<StudentsResponse>(`${API_ENDPOINTS.STUDENTS_BY_HOSTEL}/${hostelId}`);
      
      if (response.data.success) {
        setStudents(response.data.students);
        setHostelInfo(response.data.hostel);
        setStats({
          total: response.data.total,
          active: response.data.active,
          paused: response.data.paused
        });
        
        // Extract available years for filtering
        const years = [...new Set(response.data.students
          .map(student => student.year)
          .filter((year): year is string => year !== undefined && year.trim() !== '')
        )].sort();
        setAvailableYears(years);
        
        // Cache the response
        setCachedData(response.data);
        
        setError('');
      } else {
        throw new Error('Failed to fetch students');
      }
    } catch (err: any) {
      logger.error('Error fetching students:', err);
      setError(`Failed to fetch students: ${err.response?.data?.error || err.message}`);
      setStudents([]);
      setHostelInfo(null);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = [...students];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    // Filter by year
    if (yearFilter !== 'all') {
      filtered = filtered.filter(student => student.year === yearFilter);
    }

    setFilteredStudents(filtered);
  };

  const getFilteredStats = () => {
    return {
      total: filteredStudents.length,
      active: filteredStudents.filter(s => s.status === 'active').length,
      paused: filteredStudents.filter(s => s.status === 'paused').length
    };
  };

  const isFiltered = () => {
    return statusFilter !== 'all' || yearFilter !== 'all' || searchTerm.trim() !== '';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (student: Student) => {
    if (student.status === 'paused') {
      return (
        <span className="status-badge paused">
          ⏸️ Paused {student.pause_until ? `until ${formatDate(student.pause_until)}` : ''}
        </span>
      );
    }
    return <span className="status-badge active">✅ Active</span>;
  };

  if (loading) {
    return (
      <div className="page">
        <div className="loading">Loading students...</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div className="header-main">
          <h1 className="page-title">👥 Students Directory</h1>
          {hostelInfo && (
            <div className="hostel-info">
              <strong>{hostelInfo.hostel_name}</strong>
              {wardenInfo && <span> • Warden: {wardenInfo.name}</span>}
            </div>
          )}
        </div>
        
        <div className="header-actions">
          <button 
            onClick={() => fetchStudents(true)} 
            className="btn btn-primary"
            disabled={loading}
          >
            🔄 {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      <div className="students-stats">
        <div className="stat-item">
          <span className="stat-number">
            {isFiltered() ? getFilteredStats().total : (stats?.total || students.length)}
          </span>
          <span className="stat-label">
            {isFiltered() ? 'Filtered' : 'Total'} Students
          </span>
          {isFiltered() && (
            <span className="stat-total">of {stats?.total || students.length} total</span>
          )}
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {isFiltered() ? getFilteredStats().active : (stats?.active || students.filter(s => s.status === 'active').length)}
          </span>
          <span className="stat-label">Active</span>
        </div>
        <div className="stat-item">
          <span className="stat-number">
            {isFiltered() ? getFilteredStats().paused : (stats?.paused || students.filter(s => s.status === 'paused').length)}
          </span>
          <span className="stat-label">Paused</span>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="students-controls">
        <div className="search-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, roll number, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label className="filter-label">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'paused')}
              className="filter-select"
            >
              <option value="all">All Students</option>
              <option value="active">Active Only</option>
              <option value="paused">Paused Only</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Year:</label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Years</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {(statusFilter !== 'all' || yearFilter !== 'all' || searchTerm) && (
            <div className="filter-group">
              <label className="filter-label">&nbsp;</label>
              <button 
                onClick={() => {
                  setStatusFilter('all');
                  setYearFilter('all');
                  setSearchTerm('');
                }}
                className="btn btn-secondary clear-filters"
              >
                🗑️ Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="no-results">
          <p>No students found matching your criteria.</p>
        </div>
      ) : (
        <div className="students-list">
          {filteredStudents.map((student) => (
            <div key={student.id} className="student-card">
              <div className="student-avatar">
                👤
              </div>
              
              <div className="student-info">
                <div className="student-main">
                  <h3 className="student-name">{student.name}</h3>
                  <p className="student-roll">Roll: {student.roll_number}</p>
                  {(student.year || student.degree) && (
                    <p className="student-academic">
                      {student.year && `Year: ${student.year}`}
                      {student.year && student.degree && ' • '}
                      {student.degree && `Degree: ${student.degree}`}
                    </p>
                  )}
                </div>
                
                <div className="student-contact">
                  <p className="student-email">📧 {student.email}</p>
                  {student.pause_meals && (
                    <p className="student-pause-meals">🍽️ Paused meals: {student.pause_meals}</p>
                  )}
                </div>
              </div>
              
              <div className="student-status">
                {getStatusBadge(student)}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="export-section">
        <button className="btn btn-secondary">📄 Export Student List</button>
      </div>
    </div>
  );
};

export default StudentsPage;
