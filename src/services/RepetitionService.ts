import { TaskService } from "./taskService";

const addDaysToDate = (date: Date, days: number): Date => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

export const RepetitionService = {
  parseRepetitionPattern: (pattern: string): number[] => {
    return pattern
      .split(",")
      .map((num) => parseInt(num.trim()))
      .filter((num) => !isNaN(num) && num > 0);
  },

  generateRepetitionDates: (
    startDate: Date,
    pattern: string,
    occurrences: number = 1,
  ): Date[] => {
    const dates: Date[] = [];
    const dayNumbers = RepetitionService.parseRepetitionPattern(pattern);

    if (dayNumbers.length === 0) {
      return dates;
    }

    const maxDay = Math.max(...dayNumbers);

    for (let cycle = 0; cycle < occurrences; cycle++) {
      const cycleStartDay = cycle * maxDay;

      dayNumbers.forEach((dayNumber) => {
        const absoluteDay = cycleStartDay + dayNumber - 1;
        const date = addDaysToDate(startDate, absoluteDay);
        dates.push(date);
      });
    }

    return dates.sort((a, b) => a.getTime() - b.getTime());
  },

  addTaskWithRepetition: async (
    title: string,
    startDate: Date,
    pattern: string,
    occurrences: number = 1,
    dueTime?: string,
  ): Promise<{
    success: boolean;
    count: number;
    dates: string[];
  }> => {
    try {
      const dates = RepetitionService.generateRepetitionDates(
        startDate,
        pattern,
        occurrences,
      );

      if (dates.length === 0) {
        throw new Error("Invalid repetition pattern");
      }

      // Add all tasks
      for (const date of dates) {
        // Use TaskService directly to add each task
        await TaskService.addTask(title, date, dueTime);
      }

      return {
        success: true,
        count: dates.length,
        dates: dates.map((d) => d.toLocaleDateString()),
      };
    } catch (error) {
      console.error("Error adding repetition task:", error);
      throw error;
    }
  },

  commonPatterns: {
    FIBONACCI: "1,1,2,3,5,8,13,21,34,55",
    DAILY: "1,2,3,4,5,6,7,8,9,10",
    EVERY_OTHER_DAY: "1,3,5,7,9,11,13,15",
    WEEKLY: "1,8,15,22,29,36",
    EVERY_3_DAYS: "1,4,7,10,13,16,19,22",
    SPACED_REPETITION: "1,3,7,14,30,60",
    TWICE_A_WEEK: "1,4,8,11,15,18,22,25,29",
  },

  getPatternDescription: (pattern: string): string => {
    const days = RepetitionService.parseRepetitionPattern(pattern);
    if (days.length === 0) return "Invalid pattern";

    if (days.length === 1) {
      return `Once on day ${days[0]}`;
    }

    const maxDay = Math.max(...days);
    return `${days.length} times in a ${maxDay}-day cycle: days ${days.join(", ")}`;
  },

  getDatePreview: (
    startDate: Date,
    pattern: string,
    occurrences: number = 1,
  ): string[] => {
    const dates = RepetitionService.generateRepetitionDates(
      startDate,
      pattern,
      occurrences,
    );
    return dates.map((d) => d.toLocaleDateString());
  },
};
