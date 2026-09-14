import { buildSchedule, calculateAttendance } from '../src/shifts/shift-time';

describe('Shift attendance calculation', () => {
  beforeAll(() => { process.env.APP_TIME_ZONE = 'Asia/Ho_Chi_Minh'; });

  const dayShift = buildSchedule('2026-09-12', {
    startTime: '08:00', endTime: '17:00', breakMinutes: 60,
    lateGraceMinutes: 5, earlyLeaveGraceMinutes: 5,
    overtimeAllowed: true, overtimeThresholdMinutes: 30,
  });

  it('calculates work, late arrival, early leave and overtime from the assigned shift', () => {
    const result = calculateAttendance(new Date('2026-09-12T01:10:00.000Z'), new Date('2026-09-12T10:45:00.000Z'), dayShift);
    expect(result).toEqual({
      workedMinutes: 515,
      regularMinutes: 470,
      scheduledMinutes: 480,
      overtimeMinutes: 45,
      earlyArrivalMinutes: 0,
      lateArrivalMinutes: 5,
      earlyLeaveMinutes: 0,
      lateLeaveMinutes: 45,
      hasOvertime: true,
    });
  });

  it('does not count overtime below the configured threshold', () => {
    const result = calculateAttendance(new Date('2026-09-12T00:50:00.000Z'), new Date('2026-09-12T10:10:00.000Z'), dayShift);
    expect(result.earlyArrivalMinutes).toBe(10);
    expect(result.lateLeaveMinutes).toBe(10);
    expect(result.overtimeMinutes).toBe(0);
    expect(result.hasOvertime).toBe(false);
  });

  it('supports overnight shifts', () => {
    const night = buildSchedule('2026-09-12', { startTime: '22:00', endTime: '06:00', breakMinutes: 0, lateGraceMinutes: 0, earlyLeaveGraceMinutes: 0, overtimeAllowed: true, overtimeThresholdMinutes: 0 });
    const result = calculateAttendance(new Date('2026-09-12T15:00:00.000Z'), new Date('2026-09-12T23:30:00.000Z'), night);
    expect(night.scheduledEndAt.getUTCDate()).toBe(12);
    expect(result.scheduledMinutes).toBe(480);
    expect(result.overtimeMinutes).toBe(30);
  });
});
