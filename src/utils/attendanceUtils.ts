/**
 * Utility functions for attendance calculations and formatting.
 */

/**
 * Calculates attendance percentage
 * @param attended Days present
 * @param total Total possible days
 * @returns Formatted percentage string
 */
export const calculateAttendancePercentage = (attended: number, total: number): string => {
  if (total === 0) return "0.0";
  return ((attended / total) * 100).toFixed(1);
};

/**
 * Formats a date to YYYY-MM-DD
 * @param date Date object
 * @returns Formatted string
 */
export const formatDateKey = (date: Date): string => {
  return date.toISOString().split("T")[0];
};

/**
 * Converts attendance data to CSV format
 * @param data Array of student attendance records
 * @returns CSV string
 */
export const convertToCSV = (data: any[]): string => {
  const headers = ["Name", "Email", "Days Present", "Total Days", "Percentage", "Last Seen"];
  const rows = data.map(record => [
    record.name,
    record.email || "N/A",
    record.daysPresent,
    record.totalDays,
    `${record.percentage}%`,
    record.lastSeen ? new Date(record.lastSeen).toLocaleString() : "Never"
  ]);

  return [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
  ].join("\n");
};
