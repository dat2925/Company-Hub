import { BadRequestException } from '@nestjs/common';

export type AssignmentTiming = {
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  breakMinutes: number;
  lateGraceMinutes: number;
  earlyLeaveGraceMinutes: number;
  overtimeAllowed: boolean;
  overtimeThresholdMinutes: number;
};

export type AttendanceCalculation = {
  workedMinutes: number;
  regularMinutes: number;
  scheduledMinutes: number;
  overtimeMinutes: number;
  earlyArrivalMinutes: number;
  lateArrivalMinutes: number;
  earlyLeaveMinutes: number;
  lateLeaveMinutes: number;
  hasOvertime: boolean;
};

const minuteDiff = (later: Date, earlier: Date) => Math.max(0, Math.floor((later.getTime() - earlier.getTime()) / 60000));

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, Number(part.value)]));
  return Date.UTC(values.year, values.month - 1, values.day, values.hour, values.minute, values.second) - date.getTime();
}

function zonedDate(date: string, time: string, addDay: boolean, timeZone: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const desired = Date.UTC(year, month - 1, day + (addDay ? 1 : 0), hour, minute);
  let result = new Date(desired - timeZoneOffsetMs(new Date(desired), timeZone));
  result = new Date(desired - timeZoneOffsetMs(result, timeZone));
  return result;
}

export function buildSchedule(workDate: string, shift: Omit<AssignmentTiming, 'scheduledStartAt' | 'scheduledEndAt'> & { startTime: string; endTime: string }): AssignmentTiming {
  const timeZone = process.env.APP_TIME_ZONE ?? 'Asia/Ho_Chi_Minh';
  const scheduledStartAt = zonedDate(workDate, shift.startTime, false, timeZone);
  const scheduledEndAt = zonedDate(workDate, shift.endTime, shift.endTime <= shift.startTime, timeZone);
  const duration = minuteDiff(scheduledEndAt, scheduledStartAt);
  if (duration <= 0 || shift.breakMinutes >= duration) throw new BadRequestException('Shift break must be shorter than shift duration');
  return { scheduledStartAt, scheduledEndAt, breakMinutes: shift.breakMinutes, lateGraceMinutes: shift.lateGraceMinutes, earlyLeaveGraceMinutes: shift.earlyLeaveGraceMinutes, overtimeAllowed: shift.overtimeAllowed, overtimeThresholdMinutes: shift.overtimeThresholdMinutes };
}

export function calculateAttendance(checkIn: Date, checkOut: Date, schedule: AssignmentTiming): AttendanceCalculation {
  if (checkOut <= checkIn) throw new BadRequestException('Check-out must be after check-in');
  const grossMinutes = minuteDiff(checkOut, checkIn);
  const scheduledGross = minuteDiff(schedule.scheduledEndAt, schedule.scheduledStartAt);
  const scheduledMinutes = Math.max(0, scheduledGross - schedule.breakMinutes);
  const overlapStart = Math.max(checkIn.getTime(), schedule.scheduledStartAt.getTime());
  const overlapEnd = Math.min(checkOut.getTime(), schedule.scheduledEndAt.getTime());
  const overlapGross = Math.max(0, Math.floor((overlapEnd - overlapStart) / 60000));
  const shiftMidpoint = schedule.scheduledStartAt.getTime() + (schedule.scheduledEndAt.getTime() - schedule.scheduledStartAt.getTime()) / 2;
  const breakStart = shiftMidpoint - schedule.breakMinutes * 30000;
  const breakEnd = shiftMidpoint + schedule.breakMinutes * 30000;
  const breakOverlapMinutes = Math.max(0, Math.floor((Math.min(checkOut.getTime(), breakEnd) - Math.max(checkIn.getTime(), breakStart)) / 60000));
  const regularMinutes = Math.max(0, overlapGross - breakOverlapMinutes);
  const workedMinutes = Math.max(0, grossMinutes - breakOverlapMinutes);
  const rawOvertime = minuteDiff(schedule.scheduledStartAt, checkIn) + minuteDiff(checkOut, schedule.scheduledEndAt);
  const overtimeMinutes = schedule.overtimeAllowed && rawOvertime >= schedule.overtimeThresholdMinutes ? rawOvertime : 0;
  const earlyArrivalMinutes = minuteDiff(schedule.scheduledStartAt, checkIn);
  const lateArrivalMinutes = Math.max(0, minuteDiff(checkIn, schedule.scheduledStartAt) - schedule.lateGraceMinutes);
  const earlyLeaveMinutes = Math.max(0, minuteDiff(schedule.scheduledEndAt, checkOut) - schedule.earlyLeaveGraceMinutes);
  const lateLeaveMinutes = minuteDiff(checkOut, schedule.scheduledEndAt);
  return { workedMinutes, regularMinutes, scheduledMinutes, overtimeMinutes, earlyArrivalMinutes, lateArrivalMinutes, earlyLeaveMinutes, lateLeaveMinutes, hasOvertime: overtimeMinutes > 0 };
}
