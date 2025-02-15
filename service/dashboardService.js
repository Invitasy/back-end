import connectDB from '../config/dbConfig.js';

const getDashboardStats = async (eventId) => {
  const connection = await connectDB();
  try {
    // Get basic guest statistics
    const [guestStats] = await connection.query(
      `SELECT 
        COUNT(*) as totalGuests,
        SUM(CASE WHEN CheckInStatus = 'checked-in' THEN 1 ELSE 0 END) as checkedIn,
        SUM(CASE WHEN CheckInStatus = 'pending' THEN 1 ELSE 0 END) as pendingCheckIn,
        SUM(CASE WHEN SouvenirType = 'individual' THEN 1 ELSE 0 END) as individualSouvenirs,
        SUM(CASE WHEN SouvenirType = 'family' THEN 1 ELSE 0 END) as familySouvenirs
       FROM InvitedGuest
       WHERE EventID = ? AND IsDeleted = false`,
      [eventId]
    );

    // Get souvenir collection stats
    const [souvenirStats] = await connection.query(
      `SELECT 
        COUNT(*) as totalCollected
       FROM Souvenir s
       JOIN InvitedGuest g ON s.GuestID = g.GuestID
       WHERE g.EventID = ? AND s.PickupStatus = 'picked-up'`,
      [eventId]
    );

    // Get recent activity
    const [recentActivity] = await connection.query(
      `SELECT 
        c.CheckInDate,
        g.Name as GuestName,
        c.CheckInMethod,
        s.PickupStatus as SouvenirStatus
       FROM CheckInLog c
       JOIN InvitedGuest g ON c.GuestID = g.GuestID
       LEFT JOIN Souvenir s ON g.GuestID = s.GuestID
       WHERE g.EventID = ?
       ORDER BY c.CheckInDate DESC
       LIMIT 10`,
      [eventId]
    );

    // Update dashboard stats in database
    await connection.query(
      `INSERT INTO Dashboard (
        DashboardID, EventID, TotalGuests, 
        TotalCheckIns, TotalPendingCheckIns, TotalSouvenirs
       ) VALUES (
        UUID(), ?, ?, ?, ?, ?
       ) ON DUPLICATE KEY UPDATE
        TotalGuests = VALUES(TotalGuests),
        TotalCheckIns = VALUES(TotalCheckIns),
        TotalPendingCheckIns = VALUES(TotalPendingCheckIns),
        TotalSouvenirs = VALUES(TotalSouvenirs),
        LastUpdated = CURRENT_TIMESTAMP`,
      [
        eventId,
        guestStats[0].totalGuests,
        guestStats[0].checkedIn,
        guestStats[0].pendingCheckIn,
        souvenirStats[0].totalCollected
      ]
    );

    return {
      guestStats: guestStats[0],
      souvenirStats: souvenirStats[0],
      recentActivity
    };
  } finally {
    await connection.end();
  }
};

const getGuestCheckInHistory = async (eventId, limit = 10) => {
  const connection = await connectDB();
  try {
    const [history] = await connection.query(
      `SELECT 
        c.CheckInDate,
        g.Name as GuestName,
        g.GuestType,
        c.CheckInMethod,
        s.PickupStatus as SouvenirStatus,
        a.Name as CheckedInBy
       FROM CheckInLog c
       JOIN InvitedGuest g ON c.GuestID = g.GuestID
       LEFT JOIN Souvenir s ON g.GuestID = s.GuestID
       LEFT JOIN Admin a ON c.CheckedInBy = a.AdminID
       WHERE g.EventID = ?
       ORDER BY c.CheckInDate DESC
       LIMIT ?`,
      [eventId, limit]
    );
    return history;
  } finally {
    await connection.end();
  }
};

const getEventSummary = async (eventId) => {
  const connection = await connectDB();
  try {
    const [summary] = await connection.query(
      `SELECT 
        e.EventName,
        e.EventDate,
        e.Location,
        COUNT(DISTINCT g.GuestID) as TotalGuests,
        COUNT(DISTINCT CASE WHEN g.CheckInStatus = 'checked-in' THEN g.GuestID END) as CheckedInCount,
        COUNT(DISTINCT CASE WHEN s.PickupStatus = 'picked-up' THEN g.GuestID END) as SouvenirCollectedCount
       FROM Event e
       LEFT JOIN InvitedGuest g ON e.EventID = g.EventID
       LEFT JOIN Souvenir s ON g.GuestID = s.GuestID
       WHERE e.EventID = ?
       GROUP BY e.EventID`,
      [eventId]
    );
    return summary[0];
  } finally {
    await connection.end();
  }
};

export default {
  getDashboardStats,
  getGuestCheckInHistory,
  getEventSummary
};